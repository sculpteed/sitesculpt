/**
 * Pre-generates one site per template so we can screenshot them for
 * the homepage template cards. Run once, commit the screenshots.
 *
 * Usage: npx tsx scripts/seed-templates.ts
 *
 * Requires: OPENAI_API_KEY, ANTHROPIC_API_KEY in .env.local
 * Cost: ~$0.35 total (8 model calls + 8 image provider image calls)
 */

import { compilePrompt } from '../features/studio/compilePrompt';
import { composeSite } from '../features/pipeline/steps/composeSite';
import { generateFluxImage } from '../lib/providers/fal-image';
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

      // 1. Compose site (the model)
      console.log('  composing site...');
      const site = await composeSite(brief);
      await writeJson(projectId, 'site.json', site);
      console.log(`  ✓ site: ${site.hero.headline.slice(0, 40)}...`);

      // 2. Generate keyframe (image provider) — device mockups + product shots, NO people
      console.log('  generating keyframe...');
      const VISUAL_PROMPTS: Record<string, string> = {
        'saas-landing': 'Modern SaaS landing page hero. Navigation: Logo Vertex, Menu items: Features, Pricing, Docs, Button: Get Started. Centered layout. Headline: Automation That Thinks Ahead. Subtext: AI-powered workflows so your team can focus on what actually matters. CTA button: Request Access. Hero background: dark navy with glowing cyan wireframe grid, floating 3D geometric nodes connected by light trails, subtle particle effects. Design style: clean developer-focused interface. Fonts: Inter / Geist. Colors: dark navy background, white text, cyan accent highlights.',
        'creative-agency': 'Creative agency portfolio landing page hero. Navigation: Logo Studio Noir, Menu items: Work, About, Team, Contact, Button: Start a Project. Left-aligned layout. Headline: Identity Crafted for the Ambitious. Subtext: Brand strategy, visual identity, and digital design for companies that refuse to blend in. CTA button: View Our Work. Hero background: dark moody atmosphere with floating 3D golden spheres, translucent glass cubes, and metallic rings. Design style: editorial fashion-magazine aesthetic with dramatic lighting. Fonts: Playfair Display / DM Sans. Colors: near-black background, warm cream text, gold accents.',
        'app-landing': 'Mobile app landing page hero. Navigation: Logo Flowboard, Menu items: Features, Pricing, Help, Button: Sign In. Centered layout. Headline: Projects That Actually Flow. Subtext: Boards, collaboration, and smart nudges — all in one delightfully simple workspace. CTA button: Try Flowboard Free. Hero background: vibrant gradient sky (blue to pink aurora) with floating 3D iPhone showing colorful productivity app interface with task cards. Design style: playful SaaS interface with floating cards and soft shadows. Fonts: Inter / Poppins. Colors: sky blue to pink gradient background, white UI cards, soft gradient highlights.',
        'ecommerce-brand': 'Luxury DTC brand landing page hero. Navigation: Logo Maison, Menu items: Collection, About, Journal, Button: Shop Now. Left-aligned layout with product imagery right. Headline: Essentials. Nothing More. Subtext: Thoughtfully designed everyday objects made from sustainable materials and minimal packaging. CTA button: Explore Collection. Hero background: warm cream with floating 3D product renders — minimalist ceramic vessels, glass bottles, folded textiles in soft warm lighting. Design style: Apple-style soft UI with clean product photography. Fonts: Cormorant Garamond / Inter. Colors: warm cream background, dark text, muted gold accent.',
        'restaurant': 'Fine dining restaurant landing page hero. Navigation: Logo Ember & Vine, Menu items: Menu, Reserve, About, Wine. Centered layout. Headline: Where the Season Comes to Table. Subtext: An intimate tasting experience devoted to what the land provides. CTA button: Reserve Your Evening. Hero background: dramatic overhead shot of an elegant plated dish — artistic food presentation with herbs, edible flowers on handmade ceramic plate, warm candlelight tones. Design style: luxury editorial with moody atmospheric lighting. Fonts: Cormorant / DM Sans. Colors: dark warm brown background, cream text, amber accent.',
        'portfolio': 'Designer portfolio landing page hero. Navigation: wordmark name, Menu items: Work, About, Contact. Minimal left-aligned layout. Headline: Design That Earns Its Place on the Page. Subtext: Independent brand designer working with early-stage startups on identity and type systems. CTA button: View Selected Work. Hero background: clean light gray with floating design elements — Pantone swatches, typography specimens, geometric logo marks, grid paper overlays arranged as artful flat-lay. Design style: minimal editorial with generous whitespace. Fonts: Neue Haas Grotesk / Suisse Intl. Colors: light gray background, near-black text, subtle blue accent.',
        'startup-launch': 'Developer tool startup landing page hero. Navigation: Logo Nexus, Menu items: Docs, SDK, Community, Pricing, Button: Start Building. Centered layout. Headline: Dev Tools. Rebuilt From First Principles. Subtext: The next-generation toolkit for developers who refuse to accept slow. CTA button: Claim Early Access. Hero background: deep dark purple with abstract futuristic holographic light beams, floating translucent geometric crystal shards, neon purple and blue particle nebula effects. Design style: bold sci-fi tech with dramatic lighting. Fonts: JetBrains Mono / Inter. Colors: deep purple background, white text, violet and cyan glowing accents.',
        'nonprofit': 'Ocean conservation nonprofit landing page hero. Navigation: Logo Blue Horizon, Menu items: Mission, Programs, Team, Donate, Button: Get Involved. Centered layout. Headline: The Ocean Needs a Few Good Humans. Subtext: Coastal cleanup programs and marine protection advocacy — because the sea cannot speak for itself. CTA button: Join the Movement. Hero background: breathtaking aerial drone shot of crystal clear turquoise ocean meeting pristine white sand coastline, coral formations visible through water. Design style: environmental documentary cinematography with uplifting tone. Fonts: DM Serif Display / Inter. Colors: deep teal background, white text, seafoam green accent.',
      };
      const visualPrompt = VISUAL_PROMPTS[t.id] ?? `Professional product photography for ${t.brandName || 'a modern brand'}. No people. Cinematic lighting.`;
      const imgBytes = await generateFluxImage({
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
