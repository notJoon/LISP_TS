import { isMinusToken } from "typescript"

// split inputs into chars 
export function toChar(s: string): string[] {
    return Array.from(s)
}

// basic unit in LISP
export interface Atom {
    value: number | string
}

export function ParseAtom(s: string): Atom {
    s.trim()   
    if (s === '') throw new Error('invalid symbol')
    const result = Number(s)

    return isNaN(result) ? <Atom> {value: s} : <Atom> {value: result}
}

// List is a sequencce of Atoms or Lists
// e.g. (1 2 (3 4) (5 6 7))
export interface List {
    items: (Atom | List)[]
}

const ListOpenDelimeter = '('
const ListCloseDelimeter = ')'
const ListElementsDelimeter = " "

function parseListActual(elements: string[], i: number): [List, number] {
    let result = <List>{ items: [] }
    let start = -1 

    const addAtom = () => {
        if (start != -1) {
            const term = elements.slice(start, i)
            result.items.push(ParseAtom(term.join('')))
        }
    }

    while (i < elements.length) {
        if (elements[i] === ListCloseDelimeter) {
            addAtom()
            return [result, i+1]
        }

        if (elements[i] === ListOpenDelimeter) {
            const [k, v] = parseListActual(elements, i+1)
            i = v
            result.items.push(k)
            continue
        }

        // find start of Atom
        if (elements[i] === ListElementsDelimeter) {
            addAtom()
            start = -1
        } else {
            if (start == -1) {
                start = i
            }
        }
        i++
    }
    return [result, i]
}

export function ParseList(s: string): List {
    if (s.length == 0) throw new Error('Invalid expression')
    s = s.trim()
    if (s[0] !== ListOpenDelimeter) throw new Error("ListOpenDelimeter ( is not found")
    
    const elements = toChar(s)
    const [l, m] = parseListActual(elements, 0)
    return <List>l.items[0]
}

export function isAtom(o: Atom | List): o is Atom {
    return (o as Atom).value !== undefined
}

export function isList(o: Atom | List): o is List {
    return (o as List).items !== undefined
}

export function first(l: List): Atom {
    if (l.items.length === 0) throw Error('List is empty')
    if (isAtom(l.items[0])) {
        return l.items[0]
    } else {
        throw Error('Expected an Atom at the start of a List')
    }
}

export function rest(l: List): List {
    let result = <List> {items: []}

    if (l.items.length === 0) return result 
    result.items = l.items.slice(1)

    return result 
}

type basicArithmeticOperator = (a: Atom, b: Atom) => Atom
interface FunctionMap {
    [key: string]: basicArithmeticOperator
}

type ArithmeticOp = (c: number, d: number) => number 
const validate = (a: Atom, b: Atom, op: ArithmeticOp): Atom => {
    if (typeof a.value === 'number' && typeof b.value === 'number') {
        return <Atom> {value: op(a.value, b.value)}
    }
    throw Error('Invalid term in arithmetic operation')
}

const add = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c+d)
}

const minus = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c-d)
}

const multiply = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c*d)
}

const divide = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c/d)
}

const remain = (a: Atom, b: Atom): Atom => {
    return validate(a, b, (c: number, d: number) => c%d)
}

const _builtInFunctionName: FunctionMap = {
    '+': add,
    '-': minus,
    '*': multiply,
    '/': divide,
    '%': remain,
}

export function Evaluate(exp: Atom | List): Atom {
    // A list should start with a symbol like name of operators 
    // if Atom -> return itself
    if (isAtom(exp)) {
        return exp 
    } else if (isList(exp)) {
        // if List -> evaluate -> eval rest
        const f = first(exp)
        if(f.value in _builtInFunctionName) {
            const r = rest(exp)
            const evaluated = r.items.map(k => Evaluate(k))

            if (evaluated.length === 0) throw Error('Not enought argument to the operation ' + f.value)

            let a = evaluated[0]
            const func = _builtInFunctionName[f.value]

            for (let i=1; i<evaluated.length; i++){
                a = func(a, evaluated[i])
            }

            return a 
        }
    }

    throw Error('Unknown evaluation error: ' + exp)
}
