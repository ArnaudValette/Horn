/*
type orgBracketType =
    | "cookiePercent"
    | "cookieRatio"
    | "date"
    | "checkboxEmpty"
    | "checkboxCheck"
    | "image"
    | "link"
    | "footnote"

let flags = {
    "*": 0b100000,
    "/": 0b010000,
    _: 0b001000,
    "+": 0b000100,
    "~": 0b000010,
    "=": 0b000001,
}


 The type of a glitter node can be any of the flags or orgBracketType
   i.e. a number, or a string. Depending on this type parameter, the glitterNode
   should have specific parameters.
*/

export class GlitterNode {
  start: number
  end: number
  text: string
  type: string | number
  constructor(g: PreGlitter) {
    this.start = g.start
    this.end = g.end
    this.text = g.text
    this.type = g.type
  }
}

//{ start: 9, end: 16, text: '[28%]', type: 'cookiePercent' }
export class orgCookiePercent extends GlitterNode {
  percentage: number
  constructor(g: PreGlitter) {
    super(g)
    this.percentage = this.#setPercentage(g.text)
  }
  #setPercentage(s: string): number {
    return parseInt(s.substring(1, s.length - 2))
  }
  getText() {
    return `${this.percentage}%`
  }
}

export class orgCookieRatio extends GlitterNode {
  current: number
  total: number
  constructor(g: PreGlitter) {
    super(g)
    const [a, b] = this.#setRatio(g.text)
    this.current = a
    this.total = b
  }
  #setRatio(s: string): number[] {
    return s
      .substring(1, s.length - 1)
      .split("/")
      .map((str) => parseInt(str))
  }
  getText() {
    return `${this.current}/${this.total}`
  }
}
export class orgDate extends GlitterNode {
  weekday: string
  day: number
  month: number
  year: number
  constructor(g: PreGlitter) {
    super(g)
    const [a, b, c, d] = this.#setDate(g.text)
    this.year = a
    this.month = b
    this.day = c
    this.weekday = d
  }
  #setDate(s: string): [number, number, number, string] {
    const [a, b, c] = s
      .substring(1, s.length - 5)
      .split("-")
      .map((x) => parseInt(x))
    const d = s.substring(s.length - 4, s.length - 1)
    return [a, b, c, d]
  }
  getText() {
    return `${this.weekday} ${this.day} ${this.month}, ${this.year}`
  }
}
export class orgCheckBoxEmpty extends GlitterNode {}
export class orgImage extends GlitterNode {}
export class orgLink extends GlitterNode {}
export class orgFootnote extends GlitterNode {}

//{start:0, end:15, adjective:0, type:0, text:"dddd"}
export class Format extends GlitterNode {}
