'use client';

import { Plus, X } from 'lucide-react';
import { useStudioStore } from './store';
import type { UserData } from './userData';

/**
 * Progressive data-collection panels — reveal when the user toggles the
 * matching page preset on. Each panel collects the RAW DATA for that
 * section type, which then gets injected into the Claude brief via
 * compilePrompt. This is the architectural fix that stops fabrication —
 * Claude formats your data instead of inventing specifics.
 */
export function DataPanels() {
  const includedPages = useStudioStore((s) => s.includedPages);
  const userData = useStudioStore((s) => s.userData);
  const setUserData = useStudioStore((s) => s.setUserData);

  const anyRevealed =
    includedPages.some((id) =>
      ['team', 'pricing', 'testimonials', 'case-studies', 'faq', 'features', 'contact'].includes(
        id,
      ),
    ) || hasAnyData(userData);

  if (!anyRevealed) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-warm">
        <span>Your real data</span>
        <span className="font-mono text-[9px] text-warm-subtle">
          (skip any — we'll use placeholders)
        </span>
      </div>
      <div className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[rgba(243,234,217,0.015)] p-4">
        <AntiFabricationHint />
        {(includedPages.includes('team') || userData.team.length > 0) && (
          <TeamPanel userData={userData} setUserData={setUserData} />
        )}
        {(includedPages.includes('pricing') || userData.pricing.length > 0) && (
          <PricingPanel userData={userData} setUserData={setUserData} />
        )}
        {(includedPages.includes('testimonials') || userData.testimonials.length > 0) && (
          <TestimonialsPanel userData={userData} setUserData={setUserData} />
        )}
        {(includedPages.includes('case-studies') || userData.caseStudies.length > 0) && (
          <CaseStudiesPanel userData={userData} setUserData={setUserData} />
        )}
        {(includedPages.includes('faq') || userData.faqs.length > 0) && (
          <FaqPanel userData={userData} setUserData={setUserData} />
        )}
        {(includedPages.includes('features') || userData.features.length > 0) && (
          <FeaturesPanel userData={userData} setUserData={setUserData} />
        )}
        {(includedPages.includes('contact') || hasContact(userData)) && (
          <ContactPanel userData={userData} setUserData={setUserData} />
        )}
        <MetricsPanel userData={userData} setUserData={setUserData} />
        <LogosPanel userData={userData} setUserData={setUserData} />
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasAnyData(d: UserData): boolean {
  return (
    d.team.length +
      d.pricing.length +
      d.testimonials.length +
      d.caseStudies.length +
      d.faqs.length +
      d.features.length +
      d.metrics.length +
      d.customerLogos.length >
      0 || hasContact(d)
  );
}

function hasContact(d: UserData): boolean {
  return Boolean(d.contact.email || d.contact.phone || d.contact.address);
}

type SetUserData = (updater: (prev: UserData) => UserData) => void;

function AntiFabricationHint() {
  return (
    <p className="text-[11px] leading-relaxed text-warm-muted">
      Everything you add here is used verbatim in your generated site. Leave a section empty and
      we use clearly-marked placeholders (like <code className="font-mono">[Founder name]</code>)
      that you fill in after export.
    </p>
  );
}

// ─── Section header (collapsible visual) ────────────────────────────────────

function Section({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[var(--color-border)] pt-4 first:border-t-0 first:pt-0">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-warm">
          {label}
        </span>
        <span className="font-mono text-[9px] text-warm-subtle">
          {count === 0 ? 'placeholder' : `${count} provided`}
        </span>
      </div>
      {children}
    </div>
  );
}

function Row({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="group relative rounded-md border border-[var(--color-border)] bg-[rgba(243,234,217,0.01)] p-2.5">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 rounded p-1 text-warm-subtle opacity-0 transition hover:bg-[rgba(243,234,217,0.06)] hover:text-warm group-hover:opacity-100"
        aria-label="Remove"
      >
        <X className="h-3 w-3" />
      </button>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--color-border-strong)] px-3 py-1.5 text-[11px] text-warm-muted transition hover:border-[var(--color-accent)] hover:text-warm"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  );
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent pr-6 text-[12px] text-warm placeholder:text-warm-subtle outline-none"
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none bg-transparent pr-6 text-[12px] text-warm placeholder:text-warm-subtle outline-none"
    />
  );
}

