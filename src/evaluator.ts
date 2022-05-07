import { Atom, List, isAtom, isList, first, rest } from "./parser";

type basicArithmeticOperator = (a: Atom, b: Atom) => Atom;
interface FunctionMap {
    [key: string]: basicArithmeticOperator;
}

type ArithmeticOp = (c: number, d: number) => number;
const validate = (a: Atom, b: Atom, op: ArithmeticOp): Atom => {
    if (typeof a.value === 'number' && typeof b.value === 'number') {
        return <Atom>{ value: op(a.value, b.value) };
    }
    throw Error('Invalid term in arithmetic operation');
};

const add = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c + d);
};

const minus = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c - d);
};

const multiply = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c * d);
};

const divide = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c / d);
};

const remain = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c % d);
};

const builtInFunctionName: FunctionMap = {
    '+': add,
    '-': minus,
    '*': multiply,
    '/': divide,
    '%': remain,
};

export function Evaluate(exp: Atom | List): Atom {
    // A list should start with a symbol like name of operators 
    // if Atom -> return itself
    if (isAtom(exp)) {
        return exp;
    } else if (isList(exp)) {
        // if List -> evaluate -> eval rest
        const f = first(exp);
        if (f.value in builtInFunctionName) {
            const r = rest(exp);
            const evaluated = r.items.map(k => Evaluate(k));

            if (evaluated.length === 0)
                throw Error('Not enought argument to the operation ' + f.value);

            let a = evaluated[0];
            const func = builtInFunctionName[f.value];

            for (let i = 1; i < evaluated.length; i++) {
                a = func(a, evaluated[i]);
            }
            return a;
        }
    }
    throw Error('Unknown evaluation error: ' + exp);
}
