const text =
  "Ok let's *go / there* and +see /what is possible to * make+ ple/ase"

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
type found = token & { end: number; text: string }

let type = 0b000000
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
      const newNode = {
        type: n1.wholeT,
        start: n1.position,
        end: n2.position,
        text: text.substring(n1.position + 1, n2.position),
      }
      console.log(newNode)
    }
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
    text: text.substring(tokens[i].position + 1, position),
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
