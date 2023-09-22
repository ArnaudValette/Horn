import { Regs, Rr, R, NextMethod, ParsingResult } from "./Parser"

export class ParsableString extends String {
  regs: Regs = {
    /* primary nodes */
    heading: /^\*+\s/,
    list: /^\s*-\s/,
    nList: /^\s*[A-Za-z0-9]+\.\s/,
    bSrc: /^#\+begin_src/,
    eSrc: /^#\+end_src/,
    nSrc: /^#\+name:/,
    table: /^(\|.*)+\|$/,
    tableSep: /^\|(-+\+)+-+\|$/,
    /* secondary nodes */
  }
  constructor(s: string) {
    super(s)
  }
  #Text(d: Rr) {
    return d.input.substring(d[0].length, this.toString().length)
  }

  isTable(type: keyof Regs) {
    return (type as string).includes("table")
  }

  parse(type: keyof Regs, nextMethod: NextMethod): NextMethod | ParsingResult {
    const d: R = this.regs[type].exec(this.toString())
    if (!d) return nextMethod()
    const level =
      type === "list"
        ? d[0].length / 2
        : type === "nList"
        ? Math.floor((d[0].length - 1) / 2)
        : type === "heading"
        ? d[0].length - 1
        : 0
    const text = this.isTable(type) ? d[0] : this.#Text(d)
    return { level, text, type }
  }

  // Meta
  start = (): NextMethod | ParsingResult => this.Heading()
  Heading = (): NextMethod | ParsingResult =>
    this.parse("heading", this.List.bind(this))
  List = (): NextMethod | ParsingResult =>
    this.parse("list", this.nList.bind(this))
  nList = (): NextMethod | ParsingResult =>
    this.parse("nList", this.bSrc.bind(this))
  bSrc = (): NextMethod | ParsingResult =>
    this.parse("bSrc", this.nSrc.bind(this))
  nSrc = (): NextMethod | ParsingResult =>
    this.parse("nSrc", this.eSrc.bind(this))
  eSrc = (): NextMethod | ParsingResult =>
    this.parse("eSrc", this.tSep.bind(this))
  tSep = (): NextMethod | ParsingResult =>
    this.parse("tableSep", this.Table.bind(this))
  Table = (): NextMethod | ParsingResult =>
    this.parse("table", this.Paragraph.bind(this))
  Paragraph = (): ParsingResult => ({
    level: 0,
    text: this.toString(),
    type: "paragraph",
  })
}
