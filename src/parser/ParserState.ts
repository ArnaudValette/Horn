import { HornNode } from "../horn/HornNode"
import { ParsingResult } from "./Parser"

class ParserState implements _ParserState {
  roots: Array<HornNode>
  headings: Obj<HornNode>
  lists: Obj<HornNode>
  lastHeading: HornNode | null
  lastList: HornNode | null
  lastSrc: HornNode | null
  listMode: Boolean
  srcMode: Boolean
  count: Int = 0
  constructor() {
    this.roots = []
    this.headings = {}
    this.lists = {}
    this.lastHeading = null
    this.lastList = null
    this.lastSrc = null
    this.listMode = false
    this.srcMode = false
  }

  inc() {
    this.count += 1
  }
  resetMode() {
    this.srcMode = false
    this.listMode = false
  }
  appendRoot(p: ParsingResult) {
    const h = new HornNode(this.count, p.level, p.type as string, p.text)
  }
  appendHeading(p: ParsingResult) {}
  appendList(p: ParsingResult) {}
  appendNList(p: ParsingResult) {}
  appendBSrc(p: ParsingResult) {}
  appendESrc(p: ParsingResult) {}
  appendNSrc(p: ParsingResult) {}
  appendParagraph(p: ParsingResult) {}
}
export default ParserState
