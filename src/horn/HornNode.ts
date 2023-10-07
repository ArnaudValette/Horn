import { OrgBracketElementsParser } from "./OrgBracketParser"

export class HornNode {
  children: Array<HornNode | Array2D<string>> = []
  id: number
  parent: HornNode | null = null
  level: number
  glitterNodes: GlitterNode[] = []
  tags: Tags = []
  nType: string
  textContent: string

  constructor(
    id: number,
    level: number,
    nType: string,
    textContent: string,
    parent?: HornNode | null
  ) {
    this.id = id
    this.level = level
    this.nType = nType
    this.textContent = textContent
    if (parent) {
      this.parent = parent
    }
  }
  processGlitterNodes() {
    //this.replaceTODO()
    //this.parseBracketNodes()
    //this.replaceTextFormat()
  }
  replaceTODO() {
  }
}

class PossibleToken {
  textContent: string
  type: number
  submitted: boolean = false
  constructor(type: number, firstCharacter?: string) {
    this.textContent = firstCharacter || ""
    this.type = type
  }
  append(char: string) {
    this.textContent = this.textContent.concat(char)
  }
  revoke() {
    return this.textContent
  }
  publish() {
    this.submitted = true
    return this.textContent
  }
}

// a glitterNode is a marker that keeps a text in memory and tracks a position where
// a more complete text has this special kind of token
// ex : hello, *this is bold text*
// "this is bold text", 7, bold
export class GlitterNode {
  text: string = ""
  position: number = 0
  gType: number
  constructor(text: string, position: number, type: number) {
    this.text = text
    this.position = position
    this.gType = type
  }
}

export class FootNode extends HornNode {
  //children: Array<HornNode> = []
  noteId: number = 0
  constructor(
    id: number,
    level: number,
    textContent: string,
    parent?: HornNode | null
  ) {
    super(id, 0, "footNote", textContent, null)
    this.noteId = level
  }
}
export class StructTemplateNode extends HornNode {
  children: Array<HornNode> = []
  StructureType: string = ""
  Info: string = ""
  constructor(
    id: number,
    level: number,
    nType: string,
    secondType: string,
    textContent: string,
    parent?: HornNode | null
  ) {
    super(id, level, nType, "", null)
    this.StructureType = secondType
    this.Info = textContent
  }
}

// Prototyping:
export class tableRootNode extends HornNode {
  children: Array<tableRowNode> = []
  constructor(id: number) {
    super(id, 0, "table-root", "", null)
  }
}

export class tableRowNode extends HornNode {
  children: Array<HornNode> = []
  constructor(id: number) {
    super(id, 0, "table-row", "", null)
  }
}
