import * as fs from "fs"
import ParserState from "./ParserState"
import { ParsableString } from "./ParsableString"

export type R = RegExpExecArray | null
export type Rr = RegExpExecArray
export type Regs = Obj<RegExp>
export type ParsingResult = {
  level: number
  text: string
  type: string | number | symbol
}
export type NextMethod = () => ParsingResult | NextMethod

type FunctionDispatcher = Obj<(p: ParsingResult) => void>

class Parser {
  state: ParserState
  fDispatch: FunctionDispatcher
  constructor() {
    this.state = new ParserState()
    this.fDispatch = {
      heading: this.#heading,
      list: this.#list,
      nList: this.#nlist,
      bSrc: this.#bsrc,
      eSrc: this.#esrc,
      nSrc: this.#nsrc,
      paragraph: this.#paragraph,
    }
  }

  parseOrg(buff: Buffer) {
    const lines = buff.toString().split("\n")
    lines.forEach((line: string) => this.#qualifyLine(line))
  }

  #qualifyLine(s: string) {
    const p = new ParsableString(s)
    const parsed = p.start() as ParsingResult
    this.fDispatch[parsed.type].call(this, parsed)
  }

  #heading(p: ParsingResult) {
    console.log(p.text)
  }
  #list(p: ParsingResult) {}
  #nlist(p: ParsingResult) {}
  #bsrc(p: ParsingResult) {}
  #nsrc(p: ParsingResult) {}
  #esrc(p: ParsingResult) {}
  #paragraph(p: ParsingResult) {}
}

export default Parser
