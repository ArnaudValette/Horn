import ParserState from "./ParserState"

import { ParsableString } from "./ParsableString"
import { OrgBracketElementsParser } from "../horn/OrgBracketParser"
import { FormatParser } from "../horn/FormatParser"

export type R = RegExpExecArray | null
export type Rr = RegExpExecArray
export type Regs = Obj<RegExp>
export type ParsingResult = {
  level: number
  text: string
  type: string | number | symbol
  glitterNodes?: ParsedGlitter
}
export type NextMethod = () => ParsingResult | NextMethod

type FunctionDispatcher = Obj<(p: ParsingResult) => void>

class Parser {
  state: ParserState
  fDispatch: FunctionDispatcher
  bracketParser: OrgBracketElementsParser
  bracketNodesMap: Array<TreeParserNode> = []
  formatNodesMap: Array<Marker | MarkerWithTextContent> = []
  textDelimitations: Array<Array<number>> = []
  formatParser: FormatParser
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

  #qualifyLine(s: string) {
    const p = new ParsableString(s)
    const parsed = p.start() as ParsingResult
    // TODO: maybe internalize this
    const [nodeMap, textDelimitations]: [TreeParserNodes, TextDelimitations] =
      this.bracketParser.parse(parsed.text)

    const glit: Array<TreeParserNode | Marker | MarkerWithTextContent> = [
      ...nodeMap,
    ]
    textDelimitations.forEach((lim: Array<number>) => {
      const markersMap = this.formatParser.parse(
        parsed.text.substring(lim[0], lim[1])
      )
      if (markersMap.length > 0) {
        glit.push(...markersMap)
      }
    })
    // TODO: treat bracketNodes and formatNodes as GlitterNodes, and transfer them
    // to the hornNode
    this.fDispatch[parsed.type].call(this, {
      ...parsed,
      glitterNodes: glit,
    })
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