// ─── Panels ─────────────────────────────────────────────────────────────────

function TeamPanel({ userData, setUserData }: { userData: UserData; setUserData: SetUserData }) {
  const update = (i: number, patch: Partial<UserData['team'][number]>): void =>
    setUserData((prev) => ({
      ...prev,
      team: prev.team.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
    }));
  const remove = (i: number): void =>
    setUserData((prev) => ({ ...prev, team: prev.team.filter((_, idx) => idx !== i) }));
  const add = (): void =>
    setUserData((prev) => ({
      ...prev,
      team: [...prev.team, { name: '', role: '', bio: '' }],
    }));

  return (
    <Section label="Team" count={userData.team.length}>
      <div className="space-y-2">
        {userData.team.map((m, i) => (
          <Row key={i} onRemove={() => remove(i)}>
            <Input
              value={m.name}
              onChange={(v) => update(i, { name: v })}
              placeholder="Name (e.g. Alex Morgan)"
            />
            <Input
              value={m.role}
              onChange={(v) => update(i, { role: v })}
              placeholder="Role (e.g. Co-founder, CEO)"
            />
            <Textarea
              value={m.bio ?? ''}
              onChange={(v) => update(i, { bio: v })}
              placeholder="Short bio (optional)"
              rows={1}
            />
          </Row>
        ))}
        <AddButton label="Add team member" onClick={add} />
      </div>
    </Section>
  );
}

function PricingPanel({
  userData,
  setUserData,
}: {
  userData: UserData;
  setUserData: SetUserData;
}) {
  const update = (i: number, patch: Partial<UserData['pricing'][number]>): void =>
    setUserData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }));
  const remove = (i: number): void =>
    setUserData((prev) => ({
      ...prev,
      pricing: prev.pricing.filter((_, idx) => idx !== i),
    }));
  const add = (): void =>
    setUserData((prev) => ({
      ...prev,
      pricing: [...prev.pricing, { name: '', price: '', period: '/mo', features: [] }],
    }));
  const updateFeature = (i: number, fIdx: number, v: string): void =>
    setUserData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((t, idx) =>
        idx === i
          ? { ...t, features: t.features.map((f, fi) => (fi === fIdx ? v : f)) }
          : t,
      ),
    }));
  const addFeature = (i: number): void =>
    setUserData((prev) => ({
      ...prev,
      pricing: prev.pricing.map((t, idx) =>
        idx === i ? { ...t, features: [...t.features, ''] } : t,
      ),
    }));

  return (
    <Section label="Pricing tiers" count={userData.pricing.length}>
      <div className="space-y-2">
        {userData.pricing.map((t, i) => (
          <Row key={i} onRemove={() => remove(i)}>
            <Input
              value={t.name}
              onChange={(v) => update(i, { name: v })}
              placeholder="Tier name (e.g. Starter)"
            />
            <div className="flex gap-2">
              <Input
                value={t.price}
                onChange={(v) => update(i, { price: v })}
                placeholder="Price (e.g. $19 or Free)"
              />
              <Input
                value={t.period ?? ''}
                onChange={(v) => update(i, { period: v })}
                placeholder="Period (/mo)"
              />
            </div>
            <Input
              value={t.tagline ?? ''}
              onChange={(v) => update(i, { tagline: v })}
              placeholder="Tagline (optional)"
            />
            <div className="mt-1 space-y-1">
              {t.features.map((f, fi) => (
                <Input
                  key={fi}
                  value={f}
                  onChange={(v) => updateFeature(i, fi, v)}
                  placeholder="Feature line"
                />
              ))}
              <button
                type="button"
                onClick={() => addFeature(i)}
                className="text-[10px] text-warm-subtle hover:text-warm"
              >
                + feature
              </button>
            </div>
          </Row>
        ))}
        <AddButton label="Add pricing tier" onClick={add} />
      </div>
    </Section>
  );
}

