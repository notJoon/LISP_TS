/* Type Checker 

EXPRESSION = INT 
           | VAR
           | FUNCTION
           | CALL
           | IF
           | '(' <EXPRESSION> ')'

INT = 0 | 1 | 2 ...     ``Literal`` 
VAR = NAME
FUNCTION = '(' NAME ')' => <EXPRESSION>
CALL = <EXPRESSION> '(' <EXPRESSION> ')'
IF = if '(' <EXPRESSION> ')' else '(' <EXPRESSION> ')'

NAME = [a-zA-Z_][a-zA-Z0-9_]*

*/

type Expression = ExpInt | ExpVar | ExpFunction | ExpCall | ExpIf;
/* Expression 
Type representing. It takes one of types like `Int`, `Var`...  

    @nodeType: indicates what type of expression this node is, 
                and some values associated with the corresponding type.

    @value: value property 
*/

type ExpInt = { nodeType: "Int", value: number };
type ExpVar = { nodeType: "Var", name: string };
type ExpFunction = { nodeType: "Function", param: string, body: Expression };
type ExpCall = { nodeType: "Call", func: Expression, arg: Expression};
type ExpIf = { 
    nodeType: "If", 
    condition: Expression, 
    trueBranch: Expression, 
    falseBranch: Expression
};



type Type = TNamed | TVar | TFunc; 
/* Type 
    @Named: the types that have been declared 
    @Var: type variables 
    @Function: type of function
        - `from`: takes a value 
        - `to`: returns a value 
*/

type TNamed = { nodeType: "Named", name: string };
type TVar = { nodeType: "Var", name: string };
type TFunc = { nodeType: "Function", from: Type, to: Type };


type Environment = {
// mapping of variable name and their inferred type. 
    [name: string]: Type;
};

type Context = {
    next: number;       // next type variable to be generated
    env: Environment;   // mapping of variables in scope to types 
};

type Substitution = {
// a map of type variable name to types assigned to them
    [key: string]: Type;
};

function applySubstitutionToType(s: Substitution, type: Type): Type {
// replace the type var in a type that 
// are present in the given substitution and return 
// the type with those vars with their substituted values.
// e.g. { "a": Bool, "b": Int }
//      type (a -> b) will give type (Bool -> Int)
    switch (type.nodeType) {
        case "Named":
            return type;

        case "Var":
            if (s[type.name]) {
                return s[type.name];
            } else {
                return type;
        }
        
        case "Function":
            return {
                nodeType: "Function",
                from: applySubstitutionToType(s, type.from),
                to: applySubstitutionToType(s, type.to)
        };
    };
};

function addToContext(ctx: Context, name: string, type: Type): Context {
// adds the mapping of the name and type of the context's environment 
// it doesn't mutate the original context or it's environment 
// makes a copy and returns a new context. Because, it should only be visible in the scope 
// it was declared in.
    const newEnv = Object.assign({}, ctx, {
        env: Object.assign({}, ctx.env)
    });

    newEnv.env[name] = type; 

    return newEnv;
};

function newTVar(ctx: Context): Type {
// Each call will generate a new type variable.
// mutate the given context because the generated names should be unique across scopes
    const newVarNum = ctx.next; 
    ctx.next++ 

    return {
        nodeType: "Var",
        name: `T${newVarNum}`
    };
};


