import { ParseAtom, toChar, Atom, List, ParseList, isAtom, isList, first, rest, Evaluate } from './main';

describe.skip('Parse', () => {
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
})

describe.skip('PaseAtom', () => {
    test('should return a symbol of Atom, given a string containing a name', () => {
        const input = ParseAtom('a')
        const expected = <Atom> {value: 'a'}
    
        expect(expected.value).toBe(input.value)
    })
    
    test('throw error if the given string is invalid', () => {
        const input = () => {ParseAtom('')}
        expect(input).toThrowError(Error('invalid symbol'))
    })
})


describe.skip('ParseList', () => {
    test('throw error if the given string is invalid', () => {
        const input = () => {ParseList('')}
        expect(input).toThrowError(Error('Invalid expression'))
    })
    
    test('check open delimeter ( is exist', () => {
        const input = () => {ParseList("123")}
        expect(input).toThrowError("ListOpenDelimeter ( is not found")
    })
    
    test('return () for empty List', () => {
        const input = ParseList('()')
        const expected = <List> {items: []}
        expect(input.items.length).toBe(expected.items.length)
    })
    
    test('return a List with one element', () => {
        const input = ParseList('(1)')
        const expected = <List> { 
            items: [<Atom> {value: 1}]
        }
        expect(input.items.length).toBe(expected.items.length)
        expect((<Atom>expected.items[0]).value === ((<Atom>input.items[0]).value)).toBe(true)
    })
    
    test('return 2 elements List', () => {
        const input = ParseList('(1 a)')
        const expected = <List> {
            items: [ <Atom> {value: 1}, <Atom> {value: 'a'} ]
        }
        expect(input.items.length).toBe(expected.items.length)
        expect((<Atom>expected.items[0]).value === (<Atom>input.items[0]).value).toBe(true)
        expect((<Atom>expected.items[1]).value === ((<Atom>input.items[1]).value)).toBe(true)
    })
    
    test('return list that contain operator', () => {
        const input = ParseList('(() 1 a)')
        const expected = <List> {
            items: [ 
                <List> {items: []}, 
                <Atom> {value: 1}, 
                <Atom> {value: 'a'} 
            ]
        }
        expect(input.items.length).toBe(expected.items.length)
        expect((<Atom>expected.items[0]).value === (<Atom>input.items[0]).value).toBe(true)
        expect((<Atom>expected.items[1]).value === ((<Atom>input.items[1]).value)).toBe(true)
        expect((<Atom>expected.items[2]).value === ((<Atom>input.items[2]).value)).toBe(true)
    })
    
    test('return List, given a string with symbol and numeric Atoms', () => {
        const input = ParseList('(add 1 2)')
        const expected = <List> {
            items: [ 
                <Atom> {value: 'add'}, 
                <Atom> {value: 1}, 
                <Atom> {value: 2} 
            ]
        }
        expect(input.items.length).toBe(expected.items.length)
        expect((<Atom>expected.items[0]).value === (<Atom>input.items[0]).value).toBe(true)
        expect((<Atom>expected.items[1]).value === ((<Atom>input.items[1]).value)).toBe(true)
        expect((<Atom>expected.items[2]).value === ((<Atom>input.items[2]).value)).toBe(true)
    })
    
    test('return List, given operator and numeric Atoms', () => {
        const input = ParseList('(+ 1 2)')
        const expected = <List> {
            items: [
                <Atom> {value: '+'}, 
                <Atom> {value: 1}, 
                <Atom> {value: 2} 
            ]
        }   
        expect(input.items.length).toBe(expected.items.length)
        expect((<Atom>expected.items[0]).value === (<Atom>input.items[0]).value).toBe(true)
        expect((<Atom>expected.items[1]).value === ((<Atom>input.items[1]).value)).toBe(true)
        expect((<Atom>expected.items[2]).value === ((<Atom>input.items[2]).value)).toBe(true)
    })
    
    test('return List, given a string of arithmetic expression', () => {
        const input = ParseList('(+ 1 2 (* 3 4))')
        const expected = <List> {
            items: [
                <Atom> {value: '+'},
                <Atom> {value: 1}, 
                <Atom> {value: 2},
                <List> {
                    items: [
                        <Atom> {value: '*'},
                        <Atom> {value: 3},
                        <Atom> {value: 4}
                    ]
                }
            ]
        }
        expect(input.items.length).toBe(expected.items.length)
        expect((<Atom>expected.items[0]).value === (<Atom>input.items[0]).value).toBe(true)
        expect((<Atom>expected.items[1]).value === ((<Atom>input.items[1]).value)).toBe(true)
        expect((<Atom>expected.items[2]).value === ((<Atom>input.items[2]).value)).toBe(true)
    
        const b = (<List>expected.items[3]).items
        const c = (<List>input.items[3]).items
        expect(b.length).toBe(c.length)
        expect((<Atom>b[0]).value === (<Atom>c[0]).value).toBe(true)
        expect((<Atom>b[1]).value === (<Atom>c[1]).value).toBe(true)
        expect((<Atom>b[2]).value === (<Atom>c[2]).value).toBe(true)
    })
    
    test('return List given a deep nested list and arithmetic operator', () => {
        const input = ParseList('(((+ 1 2)))')
        const expected = <List> {
            items: [
                <List> {
                    items: [
                        <List> {
                            items: [
                                <Atom> {value: '+'},
                                <Atom> {value: 1},
                                <Atom> {value: 2}
                            ]
                        }
                    ]
                }
            ]
        }
        expect(input.items.length).toBe(expected.items.length)
    
        const b = (<List>input.items[0]).items
        const c = (<List>expected.items[0]).items
        expect(b.length).toBe(c.length)
        //console.log(b, c)
    
        const d = (<List>b[0]).items 
        const e = (<List>c[0]).items
        //console.log(d, e)
        expect(d.length).toBe(e.length)
    })
    
})

