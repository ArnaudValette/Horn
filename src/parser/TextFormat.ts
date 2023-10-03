/*
   this file is  the result of a reflexion about how you can
   avoid org syntax to break your parser:
   most of the parsers built for org-mode in the js ecosystem
   usually cannot parse complex expressions such as
   " Thi*s is / a * complex +  / expression that / may = be useless in itself ~ ="
   This should be parsed as the following :

   " Thi" : no formatting,
   "s is " : bold,
   " a " : bold AND italic,
   " complex + " : italic (note that + is a true character here, because it doesn't have any matching pair,
   " expression that / may " : no formatting,
   " be useless in itself ~ " : inline-code formatting

   The idea here is to behave exactly as intended, even if the expression reaches an absurd amount of complexity.

   At the same time, I used a bitfield as a way to ensure format-type composition consistency
   (bold, italic) <=> (italic, bold) === 48 === 0b110000

   The ideal would be to implement the parser in such a way that it performs a simple pass.
   I partially succeeded there, as it needs, after having parsed the text, to perform an operation to compute
   overlapping nodes.

   Now, complexity grows a lot when adding the other types of inline nodes org-mode syntax is capable of,
   that's why a choice has to be made between

   1. Separating concerns : dealing with Files, Links, Images, Footnotes, Timestamps and etc in a separate function
   2. Merging concerns and accepting to sacrifice the reached accuracy in parsing org mode formatting syntax

   Due to the non critical nature of the aim of this project I think we can conserve this implementation
   at least temporarily and confront it with the "merging of concerns" solution in a benchmark later

*/
const text =
  "Ok let's *go / there* and +see /what is possible to * make+ ple/ase / okok * yes * yed * okdfokjsdofkj sodkjfsd s *ok* xxxxx"

type FlagsType = { [key: string]: number }

let flags: FlagsType = {
  "*": 0b100000,
  "/": 0b010000,
  _: 0b001000,
  "+": 0b000100,
  "~": 0b000010,
  "=": 0b000001,
}
type token = {
  t: number
  position: number
  wholeT: number
  char?: string
}
type found = token & { end: number }
type TextFormat = { type: number; start: number; end: number }

let type = 0b000000
let result: Array<TextFormat> = []
let found: Array<found> = []
let end: Array<token> = []
let proc: { [key: number]: found | token } = {}
let tokens: Array<token> = []

for (let i = 0, j = text.length; i < j; i++) {
  const char = text[i]
  if (flags[char]) {
    if (hasFlag(flags[char], type)) {
      type = matched(i, flags[char])
    } else {
      type = unmatched(i, flags[char])
    }
  }
}

noOverlap(found)

function noOverlap(f: Array<found>) {
  const newArr = [...f, ...end]
  newArr.forEach((x) => (proc[x.position] = x))
  const indexes = Object.keys(proc)
  for (let i = 0, j = indexes.length; i < j; i++) {
    if (indexes[i + 1]) {
      const n1 = proc[parseInt(indexes[i])]
      const n2 = proc[parseInt(indexes[i + 1])]
      const newNode: TextFormat = {
        type: n1.wholeT,
        start: n1.position,
        end: n2.position,
      }
      result.push(newNode)
    }
  }
  if (result[0].start !== 0) {
    result = [{ type: 0, start: 0, end: result[0].start }, ...result]
  }
  if (result[result.length - 1].end !== text.length) {
    result.push({
      type: 0,
      start: result[result.length - 1].end,
      end: text.length - 1,
    })
  }
}

function matched(position: number, t: number) {
  const i = tokens.findIndex((x) => x.t === t)
  end.push({
    position,
    t,
    wholeT: type ^ t,
  })
  found.push({
    ...tokens[i],
    end: position,
  })
  tokens.splice(i, 1)
  return type ^ t
}

function unmatched(position: number, t: number) {
  tokens.push({ t, position, wholeT: type | t })
  return type | t
}

function hasFlag(a: number, b: number) {
  return (a & b) === a
}

function findWhoHasFlag(a: number) {}
