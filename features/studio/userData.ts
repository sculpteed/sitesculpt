// User-provided structured data injected verbatim into the brief.
// Each type maps 1:1 to a page preset id — GuidedForm reveals the matching
// editor panel when the user toggles the page on.

export interface TeamMemberInput {
  name: string;
  role: string;
  bio?: string;
}

export interface PricingTierInput {
  name: string; // "Starter"
  price: string; // "$19" or "Free" or "Contact us"
  period?: string; // "/month" — optional
  tagline?: string; // one-line description
  features: string[]; // bullet points
  cta?: string; // button label
  highlighted?: boolean; // the "recommended" tier
}

export interface TestimonialInput {
  quote: string;
  name: string;
  role?: string; // "Designer at Figma" or just "Designer"
}

export interface CaseStudyInput {
  client: string; // "Acme Inc"
  challenge: string; // 1 sentence
  outcome: string; // 1 sentence
  metric?: string; // "3× conversion lift"
}

export interface FaqInput {
  question: string;
  answer: string;
}

export interface FeatureInput {
  name: string;
  description: string;
}

export interface MetricInput {
  label: string; // "Monthly active users"
  value: string; // "12k+"
}

export interface ContactInput {
  email?: string;
  phone?: string;
  address?: string;
  social?: Array<{ label: string; url: string }>;
}

/** Full bag of user-provided data — each field is optional. */
export interface UserData {
  team: TeamMemberInput[];
  pricing: PricingTierInput[];
  testimonials: TestimonialInput[];
  caseStudies: CaseStudyInput[];
  faqs: FaqInput[];
  features: FeatureInput[];
  metrics: MetricInput[];
  customerLogos: string[]; // free-form list of company names
  contact: ContactInput;
}

export function emptyUserData(): UserData {
  return {
    team: [],
    pricing: [],
    testimonials: [],
    caseStudies: [],
    faqs: [],
    features: [],
    metrics: [],
    customerLogos: [],
    contact: {},
  };
}
