/*
   TODO: add a markerStack.push method,
   simplify conditions for knowing if a markerStack should
   be added before and after the stack, or if the stack is empty,

   simplify dealing with text offset, where we're parsing a substring,
   but need to retain information about the parent string.
 */
export class FormatParser {
  flags: FlagsType
  markers: Array<Marker>
  markerStack: Array<Marker | MarkerWithTextContent>
  currentFlag: Flag
  line: string = ""
  start:number= 0
  end:number = 0
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
  // TODO: deal with verbatim as a blocking type to revoke any marker
  parse(line: string, start:number, end:number) {
    this.resetState()
    this.start = start
    this.end = end
    this.line = line.substring(start,end)
    for (let i = 0, j = this.line.length; i < j; i++) {
      const char = this.line[i]
      if (this.flags[char]) {
        if(this.line[i+1] && this.line[i+1] === char){
          // if double symbol edge case, jump over it
          i = i+1
        }
        else{
          const cond = this.#hasFlag(this.flags[char], this.currentFlag)
          this.currentFlag = this.#match(i, this.flags[char], cond)
        }
      }
    }
    this.#createFormatMap()
    this.#appendIfNecessary()
    return this.markerStack
  }

  #resetStackAndFlag() {
    this.markerStack = []
    this.currentFlag = 0b000000
  }

  #createFormatMap() {
    this.#resetStackAndFlag()
    this.markers.sort((a, b) => a.start - b.start)
    for (let i = 0, j = this.markers.length; i < j; i++) {
      if (this.markers[i + 1]) {
        const m = this.markers[i]
        const m2 = this.markers[i + 1]
        this.currentFlag = m.first
            ? this.currentFlag | m.type
            : this.currentFlag ^ m.type
        this.markerStack.push({
            adjective: this.currentFlag,
            start: m.start + this.start,
            type: m.type,
            end: m2.start + this.start,
            text: this.line.substring(m.start + 1, m2.start),
        })
      }
    }
  }

  #appendIfNecessary() {
    const mS = this.markerStack
    const fM = mS[0]
    const lM: MarkerWithTextContentAndEnd = mS[
      mS.length - 1 
    ] as MarkerWithTextContentAndEnd
    const l = this.line
    if (!fM || !lM){
      return this.markerStack.push(
        {
          adjective:0,
          start: 0+this.start,
          type: 0,
          end:l.length+this.start,
          text: l,
          //@ts-ignore
        debugNone:true
        }
      ) 
    }
    if (fM.start !== 0+this.start) {
      this.markerStack = [
        {
          adjective: 0,
          start: 0+this.start,
          end: fM.start,
          type: 0,
          text: l.substring(0, fM.start - this.start),
          //@ts-ignore
        debugStart:true
        },
        ...this.markerStack,
      ]
    }
    if (lM.end !== l.length - 1 + this.start) {
      this.markerStack.push({
        adjective: 0,
        start: lM.end,
        end: l.length+this.start,
        type: 0,
        text: l.substring(lM.end + 1 - this.start, l.length),
        //@ts-ignore
        debugEnd:true
      })
    }
  }
  #hasFlag(a: number, b: number) {
    return (a & b) === a
  }
  #match(n: number, flag: Flag, cond: boolean) {
    const adjective = cond ? this.currentFlag ^ flag : this.currentFlag | flag
    const marker = { type: flag, start: n }
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
