'use client';

import { useState, useRef } from 'react';
import { useStudioStore } from './store';
import { X, Send, Sparkles, Check, Paperclip, Image as ImageIcon } from 'lucide-react';
import { PulsingDots } from '@/components/LoadingStates';
import { errorMessage } from './api-helpers';
import type { Palette, SiteStructure } from '@/features/pipeline/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/** AI chat panel — natural-language edits against the current SiteStructure. */
export function ChatPanel() {
  const site = useStudioStore((s) => s.site);
  const scene = useStudioStore((s) => s.scene);
  const setSite = useStudioStore((s) => s.setSite);
  const setScene = useStudioStore((s) => s.setScene);
  const funnelStep = useStudioStore((s) => s.funnelStep);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ name: string; dataUrl: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (): Promise<void> => {
    const msg = input.trim();
    if (!msg || busy) return;

    const userMsg: ChatMessage = { role: 'user', content: msg, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setBusy(true);
    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          site: site ?? undefined,
          palette: scene?.palette,
          // concept + visualPrompt keep chat useful on hero/art-direction steps
          concept: scene?.concept,
          visualPrompt: scene?.visualPrompt,
          funnelStep,
        }),
      });

      if (!res.ok) {
        const reason = await errorMessage(res, 'unknown error');
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Sorry, that didn't work: ${reason}`, timestamp: Date.now() },
        ]);
        return;
      }

      const result = (await res.json()) as {
        site?: SiteStructure;
        paletteUpdate?: Palette;
        summary: string;
      };

      if (result.site) {
        setSite(result.site);
      }
      if (result.paletteUpdate && scene) {
        setScene({
          ...scene,
          palette: result.paletteUpdate,
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.summary,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Try again.', timestamp: Date.now() },
      ]);
    } finally {
      setBusy(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <ChatEmptyState funnelStep={funnelStep} setInput={setInput} inputRef={inputRef} />
        ) : (
          <ChatMessages messages={messages} busy={busy} messagesEndRef={messagesEndRef} />
        )}
      </div>
      {attachedImage ? (
        <AttachedImagePreview name={attachedImage.name} onRemove={() => setAttachedImage(null)} />
      ) : null}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={() => void handleSend()}
        busy={busy}
        funnelStep={funnelStep}
        inputRef={inputRef}
        fileInputRef={fileInputRef}
        onFileChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => setAttachedImage({ name: file.name, dataUrl: String(reader.result) });
          reader.readAsDataURL(file);
        }}
      />
    </div>
  );
}

// ─── Shared subcomponents ───────────────────────────────────────────────────

function ChatEmptyState({
  funnelStep,
  setInput,
  inputRef,
}: {
  funnelStep: string;
  setInput: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const suggestions =
    funnelStep === 'brief'
      ? ['Help me write the description', 'What tone fits a SaaS tool?', 'Which pages should I include?', 'Suggest a brand name']
      : funnelStep === 'art-direction'
        ? ['I want something darker', 'More colorful and bold', 'Minimalist and clean', 'Warm and inviting']
        : funnelStep === 'keyframe'
          ? ['Make it brighter', 'Different subject entirely', 'More abstract', 'Warmer lighting']
          : ['Make the headline shorter', 'Add a FAQ section', 'More playful tone', 'Change colors to blue'];

  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <Sparkles className="h-8 w-8 text-[var(--color-accent)] opacity-40" />
      <p className="text-[13px] text-warm-muted">
        {funnelStep === 'brief'
          ? "Need help? I can assist with your brief."
          : "Tell me what to change. I'll update instantly."}
      </p>
      <div className="flex flex-wrap justify-center gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setInput(s); inputRef.current?.focus(); }}
            className="rounded-full border border-[var(--color-border)] bg-[rgba(243,234,217,0.02)] px-2.5 py-1 text-[10px] text-warm-muted transition hover:border-[var(--color-border-strong)] hover:text-warm"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatMessages({
  messages,
  busy,
  messagesEndRef,
}: {
  messages: ChatMessage[];
  busy: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="space-y-3">
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
            msg.role === 'user'
              ? 'bg-[var(--color-accent)] text-[#0d0a08]'
              : 'bg-[rgba(243,234,217,0.05)] text-warm-muted'
          }`}>
            {msg.role === 'assistant' ? (
              <div className="flex items-start gap-2">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-accent)]" />
                <span>{msg.content}</span>
              </div>
            ) : msg.content}
          </div>
        </div>
      ))}
      {busy ? (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-xl bg-[rgba(243,234,217,0.05)] px-3.5 py-2.5 text-[13px] text-warm-muted">
            <Sparkles className="h-3 w-3 animate-pulse text-[var(--color-accent)]" />
            <span>Updating</span>
            <PulsingDots className="text-warm-subtle" />
          </div>
        </div>
      ) : null}
      <div ref={messagesEndRef} />
    </div>
  );
}

function AttachedImagePreview({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 border-t border-[var(--color-border)] px-3 pt-2">
      <div className="flex items-center gap-2 rounded-md bg-[rgba(243,234,217,0.04)] px-2 py-1">
        <ImageIcon className="h-3 w-3 text-[var(--color-accent)]" />
        <span className="max-w-[200px] truncate text-[11px] text-warm-muted">{name}</span>
        <button onClick={onRemove} className="text-warm-subtle hover:text-warm">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  onSend,
  busy,
  funnelStep,
  inputRef,
  fileInputRef,
  onFileChange,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  funnelStep: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="border-t border-[var(--color-border)] px-3 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-warm-subtle transition hover:bg-[rgba(243,234,217,0.06)] hover:text-warm"
          title="Attach an image"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder={funnelStep === 'brief' ? 'Ask me anything…' : 'Make a change…'}
          disabled={busy}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[rgba(243,234,217,0.02)] px-3 py-2 text-[13px] text-warm placeholder:text-warm-subtle outline-none transition focus:border-[var(--color-border-strong)] disabled:opacity-50"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={busy || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-30"
          style={{ backgroundColor: '#e8b874' }}
        >
          <Send className="h-3.5 w-3.5 text-[#0d0a08]" />
        </button>
      </div>
    </div>
  );
}
