import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getToneIdByLabel } from '@/features/studio/tones';
import type { PaletteOption, ConceptOption } from '@/features/studio/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const bodySchema = z.object({
  brief: z.string().min(10).max(8000),
});

/** Wire format returned by POST /api/art-direction — a palette + concept pair. */
interface ArtDirectionOption {
  palette: PaletteOption;
  concept: ConceptOption;
}

/** Scene-library entry — distinct from the pipeline's Scene (visualPrompt,
 *  motionPrompt, palette). This is the background/style/motion metadata used
 *  to build the visualPrompt for one concept option. */
interface SceneTemplate {
  title: string;
  description: string;
  background: string;
  style: string;
  motion: string;
}

// ─── Scene library — 25 cinematic 3D scenes across industries ──────────────
const SCENES: Record<string, SceneTemplate> = {
  // Tech / SaaS / AI scenes
  cosmicPurple: {
    title: 'Cosmic Depth',
    description: 'Deep-space vista with floating crystal prisms and volumetric light beams.',
    background: 'deep dark purple cosmic scene with floating translucent 3D crystal prisms and geometric polyhedra in varying sizes, volumetric violet and cyan light beams slicing through space, subtle particle nebula, lens flare',
    style: 'bold sci-fi startup aesthetic with dramatic volumetric lighting',
    motion: 'Slow rotation of distant crystals, gentle particle drift, subtle cosmic light pulse.',
  },
  cosmicBlue: {
    title: 'Electric Horizon',
    description: 'Bright cosmic horizon with floating tech geometry and neon accents.',
    background: 'cinematic deep blue space scene with a distant glowing planet on horizon, floating translucent geometric tech artifacts in foreground, streaks of cyan and pink light, misty atmospheric depth',
    style: 'futuristic sci-fi with clean tech aesthetic',
    motion: 'Planet drifts slowly, light streaks pulse, particles float upward.',
  },
  wireframe: {
    title: 'Digital Grid',
    description: 'Futuristic wireframe grid landscape with glowing nodes and floating UI panels.',
    background: 'dark navy digital grid landscape stretching to horizon with glowing cyan wireframe lines, floating 3D geometric nodes connected by thin light trails, floating translucent code-window panels, atmospheric depth fog',
    style: 'dark developer aesthetic with sci-fi tech vibe',
    motion: 'Grid lines pulse, particles float upward, data flows through node connections.',
  },
  neonCity: {
    title: 'Neon Skyline',
    description: 'Cyberpunk neon skyline with holographic billboards and atmospheric rain.',
    background: 'futuristic cyberpunk cityscape at night with towering skyscrapers covered in neon holographic signage, light trails from flying vehicles, atmospheric rain and volumetric fog, reflections on wet streets',
    style: 'Blade Runner cinematic with vibrant neon color',
    motion: 'Flying vehicle light trails, neon signs pulse, rain falls continuously.',
  },

  // Nature / cinematic landscapes
  floatingIslands: {
    title: 'Floating Islands',
    description: 'Cinematic floating sky islands with cascading waterfalls and god rays.',
    background: 'breathtaking 3D render of floating sky islands connected by cascading waterfalls into clouds below, snow-capped mountains in distance, dramatic volumetric god rays, Unreal Engine quality',
    style: 'Ghibli-meets-Inception cinematic scene with epic scale',
    motion: 'Clouds drift slowly, waterfalls flow, light rays shift with passing time.',
  },
  aerialOcean: {
    title: 'Aerial Ocean',
    description: 'Aerial drone shot of turquoise ocean meeting pristine white sand.',
    background: 'breathtaking aerial drone photograph from high altitude showing crystal clear turquoise ocean meeting pristine white sand coastline, visible coral reef through transparent water, golden hour sunlight, light rays on waves',
    style: 'environmental documentary cinematography',
    motion: 'Gentle wave motion, subtle camera drift over coastline, light shimmer on water.',
  },
  mountainLake: {
    title: 'Alpine Reflection',
    description: 'Serene alpine lake reflecting dramatic snow-capped peaks at dawn.',
    background: 'serene alpine glacial lake perfectly reflecting massive snow-capped mountain peaks at misty dawn, dramatic volumetric light breaking through clouds, pine silhouettes in foreground',
    style: 'Nat Geo cinematic landscape photography',
    motion: 'Mist rolls across water, clouds drift slowly, gentle ripple on lake.',
  },
  desertCanyon: {
    title: 'Red Canyon',
    description: 'Dramatic red rock canyon at golden hour with long shadows.',
    background: 'dramatic red sandstone canyon landscape at golden hour with long shadows casting across the terrain, dust particles in sunbeams, distant mesa silhouettes, cinematic composition',
    style: 'cinematic western landscape with dramatic golden light',
    motion: 'Dust particles drift in sunbeams, subtle camera push, shadows shift slowly.',
  },

  // Architecture / luxury
  architectureModern: {
    title: 'Golden Hour Architecture',
    description: 'Cinematic architectural render of minimalist building at golden hour.',
    background: 'cinematic 3D architectural visualization of minimalist modernist building with glass walls and exposed concrete on a cliff overlooking ocean at golden hour, dramatic volumetric sunlight, native landscaping, photoreal Unreal Engine render',
    style: 'sophisticated architectural photography with cinematic lighting',
    motion: 'Slow camera push, subtle cloud movement, light shifts.',
  },
  architectureInterior: {
    title: 'Interior Sanctuary',
    description: 'Moody interior architectural render with dramatic window light.',
    background: 'moody interior of minimalist modern residence with floor-to-ceiling windows, wide oak floors, a single designer chair, dramatic volumetric beam of sunlight streaming through window creating light pool on floor',
    style: 'editorial interior photography with moody atmospheric lighting',
    motion: 'Dust particles catch the light beam, very subtle camera parallax.',
  },
  marbleLuxe: {
    title: 'Marble & Gold',
    description: 'Luxury marble interior with gold accents and dramatic lighting.',
    background: 'luxurious marble interior with veined white marble surfaces, brushed gold accents, fluted columns, dramatic directional lighting, deep shadows, editorial still life composition',
    style: 'luxury editorial with dramatic chiaroscuro',
    motion: 'Subtle camera rotation, light shifts slowly across marble.',
  },

  // Glass / abstract / 3D
  glassPrisms: {
    title: 'Iridescent Glass',
    description: 'Floating glass prisms and chrome spheres with rainbow reflections.',
    background: 'stunning cinematic 3D abstract scene with floating translucent glass prisms catching rainbow light, liquid chrome spheres reflecting sunset sky, iridescent metallic ribbons flowing through space, volumetric lighting, Octane render',
    style: 'bold cinematic 3D concept art with dramatic lighting',
    motion: 'Prisms rotate slowly, chrome reflections shift, ribbons flow smoothly.',
  },
  liquidMetal: {
    title: 'Liquid Metal',
    description: 'Flowing liquid chrome and mercury droplets in abstract composition.',
    background: 'abstract composition of flowing liquid chrome and mercury droplets suspended in space, each reflecting a different ambient color, soft gradient background shifting from deep purple to warm amber, cinematic Octane render',
    style: 'abstract premium 3D art direction',
    motion: 'Droplets morph and flow continuously, reflections shift, gradient slowly shifts hue.',
  },
  floatingOrbs: {
    title: 'Sunset Orbs',
    description: 'Floating glass orbs against a sunset gradient with soft bloom.',
    background: 'floating 3D glass spheres of varying sizes suspended in a warm sunset gradient sky, soft lens flare, dreamy bloom atmosphere, aurora-like light trails behind orbs',
    style: 'dreamy abstract with soft atmospheric warmth',
    motion: 'Orbs drift slowly in circular paths, light trails curl, bloom pulses softly.',
  },
  crystalCave: {
    title: 'Crystal Cave',
    description: 'Glowing crystal cave with luminescent formations and depth.',
    background: 'mystical 3D crystal cave interior with glowing luminescent amethyst and quartz formations catching light, volumetric rays streaming through cave opening, cinematic depth',
    style: 'fantasy cinematic concept art',
    motion: 'Crystals pulse with slow inner glow, light rays shift through cave opening.',
  },

  // Product / editorial / still life
  stillLifeWarm: {
    title: 'Editorial Still Life',
    description: 'Warm editorial product photography with natural window light.',
    background: 'editorial product still life with artisan ceramic vase, handblown glass bottle, folded natural linen textile, small potted succulent on warm cream stone pedestal, soft natural window light casting gentle shadows',
    style: 'Apple-style minimal product photography',
    motion: 'Dust particles catch light, very subtle camera parallax push.',
  },
  stillLifeCool: {
    title: 'Minimalist Ceramics',
    description: 'Cool-toned minimalist ceramic arrangement with sculptural shadows.',
    background: 'minimalist ceramic sculpture arrangement on pale travertine pedestal, cool gray walls, single directional light casting long sculptural shadows, one sprig of dried eucalyptus',
    style: 'editorial modern craft photography',
    motion: 'Subtle camera arc, shadows shift very slowly.',
  },
  flatlayDesigner: {
    title: 'Designer Workspace',
    description: 'Overhead flat-lay of designer tools on raw concrete.',
    background: 'overhead editorial flat lay of designer workspace with leather sketchbook open to logo sketches, color palette swatches, vintage typography specimen book, brass ruler, espresso cup on raw concrete desk with soft natural light',
    style: 'minimal editorial Swiss-inspired',
    motion: 'Subtle camera push, steam rises from espresso.',
  },

  // Food / hospitality
  foodOverhead: {
    title: 'Moody Culinary',
    description: 'Dramatic overhead food photography with ambient candlelight.',
    background: 'dramatic overhead photography of artfully plated seasonal tasting course with seared protein, microgreens, edible flowers, artistic sauce work on handmade ceramic plate, warm candlelight, dark walnut wood surface, wine glass edge',
    style: 'luxury Michelin editorial with moody atmospheric candlelight',
    motion: 'Candlelight flickers, steam rises from dish, slow camera rotation.',
  },
  foodCinematic: {
    title: 'Ember & Flame',
    description: 'Cinematic kitchen shot with live fire and glowing embers.',
    background: 'cinematic shot of a professional kitchen pass with live open flame, glowing embers, a single illuminated plated dish in foreground, moody deep shadows, copper pot reflections',
    style: 'cinematic culinary editorial with dramatic fire lighting',
    motion: 'Flames dance, embers glow, smoke rises subtly.',
  },

  // UI / product showcase
  skyUI: {
    title: 'Sky + Floating UI',
    description: 'Bright sky with floating product UI cards and soft shadows.',
    background: 'bright sky blue gradient with soft clouds, floating 3D glass UI cards showing dashboard panels, notifications, charts, and product screens scattered playfully with soft drop shadows',
    style: 'playful SaaS interface with glass morphism',
    motion: 'Cards gently float and drift, clouds move across sky.',
  },
  glassDashboard: {
    title: 'Glass Dashboard',
    description: 'Frosted glass dashboard UI floating over abstract gradient.',
    background: 'floating 3D frosted glass dashboard panels with charts, graphs, user tiles and notification cards suspended over soft pastel gradient background (cream to sky blue), soft drop shadows, depth',
    style: 'modern SaaS glass morphism with premium feel',
    motion: 'Panels drift slowly in parallax, charts subtly animate, gradient shifts hue.',
  },
  pastelFloating: {
    title: 'Pastel Dream',
    description: 'Soft pastel gradient with floating 3D rounded shapes.',
    background: 'soft pastel gradient background (peach to lavender to mint) with floating 3D rounded shapes — glossy spheres, soft cubes, curved surfaces — casting gentle shadows, dreamlike atmosphere',
    style: 'playful Dribbble 3D art direction',
    motion: 'Shapes bob gently, gradient shifts hue very slowly.',
  },

  // Cinematic / atmospheric
  goldenField: {
    title: 'Golden Field',
    description: 'Wildflower meadow with rolling hills and distant mountains at golden hour.',
    background: 'serene meadow of wildflowers in full bloom on rolling hills perched atop clifftop overlooking rugged coastline, distant snow-capped mountains, golden hour light, soft cinematic clouds, National Geographic quality',
    style: 'editorial landscape photography with painterly color grading',
    motion: 'Flowers sway in gentle breeze, clouds drift slowly.',
  },
  oceanDepths: {
    title: 'Ocean Depths',
    description: 'Underwater scene with bioluminescent creatures and shafts of light.',
    background: 'underwater ocean scene with shafts of sunlight penetrating blue depths, bioluminescent particles, a distant school of fish silhouettes, atmospheric haze, cinematic depth',
    style: 'cinematic underwater documentary',
    motion: 'Light rays shift, particles drift, distant silhouettes move slowly.',
  },
};

