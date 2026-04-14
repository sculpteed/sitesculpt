import { NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  brief: z.string().min(10).max(8000),
});

interface ConceptOption {
  palette: { name: string; background: string; foreground: string; accent: string };
  concept: { title: string; description: string; visualPrompt: string; motionPrompt: string };
}

// ─── Background scene library — all cinematic 3D scenes ───────────────────
const SCENES = {
  cosmic: {
    title: 'Cosmic Depth',
    description: 'Deep-space vista with floating geometric prisms and volumetric light beams.',
    background:
      'deep dark purple cosmic scene with floating translucent 3D crystal prisms and geometric polyhedra in varying sizes, volumetric violet and cyan light beams slicing through space, subtle particle nebula effect, soft lens flare in upper right corner',
    style: 'bold sci-fi startup aesthetic with dramatic volumetric lighting',
    motion: 'Slow rotation of distant crystals, gentle particle drift, subtle cosmic light pulse.',
  },
  islands: {
    title: 'Floating Islands',
    description: 'Cinematic floating sky islands with cascading waterfalls and god rays.',
    background:
      'breathtaking cinematic 3D render of floating sky islands connected by cascading waterfalls into clouds below, snow-capped mountains in distance, dramatic volumetric god rays piercing through atmospheric mist, Unreal Engine quality',
    style: 'Ghibli-meets-Inception cinematic 3D scene with epic scale and depth',
    motion: 'Clouds drift slowly, waterfalls flow, light rays shift with passing time.',
  },
  architecture: {
    title: 'Golden Hour Architecture',
    description: 'Cinematic architectural render at golden hour with dramatic shadows.',
    background:
      'cinematic 3D architectural visualization of a minimalist modernist building with glass walls and exposed concrete, perched on a cliff overlooking ocean at golden hour, dramatic volumetric sunlight, surrounded by native landscaping, photoreal Unreal Engine render',
    style: 'sophisticated architectural photography with cinematic lighting',
    motion: 'Slow camera push toward the building, subtle cloud movement, light shifts.',
  },
  glass: {
    title: 'Iridescent Glass',
    description: 'Floating glass prisms and chrome spheres with rainbow reflections.',
    background:
      'stunning cinematic 3D abstract scene with floating translucent glass prisms catching rainbow light, liquid chrome spheres reflecting a sunset sky, iridescent metallic ribbons flowing through space, volumetric lighting, ultra-high-detail Octane render',
    style: 'bold cinematic 3D concept art with dramatic lighting and rich color',
    motion: 'Prisms rotate slowly, chrome reflections shift, ribbons flow smoothly.',
  },
  ocean: {
    title: 'Aerial Ocean',
    description: 'Breathtaking aerial drone shot of turquoise ocean meeting white sand.',
    background:
      'breathtaking aerial drone photograph from high altitude showing crystal clear turquoise ocean meeting pristine white sand coastline, visible coral reef formations through transparent water, dramatic golden hour sunlight reflecting off gentle waves creating light rays',
    style: 'environmental documentary cinematography with uplifting cinematic tone',
    motion: 'Gentle wave motion, subtle camera drift over coastline, light shimmer on water.',
  },
  wireframe: {
    title: 'Digital Grid',
    description: 'Futuristic wireframe grid landscape with glowing nodes and floating UI.',
    background:
      'dark navy digital grid landscape stretching to horizon with glowing cyan wireframe lines, floating 3D geometric nodes connected by thin light trails, subtle particle effects, atmospheric depth fog, floating translucent code-window panels',
    style: 'dark developer aesthetic with sci-fi tech vibe',
    motion: 'Grid lines pulse, particles float upward, data flows through node connections.',
  },
  stillLife: {
    title: 'Editorial Still Life',
    description: 'Warm editorial product photography with soft natural window light.',
    background:
      'editorial product still life with artisan ceramic vase, handblown glass bottle, folded natural linen textile, small potted succulent on warm cream stone pedestal, soft natural window light casting gentle shadows, generous whitespace around',
    style: 'Apple-style minimal product photography with warm editorial feel',
    motion: 'Dust particles catch light, very subtle camera parallax push.',
  },
  food: {
    title: 'Moody Culinary',
    description: 'Dramatic overhead food photography with ambient candlelight.',
    background:
      'dramatic overhead photography of artfully plated seasonal tasting course with seared protein, microgreens, edible flowers, artistic sauce work on handmade ceramic plate, warm ambient candlelight, dark walnut wood surface, wine glass edge, linen napkin',
    style: 'luxury Michelin editorial with moody atmospheric candlelight',
    motion: 'Candlelight flickers subtly, steam rises from dish, slow camera rotation.',
  },
  skyUI: {
    title: 'Sky + Floating UI',
    description: 'Bright sky background with floating product UI cards and soft shadows.',
    background:
      'bright sky blue gradient background with soft clouds, floating 3D glass UI cards showing dashboard panels, notifications, charts, and product screens scattered playfully with soft drop shadows',
    style: 'playful SaaS interface with glass morphism and floating cards',
    motion: 'Cards gently float and drift, clouds move across sky, soft light shifts.',
  },
  designerDesk: {
    title: 'Designer Workspace',
    description: 'Overhead editorial flat-lay of designer tools on raw concrete.',
    background:
      'overhead editorial flat lay photography of designer workspace with leather sketchbook, color palette swatches fanned out, vintage typography specimen book open, brass ruler, espresso cup on raw concrete desk with soft natural window light',
    style: 'minimal editorial Swiss-inspired with generous whitespace',
    motion: 'Subtle camera push, steam rises from espresso, soft shadow drift.',
  },
} as const;