function TestimonialsPanel({
  userData,
  setUserData,
}: {
  userData: UserData;
  setUserData: SetUserData;
}) {
  const update = (i: number, patch: Partial<UserData['testimonials'][number]>): void =>
    setUserData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }));
  const remove = (i: number): void =>
    setUserData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, idx) => idx !== i),
    }));
  const add = (): void =>
    setUserData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, { quote: '', name: '', role: '' }],
    }));

  return (
    <Section label="Testimonials" count={userData.testimonials.length}>
      <div className="space-y-2">
        {userData.testimonials.map((t, i) => (
          <Row key={i} onRemove={() => remove(i)}>
            <Textarea
              value={t.quote}
              onChange={(v) => update(i, { quote: v })}
              placeholder="The quote (what they said)"
              rows={2}
            />
            <Input
              value={t.name}
              onChange={(v) => update(i, { name: v })}
              placeholder="Customer name"
            />
            <Input
              value={t.role ?? ''}
              onChange={(v) => update(i, { role: v })}
              placeholder="Role / Company (optional)"
            />
          </Row>
        ))}
        <AddButton label="Add testimonial" onClick={add} />
      </div>
    </Section>
  );
}

function CaseStudiesPanel({
  userData,
  setUserData,
}: {
  userData: UserData;
  setUserData: SetUserData;
}) {
  const update = (i: number, patch: Partial<UserData['caseStudies'][number]>): void =>
    setUserData((prev) => ({
      ...prev,
      caseStudies: prev.caseStudies.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));
  const remove = (i: number): void =>
    setUserData((prev) => ({
      ...prev,
      caseStudies: prev.caseStudies.filter((_, idx) => idx !== i),
    }));
  const add = (): void =>
    setUserData((prev) => ({
      ...prev,
      caseStudies: [...prev.caseStudies, { client: '', challenge: '', outcome: '' }],
    }));

  return (
    <Section label="Case studies" count={userData.caseStudies.length}>
      <div className="space-y-2">
        {userData.caseStudies.map((c, i) => (
          <Row key={i} onRemove={() => remove(i)}>
            <Input
              value={c.client}
              onChange={(v) => update(i, { client: v })}
              placeholder="Client name"
            />
            <Input
              value={c.challenge}
              onChange={(v) => update(i, { challenge: v })}
              placeholder="Challenge (1 sentence)"
            />
            <Input
              value={c.outcome}
              onChange={(v) => update(i, { outcome: v })}
              placeholder="Outcome (1 sentence)"
            />
            <Input
              value={c.metric ?? ''}
              onChange={(v) => update(i, { metric: v })}
              placeholder="Metric (e.g. 3× conversion)"
            />
          </Row>
        ))}
        <AddButton label="Add case study" onClick={add} />
      </div>
    </Section>
  );
}

function FaqPanel({ userData, setUserData }: { userData: UserData; setUserData: SetUserData }) {
  const update = (i: number, patch: Partial<UserData['faqs'][number]>): void =>
    setUserData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    }));
  const remove = (i: number): void =>
    setUserData((prev) => ({ ...prev, faqs: prev.faqs.filter((_, idx) => idx !== i) }));
  const add = (): void =>
    setUserData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));

  return (
    <Section label="FAQ" count={userData.faqs.length}>
      <div className="space-y-2">
        {userData.faqs.map((f, i) => (
          <Row key={i} onRemove={() => remove(i)}>
            <Input
              value={f.question}
              onChange={(v) => update(i, { question: v })}
              placeholder="Question"
            />
            <Textarea
              value={f.answer}
              onChange={(v) => update(i, { answer: v })}
              placeholder="Answer"
              rows={2}
            />
          </Row>
        ))}
        <AddButton label="Add FAQ" onClick={add} />
      </div>
    </Section>
  );
}

