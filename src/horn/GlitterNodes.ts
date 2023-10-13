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
export function NodesToGN(n: ParsedGlitter): GlitterNode[] {
  return n.map((g: PreGlitter) => GNdispatcher(g))
}

function GNdispatcher(g: PreGlitter): GlitterNode {
  const t = g.type
  if (typeof t === "number") {
    return new Format(g)
  }
  if (t === "image") {
    return new orgImage(g)
  }
  if (t === "link") {
    return new orgLink(g)
  }
  if (t === "footnote") {
    return new orgFootnote(g)
  }
  if (t === "cookiePercent") {
    return new orgCookiePercent(g)
  }
  if (t === "cookieRatio") {
    return new orgCookieRatio(g)
  }
  if (t === "date") {
    return new orgDate(g)
  }
  if (t === "checkboxEmpty" || t === "checkboxCheck") {
    return new orgCheckBox(g)
  }
  return new GlitterNode(g)
}

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
  constructor(g: TreeParserNode) {
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
  constructor(g: TreeParserNode) {
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
  constructor(g: TreeParserNode) {
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
export class orgCheckBox extends GlitterNode {
  checked: boolean
  constructor(g: TreeParserNode) {
    super(g)
    this.checked = this.#setChecked(g.type)
  }
  #setChecked(t: orgBracketType): boolean {
    return t === "checkboxCheck"
  }
}
export class orgImage extends GlitterNode {
  src: string
  constructor(g: TreeParserNode) {
    super(g)
    this.src = this.#setSrc(g.text)
  }
  #setSrc(s: string) {
    return s.substring(2, s.length - 2)
  }
  getSrc() {
    return this.src
  }
}

export class orgLink extends GlitterNode {
  href: string
  text: string
  constructor(g: TreeParserNode) {
    super(g)
    const [a, b] = this.#setValues(g.text)
    this.href = a
    this.text = b
  }
  #setValues(s: string): [string, string] {
    const x = s.substring(2, s.length - 2).split("]")
    return [x[0], x[1].substring(1)]
  }
  getHref(): string {
    return this.href
  }
  getText(): string {
    return this.text
  }
  getValues(): [string, string] {
    return [this.href, this.text]
  }
}

export class orgFootnote extends GlitterNode {
  noteId: number
  constructor(g: TreeParserNode) {
    super(g)
    this.noteId = this.#FindNoteId(g.text)
  }
  #FindNoteId(d: string) {
    return parseInt(d.substring(4, this.toString().indexOf("]")))
  }
  getId(): number {
    return this.noteId
  }
}

export class Format extends GlitterNode {
  type: number
  constructor(g: MarkerWithTextContentAndEnd) {
    super(g)
    this.type = g.adjective || 0
  }
  getText(): string {
    return this.text
  }
  getType(): number {
    return this.type
  }
}
