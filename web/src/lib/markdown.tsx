import { Fragment, ReactNode } from 'react';

/**
 * Tiny safe markdown renderer for article bodies.
 * Supports: # h1, ## h2, ### h3, paragraphs, **bold**, *em*, `code`,
 * [link](url), - bullet lists, > blockquote, horizontal rule (---).
 * Escapes all HTML first → XSS-safe.
 */
export function renderMarkdown(src: string): ReactNode {
  const blocks = src.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return blocks.map((block, i) => <Block key={i} src={block.trim()} />);
}

function Block({ src }: { src: string }) {
  if (!src) return null;

  if (src === '---' || src === '***') {
    return <hr className="my-6 border-[var(--color-border)]" />;
  }
  if (src.startsWith('### ')) {
    return <h3 className="text-lg font-bold mt-6 mb-2">{renderInline(src.slice(4))}</h3>;
  }
  if (src.startsWith('## ')) {
    return <h2 className="text-xl font-bold mt-8 mb-3">{renderInline(src.slice(3))}</h2>;
  }
  if (src.startsWith('# ')) {
    return <h1 className="text-2xl font-bold mt-8 mb-4">{renderInline(src.slice(2))}</h1>;
  }
  if (src.split('\n').every((l) => l.trim().startsWith('- '))) {
    const items = src.split('\n').map((l) => l.trim().slice(2));
    return (
      <ul className="list-disc pl-5 space-y-1 my-3">
        {items.map((it, i) => (
          <li key={i}>{renderInline(it)}</li>
        ))}
      </ul>
    );
  }
  if (src.startsWith('> ')) {
    const body = src
      .split('\n')
      .map((l) => l.replace(/^>\s?/, ''))
      .join(' ');
    return (
      <blockquote className="border-l-4 border-[var(--color-accent)] pl-4 italic text-[var(--color-muted)] my-4">
        {renderInline(body)}
      </blockquote>
    );
  }
  return (
    <p className="leading-relaxed my-3">
      {src.split('\n').map((line, i, arr) => (
        <Fragment key={i}>
          {renderInline(line)}
          {i < arr.length - 1 && <br />}
        </Fragment>
      ))}
    </p>
  );
}

function renderInline(s: string): ReactNode {
  const tokens: ReactNode[] = [];
  let buf = '';
  let i = 0;
  const flush = () => {
    if (buf) {
      tokens.push(buf);
      buf = '';
    }
  };

  while (i < s.length) {
    if (s.startsWith('**', i)) {
      const end = s.indexOf('**', i + 2);
      if (end !== -1) {
        flush();
        tokens.push(<strong key={`b${i}`}>{s.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    if (s[i] === '*' && s[i - 1] !== '*' && s[i + 1] !== '*') {
      const end = s.indexOf('*', i + 1);
      if (end !== -1 && s[end + 1] !== '*') {
        flush();
        tokens.push(<em key={`i${i}`}>{s.slice(i + 1, end)}</em>);
        i = end + 1;
        continue;
      }
    }
    if (s[i] === '`') {
      const end = s.indexOf('`', i + 1);
      if (end !== -1) {
        flush();
        tokens.push(
          <code key={`c${i}`} className="px-1 py-0.5 rounded bg-[var(--color-accent)]/10 text-sm font-mono">
            {s.slice(i + 1, end)}
          </code>
        );
        i = end + 1;
        continue;
      }
    }
    if (s[i] === '[') {
      const linkEnd = s.indexOf(']', i + 1);
      if (linkEnd !== -1 && s[linkEnd + 1] === '(') {
        const urlEnd = s.indexOf(')', linkEnd + 2);
        if (urlEnd !== -1) {
          const text = s.slice(i + 1, linkEnd);
          const url = s.slice(linkEnd + 2, urlEnd);
          if (/^(https?:|mailto:|tel:|\/)/i.test(url)) {
            flush();
            tokens.push(
              <a
                key={`l${i}`}
                href={url}
                target={url.startsWith('http') ? '_blank' : undefined}
                rel="noopener"
                className="text-[var(--color-accent-2)] underline hover:no-underline"
              >
                {text}
              </a>
            );
            i = urlEnd + 1;
            continue;
          }
        }
      }
    }
    buf += s[i];
    i++;
  }
  flush();
  return <>{tokens}</>;
}
