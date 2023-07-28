class ParserState implements _ParserState {
  headings: Obj<HornNode>
  lists: Obj<HornNode>
  lastHeading: HornNode | null
  lastList: HornNode | null
  lastSrc: HornNode | null
  listMode: Boolean
  srcMode: Boolean
  constructor() {
    this.headings = {}
    this.lists = {}
    this.lastHeading = null
    this.lastList = null
    this.lastSrc = null
    this.listMode = false
    this.srcMode = false
  }

  resetMode() {
    this.srcMode = false
    this.listMode = false
  }
  appendHeading(h: HornNode) {
    this.resetMode()
    this.headings[h.level] = h
    this.lastHeading = h
  }
  appendList(h: HornNode) {
    this.listMode = true
    this.lists[h.level] = h
    this.lastList = h
  }
  appendSrc(h: HornNode) {
    this.srcMode = true
    this.lastSrc = h
  }
}
