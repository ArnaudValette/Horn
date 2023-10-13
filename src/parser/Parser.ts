import ParserState from "./ParserState"

import { ParsableString } from "./ParsableString"
import { OrgBracketElementsParser } from "../horn/OrgBracketParser"
import { FormatParser } from "../horn/FormatParser"

class Parser {
  state: ParserState
  fDispatch: FunctionDispatcher
  bracketParser: OrgBracketElementsParser
  formatParser: FormatParser
  isVerbatimMode: Boolean = false
  isOrgCodeMode: Boolean = false
  constructor(
    bracketParser: OrgBracketElementsParser,
    formatParser: FormatParser
  ) {
    // parserState handles the glitterNodes
    // since Parser is our high-level interface, we transfer
    this.state = new ParserState()
    this.fDispatch = {
      heading: this.#heading,
      list: this.#list,
      nList: this.#nlist,
      sTemplate: this.#sTemplate,
      sTemplateEnd: this.#sTemplateEnd,
      //bSrc: this.#bsrc,
      //eSrc: this.#esrc,
      nSrc: this.#nsrc,
      paragraph: this.#paragraph,
      tableSep: this.#tableSep,
      table: this.#table,
      empty: this.#empty,
      HR: this.#HR,
      orgCode: this.#orgCode,
      footNote: this.#footNote,
      clock: this.#empty,
    }
    this.bracketParser = bracketParser
    this.formatParser = formatParser
  }

  parseOrg(buff: Buffer) {
    const a = performance.now()
    const lines = buff.toString().split("\n")
    lines.forEach((line: string) => this.#qualifyLine(line))
    this.state.transferFootNotes()
    const b = performance.now()
    console.log(`TIME TAKEN : ${b - a} ms`)
  }

  /*
type HornType =
  | "heading"
  | "list"
  | "nList"
  | "sTemplate"
  | "sTemplateEnd"
  | "nSrc"
  | "table"
  | "tableSep"
  | "empty"
  | "HR"
  | "orgCode"
  | "footNote"
  | "paragraph"
    */
  #qualifyLine(s: string) {
    const [p, n, sentences] = this.#getParsingResults(s)
    const Nodes: ParsedGlitter = [...n]
    sentences.forEach((n: Array<number>) => {
      const m = this.formatParser.parse(p.text, n[0], n[1])
      if (m.length > 0) Nodes.push(...m)
    })

    Nodes.sort((a, b) => a.start - b.start)
    this.fDispatch[p.type].call(this, {
      ...p,
      glitterNodes: this.#isFormatFree(p.type) ? [] : Nodes,
    })
  }

  #getParsingResults(
    s: string
  ): [ParsingResult, TreeParserNodes, TextDelimitations] {
    const p = this.#getParsedString(s)
    this.#handleVerbatim(p.type)
    const [n, t] = this.#isFormatFree(p.type)
      ? [[], []]
      : this.#getParsedNodes(p.text)
    return [p, n, t]
  }
  #getParsedNodes(s: string): [TreeParserNodes, TextDelimitations] {
    return this.bracketParser.parse(s)
  }
  #getParsedString(s: string): ParsingResult {
    return new ParsableString(s).start() as ParsingResult
  }
  #isFormatFree(t: HornType): Boolean {
    return (
      this.isOrgCodeMode ||
      this.isVerbatimMode ||
      t === "empty" ||
      t === "clock"
    )
  }
  #handleVerbatim(t: HornType) {
    this.isOrgCodeMode = t === "orgCode"
    if (t === "sTemplate") {
      this.isVerbatimMode = true
    }
    if (t === "sTemplateEnd") {
      this.isVerbatimMode = false
    }
  }

  #footNote(p: ParsingResult) {
    this.state.appendFootNote(p)
  }
  #orgCode(p: ParsingResult) {
    this.state.appendOrgCode(p)
  }
  #HR(p: ParsingResult) {
    this.state.appendHR(p)
  }
  #empty(p: ParsingResult) {
    this.state.appendEmpty(p)
  }
  #heading(p: ParsingResult) {
    this.state.appendHeading(p)
  }
  #list(p: ParsingResult) {
    this.state.appendList(p)
  }
  #nlist(p: ParsingResult) {
    // I think we should treat em like normal list for now ?
    this.state.appendList(p)
  }
  #sTemplate(p: ParsingResult) {
    this.state.appendTemplate(p)
  }
  #sTemplateEnd(p: ParsingResult) {
    this.state.appendTemplateEnd(p)
  }
  #nsrc(p: ParsingResult) {
    this.state.appendNSrc(p)
  }
  // #esrc(p: ParsingResult) {
  //   this.state.appendESrc(p)
  // }
  // #bsrc(p: ParsingResult) {
  //   this.state.appendBSrc(p)
  // }
  #tableSep(p: ParsingResult) {
    this.state.appendTableSep(p)
  }
  #table(p: ParsingResult) {
    this.state.appendTable(p)
  }
  #paragraph(p: ParsingResult) {
    this.state.appendParagraph(p)
  }
}

export default Parser