function inference(ctx: Context, e: Expression): [Type, Substitution] {
    const env = ctx.env;
    switch(e.nodeType) {
        case "Int": 
            return [{ nodeType: "Named", name: "Int" }, {}];
        
        case "Var":
            if (env[e.name]) {
                return [env[e.name], {}];
            } else {
                throw `Unbound var ${e.name}`;
            }

        case "Function":
        // need to infer the type of it's body. so need to make a recursive call 
        // to infer with the function's body.
        //
        // the body may refer to the param of the function
        // so it needs to be added th the environment, but don't have to add permanently 
        // make a copy of the environment with one extra member which is th parameter. 
            {
                const newType = newTVar(ctx);
                const newCtx = addToContext(ctx, e.param, newType);
                const [bodyType, sub] = inference(newCtx, e.body);
                const inferredType: Type = {
                    nodeType: "Function",
                    from: applySubstitutionToType(sub, newType),
                    to: bodyType
                };

                return [inferredType, sub];
            }
        
            case "Call":
                {
                    const [funcType, s1] = inference(ctx, e.func);
                    const [argType, s2] = inference(applySubToCtx(s1, ctx), e.arg);
                    const newVar = newTVar(ctx);
                    const s3 = composeSub(s1, s2);
                    const s4 = unification({
                        nodeType: "Function",
                        from: argType,
                        to: newVar
                    }, funcType);

                    const funcType1 = applySubstitutionToType(s4, funcType);
                    const s5 = composeSub(s3, s4);
                    const s6 = unification(
                        applySubstitutionToType(s5, (funcType1 as TFunc).from),
                        argType
                    );
                    const resultSub = composeSub(s5, s6);

                    return [applySubstitutionToType(resultSub, (funcType1 as TFunc).to), resultSub];
                }
            
            case "If": {
                const [conditionType, s0] = inference(ctx, e.condition);
                const s1 = unification(conditionType, {
                    nodeType: "Named",
                    name: "Bool"
                });

                const ctx1 = applySubToCtx(composeSub(s0, s1), ctx);
                const [_trueBranchType, s2] = inference(ctx1, e.trueBranch);
                const s3 = composeSub(s1, s2);
                const ctx2 = applySubToCtx(s2, ctx1);
                const [_falseBranchType, s4] = inference(ctx2, e.falseBranch);
                const s5 = composeSub(s3, s4);

                const trueBranchType = applySubstitutionToType(s5, _trueBranchType);
                const falseBranchType = applySubstitutionToType(s5, _falseBranchType);
                const s6 = unification(trueBranchType, falseBranchType);

                const resultSub = composeSub(s5, s6);
                return [
                    applySubstitutionToType(s6, trueBranchType),
                    resultSub
                ];
            }
        
        default: throw "Unimplemented";
    };
};

/* TODO 
    - Generate a new type variable for parameter
    - Add the generated type to a copy of the context
    - Call infer with the function;s body and the new context
    - Apply the returned substitution to the type variable we generated 
    - Create a new function type with the param's type and body type 
    - Return the function's type and substitution
*/

//! Function Calls 
//! First we need to call infer with the function node
//! check if the returned type is a function
//! if not we throw a type error
//!
//! Need to apply the resulting substitution to the env's context
//! So, that the type of any type variable inferred by the last call is available
//! to the call to infer the argument's type. Then, infer is called with this new context
//! and the argument node.
//!
//! Need to match the type of the argument with the type expected by the function.
//! The types may contain type variables which may stand for other types. -> `unification`

function unification(t1: Type, t2: Type): Substitution {
/// `unification`: check if 2 types "fit" and if they do, return a substitution that makes them equal.
///
/// When both the types are `Named`, and they're same => return an `empty substitution`
///
/// If one of them is a type var, and they're the same => return `null substitution`
///
/// If one of them is a type var, and the other type contains the same type var. => Error
///         this may lead to an infinitely recursive type. 
///         e.g. `A` and `A -> B` unify, this would mean that `A` is `A -> B`. which would 
///         mean `A -> B` is `(A -> B) -> B` and `((A -> B) -> B) -> B` ... 
///
/// If one of them is type variable and the other type doesn't contain it, 
/// `bind` the type var to the other type. Because a type var can stand in for 
/// any type, and call to unify both types must same
///
/// When both types are `Function`, recursively unify their param types and 
/// return types and compose the resulting substitution
///
/// Any other type => Error 
    if (t1.nodeType === "Named"
        && t2.nodeType === "Named"
        && t2.name === t1.name) {
            return {};                          
    } else if (t1.nodeType === "Var") {
        return varBind(t1.name, t2);
    } else if (t2.nodeType === "Var") {
        return varBind(t2.name, t1);
    } else if (t1.nodeType === "Function"
            && t2.nodeType === "Function") {
                const s1 = unification(t1.from, t2.from);
                const s2 = unification(
                    applySubstitutionToType(s1, t1.to),
                    applySubstitutionToType(s1, t2.to)
                );
            return composeSub(s1, s2);
        } else {
            throw `Type mismatch: \n    Expected ${t1.nodeType}\n  Got ${t2.nodeType}`;
    };
};

