import { useEffect, useRef } from 'react';
import { Code2, Circle } from 'lucide-react';
import type { Step } from '../engine/types';

function Syntax({ text }: { text: string }) {
  const parts = text.split(
    /("[^"]*"|'[^']*'|#.*$|\b(?:def|class|if|else|while|return|in|for|True|False|None)\b|\b\d+(?:\.\d+)?\b|\b(?:print|len|self)\b)/g,
  );
  return (
    <>
      {parts.map((part, i) => {
        const kind = /^['"]/.test(part)
          ? 'string'
          : /^#/.test(part)
            ? 'comment'
            : /^\d/.test(part)
              ? 'number'
              : /^(def|class|if|else|while|return|in|for|True|False|None)$/.test(part)
                ? 'keyword'
                : /^(print|len|self)$/.test(part)
                  ? 'builtin'
                  : '';
        return (
          <span key={i} className={kind}>
            {part}
          </span>
        );
      })}
    </>
  );
}
export function CodePanel({ code, step, id }: { code: string; step?: Step; id: string }) {
  const current = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const line = current.current;
    const container = line?.parentElement;
    if (line && container) {
      if (
        line.offsetTop < container.scrollTop ||
        line.offsetTop + line.offsetHeight > container.scrollTop + container.clientHeight
      )
        container.scrollTop = line.offsetTop - container.clientHeight / 2;
    }
  }, [step?.line]);
  return (
    <section className="panel code-panel" aria-label="Code Python">
      <div className="panel-heading">
        <h2>
          <Code2 size={17} /> Code
        </h2>
        <span className="micro-label">PYTHON</span>
      </div>
      <div className="file-tab">
        <span className="python-mark">py</span> {id}.py <span className="file-dot" />
      </div>
      <div
        className="code-lines"
        tabIndex={0}
        aria-label="Code du programme, défilement au clavier"
      >
        {code.split('\n').map((line, index) => {
          const n = index + 1;
          const isCurrent = step?.line === n && step.event !== 'end';
          const isCall = step?.callLine === n;
          const isResume = step?.resumeLine === n;
          return (
            <div
              key={n}
              ref={isCurrent ? current : undefined}
              className={`code-line ${isCurrent ? 'current-line' : ''} ${isCall ? 'call-line' : ''} ${isResume ? 'resume-line' : ''}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className="line-pointer"
                title={
                  isResume ? 'Reprise' : isCall ? 'Appel' : isCurrent ? 'Ligne courante' : undefined
                }
              >
                {isResume ? '↩' : isCall ? '↗' : isCurrent ? '●' : ''}
              </span>
              <span className="line-number">{n}</span>
              <code>
                <Syntax text={line || ' '} />
              </code>
            </div>
          );
        })}
      </div>
      <div className="code-legend">
        <span>
          <Circle size={8} fill="currentColor" /> En cours
        </span>
        <span>↗ Appel</span>
        <span>↩ Reprise</span>
      </div>
      <div className="panel-footnote">
        Les événements « ligne » montrent l’état <strong>avant</strong> l’instruction.
      </div>
    </section>
  );
}
