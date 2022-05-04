// split inputs into chars 
export function toChar(s: string): string[] {
    return Array.from(s)
}

// basic unit in LISP
export interface Atom {
    value: number | string
}

// lexer
export function ParseAtom(s: string):Atom {
    s.trim()   
    if (s === '') throw new Error('invalid symbol')
    const result = Number(s)

    return isNaN(result) ? <Atom> {value: s} : <Atom> {value: result}
}

// List is a sequencce of Atoms or Lists
// e.g. (1 2 (3 4) (5 6 7))
export interface List {
    items: (Atom|List)[]
}

const ListOpenDelimiter = '('
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
        addAtom()
        if (elements[i] === ListCloseDelimeter) {
            return [result, i+1]
        }

        if (elements[i] === ListOpenDelimiter) {
            const [k, v] = parseListActual(elements, i+1)
            i = v
            result.items.push(k)
        }

        // find start index of Atom
        if (start == -1 && elements[i] != ListOpenDelimiter) {
            start = i
        }

        if (elements[i] === ListElementsDelimeter) {
            addAtom()
            start = -1
        }

        i++
    }
    return [result, i]
}

export function ParseList(s: string): List {
    if (s.length === 0) throw new Error('Invalid expression')
    s = s.trim()

    // check grammar error
    if (s[0] !== ListOpenDelimiter) throw new Error("ListOpenDelimeter ( is not found")
    
    const elements = toChar(s)
    const [l, m] = parseListActual(elements, 0)
    return <List>l.items[0]
}


