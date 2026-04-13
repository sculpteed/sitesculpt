'use client';

import { useRef, useCallback } from 'react';

/**
 * Inline-editable text for the preview iframe. When edit mode is on,
 * text becomes contentEditable. On blur, sends a postMessage to the
 * parent Studio with the field path + new value.
 */
export function EditableText({
  value,
  path,
  editable,
  className,
  tag: Tag = 'span',
  style,
  children,
}: {
  value: string;
  path: string;
  editable: boolean;
  className?: string;
  tag?: 'span' | 'h1' | 'h2' | 'p' | 'div' | 'blockquote';
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  const handleBlur = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = (el.textContent ?? '').trim();
    if (next && next !== value) {
      window.parent.postMessage(
        { type: 'sitesculpt-edit', path, value: next },
        '*',
      );
    }
  }, [value, path]);

  if (!editable) {
    return <Tag className={className} style={style}>{children ?? value}</Tag>;
  }

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`${className ?? ''} outline-none ring-transparent transition-shadow focus:ring-2 focus:ring-white/30 focus:rounded-sm`}
      style={{ ...style, cursor: 'text' }}
    >
      {children ?? value}
    </Tag>
  );
}
