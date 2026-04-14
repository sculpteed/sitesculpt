/**
 * Pre-generates one site per template so we can screenshot them for
 * the homepage template cards. Run once, commit the screenshots.
 *
 * Usage: npx tsx scripts/seed-templates.ts
 *
 * Requires: OPENAI_API_KEY, ANTHROPIC_API_KEY in .env.local
 * Cost: ~$0.35 total (8 Claude calls + 8 OpenAI image calls)
 */

import { compilePrompt } from '../features/studio/compilePrompt';
import { composeSite } from '../features/pipeline/steps/composeSite';
import { generateKeyframeImage } from '../lib/providers/openai-image';
import { ensureProjectDir, writeJson, writeFileBytes } from '../lib/cache';
import { createHash } from 'node:crypto';

// Inline template data to avoid import issues with the client module
const TEMPLATES = [
  {
    id: 'saas-landing',
    brandName: 'Vertex',
    description: 'A modern SaaS product that helps teams work faster with AI-powered automation. Built for startups and growing companies.',
    toneId: 'minimal',
    pages: ['features', 'pricing', 'faq', 'testimonials'],
  },
  {
    id: 'creative-agency',
    brandName: 'Studio Noir',
    description: 'A boutique creative agency specializing in brand identity, digital design, and strategic campaigns for ambitious brands.',
    toneId: 'editorial',
    pages: ['about', 'case-studies', 'team', 'contact'],
  },
  {
    id: 'app-landing',
    brandName: 'Flowboard',
    description: 'A productivity app that simplifies project management with intuitive boards, real-time collaboration, and smart notifications.',
    toneId: 'playful',
    pages: ['features', 'pricing', 'faq'],
  },
  {
    id: 'ecommerce-brand',
    brandName: 'Maison',
    description: 'A direct-to-consumer brand selling thoughtfully designed everyday essentials with sustainable materials and minimal packaging.',
    toneId: 'luxurious',
    pages: ['about', 'features', 'testimonials'],
  },
  {
    id: 'restaurant',
    brandName: 'Ember & Vine',
    description: 'An intimate restaurant focused on seasonal, locally sourced ingredients with a rotating tasting menu and natural wine program.',
    toneId: 'luxurious',
    pages: ['about', 'contact'],
  },
  {
    id: 'portfolio',
    brandName: '',
    description: 'Personal portfolio for an independent designer who works with early-stage startups on brand identity, type systems, and digital products.',
    toneId: 'editorial',
    pages: ['about', 'case-studies', 'contact'],
  },
  {
    id: 'startup-launch',
    brandName: 'Nexus',
    description: 'A stealth-mode startup building the next generation of developer tools. Launching soon with early access for design partners.',
    toneId: 'bold',
    pages: ['features', 'team'],
  },
  {
    id: 'nonprofit',
    brandName: 'Blue Horizon',
    description: 'A non-profit focused on ocean conservation, running coastal cleanup programs and advocating for marine protection policies worldwide.',
    toneId: 'playful',
    pages: ['about', 'team', 'contact', 'testimonials'],
  },
];

async function main() {
  console.log('Seeding template sites...\n');

  for (const t of TEMPLATES) {
    console.log(`─── ${t.id} ───`);

    // Create a deterministic project ID from the template id
    const projectId = createHash('sha256')
      .update(`template-${t.id}`)
      .digest('hex')
      .slice(0, 16);

    console.log(`  projectId: ${projectId}`);

    // Compile the brief
    const brief = compilePrompt({
      brandName: t.brandName,
      description: t.description,
      toneId: t.toneId,
      paletteMode: 'ai',
      customPalette: { background: '#0a0a0a', foreground: '#fafafa', accent: '#e8b874' },
      includedPages: t.pages,
      userData: {
        team: [],
        pricing: [],
        testimonials: [],
        caseStudies: [],
        faqs: [],
        features: [],
        contact: {},
        metrics: [],
        customerLogos: [],
      },
      hasAttachedImage: false,
      hasAttachedVideo: false,
    });

    try {
      await ensureProjectDir(projectId);

      // 1. Compose site (Claude)
      console.log('  composing site...');
      const site = await composeSite(brief);
      await writeJson(projectId, 'site.json', site);
      console.log(`  ✓ site: ${site.hero.headline.slice(0, 40)}...`);

      // 2. Generate keyframe (OpenAI) — device mockups + product shots, NO people
      console.log('  generating keyframe...');
      const VISUAL_PROMPTS: Record<string, string> = {
        'saas-landing': 'Dark navy background with abstract glowing cyan wireframe grid lines, floating geometric nodes connected by light trails, subtle particle effects. Clean minimalist tech aesthetic. 3D render style, Dribbble quality. No text, no people.',
        'creative-agency': 'Dark moody background with floating 3D geometric shapes — golden spheres, translucent glass cubes, metallic rings — arranged in an elegant asymmetric composition. Soft dramatic studio lighting. Art direction portfolio style. No text, no people.',
        'app-landing': 'Vibrant gradient background (blue to pink aurora) with floating 3D rendered smartphone showing a clean colorful productivity app interface with task cards and charts. Glossy device render, soft shadows. Dribbble/Behance quality. No text, no people.',
        'ecommerce-brand': 'Warm cream background with floating 3D rendered luxury product packaging — minimalist boxes, glass bottles, fabric swatches — in soft warm lighting. Soft pastel shadows, clean product render style. No text, no people.',
        'restaurant': 'Dark atmospheric background with dramatic overhead shot of a single elegant plated dish — artistic food presentation with herbs, sauce drizzles, and edible flowers on handmade ceramic. Warm candlelight tones. No text, no people.',
        'portfolio': 'Clean minimal light gray background with floating design elements — color palette swatches, typography specimens, geometric logo marks, grid overlays — arranged as an artful flat-lay. Graphic design studio aesthetic. No text, no people.',
        'startup-launch': 'Deep dark purple background with abstract futuristic holographic light beams, floating translucent geometric shards, and subtle particle nebula effects. Sci-fi concept art quality. No text, no people.',
        'nonprofit': 'Breathtaking aerial view of crystal clear turquoise ocean meeting pristine white sand coastline, coral formations visible through water, dramatic natural lighting. Environmental documentary cinematography. No text, no people.',
      };
      const visualPrompt = VISUAL_PROMPTS[t.id] ?? `Professional product photography for ${t.brandName || 'a modern brand'}. No people. Cinematic lighting.`;
      const imgBytes = await generateKeyframeImage({
        prompt: visualPrompt,
        aspect: '16:9',
      });
      await writeFileBytes(projectId, 'keyframe.png', imgBytes);
      console.log('  ✓ keyframe saved');

      // 3. Save scene
      await writeJson(projectId, 'scene.json', {
        visualPrompt,
        motionPrompt: '',
        palette: { background: '#0a0a0a', foreground: '#fafafa', accent: '#e8b874' },
        concept: t.description.slice(0, 60),
      });

      console.log(`  ✓ done → /preview/${projectId}\n`);
    } catch (err) {
      console.error(`  ✗ failed: ${(err as Error).message}\n`);
    }
  }

  console.log('Done! Now screenshot each preview page and save to public/templates/');
}

main().catch(console.error);