// ─── Palette library per mood ─────────────────────────────────────────────
const PALETTES: Record<string, Array<ConceptOption['palette']>> = {
  bold: [
    { name: 'Cosmic Violet', background: '#0a0420', foreground: '#F4EFE6', accent: '#a78bfa' },
    { name: 'Electric Sunset', background: '#1a0a2e', foreground: '#F4EFE6', accent: '#ff6ec7' },
    { name: 'Neon Tech', background: '#0b0f1a', foreground: '#F4EFE6', accent: '#06b6d4' },
  ],
  minimal: [
    { name: 'Warm Cream', background: '#F4EFE6', foreground: '#141210', accent: '#b88b5d' },
    { name: 'Soft Sky', background: '#eef5ff', foreground: '#0f172a', accent: '#3b82f6' },
    { name: 'Cool Stone', background: '#f3f4f6', foreground: '#111827', accent: '#10b981' },
  ],
  editorial: [
    { name: 'Ink & Cream', background: '#141210', foreground: '#F4EFE6', accent: '#c9a96e' },
    { name: 'Cream & Ink', background: '#F4EFE6', foreground: '#141210', accent: '#8b9dc3' },
    { name: 'Deep Forest', background: '#1a2e1a', foreground: '#F4EFE6', accent: '#d4b88a' },
  ],
  playful: [
    { name: 'Sky Aurora', background: '#87CEEB', foreground: '#1e293b', accent: '#ff6b9d' },
    { name: 'Pastel Dream', background: '#fef3c7', foreground: '#1f2937', accent: '#a855f7' },
    { name: 'Mint Fresh', background: '#d1fae5', foreground: '#1f2937', accent: '#f59e0b' },
  ],
  technical: [
    { name: 'Deep Navy', background: '#0a0a14', foreground: '#F4EFE6', accent: '#06b6d4' },
    { name: 'Terminal', background: '#0d0d0d', foreground: '#22c55e', accent: '#a78bfa' },
    { name: 'Cyberpunk', background: '#0a0420', foreground: '#F4EFE6', accent: '#ec4899' },
  ],
  luxurious: [
    { name: 'Black & Gold', background: '#141210', foreground: '#F4EFE6', accent: '#c9a96e' },
    { name: 'Burgundy Cream', background: '#2d1b1f', foreground: '#F4EFE6', accent: '#e8b874' },
    { name: 'Marble', background: '#F4EFE6', foreground: '#141210', accent: '#8b6f47' },
  ],
};