describe.skip('Eval', () => {
// List -> Evaluator -> Atom
// Match first element with kown operators
// recursively evaluate he rest of the list 
// Apply operator to Atoms 
// Return the result 
    test('isAtom: return true. if input is Atom', () => {
        const input = isAtom(<Atom> {value: 3})
        expect(input).toBe(true)
    })

    test('isAtom: return false. if input is List', () => {
        const input = isAtom(<List> { items: []})
        expect(input).toBe(false)
    })
    
    test('isList: return true. if input is List', () => {
        const input = isList(<List> {items: []})
        expect(input).toBe(true)
    })
    
    test('isList: return false. if input is Atom', () => {
        const input = isList(<Atom> {value: 3})
        expect(input).toBe(false)
    })
})

describe.skip('check List', () => {
    test('return ist element of a List', () => {
        const input = first(<List> {
            items: [ <Atom> {value: 3} ]
        })
        const expected = <Atom> {value: 3}
        expect(input.value).toBe(expected.value)
    })

    test('throw Error if input list is empty', () => {
        const input = () => {
            first(<List> { items: []})
        }
        expect(input).toThrowError(Error('List is empty'))
    })

    test('return the rest of List', () => {
        const input = rest(<List> {
            items: [
                <Atom> {value: 3}
            ]
        })
        const expected = <List> {items: []}
        expect(input.items.length).toBe(expected.items.length)
    })
})

describe('Arithmetic Operation', () => {
    test('+ : calculate arithmetic expression correctly', () => {
        const s = ParseList('(+ 1 2)')
        const input = Evaluate(s)
        const expected = <Atom> {value: 3}
        expect(input.value).toBe(expected.value)
    })

    test('+ : return false if input is invalid form', () => {
        const s = ParseList('(+)')
        const input = () => {Evaluate(s)}
        expect(input).toThrowError('Not enought argument to the operation')
    })

    test('- : calculate arithmetic expression correctly', () => {
        const s = ParseList('(- 1 2)')
        const input = Evaluate(s)
        const expected = <Atom> {value: -1}
        expect(input.value).toBe(expected.value)
    })

    test('- : return false if input is invalid form', () => {
        const s = ParseList('(-)')
        const input = () => {Evaluate(s)}
        expect(input).toThrowError('Not enought argument to the operation')
    })

    test('* : calculate arithmetic expression correctly', () => {
        const s = ParseList('(* 1 2)')
        const input = Evaluate(s)
        const expected = <Atom> {value: 2}
        expect(input.value).toBe(expected.value)
    })

    test('* : return false if input is invalid form', () => {
        const s = ParseList('(-)')
        const input = () => {Evaluate(s)}
        expect(input).toThrowError('Not enought argument to the operation')
    })

    test('/ : calculate arithmetic expression correctly', () => {
        const s = ParseList('(/ 4 2)')
        const input = Evaluate(s)
        const expected = <Atom> {value: 2}
        expect(input.value).toBe(expected.value)
    })

    test('/ : return false if input is invalid form', () => {
        const s = ParseList('(/)')
        const input = () => {Evaluate(s)}
        expect(input).toThrowError('Not enought argument to the operation')
    })

    test('% : calculate arithmetic expression correctly', () => {
        const s = ParseList('(% 13 5)')
        const input = Evaluate(s)
        const expected = <Atom> {value: 3}
        expect(input.value).toBe(expected.value)
    })

    test('% : return false if input is invalid form', () => {
        const s = ParseList('(%)')
        const input = () => {Evaluate(s)}
        expect(input).toThrowError('Not enought argument to the operation')
    })

    test('calculate nested arithmetic expression correctly', () => {
        const s = ParseList('(+ 1 2 3)')
        const input = Evaluate(s)
        const expected = <Atom> {value: 6}
        expect(input.value).toBe(expected.value)
    })

    test('calculate nested arithmetic expression correctly', () => {
        const s = ParseList('(+ 1 2 3)')
        const input = Evaluate(s)
        const expected = <Atom> {value: 6}
        expect(input.value).toBe(expected.value)
    })

    test('calculate complex arithmetic expression correctly', () => {
        const s = ParseList('(+ 1 2 (* 3 (/ 8 2)) 10)')
        const input = Evaluate(s)
        const expected = <Atom> {value: 25}
        expect(input.value).toBe(expected.value)
    })
})