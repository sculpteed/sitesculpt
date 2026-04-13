'use client';

import { useState, useRef, useEffect } from 'react';
import { useStudioStore } from './store';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Check, Paperclip, Image as ImageIcon } from 'lucide-react';
import { PulsingDots } from '@/components/LoadingStates';
import type { SiteStructure } from '@/features/pipeline/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * AI Chat Panel — floating collapsible panel in the studio where users
 * make changes via natural language.
 *
 * "Make the headline shorter" → Claude modifies the SiteStructure → preview
 * updates instantly. This is the core "feels like working with a designer"
 * interaction that differentiates us from form-based builders.
 */
export function ChatPanel() {
  const site = useStudioStore((s) => s.site);
  const scene = useStudioStore((s) => s.scene);
  const setSite = useStudioStore((s) => s.setSite);
  const setScene = useStudioStore((s) => s.setScene);
  const funnelStep = useStudioStore((s) => s.funnelStep);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ name: string; dataUrl: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat is available at EVERY step — context-aware based on funnel position

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
          site,
          palette: scene?.palette,
        }),
      });

      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({ error: 'Failed' }))) as { error?: string };
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Sorry, that didn't work: ${error ?? 'unknown error'}`, timestamp: Date.now() },
        ]);
        return;
      }

      const result = (await res.json()) as {
        site: SiteStructure;
        paletteUpdate?: { background: string; foreground: string; accent: string };
        summary: string;
      };

      // Apply changes to the store — preview updates instantly
      setSite(result.site);
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
    } catch (err) {
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
    <>
      {/* Toggle button — bottom right */}
      <AnimatePresence>
        {!open ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            type="button"
            onClick={() => {
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 200);
            }}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition hover:scale-105"
            style={{ backgroundColor: '#e8b874' }}
            title="AI Editor — make changes with natural language"
          >
            <Sparkles className="h-5 w-5 text-[#0d0a08]" />
          </motion.button>
        ) : null}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 flex w-[380px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[rgba(13,10,8,0.97)] shadow-2xl backdrop-blur-xl"
            style={{ maxHeight: 'min(600px, 80vh)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--color-accent)]" />
                <span className="text-[13px] font-medium text-warm">AI Editor</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1.5 text-warm-subtle transition hover:bg-[rgba(243,234,217,0.06)] hover:text-warm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <Sparkles className="h-8 w-8 text-[var(--color-accent)] opacity-40" />
                  <p className="text-[13px] text-warm-muted">
                    {funnelStep === 'brief'
                      ? 'Need help describing your site? I can help.'
                      : funnelStep === 'art-direction'
                        ? 'Want a different direction? Tell me what you\'re looking for.'
                        : funnelStep === 'keyframe'
                          ? 'Not feeling the hero? Tell me what to change.'
                          : 'Tell me what to change. I\'ll update your site instantly.'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {(funnelStep === 'brief'
                      ? [
                          'Help me write the description',
                          'What tone fits a SaaS tool?',
                          'Which pages should I include?',
                          'Suggest a brand name',
                        ]
                      : funnelStep === 'art-direction'
                        ? [
                            'I want something darker',
                            'More colorful and bold',
                            'Minimalist and clean',
                            'Warm and inviting',
                          ]
                        : funnelStep === 'keyframe'
                          ? [
                              'Make it brighter',
                              'Different subject entirely',
                              'More abstract',
                              'Warmer lighting',
                            ]
                          : [
                              'Make the headline shorter',
                              'Add a FAQ section',
                              'More playful tone',
                              'Change colors to blue',
                            ]
                    ).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setInput(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-[var(--color-border)] bg-[rgba(243,234,217,0.02)] px-2.5 py-1 text-[10px] text-warm-muted transition hover:border-[var(--color-border-strong)] hover:text-warm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[var(--color-accent)] text-[#0d0a08]'
                            : 'bg-[rgba(243,234,217,0.05)] text-warm-muted'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="flex items-start gap-2">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-accent)]" />
                            <span>{msg.content}</span>
                          </div>
                        ) : (
                          msg.content
                        )}
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
              )}
            </div>

            {/* Attached image preview */}
            {attachedImage ? (
              <div className="flex items-center gap-2 border-t border-[var(--color-border)] px-3 pt-2">
                <div className="flex items-center gap-2 rounded-md bg-[rgba(243,234,217,0.04)] px-2 py-1">
                  <ImageIcon className="h-3 w-3 text-[var(--color-accent)]" />
                  <span className="max-w-[200px] truncate text-[11px] text-warm-muted">{attachedImage.name}</span>
                  <button onClick={() => setAttachedImage(null)} className="text-warm-subtle hover:text-warm">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Input */}
            <div className="border-t border-[var(--color-border)] px-3 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-warm-subtle transition hover:bg-[rgba(243,234,217,0.06)] hover:text-warm"
                  title="Attach an image (logo, screenshot, reference)"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setAttachedImage({ name: file.name, dataUrl: String(reader.result) });
                    reader.readAsDataURL(file);
                  }}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder={funnelStep === 'brief' ? 'Ask me anything…' : 'Make a change…'}
                  disabled={busy}
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-[rgba(243,234,217,0.02)] px-3 py-2 text-[13px] text-warm placeholder:text-warm-subtle outline-none transition focus:border-[var(--color-border-strong)] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={busy || (!input.trim() && !attachedImage)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-30"
                  style={{ backgroundColor: '#e8b874' }}
                >
                  <Send className="h-3.5 w-3.5 text-[#0d0a08]" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