function FeaturesPanel({
  userData,
  setUserData,
}: {
  userData: UserData;
  setUserData: SetUserData;
}) {
  const update = (i: number, patch: Partial<UserData['features'][number]>): void =>
    setUserData((prev) => ({
      ...prev,
      features: prev.features.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    }));
  const remove = (i: number): void =>
    setUserData((prev) => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== i),
    }));
  const add = (): void =>
    setUserData((prev) => ({
      ...prev,
      features: [...prev.features, { name: '', description: '' }],
    }));

  return (
    <Section label="Features" count={userData.features.length}>
      <div className="space-y-2">
        {userData.features.map((f, i) => (
          <Row key={i} onRemove={() => remove(i)}>
            <Input
              value={f.name}
              onChange={(v) => update(i, { name: v })}
              placeholder="Feature name"
            />
            <Textarea
              value={f.description}
              onChange={(v) => update(i, { description: v })}
              placeholder="Short description"
              rows={1}
            />
          </Row>
        ))}
        <AddButton label="Add feature" onClick={add} />
      </div>
    </Section>
  );
}

function ContactPanel({
  userData,
  setUserData,
}: {
  userData: UserData;
  setUserData: SetUserData;
}) {
  const update = (patch: Partial<UserData['contact']>): void =>
    setUserData((prev) => ({ ...prev, contact: { ...prev.contact, ...patch } }));

  return (
    <Section label="Contact" count={hasContact(userData) ? 1 : 0}>
      <div className="space-y-2 rounded-md border border-[var(--color-border)] bg-[rgba(243,234,217,0.01)] p-2.5">
        <Input
          value={userData.contact.email ?? ''}
          onChange={(v) => update({ email: v })}
          placeholder="Email"
        />
        <Input
          value={userData.contact.phone ?? ''}
          onChange={(v) => update({ phone: v })}
          placeholder="Phone (optional)"
        />
        <Input
          value={userData.contact.address ?? ''}
          onChange={(v) => update({ address: v })}
          placeholder="Address (optional)"
        />
      </div>
    </Section>
  );
}

function MetricsPanel({
  userData,
  setUserData,
}: {
  userData: UserData;
  setUserData: SetUserData;
}) {
  const update = (i: number, patch: Partial<UserData['metrics'][number]>): void =>
    setUserData((prev) => ({
      ...prev,
      metrics: prev.metrics.map((m, idx) => (idx === i ? { ...m, ...patch } : m)),
    }));
  const remove = (i: number): void =>
    setUserData((prev) => ({
      ...prev,
      metrics: prev.metrics.filter((_, idx) => idx !== i),
    }));
  const add = (): void =>
    setUserData((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { label: '', value: '' }],
    }));

  return (
    <Section label="Key metrics" count={userData.metrics.length}>
      <div className="space-y-2">
        {userData.metrics.map((m, i) => (
          <Row key={i} onRemove={() => remove(i)}>
            <Input
              value={m.label}
              onChange={(v) => update(i, { label: v })}
              placeholder="Label (e.g. Monthly active users)"
            />
            <Input
              value={m.value}
              onChange={(v) => update(i, { value: v })}
              placeholder="Value (e.g. 12k+)"
            />
          </Row>
        ))}
        <AddButton label="Add metric" onClick={add} />
      </div>
    </Section>
  );
}

function LogosPanel({
  userData,
  setUserData,
}: {
  userData: UserData;
  setUserData: SetUserData;
}) {
  const setLogos = (logos: string[]): void =>
    setUserData((prev) => ({ ...prev, customerLogos: logos }));

  return (
    <Section label="Customer logos" count={userData.customerLogos.length}>
      <Textarea
        value={userData.customerLogos.join(', ')}
        onChange={(v) =>
          setLogos(
            v
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        placeholder="Comma-separated company names (only real customers)"
        rows={2}
      />
    </Section>
  );
}
