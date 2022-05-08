import { Atom, List, isAtom, isList, first, rest, AUT } from "./parser";

type basicArithmeticOperator = (a: Atom<number>, b: Atom<number>) => Atom<number>;
interface FunctionMapArithmetic {
    [key: string]: basicArithmeticOperator;
}

const add = (a: Atom<number>, b: Atom<number>): Atom<number> => {
    return <Atom<number>> {value: a.value + b.value};
};

const minus = (a: Atom<number>, b: Atom<number>): Atom<number> => {
    return <Atom<number>> {value: a.value - b.value};
};

const multiply = (a: Atom<number>, b: Atom<number>): Atom<number> => {
    return <Atom<number>> {value: a.value * b.value};
};

const divide = (a: Atom<number>, b: Atom<number>): Atom<number> => {
    return <Atom<number>> {value: a.value / b.value};
};

const remain = (a: Atom<number>, b: Atom<number>): Atom<number> => {
    return <Atom<number>> {value: a.value % b.value};
};

const basicArithmeticOperations: FunctionMapArithmetic = {
    '+': add,
    '-': minus,
    '*': multiply,
    '/': divide,
    '%': remain,
};

function doArithmeticOperations(r: List, f: Atom<string>) {
    const evaluated = r.items.map(k => Evaluate(k));

    if (evaluated.length === 0)
        throw Error('Not enought argument to the operation ' + f.value);

    let a = <Atom<number>>evaluated[0];
    const func = basicArithmeticOperations[f.value];

    for (let i = 1; i < evaluated.length; i++) {
        a = func(a, <Atom<number>>evaluated[i]);
    }
    return a;
};

// ------------------------------ //

type basicComparisonOperator = (a: AUT, b: AUT) => Atom<boolean>;
interface FunctionMapComparison {
    [key: string]: basicComparisonOperator;
}

const eq = (a: AUT, b: AUT): Atom<boolean> => {
    return <Atom<boolean>>{value: a.value === b.value}
};

const ne = (a: AUT, b: AUT): Atom<boolean> => {
    return <Atom<boolean>>{value: a.value !== b.value}
};

const gt = (a: AUT, b: AUT): Atom<boolean> => {
    return <Atom<boolean>>{value: a.value > b.value}
};

const lt = (a: AUT, b: AUT): Atom<boolean> => {
    return <Atom<boolean>>{value: a.value < b.value}
};

const ge = (a: AUT, b: AUT): Atom<boolean> => {
    return <Atom<boolean>>{value: a.value >= b.value}
};

const le = (a: AUT, b: AUT): Atom<boolean> => {
    return <Atom<boolean>>{value: a.value <= b.value}
};

const basicComparisonOperators: FunctionMapComparison = {
    '==': eq,
    '!=': ne,
    '>': gt,
    '<': lt,
    '>=': ge,
    '<=': le,
}

// f.value contains the comparison symbol 
function doComparisonOperations(r: List, f: Atom<string>): Atom<boolean> {
    const defun = basicComparisonOperators[f.value]

    if (r.items.length != 2) throw new Error('Comparision operator ' + f.value + 
                                                    ' needs 2 arguments. got=' + r.items.length)
    const [a, b] = r.items 
    return defun(Evaluate(a), Evaluate(b))
}

// ------------------------------ //
type basicLogicalOperator = (a: AUT, b: AUT) => Atom<boolean>;
interface FunctionMapLogical {
    [key: string]: basicLogicalOperator;
}

const and = (a: AUT, b: AUT): Atom<boolean> => {
    return <Atom<boolean>>{value: a.value && b.value}
};

const or = (a: AUT, b: AUT): Atom<boolean> => {
    return <Atom<boolean>>{value: a.value || b.value}
};

const basicLogicalOperators: FunctionMapLogical = {
    '&&': and,
    '||': or,
}

function doLogicalOperations(r: List, f: Atom<string>): Atom<boolean> {
    const defun = basicLogicalOperators[f.value]

    if (r.items.length != 2) throw new Error('Logical operator ' + f.value 
                                                        + ' needs 2 arguments. got=' + r.items.length) 
    const [a, b] = r.items 
    return defun(Evaluate(a), Evaluate(b))
}

// --------------------------
function doConditionalOperators(r: List, f: Atom<string>): AUT {
    const [test, ifTrue, ifFalse] = r.items
    return Evaluate(test).value ? Evaluate(ifTrue) : Evaluate(ifFalse)
}

// --------------------------

function doFunctionOperations(r: List, f: Atom<string>): AUT {
    // defun <name> <args> <body ... n>
    if (r.items.length < 3) throw Error('defun does not have enought arguments needs 3 arguments. got=' + r.items.length) 
    const fname = r.items[0]
    const fparams = r.items[1]
    const fbodies = r.items.slice(2)

    // TODO store function into a scoped context 

    return <Atom<boolean>> { value: true }
}

export function Evaluate(exp: AUT | List): AUT {
    // A list should start with a symbol like name of operators 
    // if Atom -> return itself
    if (isAtom(exp)) {
        return exp;
    } else if (isList(exp)) {
    // if List -> evaluate -> eval rest
        const f = <Atom<string>>first(exp);
        const r = rest(exp);

        if (f.value in basicArithmeticOperations) {
            return doArithmeticOperations(r, f);
        } else if (f.value in basicComparisonOperators) {
            return doComparisonOperations(r, f);
        } else if (f.value in basicLogicalOperators) {
            return doLogicalOperations(r, f)
        } else if (f.value === 'if') {
            return doConditionalOperators(r, f);
        } else if (f.value === 'defun') {
            return doFunctionOperations(r, f);
        }
        return f 
    }
    throw Error('Unknown evaluation error: ' + exp);
};

