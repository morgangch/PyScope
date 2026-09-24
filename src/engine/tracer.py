"""Trace réelle de Python. Chaque capture est détachée par sérialisation JSON."""
import sys
import json
import types
import math


def trace_program(source, initial=None, max_steps=1200):
    filename = '<exercice>'
    namespace = {'__name__': '__main__', **(initial or {})}
    steps, active, output = [], [], []
    identities, kept_alive, frame_ids, resumed = {}, [], {}, {}
    last_line = 1
    limit_hit = False
    frame_counter = 0

    class TraceLimit(Exception):
        pass

    def visible(value):
        return not isinstance(value, (types.FunctionType, types.ModuleType, type, types.BuiltinFunctionType))

    def capture(event, frame=None, returned=None, message=None):
        nonlocal last_line, limit_hit
        if len(steps) >= max_steps:
            limit_hit = True
            raise TraceLimit('Limite de %s étapes atteinte.' % max_steps)
        heap, references = {}, []

        def encode(value, source_name='', depth=0):
            if value is None or type(value) in (str, bool, int):
                if type(value) is str and len(value) > 2000:
                    return value[:2000] + '… [texte tronqué]'
                if type(value) is int and abs(value) > 9007199254740991:
                    return str(value) + ' [entier exact]'
                return value
            if type(value) is float:
                return value if math.isfinite(value) else str(value)
            key = id(value)
            if key not in identities:
                identities[key] = 'o' + str(len(identities) + 1)
                kept_alive.append(value)
            object_id = identities[key]
            if source_name:
                references.append({'source': source_name, 'target': object_id})
            if object_id in heap:
                return {'ref': object_id}
            obj = {'id': object_id, 'type': type(value).__name__}
            heap[object_id] = obj
            if depth >= 8 or len(heap) > 80:
                obj['attributes'] = {'…': 'Détail limité (profondeur 8 / 80 objets).'}
            elif type(value) in (list, tuple):
                obj['items'] = [encode(v, object_id + '[' + str(i) + ']', depth + 1) for i, v in enumerate(value[:80])]
                if len(value) > 80:
                    obj['items'].append('… liste tronquée à 80 éléments')
            elif type(value) is dict:
                obj['attributes'] = {str(k): encode(v, object_id + '.' + str(k), depth + 1) for k, v in list(value.items())[:80]}
                if len(value) > 80:
                    obj['attributes']['… [limite]'] = 'Dictionnaire tronqué à 80 entrées.'
            elif hasattr(value, '__dict__'):
                obj['attributes'] = {k: encode(v, object_id + '.' + k, depth + 1) for k, v in list(vars(value).items())[:80] if visible(v)}
                if len(vars(value)) > 80:
                    obj['attributes']['… [limite]'] = 'Attributs tronqués à 80 entrées.'
            else:
                obj['attributes'] = {'détail': 'Type non développé dans cette visualisation.'}
            return {'ref': object_id}

        def variables(mapping, prefix):
            return {name: encode(value, prefix + name) for name, value in list(mapping.items()) if not name.startswith('__') and visible(value)}

        globals_snapshot = variables(namespace, 'global.')
        stack = []
        for item in active:
            fid = frame_ids[id(item)]
            count = item.f_code.co_argcount + item.f_code.co_kwonlyargcount
            stack.append({'id': fid, 'name': item.f_code.co_name, 'line': item.f_lineno,
                          'parameters': list(item.f_code.co_varnames[:count]),
                          'locals': variables(item.f_locals, fid + '.')})
        if frame:
            last_line = frame.f_lineno
        step = {'line': last_line, 'event': event, 'stack': stack, 'globals': globals_snapshot,
                'objects': heap, 'references': references, 'stdout': ''.join(output)}
        if frame:
            step['functionName'] = frame.f_code.co_name
        if event == 'call' and frame and frame.f_back:
            step['callLine'] = frame.f_back.f_lineno
        if frame and id(frame) in resumed:
            step['resumeLine'] = resumed.pop(id(frame))
        if event == 'return':
            step['returnValue'] = encode(returned, 'retour')
        if message:
            step['error'] = message
        # Aucun objet mutable Python n'est conservé dans les instantanés.
        steps.append(json.loads(json.dumps(step, ensure_ascii=False)))

    def tracer(frame, event, arg):
        nonlocal frame_counter
        if frame.f_code.co_filename != filename:
            return None
        is_function = bool(frame.f_code.co_flags & 2)
        if event == 'call' and is_function:
            frame_counter += 1
            frame_ids[id(frame)] = 'f' + str(frame_counter)
            active.append(frame)
            capture('call', frame)
        elif event == 'line':
            capture('line', frame)
        elif event == 'return' and is_function:
            capture('return', frame, returned=arg)
            if frame.f_back and frame.f_back.f_code.co_filename == filename:
                resumed[id(frame.f_back)] = frame.f_back.f_lineno
            if frame in active:
                active.remove(frame)
        elif event == 'exception':
            capture('error', frame, message=arg[0].__name__ + ': ' + str(arg[1]))
        return tracer

    class Output:
        def write(self, text):
            if text:
                if sum(map(len, output)) + len(text) > 16000:
                    raise TraceLimit('Sortie limitée à 16 000 caractères.')
                output.append(text)
                caller = sys._getframe(1)
                capture('output', caller if caller.f_code.co_filename == filename else None)
            return len(text)

        def flush(self):
            pass

    error = None
    previous_stdout = sys.stdout
    try:
        compiled = compile(source, filename, 'exec')
        sys.stdout = Output()
        sys.settrace(tracer)
        exec(compiled, namespace)
        if limit_hit:
            raise TraceLimit('Limite de %s étapes atteinte.' % max_steps)
    except BaseException as exc:
        error = type(exc).__name__ + ': ' + str(exc)
        if isinstance(exc, SyntaxError):
            last_line = exc.lineno or 1
    finally:
        sys.settrace(None)
        sys.stdout = previous_stdout
    active.clear()
    # Une dernière capture explicite présente l'état après la dernière instruction.
    if len(steps) >= max_steps:
        steps.pop()
    capture('error' if error else 'end', message=error)
    return json.dumps({'steps': steps, 'error': error}, ensure_ascii=False)
