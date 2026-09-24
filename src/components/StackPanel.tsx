import { Layers3, CornerDownLeft, ArrowDown } from 'lucide-react';
import type { Step } from '../engine/types';
import { displayValue, ValueView } from './ValueView';

export function StackPanel({ step, previous }: { step?: Step; previous?: Step }) {
  const frames = step?.stack || [];
  return (
    <section className="panel stack-panel" aria-label="Pile d’appels">
      <div className="panel-heading">
        <h2>
          <Layers3 size={17} /> Pile d’appels
        </h2>
        <span className="count-badge">{frames.length}</span>
      </div>
      <div className="stack-intro">
        <span>Dernier entré, premier sorti</span>
        <ArrowDown size={14} />
      </div>
      <div className="stack-content">
        {!frames.length && (
          <div className="empty-state">
            <Layers3 size={30} />
            <strong>
              {step?.event === 'end' ? 'Tous les appels sont terminés' : 'Tout commence ici'}
            </strong>
            <p>Un appel de fonction ajoutera une carte à la pile.</p>
          </div>
        )}
        {[...frames].reverse().map((frame, index) => {
          const active = index === 0;
          const old = previous?.stack.find((f) => f.id === frame.id);
          const child = frames[frames.indexOf(frame) + 1];
          const self = frame.locals.self;
          const selfObject = self && typeof self === 'object' ? step?.objects[self.ref] : undefined;
          return (
            <article
              key={frame.id}
              className={`frame-card ${active ? 'active-frame' : ''} ${active && step?.event === 'return' ? 'returning' : ''}`}
            >
              <header>
                <span className="frame-name">
                  {frame.name}(
                  {frame.parameters
                    .filter((p) => p !== 'self')
                    .map((p) => displayValue(frame.locals[p]))
                    .join(', ')}
                  )
                </span>
                <span className="frame-id">{frame.id}</span>
              </header>
              <div className="frame-state">
                {active
                  ? step?.event === 'return'
                    ? '↩ Retour à l’appelant'
                    : '● Appel actif'
                  : '◷ En attente'}
                <span>ligne {frame.line}</span>
              </div>
              <dl className="variables">
                {Object.entries(frame.locals).map(([name, value]) => (
                  <div key={name}>
                    <dt>
                      {name}
                      {frame.parameters.includes(name) && <small>param.</small>}
                    </dt>
                    <dd>
                      <ValueView value={value} previous={old?.locals[name]} />
                    </dd>
                  </div>
                ))}
              </dl>
              {selfObject && (
                <p className="self-hint">
                  self → {String(selfObject.attributes?.nom || selfObject.type)}{' '}
                  <span>#{selfObject.id}</span>
                </p>
              )}
              {child && (
                <p className="waiting-hint">
                  Attend {child.name}(
                  {child.parameters
                    .filter((p) => p !== 'self')
                    .map((p) => displayValue(child.locals[p]))
                    .join(', ')}
                  )
                </p>
              )}
              {active && step?.event === 'return' && (
                <div className="return-value">
                  <CornerDownLeft size={15} /> renvoie{' '}
                  <ValueView value={step.returnValue ?? null} />
                </div>
              )}
            </article>
          );
        })}
        <div className="stack-base">
          <CodeMark /> Programme principal <span>global</span>
        </div>
      </div>
      <div className="panel-footnote">Chaque appel a ses propres variables locales.</div>
    </section>
  );
}
function CodeMark() {
  return <span aria-hidden="true">⌘</span>;
}
