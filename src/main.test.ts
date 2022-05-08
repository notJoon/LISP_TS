import { toChar, isAtom, isList, first, rest } from './parser';
import { ParseAtom, Atom, List, ParseList } from "./parser";
import { Evaluate } from "./evaluator";

describe.skip('Parse', () => {
        test('expect return: array of chars', () => {
        const input = toChar('abc')
        const expected = ['a', 'b', 'c']

        expect(input).toEqual(expected)
    })

    test('should return a number of Atom, given a string containing a number', () => {
        const input = ParseAtom('1')
        const expected = <Atom<number>> {value: 1}

        expect(expected.value).toBe(input.value)
    })
})

describe.skip('ParseAtom', () => {
    test('should return a symbol of Atom, given a string containing a name', () => {
        const input = ParseAtom('a')
        const expected = <Atom<string>> {value: 'a'}
    
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
            items: [<Atom<number>> {value: 1}]
        }
        expect(input.items.length).toBe(expected.items.length)
        expect((<Atom<number>>expected.items[0]).value === ((<Atom<number>>input.items[0]).value)).toBe(true)
    })
    
    test('return 2 elements List', () => {
        const input = ParseList('(1 a)')
        const expected = <List> {
            items: [ <Atom<number>> {value: 1}, <Atom<string>> {value: 'a'} ]
        }
        expect(input.items.length).toBe(expected.items.length)
        expect((<Atom<number>>expected.items[0]).value === (<Atom<number>>input.items[0]).value).toBe(true)
        expect((<Atom<string>>expected.items[1]).value === ((<Atom<string>>input.items[1]).value)).toBe(true)
    })
    
    test('return list that contain operator', () => {
        const input = ParseList('(() 1 a)')
        const expected = <List> {
            items: [ 
                <List> {items: []}, 
                <Atom<number>> {value: 1}, 
                <Atom<string>> {value: 'a'} 
            ]
        }
        expect(input).toBe(expected)
    })
    
    test('return List, given a string with symbol and numeric Atoms', () => {
        const input = ParseList('(add 1 2)')
        const expected = <List> {
            items: [ 
                <Atom<string>> {value: 'add'}, 
                <Atom<number>> {value: 1}, 
                <Atom<number>> {value: 2} 
            ]
        }
        expect(input).toBe(expected)
    })
    
    test('return List, given operator and numeric Atoms', () => {
        const input = ParseList('(+ 1 2)')
        const expected = <List> {
            items: [
                <Atom<string>> {value: '+'}, 
                <Atom<number>> {value: 1}, 
                <Atom<number>> {value: 2} 
            ]
        }   
        expect(input).toBe(expected)
    })
    
    test('return List, given a string of arithmetic expression', () => {
        const input = ParseList('(+ 1 2 (* 3 4))')
        const expected = <List> {
            items: [
                <Atom<string>> {value: '+'},
                <Atom<number>> {value: 1}, 
                <Atom<number>> {value: 2},
                <List> {
                    items: [
                        <Atom<string>> {value: '*'},
                        <Atom<number>> {value: 3},
                        <Atom<number>> {value: 4}
                    ]
                }
            ]
        }
        expect(input).toBe(expected)
    })
    
    test('return List given a deep nested list and arithmetic operator', () => {
        const input = ParseList('(((+ 1 2)))')
        const expected = <List> {
            items: [
                <List> {
                    items: [
                        <List> {
                            items: [
                                <Atom<string>> {value: '+'},
                                <Atom<number>> {value: 1},
                                <Atom<number>> {value: 2}
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
        const input = isAtom(<Atom<number>> {value: 3})
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
        const input = isList(<Atom<number>> {value: 3})
        expect(input).toBe(false)
    })
})

describe.skip('check List', () => {
    test('return ist element of a List', () => {
        const input = first(<List> {
            items: [ <Atom<number>> {value: 3} ]
        })
        const expected = <Atom<number>> {value: 3}
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
                <Atom<number>> {value: 3}
            ]
        })
        const expected = <List> {items: []}
        expect(input.items.length).toBe(expected.items.length)
    })
})

describe.skip('Arithmetic Operation', () => {
    test('+ : calculate arithmetic expression correctly', () => {
        const s = ParseList('(+ 1 2)')
        const input = Evaluate(s)
        const expected = <Atom<number>> {value: 3}
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
        const expected = <Atom<number>> {value: -1}
        expect(input.value).toBe(expected.value)
    })

    test('- : calculate arithmetic expression correctly', () => {
        const s = ParseList('(- -1 2)')
        const input = Evaluate(s)
        const expected = <Atom<number>> {value: -3}
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
        const expected = <Atom<number>> {value: 2}
        expect(input.value).toBe(expected.value)
    })

    test('* : return false if input is invalid form', () => {
        const s = ParseList('(*)')
        const input = () => {Evaluate(s)}
        expect(input).toThrowError('Not enought argument to the operation')
    })

    test('/ : calculate arithmetic expression correctly', () => {
        const s = ParseList('(/ 4 2)')
        const input = Evaluate(s)
        const expected = <Atom<number>> {value: 2}
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
        const expected = <Atom<number>> {value: 3}
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
        const expected = <Atom<number>> {value: 6}
        expect(input.value).toBe(expected.value)
    })

    test('calculate nested arithmetic expression correctly', () => {
        const s = ParseList('(+ 1 2 3)')
        const input = Evaluate(s)
        const expected = <Atom<number>> {value: 6}
        expect(input.value).toBe(expected.value)
    })

    test('calculate complex arithmetic expression correctly', () => {
        const s = ParseList('(+ 1 2 (* 3 (/ 8 2)) 10)')
        const input = Evaluate(s)
        const expected = <Atom<number>> {value: 25}
        expect(input.value).toBe(expected.value)
    })
})

describe.skip('Comparison Operator', () => {
    test('parse comparison: ==', () => {
        const t = ParseList('(==)')
        const input = () => {Evaluate(t)}

        expect(input).toThrowError(Error("Comparision operator == needs 2 arguments. got=0"))
    })

    test('parse comparison: ==', () => {
        const t = ParseList('(== 1)')
        const input = () => {Evaluate(t)}

        expect(input).toThrowError(Error("Comparision operator == needs 2 arguments. got=1"))
    })

    test('== : return true', () => {
        const t = ParseList('(== 1 1)')
        const input = Evaluate(t)

        expect(input.value).toBe(true)
    })

    test('== : return false', () => {
        const t = ParseList('(== 1 -1)')
        const input = Evaluate(t)

        expect(input.value).toBe(false)
    })

    test('!= : return true', () => {
        const t = ParseList('(!= 1 2)')
        const input = Evaluate(t)

        expect(input.value).toBe(true)
    })

    test('!= : return false', () => {
        const t = ParseList('(!= 1 1)')
        const input = Evaluate(t)

        expect(input.value).toBe(false)
    })

    test('> : return true', () => {
        const t = ParseList('(> 2 1)')
        const input = Evaluate(t)

        expect(input.value).toBe(true)
    })

    test('> : return false', () => {
        const t = ParseList('(> 1 1)')
        const input = Evaluate(t)

        expect(input.value).toBe(false)
    })

    test('< : return true', () => {
        const t = ParseList('(< 1 2)')
        const input = Evaluate(t)

        expect(input.value).toBe(true)
    })

    test('< : return false', () => {
        const t = ParseList('(< 1 1)')
        const input = Evaluate(t)

        expect(input.value).toBe(false)
    })

    test('>= : return true', () => {
        const t = ParseList('(>= 2 2)')
        const input = Evaluate(t)

        expect(input.value).toBe(true)
    })

    test('>= : return false', () => {
        const t = ParseList('(>= 0 1)')
        const input = Evaluate(t)

        expect(input.value).toBe(false)
    })

    test('<= : return true', () => {
        const t = ParseList('(>= 2 2)')
        const input = Evaluate(t)

        expect(input.value).toBe(true)
    })

    test('<= : return false', () => {
        const t = ParseList('(<= 0 -1)')
        const input = Evaluate(t)

        expect(input.value).toBe(false)
    })

    test('complex comparison. return true', () => {
        const t = ParseList('(== (== 1 1) (!= a b))')
        const input = Evaluate(t)

        expect(input.value).toBe(true)
    })

    test('complex comparison. return false', () => {
        const t = ParseList('(!= (== 1 1) (!= a b))')
        const input = Evaluate(t)

        expect(input.value).toBe(false)
    })
})

describe.skip('Logical Ops', () => {
    test('throw error for lack of arguments. given only op', () => {
        const t = ParseList('(&&)')
        const input = () => { Evaluate(t) }

        expect(input).toThrowError(Error('Logical operator && needs 2 arguments. got=0'))
    })

    test('throw error for lack of arguments. given 1 op, 1 arg', () => {
        const t = ParseList('(&& true)')
        const input = () => { Evaluate(t) }

        expect(input).toThrowError(Error('Logical operator && needs 2 arguments. got=1'))
    })

    test('throw error for lack of arguments. given only op', () => {
        const t = ParseList('(||)')
        const input = () => { Evaluate(t) }

        expect(input).toThrowError(Error('Logical operator || needs 2 arguments. got=0'))
    })

    test('throw error for lack of arguments. given 1 op, 1 arg', () => {
        const t = ParseList('(|| true)')
        const input = () => { Evaluate(t) }

        expect(input).toThrowError(Error('Logical operator || needs 2 arguments. got=1'))
    })

    test('&&. return true', () => {
        const t = ParseList('(&& true true)')
        const input = Evaluate(t)
        expect(input.value).toBe(true)
    })

    // ------------------
    test('&&. return false', () => {
        const t = ParseList('(&& true false)')
        const input = Evaluate(t)
        expect(input.value).toBe(false)
    })

    test('&&. return false', () => {
        const t = ParseList('(&& false true)')
        const input = Evaluate(t)
        expect(input.value).toBe(false)
    })

    test('&&. return false', () => {
        const t = ParseList('(&& false false)')
        const input = Evaluate(t)
        expect(input.value).toBe(false)
    })

    // -------------

    test('||. return true', () => {
        const t = ParseList('(|| true true)')
        const input = Evaluate(t)
        expect(input.value).toBe(true)
    })

    test('||. return false', () => {
        const t = ParseList('(|| false false)')
        const input = Evaluate(t)
        expect(input.value).toBe(false)
    })

    test('||. return true', () => {
        const t = ParseList('(|| true false)')
        const input = Evaluate(t)
        expect(input.value).toBe(true)
    })

    test('||. return true', () => {
        const t = ParseList('(|| false true)')
        const input = Evaluate(t)
        expect(input.value).toBe(true)
    })
})

describe.skip('Conditioning Operators', () => {
    test('condition logic, if then else', () => {
        const t = ParseList('(if (> 2 1) pass)')
        const input = Evaluate(t)

        expect(input.value).toBe('pass')
    })

    test('condition logic, if then else', () => {
        const t = ParseList('(if (< 2 1) pass nope)')
        const input = Evaluate(t)

        expect(input.value).toBe('nope')
    })

    test('condition logic, if then else', () => {
        const t = ParseList('(if (&& (> 2 1) (>= 3 1)) pass nope)')
        const input = Evaluate(t)

        expect(input.value).toBe('pass')
    })

    test('condition logic, if then else', () => {
        const t = ParseList('(if (|| (< 2 1) (<= 3 1)) pass nope)')
        const input = Evaluate(t)

        expect(input.value).toBe('nope')
    })
})

describe("Function", () => {
    test('function throw grammar Error', () => {
        const t = ParseList('(defun () 0)')
        const input = () => { Evaluate(t) }

        expect(input).toThrowError(Error('defun does not have enought arguments needs 3 arguments. got=2'))
    })

    test('main function throw grammar Error', () => {
        const t = ParseList('(defun main)')
        const input = () => { Evaluate(t) }

        expect(input).toThrowError(Error('defun does not have enought arguments needs 3 arguments. got=1'))
    })

    test('main function throw grammar Error', () => {
        const t = ParseList('(defun)')
        const input = () => { Evaluate(t) }

        expect(input).toThrowError(Error('defun does not have enought arguments needs 3 arguments. got=0'))
    })

    test('main function', () => {
        const t = ParseList('(defun main () 0)')
        const input = Evaluate(t)

        expect(input.value).toBe(true)
    })
})