// ─── Industry detection with multiple scene candidates ─────────────────────
function detectIndustryScenes(brief: string, toneId: string | null): string[] {
  const lower = brief.toLowerCase();

  if (/\b(saas|platform|api|infrastructure|devops|cloud|developer|dev tool)\b/.test(lower)) {
    return ['wireframe', 'cosmicBlue', 'glassDashboard', 'neonCity', 'liquidMetal'];
  }
  if (/\b(ai|artificial intelligence|ml|machine learning|neural|llm|automation)\b/.test(lower)) {
    return ['floatingIslands', 'cosmicPurple', 'wireframe', 'crystalCave', 'glassPrisms'];
  }
  if (/\b(space|research|science|lab|astronomy|physics)\b/.test(lower)) {
    return ['cosmicPurple', 'cosmicBlue', 'floatingIslands', 'crystalCave', 'glassPrisms'];
  }
  if (/\b(architecture|building|real estate|property|interior|construction)\b/.test(lower)) {
    return ['architectureModern', 'architectureInterior', 'marbleLuxe', 'stillLifeCool', 'desertCanyon'];
  }
  if (/\b(restaurant|dining|food|menu|chef|cafe|bar|kitchen|cuisine)\b/.test(lower)) {
    return ['foodOverhead', 'foodCinematic', 'stillLifeWarm', 'marbleLuxe', 'architectureInterior'];
  }
  if (/\b(portfolio|designer|freelance|personal|photographer|artist|creative director)\b/.test(lower)) {
    return ['flatlayDesigner', 'stillLifeWarm', 'glassPrisms', 'architectureInterior', 'stillLifeCool'];
  }
  if (/\b(ecommerce|e-commerce|brand|store|shop|product|retail|dtc|consumer goods)\b/.test(lower)) {
    return ['stillLifeWarm', 'stillLifeCool', 'pastelFloating', 'marbleLuxe', 'floatingOrbs'];
  }
  if (/\b(app|mobile|ios|android|iphone|smartphone)\b/.test(lower)) {
    return ['skyUI', 'glassDashboard', 'pastelFloating', 'floatingOrbs', 'liquidMetal'];
  }
  if (/\b(non-profit|nonprofit|charity|ocean|climate|environment|conservation|mission-driven)\b/.test(lower)) {
    return ['aerialOcean', 'mountainLake', 'floatingIslands', 'goldenField', 'oceanDepths'];
  }
  if (/\b(agency|consultancy|consulting|studio|creative|design studio|branding)\b/.test(lower)) {
    return ['glassPrisms', 'architectureModern', 'flatlayDesigner', 'liquidMetal', 'marbleLuxe'];
  }
  if (/\b(finance|fintech|banking|trading|investment|wealth|crypto)\b/.test(lower)) {
    return ['marbleLuxe', 'architectureModern', 'glassPrisms', 'wireframe', 'cosmicBlue'];
  }
  if (/\b(fashion|apparel|clothing|jewelry|beauty|cosmetic)\b/.test(lower)) {
    return ['stillLifeCool', 'marbleLuxe', 'glassPrisms', 'floatingOrbs', 'stillLifeWarm'];
  }
  if (/\b(health|medical|wellness|fitness|therapy|yoga|meditation)\b/.test(lower)) {
    return ['mountainLake', 'aerialOcean', 'stillLifeWarm', 'architectureInterior', 'goldenField'];
  }
  if (/\b(travel|hotel|hospitality|resort|tourism|booking)\b/.test(lower)) {
    return ['aerialOcean', 'mountainLake', 'goldenField', 'desertCanyon', 'skyUI'];
  }

  // Default: tone-based fallback with variety
  if (toneId === 'bold') return ['cosmicPurple', 'glassPrisms', 'floatingIslands', 'neonCity', 'liquidMetal'];
  if (toneId === 'luxurious') return ['marbleLuxe', 'architectureInterior', 'stillLifeWarm', 'glassPrisms', 'architectureModern'];
  if (toneId === 'playful') return ['pastelFloating', 'skyUI', 'floatingOrbs', 'aerialOcean', 'glassDashboard'];
  if (toneId === 'editorial') return ['architectureModern', 'stillLifeWarm', 'flatlayDesigner', 'goldenField', 'marbleLuxe'];
  if (toneId === 'technical') return ['wireframe', 'cosmicBlue', 'cosmicPurple', 'liquidMetal', 'crystalCave'];
  if (toneId === 'minimal') return ['stillLifeCool', 'architectureInterior', 'glassPrisms', 'stillLifeWarm', 'marbleLuxe'];

  return ['floatingIslands', 'glassPrisms', 'aerialOcean', 'cosmicPurple', 'architectureModern'];
}