function varBind(name: string, t: Type): Substitution {
    if (t.nodeType === "Var" && t.name === name) {
        return {};
    } else if (contains(t, name)) {
        throw `Type ${t.nodeType} contains a reference to itself`;
    } else {
        const sub: Substitution = {};
        sub[name] = t;
        return sub;
    };
};

function composeSub(s1: Substitution, s2: Substitution): Substitution {
    const result: Substitution = {};
    for (const k in s2) {
        const type = s2[k];
        result[k] = applySubstitutionToType(s1, type);
    };

    return {...s1, ...result};
};

function contains(t: Type, name: string): boolean {
    switch (t.nodeType) {
        case "Named": return false;
        case "Var": return t.name === name;
        case "Function": return contains(t.from, name) || contains(t.to, name); 
    }
};

function applySubToCtx(sub: Substitution, ctx: Context): Context {
// apply given substitution to each type in the context;s environment.
// Doesn't change the input context, bt returns a new one.
    const newContext = {
        ...ctx,
        env: { ...ctx.env }
    };

    for (const name in newContext.env) {
        const t = newContext.env[name];
        newContext.env[name] = applySubstitutionToType(sub, t);
    };

    return newContext;
};



//* Testing function  *//

function v(name: string): Expression {
    return {
        nodeType: "Var",
        name: name
    };
};

function i(value: number): Expression {
    return {
        nodeType: "Int",
        value: value
    };
};

function f(param: string, body: Expression | string): Expression {
    return {
        nodeType: "Function",
        param: param,
        body: typeof body === "string" ? v(body) : body
    };
};

function c(f: Expression | string, ..._args: (Expression | string)[]): Expression {
    const args = _args.map(a => typeof a === "string" ? v(a) : a);

    return args.reduce(
        (func, arg) => ({
            nodeType: "Call",
            func: typeof func === "string" ? v(func) : func,
            arg: typeof arg === "string" ? v(arg) : arg 
        }),

        typeof f === "string" ? v(f) : f
    );
};

function tv(name: string): Type {
    return {
        nodeType: "Var",
        name: name
    };
};

function tn(name: string): Type {
    return {
        nodeType: "Named",
        name: name
    };
};

function tf(...types: Type[]): Type {
    return types.reduceRight((to, from) => ({
        nodeType: "Function",
        from: from,
        to: to 
    }));
};

const initialEnv = {
    "true": tn("Bool"),
    "false": tn("Bool"),
    "!": tf(tn("Bool"), tn("Bool")),
    "&&": tf(tn("Bool"), tn("Bool"), tn("Bool")),
    '||': tf(tn("Bool"), tn("Bool"), tn("Bool")),
    "Int==": tf(tv("Int"), tv("Int"), tv("Bool")),
    "Bool==": tf(tv("Bool"), tv("Bool"), tv("Bool")),
    "+": tf(tn("Int"), tn("Int"), tn("Int"))
};

// console.log(
//     inference({
//         next: 0,
//         env: initialEnv
//     },
//     c("+", i(1), i(2))
// )[0]);

//* polymorphic function
// e.g. (x) => x   <- this function should work for any Types
//                    Its return type is the same as the type of its argument. 
//
//* Universal Quantification
// polymorphic types are expressible through the means of universal quantification.
// e.g) for all A.A -> A
//    -> for all <T> "A", the type of this function is A -> A
//       with for all quantification. may be "instantiated" when they are
//       used with a concrete type.
// Type instantiation is similar to calling a function.
//
// Instantiating a quantified type is equivalent to replacing the instances of the "type parameter"
// in its body with the "type argument" and removing the for all clause.
//
//* Rank
// The depth at which a quantifier can appear 
// e.g. `Rank 0 types` mean a quantifier can only appear at the top level
// under Rank 1 restriction, this type is valid
//  >>> for all A.A -> A
//! invalid
//  >>> for all A.A -> (for all B.B -> B)





