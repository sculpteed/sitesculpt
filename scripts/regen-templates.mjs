import { fal } from '@fal-ai/client';
import fs from 'fs';

fal.config({ credentials: process.env.FAL_API_KEY });

// New 3D cinematic templates — showcase the scroll-driven 3D capability
const templates = [
  {
    id: 'ai-platform',
    prompt: 'Futuristic enterprise AI platform landing page hero with cinematic 3D scene. Navigation: Logo Aura, Menu items: Overview, Infrastructure, Agents, Scale, Deploy, Button: Deploy Now. Centered hero layout. Headline: The intelligence layer for modern enterprise. Subtext: Unify your fragmented data streams. Aura processes billions of events in real-time to deliver autonomous predictive insights straight to your team. CTA button: Request Access + secondary: Explore Architecture. Hero background: breathtaking cinematic 3D render of floating sky islands connected by waterfalls cascading into clouds below, snow-capped mountains in distance, dramatic volumetric god rays piercing through atmospheric mist, Unreal Engine quality. Design style: cinematic 3D scene with epic scale and depth, Ghibli-meets-Inception atmosphere. Fonts: Inter / IBM Plex Sans. Colors: atmospheric blue-grey sky, warm sun highlights, white UI text, subtle gold accents.',
  },
  {
    id: 'space-research',
    prompt: 'Space research lab and cosmic discovery platform landing page hero. Navigation: Logo UNVRS Labs, Menu items: Premium, Scroll, Research, Missions, Gallery, Button: Start Building. Centered hero layout. Headline: Chart the unknown. Subtext: Advanced deep-space research platform for the next generation of cosmic explorers, astronomers, and theoretical physicists. CTA button: Enter the Lab + secondary: View Missions. Hero background: stunning cinematic 3D space scene with massive glowing ring portal in center, floating planets with rings, distant nebulae, stars and galaxies, a small spacecraft silhouette for scale, volumetric cosmic light, sci-fi concept art. Design style: cinematic space adventure with epic scale, Interstellar-meets-No-Mans-Sky aesthetic. Fonts: Space Grotesk / Inter. Colors: deep cosmic purple and blue, white bright stars, glowing cyan and pink nebula highlights.',
  },
  {
    id: 'architecture',
    prompt: 'Modern architecture studio landing page hero with 3D cinematic render. Navigation: Logo MERIDIAN in serif caps, Menu items: Projects, Practice, Awards, Journal, Contact, Button: Commission. Centered hero layout over full-bleed 3D render. Headline: Where vision meets form. Italic serif accent on "form". Subtext: A contemporary architecture practice designing residences, cultural institutions, and urban landmarks across North America and Europe. CTA button: View Portfolio + secondary: About Our Practice. Hero background: cinematic 3D architectural visualization of a minimalist modernist building with glass walls and exposed concrete, perched on a cliff overlooking ocean at golden hour, dramatic volumetric sunlight, surrounded by native landscaping, photoreal Unreal Engine render. Design style: sophisticated architectural photography with cinematic lighting, premium print-magazine aesthetic. Fonts: Cormorant Garamond / Inter. Colors: warm golden hour tones, deep shadows, cream text, muted bronze accent.',
  },
  {
    id: 'creative-3d',
    prompt: 'Bold 3D creative agency landing page hero with abstract cinematic composition. Navigation: Logo PRISM with geometric icon, Menu items: Work, Services, About, Contact, Button: Start a Project. Centered hero layout. Headline: Design at the speed of imagination. Subtext: We craft brand worlds, immersive digital experiences, and cinematic interactive identity systems for ambitious brands. CTA button: View Our Work + secondary: Our Process. Hero background: stunning cinematic 3D abstract scene with floating translucent glass prisms catching rainbow light, liquid chrome spheres reflecting a sunset sky, iridescent metallic ribbons flowing through space, volumetric lighting, ultra-high-detail Octane render. Design style: bold cinematic 3D concept art with dramatic lighting and rich color. Fonts: PP Neue Montreal / Inter. Colors: rich gradient backdrop, iridescent metallic highlights, white typography, vibrant accent spectrum.',
  },
];

for (const t of templates) {
  console.log('→ ' + t.id);
  try {
    const r = await fal.subscribe('fal-ai/ideogram/v3', {
      input: {
        prompt: t.prompt,
        image_size: 'landscape_16_9',
        num_images: 1,
        style: 'DESIGN',
      },
    });
    const url = r.data?.images?.[0]?.url;
    const resp = await fetch(url);
    const buf = Buffer.from(await resp.arrayBuffer());
    fs.writeFileSync('public/templates/' + t.id + '.jpg', buf);
    console.log('  ✓ ' + Math.round(buf.length / 1024) + 'KB');
  } catch (e) {
    console.log('  ✗ ' + e.message?.slice(0, 150));
  }
}
console.log('Done!');
