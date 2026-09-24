import type { Value } from '../engine/types';

export function displayValue(value: Value | undefined): string {
  if (value === undefined) return '—';
  if (value === null) return 'None';
  if (typeof value === 'object') return `↗ #${value.ref}`;
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  return typeof value === 'string' ? `"${value}"` : String(value);
}
export function ValueView({ value, previous }: { value: Value; previous?: Value }) {
  const changed = previous !== undefined && JSON.stringify(value) !== JSON.stringify(previous);
  return (
    <span className={`value ${changed ? 'changed' : ''}`}>
      {changed && (
        <>
          <del title="Ancienne valeur">{displayValue(previous)}</del>
          <span aria-label="devient"> → </span>
        </>
      )}
      {typeof value === 'object' && value !== null ? (
        <a className="reference" href={`#object-${value.ref}`} title="Voir l’objet référencé">
          ↗ #{value.ref}
        </a>
      ) : (
        <span className={typeof value === 'string' ? 'string' : 'literal'}>
          {displayValue(value)}
        </span>
      )}
    </span>
  );
}
