import {
  HornType,
  NextMethod,
  ParsingResult,
  R,
  Regs,
  Rr,
} from "../types/types"

export class ParsableString extends String {
  regs: Regs = {
    /* primary nodes */
    heading: /^\*+\s/,
    list: /^\s*-\s/,
    nList: /^\s*([A-Za-z]|[0-9]+)\.\s/,
    sTemplate: /^#\+begin_/,
    sTemplateEnd: /^#\+end_/,
    //bSrc: /^#\+begin_src/,
    //eSrc: /^#\+end_src/,
    nSrc: /^#\+name:/,
    table: /^\|([^\|]*\|)+$/,
    tableSep: /^\|(-+\+)+-+\|$/,
    empty: /^\s*$/,
    HR: /^\s*-{5,}\s*$/,
    orgCode: /^:\s/,
    footNote: /^\[fn:\d+\]\s/,
    paragraph: /.+/,
    clock: /^CLOCK:\s/,
    /* secondary nodes */
  }
  constructor(s: string) {
    super(s)
  }
  #Text(d: Rr) {
    return d.input.substring(d[0].length, this.toString().length)
  }

  #FindNoteId(d: Rr) {
    return parseInt(d.input.substring(4, this.toString().indexOf("]")))
  }

  isTable(type: keyof Regs) {
    return (type as string).includes("table")
  }

  parse(type: HornType, nextMethod: NextMethod): NextMethod | ParsingResult {
    const d: R = this.regs[type].exec(this.toString())
    if (!d) return nextMethod()
    const level =
      type === "footNote"
        ? this.#FindNoteId(d)
        : type === "list"
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
  start = (): NextMethod | ParsingResult => this.FootNote()
  FootNote = (): NextMethod | ParsingResult =>
    this.parse("footNote", this.OrgCode.bind(this))
  OrgCode = (): NextMethod | ParsingResult =>
    this.parse("orgCode", this.HR.bind(this))
  HR = (): NextMethod | ParsingResult => this.parse("HR", this.Empty.bind(this))
  Empty = (): NextMethod | ParsingResult =>
    this.parse("empty", this.Heading.bind(this))
  Heading = (): NextMethod | ParsingResult =>
    this.parse("heading", this.List.bind(this))
  List = (): NextMethod | ParsingResult =>
    this.parse("list", this.nList.bind(this))
  nList = (): NextMethod | ParsingResult =>
    this.parse("nList", this.sTemplate.bind(this))
  sTemplate = (): NextMethod | ParsingResult =>
    this.parse("sTemplate", this.nSrc.bind(this))
  nSrc = (): NextMethod | ParsingResult =>
    this.parse("nSrc", this.sTemplateEnd.bind(this))
  sTemplateEnd = (): NextMethod | ParsingResult =>
    this.parse("sTemplateEnd", this.tSep.bind(this))
  tSep = (): NextMethod | ParsingResult =>
    this.parse("tableSep", this.Table.bind(this))
  Table = (): NextMethod | ParsingResult =>
    this.parse("table", this.Clock.bind(this))
  Clock = (): NextMethod | ParsingResult =>
    this.parse("clock", this.Paragraph.bind(this))
  Paragraph = (): ParsingResult => ({
    level: 0,
    text: this.toString(),
    type: "paragraph",
  })
  //OLD
  //bSrc = (): NextMethod | ParsingResult =>
  //this.parse("bSrc", this.nSrc.bind(this))
  //eSrc = (): NextMethod | ParsingResult =>
  //this.parse("eSrc", this.tSep.bind(this))
}
