import * as fs from "fs"
import ParserState from "./ParserState"
import { ParsableString } from "./ParsableString"

export type R = RegExpExecArray | null
export type Rr = RegExpExecArray
export type Regs = { [k: string]: RegExp }
export type ParsingResult = {
  level: number
  text: string
  type: string | number
}
export type NextMethod = () => ParsingResult | NextMethod

class Parser {
  state: ParserState
  constructor() {
    this.state = new ParserState()
  }

  parseOrg(buff: Buffer) {
    const lines = buff.toString().split("\n")
    lines.forEach((line: string) => this.#qualifyLine(line))
  }

  #qualifyLine(s: string) {
    const p = new ParsableString(s)
    const { level, text, type } = p.start() as ParsingResult
    console.log(text)
  }
}

export default Parser