// ─── Detect industry from brief ────────────────────────────────────────────
function detectIndustryScenes(brief: string, toneId: string | null): Array<keyof typeof SCENES> {
  const lower = brief.toLowerCase();

  // SaaS / dev tools / tech
  if (/\b(saas|platform|api|developer|dev tool|infrastructure|cloud|devops)\b/.test(lower)) {
    return ['wireframe', 'cosmic', 'glass'];
  }
  // AI / enterprise AI
  if (/\b(ai|artificial intelligence|ml|machine learning|neural|llm|automation)\b/.test(lower)) {
    return ['islands', 'cosmic', 'wireframe'];
  }
  // Space / research / exploration
  if (/\b(space|research|science|lab|astronomy|physics)\b/.test(lower)) {
    return ['cosmic', 'islands', 'glass'];
  }
  // Architecture / real estate / building
  if (/\b(architecture|building|real estate|property|design studio|interior)\b/.test(lower)) {
    return ['architecture', 'glass', 'stillLife'];
  }
  // Restaurant / food / hospitality
  if (/\b(restaurant|dining|food|menu|chef|cafe|bar|kitchen|cuisine)\b/.test(lower)) {
    return ['food', 'stillLife', 'architecture'];
  }
  // Portfolio / personal / designer
  if (/\b(portfolio|designer|freelance|personal|photographer|artist)\b/.test(lower)) {
    return ['designerDesk', 'stillLife', 'glass'];
  }
  // Ecommerce / retail / brand
  if (/\b(ecommerce|e-commerce|brand|store|shop|product|retail|dtc|direct-to-consumer)\b/.test(lower)) {
    return ['stillLife', 'glass', 'skyUI'];
  }
  // Mobile app
  if (/\b(app|mobile|ios|android|iphone|smartphone)\b/.test(lower)) {
    return ['skyUI', 'glass', 'cosmic'];
  }
  // Non-profit / environmental / ocean / mission
  if (/\b(non-profit|nonprofit|charity|ocean|climate|environment|conservation|mission-driven)\b/.test(lower)) {
    return ['ocean', 'islands', 'architecture'];
  }
  // Agency / consulting / services
  if (/\b(agency|consultancy|consulting|studio|services|creative)\b/.test(lower)) {
    return ['glass', 'architecture', 'designerDesk'];
  }

  // Default: diverse cinematic mix based on tone
  if (toneId === 'bold') return ['cosmic', 'glass', 'islands'];
  if (toneId === 'luxurious') return ['architecture', 'stillLife', 'glass'];
  if (toneId === 'playful') return ['skyUI', 'ocean', 'glass'];
  if (toneId === 'editorial') return ['architecture', 'stillLife', 'designerDesk'];
  if (toneId === 'technical') return ['wireframe', 'cosmic', 'glass'];
  if (toneId === 'minimal') return ['stillLife', 'architecture', 'glass'];
  return ['islands', 'glass', 'ocean'];
}

// ─── Extract structured fields from compiled brief ────────────────────────
function extractFields(brief: string): { brandName: string; description: string; toneId: string | null } {
  const brandMatch = brief.match(/Brand name:\s*([^.\n]+)/);
  const brandName =
    brandMatch?.[1]?.trim() && !brandMatch[1].includes('not provided')
      ? brandMatch[1].trim()
      : 'Your Brand';
  const descMatch = brief.match(/What it is:\s*([^\n]+)/);
  const description = descMatch?.[1]?.trim() ?? '';
  const toneMatch = brief.match(/Tone:\s*([^.]+)\./);
  const toneLabel = toneMatch?.[1]?.trim() ?? null;
  const toneId =
    toneLabel === 'Minimal & confident' ? 'minimal' :
    toneLabel === 'Editorial & elegant' ? 'editorial' :
    toneLabel === 'Playful & warm' ? 'playful' :
    toneLabel === 'Technical & precise' ? 'technical' :
    toneLabel === 'Luxurious' ? 'luxurious' :
    toneLabel === 'Bold & loud' ? 'bold' : null;
  return { brandName, description, toneId };
}

// ─── Build the Ideogram-ready visual prompt from scene + fields ───────────
function buildVisualPrompt(args: {
  brandName: string;
  description: string;
  scene: (typeof SCENES)[keyof typeof SCENES];
  palette: ConceptOption['palette'];
}): string {
  const { brandName, description, scene, palette } = args;

  // Short headline extracted from description (first sentence, up to ~60 chars)
  const headline = description.split(/[.!?]/)[0]?.trim().slice(0, 80) || 'Built for what comes next';
  const subtext = description.slice(0, 160);
  const menuItems = 'Features, Pricing, About, Contact';

  return `Premium modern landing page hero section. Navigation: Logo ${brandName}, Menu items: ${menuItems}, Button: Get Started. Centered hero layout. Headline: ${headline}. Subtext: ${subtext} CTA button: Start Free + secondary: Learn More. Hero background: ${scene.background}. Design style: ${scene.style}. Fonts: Inter / DM Sans. Colors: background ${palette.background}, foreground ${palette.foreground}, accent ${palette.accent}. Clean typography, Draftly-tier cinematic quality.`;
}

export async function POST(req: NextRequest): Promise<Response> {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { brandName, description, toneId } = extractFields(parsed.data.brief);
    const sceneKeys = detectIndustryScenes(parsed.data.brief, toneId);
    const palettePool = PALETTES[toneId ?? 'minimal'] ?? PALETTES.minimal!;

    const options: ConceptOption[] = sceneKeys.slice(0, 3).map((sceneKey, idx) => {
      const scene = SCENES[sceneKey];
      const palette = palettePool[idx % palettePool.length]!;
      return {
        palette,
        concept: {
          title: scene.title,
          description: scene.description,
          visualPrompt: buildVisualPrompt({ brandName, description, scene, palette }),
          motionPrompt: scene.motion,
        },
      };
    });

    return Response.json({ options });
  } catch (err) {
    console.error('[art-direction] failed', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Art direction failed' },
      { status: 500 },
    );
  }
}
