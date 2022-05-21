export function toChar(s: string): string[] {
    return Array.from(s)
}

export interface Atom<T> {
    value: T;
}

export type AUT = Atom<string> | Atom<number> | Atom<boolean>

export function ParseAtom(s: string): AUT {
    s.trim();
    if (s === '') throw new Error('invalid symbol');
    const result = Number(s);

    if (isNaN(result)) {
        if (s === 'true') {
            return <Atom<boolean>>{value: true}
        }

        if (s === 'false') {
            return <Atom<boolean>>{value: false}
        }
        return <Atom<string>>{value: s}

    } else {
        return <Atom<number>>{value: result}
    }
}
// List is a sequencce of Atoms or Lists
// e.g. (1 2 (3 4) (5 6 7))

export interface List {
    items: (AUT | List)[];
}
const ListOpenDelimeter = '(';
const ListCloseDelimeter = ')';
const ListElementsDelimeter = " ";

function parseListActual(elements: string[], i: number): [List, number] {
    let result = <List>{ items: [] };
    let start = -1;

    const addAtom = () => {
        if (start != -1) {
            const term = elements.slice(start, i);
            result.items.push(ParseAtom(term.join('')));
        }
    };

    while (i < elements.length) {
        if (elements[i] === ListCloseDelimeter) {
            addAtom();
            return [result, i + 1];
        }

        if (elements[i] === ListOpenDelimeter) {
            const [k, v] = parseListActual(elements, i + 1);
            i = v;
            result.items.push(k);
            continue;
        }

        // find start of Atom
        if (ListElementsDelimeter.includes(elements[i])) {
            addAtom();
            start = -1;
            
        } else {
            if (start == -1) {
                start = i;
            }
        }
        i++;
    }
    return [result, i];
}

export function ParseList(s: string): List {
    if (s.length == 0)
        throw new Error('Invalid expression');
    s = s.trim();
    if (s[0] !== ListOpenDelimeter)
        throw new Error("ListOpenDelimeter ( is not found");

    const elements = toChar(s);
    const [l, m] = parseListActual(elements, 0);
    return <List>l.items[0];
}

export function isAtom(o: AUT | List): o is AUT {
    return (o as AUT).value !== undefined
}

export function isList(o: AUT | List): o is List {
    return (o as List).items !== undefined
}

export function first(l: List): AUT {
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