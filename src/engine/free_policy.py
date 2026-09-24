"""A documented teaching subset, checked before execution (not a security sandbox)."""
import ast
import builtins
import operator

class UnsupportedCode(ValueError):
    pass

class ResourceLimit(ValueError):
    pass

def bounded_range(*args):
    result = range(*args)
    if len(result) > 4096:
        raise ResourceLimit('range est limité à 4 096 éléments.')
    return result

def bounded_operation(op, left, right):
    if op in ('Mult', 'Add'):
        sequence = left if type(left) in (str, list, tuple) else right if type(right) in (str, list, tuple) else None
        if sequence is not None:
            size = len(sequence)
            if op == 'Mult':
                count = right if sequence is left else left
                if type(count) is int and size * max(0, count) > 4096:
                    raise ResourceLimit('Une séquence ne peut pas dépasser 4 096 éléments.')
            elif type(left) in (str, list, tuple) and type(right) is type(left) and len(left) + len(right) > 4096:
                raise ResourceLimit('Une séquence ne peut pas dépasser 4 096 éléments.')
    if op == 'Pow' and (type(right) not in (int, float) or abs(right) > 1024 or (type(left) is int and left.bit_length() * max(0, right) > 4096)):
        raise ResourceLimit('Puissance trop grande : exposant maximal 1 024, entier maximal 4 096 bits.')
    if op == 'Mod' and type(left) is str:
        raise UnsupportedCode('Le formatage par % n’est pas pris en charge en mode libre.')
    functions = {'Add':operator.add,'Sub':operator.sub,'Mult':operator.mul,'Div':operator.truediv,'FloorDiv':operator.floordiv,'Mod':operator.mod,'Pow':operator.pow}
    result = functions[op](left, right)
    if type(result) is int and result.bit_length() > 4096:
        raise ResourceLimit('Entier limité à 4 096 bits.')
    return result

def prepare_free(source, filename):
    if len(source) > 12000:
        raise ResourceLimit('Programme limité à 12 000 caractères.')
    tree = ast.parse(source, filename)
    allowed = (ast.Module, ast.Assign, ast.AugAssign, ast.Expr, ast.If, ast.While, ast.For,
               ast.Break, ast.Continue, ast.Pass, ast.FunctionDef, ast.ClassDef, ast.Return,
               ast.Assert, ast.arguments, ast.arg, ast.keyword, ast.Name, ast.Constant,
               ast.List, ast.Tuple, ast.Dict, ast.Attribute, ast.Subscript, ast.Slice,
               ast.Call, ast.BinOp, ast.UnaryOp, ast.BoolOp, ast.Compare, ast.IfExp,
               ast.Load, ast.Store, ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv,
               ast.Mod, ast.Pow, ast.UAdd, ast.USub, ast.Not, ast.And, ast.Or,
               ast.Eq, ast.NotEq, ast.Lt, ast.LtE, ast.Gt, ast.GtE, ast.Is, ast.IsNot,
               ast.In, ast.NotIn)
    nodes = list(ast.walk(tree))
    methods = {node.name for node in nodes if isinstance(node, ast.FunctionDef)}
    safe_methods = methods | {'append','pop','copy','count','index','keys','values','items','get'}
    for node in nodes:
        line = getattr(node, 'lineno', 1)
        def reject(message):
            raise UnsupportedCode('Ligne %s : %s' % (line, message))
        if not isinstance(node, allowed):
            reject('%s non pris en charge. Utilisez des fonctions/classes synchrones et des boucles simples.' % type(node).__name__)
        if isinstance(node, ast.Name) and node.id.startswith('_'):
            reject('Les noms internes commençant par _ ne sont pas accessibles.')
        if isinstance(node, ast.Attribute) and node.attr.startswith('_'):
            reject('Les attributs internes ne sont pas accessibles.')
        if isinstance(node, ast.FunctionDef) and (node.decorator_list or (node.name.startswith('_') and node.name != '__init__')):
            reject('Décorateurs et méthodes spéciales (hors __init__) non pris en charge.')
        if isinstance(node, ast.ClassDef) and (node.bases or node.keywords or node.decorator_list):
            reject('Héritage, métaclasses et décorateurs non pris en charge.')
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr not in safe_methods:
            reject('Méthode non prise en charge : ' + node.func.attr)
        if isinstance(node, ast.Call) and not isinstance(node.func, (ast.Name, ast.Attribute)):
            reject('Les appels indirects ne sont pas pris en charge.')
        if isinstance(node, ast.Constant):
            if type(node.value) is int and node.value.bit_length() > 4096:
                reject('Entier littéral trop grand.')
            if type(node.value) is str and len(node.value) > 4096:
                reject('Texte littéral limité à 4 096 caractères.')
        if isinstance(node, ast.AugAssign) and not isinstance(node.target, ast.Name) and isinstance(node.op, (ast.Mult, ast.Pow)):
            reject('Pour *= ou **= sur un attribut, utilisez une affectation explicite.')

    class GuardArithmetic(ast.NodeTransformer):
        def visit_BinOp(self, node):
            self.generic_visit(node)
            return ast.copy_location(ast.Call(func=ast.Name(id='__bounded_operation__',ctx=ast.Load()),args=[ast.Constant(type(node.op).__name__),node.left,node.right],keywords=[]),node)
        def visit_AugAssign(self,node):
            if isinstance(node.target,ast.Name):
                replacement=ast.Assign(targets=[node.target],value=ast.BinOp(left=ast.Name(id=node.target.id,ctx=ast.Load()),op=node.op,right=node.value))
                return self.visit(ast.copy_location(replacement,node))
            return self.generic_visit(node)
    tree=ast.fix_missing_locations(GuardArithmetic().visit(tree))
    allowed_builtins = {name:getattr(builtins,name) for name in ['print','len','abs','min','max','sum','enumerate','zip','list','tuple','dict','str','int','float','bool','isinstance','AssertionError','__build_class__']}
    allowed_builtins['range']=bounded_range
    return compile(tree,filename,'exec'), {'__builtins__':allowed_builtins,'__bounded_operation__':bounded_operation}
