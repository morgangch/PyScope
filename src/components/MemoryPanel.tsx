import { Database, Terminal, Box } from 'lucide-react';
import type { Exercise, Step } from '../engine/types';
import { ValueView } from './ValueView';

export function MemoryPanel({
  step,
  previous,
  exercise,
}: {
  step?: Step;
  previous?: Step;
  exercise: Exercise;
}) {
  const variables = step?.globals || {};
  const objects = Object.values(step?.objects || {});
  return (
    <section className="panel memory-panel" aria-label="Mémoire et résultat">
      <div className="panel-heading">
        <h2>
          <Database size={17} /> Mémoire & résultat
        </h2>
        <span className="live-indicator">instantané</span>
      </div>
      <div className="memory-content">
        <div className="section-label">
          VARIABLES GLOBALES <span>{Object.keys(variables).length}</span>
        </div>
        {Object.keys(variables).length ? (
          <dl className="variables globals">
            {Object.entries(variables).map(([name, value]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>
                  <ValueView value={value} previous={previous?.globals[name]} />
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="muted empty-small">Aucune variable globale pour le moment.</p>
        )}
        {exercise.visualization === 'search' && <SearchView exercise={exercise} step={step} />}
        <div className="section-label object-label">
          OBJETS EN MÉMOIRE <Box size={13} />
        </div>
        {!objects.length && (
          <div className="object-empty">
            Les listes et les instances apparaîtront ici.
            <br />
            <span>Un nom référence un objet ; il n’est pas l’objet.</span>
          </div>
        )}
        {objects.map((object) => (
          <article id={`object-${object.id}`} tabIndex={-1} key={object.id} className="heap-object">
            <header>
              <strong>{object.type}</strong>
              <span>#{object.id}</span>
            </header>
            <div className="object-refs">
              {step?.references
                .filter((r) => r.target === object.id)
                .map((r) => (
                  <span key={r.source}>
                    {r.source.replace('global.', '')} <b>→</b>
                  </span>
                ))}
            </div>
            {object.attributes && (
              <dl className="variables">
                {Object.entries(object.attributes).map(([name, value]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>
                      <ValueView
                        value={value}
                        previous={previous?.objects[object.id]?.attributes?.[name]}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {object.items && (
              <div className="list-values">
                {object.items.map((value, index) => (
                  <div key={index}>
                    <small>{index}</small>
                    <ValueView
                      value={value}
                      previous={previous?.objects[object.id]?.items?.[index]}
                    />
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="terminal">
        <div>
          <span>
            <Terminal size={15} /> SORTIE · print()
          </span>
          <span className="terminal-dot" />
        </div>
        <pre data-testid="stdout">
          {step?.stdout || <span className="terminal-placeholder">En attente d’un print()…</span>}
        </pre>
      </div>
    </section>
  );
}

function SearchView({ exercise, step }: { exercise: Exercise; step?: Step }) {
  const config = exercise.search;
  if (!config || !step) return null;
  const scope = step.stack.at(-1)?.locals || {};
  const list = step.globals[config.list];
  const items = list && typeof list === 'object' ? step.objects[list.ref]?.items : undefined;
  if (!items) return null;
  const result = step.globals[config.result];
  const ended = !step.stack.length && typeof result === 'number';
  const left = ended
    ? result === -1
      ? items.length
      : result
    : typeof scope[config.left] === 'number'
      ? (scope[config.left] as number)
      : 0;
  const right = ended
    ? result === -1
      ? -1
      : result
    : typeof scope[config.right] === 'number'
      ? (scope[config.right] as number)
      : items.length - 1;
  const middle = ended ? result : scope[config.middle];
  return (
    <div className="search-view">
      <div className="section-label">
        ZONE DE RECHERCHE <span>cible {String(step.globals[config.target])}</span>
      </div>
      <div className="search-bounds">
        {ended ? (
          `Recherche terminée · indice ${result}`
        ) : (
          <>
            gauche = {left} <span>milieu = {typeof middle === 'number' ? middle : '—'}</span> droite
            = {right}
          </>
        )}
      </div>
      <div className="search-cells">
        {items.map((value, i) => (
          <div
            key={i}
            className={`${i < left || i > right ? 'excluded' : 'possible'} ${i === middle ? 'examined' : ''}`}
          >
            <small>{i}</small>
            <ValueView value={value} />
            <span>{i === middle ? '▼' : i < left || i > right ? '×' : '·'}</span>
          </div>
        ))}
      </div>
      <p>▼ case examinée · × case exclue{left > right ? ' · Zone vide : cible absente' : ''}</p>
    </div>
  );
}
