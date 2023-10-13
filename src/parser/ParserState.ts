import Table from "../horn/Table"
import { FootNode, HornNode, StructTemplateNode } from "../horn/HornNode"
import {
  Int,
  Obj,
  ParsedGlitter,
  ParsingResult,
  _ParserState,
} from "../types/types"

// TODO: it should be more logical, more focused, so that we can
// perform the operation of passing the glitterNodes to ANY node easily
class ParserState implements _ParserState {
  roots: Array<HornNode>
  headings: Obj<HornNode>
  lists: Obj<HornNode>
  lastHeading: HornNode | null
  lastList: HornNode | null
  lastSrc: HornNode | null
  table: Table
  tableMode: Boolean
  listMode: Boolean
  srcMode: string | null
  count: Int = 0
  footNoteMode: string | null = null
  footNotes: Array<HornNode> = []
  footNoteId: number | null = null
  footNoteGlitter: ParsedGlitter = []
  minLevel: number

  constructor() {
    this.roots = []
    this.headings = {}
    this.lists = {}
    this.lastHeading = null
    this.lastList = null
    this.lastSrc = null
    this.tableMode = false
    this.listMode = false
    this.table = new Table()
    this.srcMode = null
    this.minLevel = 9999999
  }

  resetAllState() {
    this.roots = []
    this.keepOnlyRoots()
  }
  keepOnlyRoots() {
    this.headings = {}
    this.lists = {}
    this.lastHeading = null
    this.lastList = null
    this.lastSrc = null
    this.tableMode = false
    this.listMode = false
    this.table = new Table()
    this.srcMode = null
    this.minLevel = 9999999
  }
  transferFootNotes() {
    /* This is not really what you may want
       every lesser element [fn:1] refers to
       the greater element ^/[fn:1] <text>/

       the orgFootnote lesser element has a noteId property,
       the FootNode greater element has a noteId property,

       An high level library that would like to create an html export
       could create an <a href=`#fn:${noteId}`/> tag for the lesser elements
       and later <div id=`#fn:${noteId}` /> tag for the greater element.
    */
    this.roots.push(...this.footNotes)
  }

  inc() {
    this.count += 1
  }

  templateModeToggle(type: string) {
    this.resetMode()
    this.srcMode = type
  }
  tableModeToggle() {
    this.srcMode = null
    this.footNoteMode = null
    this.listMode = false
    this.tableMode = true
  }

  resetMode() {
    if (this.footNoteMode) {
      const f = this.FN()
      this.footNotes.push(f)
    }
    if (this.tableMode) {
      if (Object.entries(this.headings).length > 0) {
        this.lastHeading?.children.push(this.table.copyData(this))
      } else {
        this.roots.push(this.table.copyData(this))
      }
      this.table = new Table()
    }
    this.footNoteMode = null
    this.footNoteGlitter = []
    this.srcMode = null
    this.listMode = false
    this.tableMode = false
  }

  #trivialAppend(h: HornNode, p: ParsingResult) {
    if (this.tableMode) {
      return this.resetMode()
    }
    if (this.srcMode) {
      return this.appendParagraph(p)
    }
    this.inc()
    if (Object.entries(this.headings).length !== 0) {
      //@ts-ignore
      this.lastHeading.children.push(h)
    } else {
      this.roots.push(h)
    }
  }
  FN() {
    //
    return new FootNode(
      this.count,
      this.footNoteId || 0,
      this.footNoteMode || "",
      this.footNoteGlitter
    )
  }
  HN(p: ParsingResult) {
    return new HornNode(
      this.count,
      p.level,
      p.type as string,
      p.text,
      p.glitterNodes
    )
  }
  ST(p: ParsingResult) {
    const text2arr = p.text.split(" ")
    const secondType = text2arr[0]
    const textContent = text2arr[1] || " "
    return new StructTemplateNode(
      this.count,
      p.level,
      p.type as string,
      secondType,
      textContent
    )
  }

  FNModeToggle(p: ParsingResult, id: number) {
    this.resetMode()
    this.footNoteMode = p.text
    this.footNoteGlitter = p.glitterNodes || []
    this.footNoteId = id
  }
  FNAppendText(p: ParsingResult) {
    if (this.footNoteMode) {
      this.footNoteMode = this.footNoteMode.concat(p.text)
      if (p.glitterNodes) {
        this.footNoteGlitter.push(...p.glitterNodes)
      }
    }
  }
  //It's not really appending, but rather entering a special mode of operation
  appendFootNote(p: ParsingResult) {
    if (this.srcMode) {
      return this.appendParagraph(p)
    }
    this.FNModeToggle(p, p.level)
  }
  appendOrgCode(p: ParsingResult) {
    const h = this.HN(p)
    this.#trivialAppend(h, p)
  }
  appendHR(p: ParsingResult) {
    const h = this.HN(p)
    this.#trivialAppend(h, p)
  }
  appendEmpty(p: ParsingResult) {
    const h = this.HN({ ...p, text: "", glitterNodes: [] })
    if (this.footNoteMode) {
      const f = this.FN()
      this.footNotes.push(f)
      return (this.footNoteMode = null)
    }
    this.#trivialAppend(h, p)
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

    if (p.level <= this.minLevel) {
      this.minLevel = p.level
      this.roots.push(h)
    } else if (this.lastHeading && this.lastHeading.level < p.level) {
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
    this.resetMode()
    this.listMode = true
    this.inc()
  }
  appendNList(p: ParsingResult) {
    /*
       a numbered list works exactly like a common list, I think...
     */
  }

  appendTemplate(p: ParsingResult) {
    if (this.srcMode) {
      // obviously
      return this.appendParagraph(p)
    }
    this.resetMode()
    const h = this.ST(p)
    this.srcMode = h.StructureType
    this.lastSrc = h
    this.inc()
    if (Object.keys(this.headings).length === 0) {
      return this.roots.push(h)
    }
    return this.lastHeading?.children.push(h)
  }

  appendTemplateEnd(p: ParsingResult) {
    const h = this.ST(p)
    if (this.srcMode && this.srcMode === h.StructureType) {
      this.inc()
      return this.resetMode()
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
    if (this.footNoteMode) {
      return this.FNAppendText(p)
    }
    this.resetMode()
    this.inc()
    if (Object.entries(this.headings).length === 0) {
      return this.roots.push(h)
    }
    return this.lastHeading?.children.push(h)
  }

  appendTableSep(p: ParsingResult) {
    this.tableModeToggle()
    this.table.publishRow(p, 0, this)
  }

  appendTable(p: ParsingResult) {
    if (this.tableMode) {
      this.table.publishRow(p, 2, this)
    } else {
      this.tableModeToggle()
      this.table.publishRow(p, 1, this)
    }
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
