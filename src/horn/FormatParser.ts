type Flag = number
type FlagsType = { [key: string]: Flag }
type Marker = {
  type: Flag
  position: number
  first?: boolean
  adjective?: Flag
  end?: number
}
type MarkerWithTextContent = Marker & { text: string }
type MarkerWithTextContentAndEnd = Marker & { text: string; end: number }

type Markers = { [key: number]: Marker }

class FormatParser {
  flags: FlagsType
  markers: Array<Marker>
  markerStack: Array<Marker | MarkerWithTextContent>
  currentFlag: Flag
  line: string = ""
  constructor(flags: FlagsType) {
    this.flags = flags
    this.markers = []
    this.markerStack = []
    this.currentFlag = 0b000000
  }

  resetState() {
    this.#resetStackAndFlag()
    this.markers = []
    this.line = ""
  }
  parse(line: string) {
    this.resetState()
    this.line = line
    for (let i = 0, j = line.length; i < j; i++) {
      const char = line[i]
      if (this.flags[char]) {
        const cond = this.#hasFlag(this.flags[char], this.currentFlag)
        this.currentFlag = this.#match(i, this.flags[char], cond)
      }
    }
    this.#createFormatMap()
    return this.markerStack
  }

  #resetStackAndFlag() {
    this.markerStack = []
    this.currentFlag = 0b000000
  }

  #createFormatMap() {
    this.#resetStackAndFlag()
    this.markers.sort((a, b) => a.position - b.position)
    for (let i = 0, j = this.markers.length; i < j; i++) {
      if (this.markers[i + 1]) {
        const m = this.markers[i]
        const m2 = this.markers[i + 1]
        this.currentFlag = m.first
          ? this.currentFlag | m.type
          : this.currentFlag ^ m.type
        this.markerStack.push({
          adjective: this.currentFlag,
          position: m.position,
          type: m.type,
          end: m2.position,
          text: this.line.substring(m.position + 1, m2.position),
        })
      }
    }
    this.#appendIfNecessary()
  }

  #appendIfNecessary() {
    const mS = this.markerStack
    const fM = mS[0]
    const lM: MarkerWithTextContentAndEnd = mS[
      mS.length - 1
    ] as MarkerWithTextContentAndEnd
    const l = this.line
    if (!fM || !lM) return
    if (fM.position !== 0) {
      this.markerStack = [
        {
          adjective: 0,
          position: 0,
          end: fM.position,
          type: 0,
          text: l.substring(0, fM.position),
        },
        ...this.markerStack,
      ]
    }
    if (lM.end !== l.length - 1) {
      this.markerStack.push({
        adjective: 0,
        position: lM.end,
        end: l.length,
        type: 0,
        text: l.substring(lM.end + 1, l.length),
      })
    }
  }
  #hasFlag(a: number, b: number) {
    return (a & b) === a
  }
  #match(n: number, flag: Flag, cond: boolean) {
    const adjective = cond ? this.currentFlag ^ flag : this.currentFlag | flag
    const marker = { type: flag, position: n }
    if (cond) {
      const index = this.#findByFlag(flag)
      const first = this.markerStack[index]
      this.markers.push({ ...first, first: true })
      this.markers.push(marker)
      this.markerStack.splice(index, 1)
    } else {
      this.markerStack.push(marker)
    }
    return adjective
  }
  #findByFlag(flag: Flag) {
    return this.markerStack.findIndex((x) => x.type === flag)
  }
}

// const line: string =
//   "/Ok/ let's *go / there* and +see /what is possible to *make+ wi/th~ this / . * So * far, * we can see *that* the+ normal* distribution[...]*"
//
// let flagField: FlagsType = {
//   "*": 0b100000,
//   "/": 0b010000,
//   _: 0b001000,
//   "+": 0b000100,
//   "~": 0b000010,
//   "=": 0b000001,
// }
//
// const parser = new FormatParser(flagField)
// const parsedString = parser.parse(line)
// console.log(parsedString)

/*
   Usage :

    const line: string =
   "/Ok/ let's *go / there* and +see /what is possible to *
   make+ wi/th~ this / . * So * far, * we can see *that* the+ normal* distribution[...]*"

    let flagField: FlagsType = {
    "*": 0b100000,
    "/": 0b010000,
    _: 0b001000,
    "+": 0b000100,
    "~": 0b000010,
    "=": 0b000001,
    }


   const parser = new FormatParser(flagField)
   const parsedString = parser.parse(line)

   Result is an array of MarkerWithTextContentAndEnd
   example:
   {
   type: 0b100000, <=== the raw type of the current node (here bold, "*")
   adjective: 0b111000, <=== the real type of the current node (compound type, bold+italic+underlined)
   position: 5 (a number) <=== the start of the node in the line
   end: 8 (a number) <=== the end of the node in the line
   text: "some bold italic underlined text" <=== the substring
   }

   Note:
   position includes the encountered marker (*, / , _... in our case)
   end excludes it
   text doesn't contain the marker symbols when they are indeed markers

*/
