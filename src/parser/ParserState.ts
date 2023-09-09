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
  HN(p: ParsingResult) {
    return new HornNode(this.count, p.level, p.type as string, p.text)
  }
  subscribeHeading(h: HornNode) {
    this.headings[h.level] = h
    this.lastHeading = h
    this.inc()
  }
  appendRoot(p: ParsingResult) {
    this.resetMode()
    const h = this.HN(p)
    this.roots.push(h)
    this.subscribeHeading(h)
  }
  appendHeading(p: ParsingResult) {
    this.resetMode()
    const h = this.HN(p)

    if (this.lastHeading && this.lastHeading.level < p.level) {
      this.lastHeading.children.push(h)
    } else {
      this.mostRecentHeading(p.level)?.children.push(h)
    }
    this.subscribeHeading(h)
  }
  appendList(p: ParsingResult) {
    const h = this.HN(p)

    if (this.lastList && p.level > this.lastList.level) {
      this.lastList.children.push(h)
    } else {
      if (p.level === 1) {
        if (Object.keys(this.headings).length === 0) {
          this.roots.push(h)
        } else {
          this.lastHeading?.children.push(h)
        }
      } else {
        this.lists[p.level - 1]?.children.push(h)
      }
    }
    this.lists[p.level] = h
    this.lastList = h
    this.listMode = true
    this.inc()
  }
  appendNList(p: ParsingResult) {
    /*
       a numbered list works exactly like a common list, I think...
     */
  }
  appendBSrc(p: ParsingResult) {
    if (this.srcMode) {
      // obviously
      return this.appendParagraph(p)
    }
    this.listMode = false
    this.srcMode = true
    const h = this.HN(p)
    // An src block is always the children of the last heading
    // if it is not a root node
    this.lastSrc = h
    this.inc()
    if (Object.keys(this.headings).length === 0) {
      return this.roots.push(h)
    }
    return this.lastHeading?.children.push(h)
  }

  appendESrc(p: ParsingResult) {
    // you don't need another node
    if (this.srcMode) {
      this.inc()
      return (this.srcMode = false)
    }
    this.resetMode()
    return this.appendParagraph(p)
  }
  appendNSrc(p: ParsingResult) {
    if (this.srcMode && this.lastSrc) {
      this.inc()
      return this.lastSrc.tags.push(`name:${p.text}`)
    }
    this.resetMode()
    return this.appendParagraph(p)
  }
  appendParagraph(p: ParsingResult) {
    const h = this.HN(p)
    if (this.srcMode && this.lastSrc) {
      return this.lastSrc.children.push(h)
    }
    this.resetMode()
    this.inc()
    if (Object.entries(this.headings).length === 0) {
      return this.roots.push(h)
    }
    return this.lastHeading?.children.push(h)
  }

  mostRecentHeading(level: Int) {
    let result
    for (let i = 0, maxId = 0; i < level; i++) {
      if (this.headings[i]?.id > maxId) {
        maxId = this.headings[i].id
        result = this.headings[i]
      }
    }
    return result
  }
}
export default ParserState