// ─── Palette library per tone (3-4 variants each) ─────────────────────────
const PALETTES: Record<string, PaletteOption[]> = {
  bold: [
    { name: 'Cosmic Violet', background: '#0a0420', foreground: '#F4EFE6', accent: '#a78bfa' },
    { name: 'Electric Sunset', background: '#1a0a2e', foreground: '#F4EFE6', accent: '#ff6ec7' },
    { name: 'Neon Tech', background: '#0b0f1a', foreground: '#F4EFE6', accent: '#06b6d4' },
    { name: 'Blood Orange', background: '#1a0e08', foreground: '#F4EFE6', accent: '#f97316' },
  ],
  minimal: [
    { name: 'Warm Cream', background: '#F4EFE6', foreground: '#141210', accent: '#b88b5d' },
    { name: 'Soft Sky', background: '#eef5ff', foreground: '#0f172a', accent: '#3b82f6' },
    { name: 'Cool Stone', background: '#f3f4f6', foreground: '#111827', accent: '#10b981' },
    { name: 'Paper White', background: '#fafaf7', foreground: '#1c1917', accent: '#78716c' },
  ],
  editorial: [
    { name: 'Ink & Cream', background: '#141210', foreground: '#F4EFE6', accent: '#c9a96e' },
    { name: 'Cream & Ink', background: '#F4EFE6', foreground: '#141210', accent: '#8b9dc3' },
    { name: 'Deep Forest', background: '#1a2e1a', foreground: '#F4EFE6', accent: '#d4b88a' },
    { name: 'Midnight Gold', background: '#0e0f1a', foreground: '#F4EFE6', accent: '#e8b874' },
  ],
  playful: [
    { name: 'Sky Aurora', background: '#87CEEB', foreground: '#1e293b', accent: '#ff6b9d' },
    { name: 'Pastel Dream', background: '#fef3c7', foreground: '#1f2937', accent: '#a855f7' },
    { name: 'Mint Fresh', background: '#d1fae5', foreground: '#1f2937', accent: '#f59e0b' },
    { name: 'Peach Sunset', background: '#fed7aa', foreground: '#1c1917', accent: '#db2777' },
  ],
  technical: [
    { name: 'Deep Navy', background: '#0a0a14', foreground: '#F4EFE6', accent: '#06b6d4' },
    { name: 'Terminal', background: '#0d0d0d', foreground: '#22c55e', accent: '#a78bfa' },
    { name: 'Cyberpunk', background: '#0a0420', foreground: '#F4EFE6', accent: '#ec4899' },
    { name: 'Matrix', background: '#030712', foreground: '#d1d5db', accent: '#10b981' },
  ],
  luxurious: [
    { name: 'Black & Gold', background: '#141210', foreground: '#F4EFE6', accent: '#c9a96e' },
    { name: 'Burgundy Cream', background: '#2d1b1f', foreground: '#F4EFE6', accent: '#e8b874' },
    { name: 'Marble', background: '#F4EFE6', foreground: '#141210', accent: '#8b6f47' },
    { name: 'Emerald Noir', background: '#0a1a14', foreground: '#F4EFE6', accent: '#d4af37' },
  ],
};

