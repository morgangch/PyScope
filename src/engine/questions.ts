import type { Exercise, Frame, QuestionSpec, Step, Trace, Value, VerifiedQuestion } from './types';
import { displayValue } from '../components/ValueView';

export function selfName(step: Step, frame?: Frame) {
  const value = frame?.locals.self;
  return value && typeof value === 'object' ? step.objects[value.ref]?.attributes?.nom : undefined;
}
export function frameLabel(step: Step, frame: Frame) {
  const name = selfName(step, frame);
  return `${name ? `${String(name)}.` : ''}${frame.name}(${frame.parameters.filter(p => p !== 'self').map(p => displayValue(frame.locals[p])).join(', ')})`;
}
export function readAnswer(spec: QuestionSpec, step: Step): string | undefined {
  let value: Value | undefined;
  if (spec.read === 'self') value = selfName(step, step.stack.at(-1));
  if (spec.read === 'caller') return step.stack.length > 1 ? frameLabel(step, step.stack.at(-2)!) : 'Programme principal';
  if (spec.read === 'depth') value = step.stack.length;
  if (spec.read === 'return') value = step.returnValue;
  if (spec.read === 'global') value = spec.variable ? step.globals[spec.variable] : undefined;
  if (value === undefined || (typeof value === 'object' && value !== null)) return undefined;
  return typeof value === 'string' ? value : displayValue(value);
}
export function resolveQuestions(exercise: Exercise, trace?: Trace): VerifiedQuestion[] {
  if (!trace || trace.error || trace.steps.at(-1)?.event !== 'end') return [];
  const result: VerifiedQuestion[] = [];
  for (const spec of exercise.questionSpecs || []) {
    const matches = trace.steps.map((step, index) => ({step,index})).filter(({step}) => step.event === spec.event && (!spec.functionName || step.functionName === spec.functionName) && (!spec.selfName || selfName(step,step.stack.at(-1)) === spec.selfName));
    const match = matches[(spec.occurrence || 1) - 1];
    if (!match) continue;
    const answer = readAnswer(spec, match.step);
    if (answer === undefined) continue;
    const alternatives = spec.read === 'self' ? Object.values(match.step.objects).map(o => o.attributes?.nom).filter((v): v is string => typeof v === 'string') : spec.read === 'caller' ? ['Programme principal', ...match.step.stack.map(f => frameLabel(match.step,f))] : ['None', '0', '1', String(Number(answer) + 1), String(Number(answer) - 1)];
    const choices = [answer, ...alternatives.filter(v => v !== answer && v !== 'NaN')].filter((v,i,a) => a.indexOf(v) === i).slice(0,3);
    if (choices.length < 2) choices.push('Aucun objet');
    // Deterministic position, never an assumed or random answer.
    const shift = match.index % choices.length;
    const rotated = [...choices.slice(shift), ...choices.slice(0,shift)];
    result.push({id:spec.id,stepIndex:match.index,prompt:spec.prompt,choices:rotated,answer:rotated.indexOf(answer),explanation:spec.explanation});
  }
  return result;
}
