import { ParseAtom, toChar, Atom, List, ParseList } from './main';

test('expect return: array of chars', () => {
    const input = toChar('abc')
    const expected = ['a', 'b', 'c']

    expect(input).toEqual(expected)
})

test('should return a number of Atom, given a string containing a number', () => {
    const input = ParseAtom('1')
    const expected = <Atom> {value: 1}

    expect(expected.value).toBe(input.value)
})

test('should return a symbol of Atom, given a string containing a name', () => {
    const input = ParseAtom('a')
    const expected = <Atom> {value: 'a'}

    expect(expected.value).toBe(input.value)
})

test('ParseAtom throw error if the given string is invalid', () => {
    const input = () => {ParseAtom('')}
    expect(input).toThrowError(Error('invalid symbol'))
})

test('ParseList: throw error if the given string is invalid', () => {
    const input = () => {ParseList('')}
    expect(input).toThrowError(Error('Invalid expression'))
})

test('ParseList: check open delimeter ( is exist', () => {
    const input = () => {ParseList("123")}
    expect(input).toThrowError("ListOpenDelimeter ( is not found")
})

test('ParseList: return () for empty List', () => {
    const input = ParseList('()')
    const expected = <List> {items: []}
    expect(input.items.length === expected.items.length).toBe(true)
})

test('ParseList: return a List with one element', () => {
    const input = ParseList('(1)')
    const expected = <List> { 
        items: [<Atom> {value: 1}]
    }
    expect(input.items.length === expected.items.length).toBe(true)
})

test('ParseList: return multible numbers List', () => {
    const input = ParseList('(1 a)')
    const expected = <List> {
        items: [<Atom> {value: 1}, <Atom> {value: 'a'}]
    }
    expect(input.items.length === expected.items.length).toBe(true)
})