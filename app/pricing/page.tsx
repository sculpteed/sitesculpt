import { Pricing } from '@/features/billing/Pricing';
import { getTiers } from '@/lib/stripe';

export const metadata = {
  title: 'Pricing — sitesculpt',
  description: 'Two plans. Subscribe to sculpt.',
};

export default function PricingPage() {
  // Server-side: read tiers from env so prices + Stripe price IDs stay
  // in one place. We pass the serializable shape to the client component.
  let tiers;
  try {
    tiers = getTiers().map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      tagline: t.tagline,
      features: t.features,
      recommended: t.recommended ?? false,
    }));
  } catch {
    // env not configured — show a helpful fallback
    tiers = null;
  }

  return <Pricing tiers={tiers} />;
}