// ─── Compositional variations — added to prompts for freshness ─────────────
const COMPOSITION_VARIATIONS = [
  'wide cinematic shot',
  'medium cinematic composition',
  'dramatic low angle',
  'elegant overhead angle',
  'editorial three-quarter view',
];

const LIGHTING_VARIATIONS = [
  'golden hour warm light',
  'blue hour cool tones',
  'dramatic volumetric beams',
  'soft diffused natural light',
  'moody directional rim lighting',
];

// ─── Fisher–Yates shuffle for scene/palette randomization ─────────────────
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = temp;
  }
  return out;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function extractFields(brief: string): { brandName: string; description: string; toneId: string | null } {
  const brandMatch = brief.match(/Brand name:\s*([^.\n]+)/);
  const brandName =
    brandMatch?.[1]?.trim() && !brandMatch[1].includes('not provided')
      ? brandMatch[1].trim()
      : 'Your Brand';
  const descMatch = brief.match(/What it is:\s*([^\n]+)/);
  const description = descMatch?.[1]?.trim() ?? '';
  const toneMatch = brief.match(/Tone:\s*([^.]+)\./);
  const toneId = getToneIdByLabel(toneMatch?.[1]);
  return { brandName, description, toneId };
}

function buildVisualPrompt(args: {
  brandName: string;
  description: string;
  scene: SceneTemplate;
  palette: PaletteOption;
}): string {
  const { scene, palette } = args;
  const composition = pickRandom(COMPOSITION_VARIATIONS);
  const lighting = pickRandom(LIGHTING_VARIATIONS);

  // Background-only prompt — the HTML overlay adds nav/headline/CTAs on top.
  // Asking the image model to bake text into the image AND rendering the same
  // text as HTML = doubled ghost text over the user's hero. Don't do that.
  return `Ultra-clean composition, premium color grading, full-bleed website hero background. ${composition} with ${lighting} — ${scene.background}. Design style: ${scene.style}. Color palette: ${palette.background} background with ${palette.accent} accents. ABSOLUTELY NO TEXT, NO LOGOS, NO WORDS, NO UI ELEMENTS, NO BUTTONS, NO NAVIGATION, NO HEADLINES, NO LABELS, NO WATERMARKS IN THE IMAGE. Pure atmospheric scene only. Aspect ratio 16:9.`;
}

export async function POST(req: NextRequest): Promise<Response> {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { brandName, description, toneId } = extractFields(parsed.data.brief);

  // Get candidate scenes for this industry/tone (5-6 options)
  const sceneCandidates = detectIndustryScenes(parsed.data.brief, toneId);
  // Randomly pick 3 unique scenes
  const chosenScenes = shuffle(sceneCandidates).slice(0, 3);

  // Shuffle palettes so each generation pairs differently
  const palettePool = shuffle(PALETTES[toneId ?? 'minimal'] ?? PALETTES.minimal!);

  const options: ArtDirectionOption[] = chosenScenes.map((sceneKey, idx) => {
    const scene = SCENES[sceneKey]!;
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
}
