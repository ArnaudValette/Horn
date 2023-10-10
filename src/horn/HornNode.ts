export class HornNode {
  children: Array<HornNode> = []
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
    glitterNodes?: ParsedGlitter,
  ) {
    this.id = id
    this.level = level
    this.nType = nType
    this.textContent = textContent
    //@ts-ignore
    this.glitterNodes = this.processGlitterNodes(glitterNodes)
  }
  processGlitterNodes(gN: ParsedGlitter | undefined) {
    return gN
  }
  replaceTODO() {}
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
    glitterNodes?: ParsedGlitter,
  ) {
    super(id, 0, "footNote", textContent, glitterNodes, null)
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
    glitterNodes?: ParsedGlitter,
  ) {
    super(id, level, nType, "", glitterNodes, null)
    this.StructureType = secondType
    this.Info = textContent
  }
}

// Prototyping:
export class tableRootNode extends HornNode {
  children: Array<tableRowNode> = []
  constructor(id: number, glitterNodes?: ParsedGlitter) {
    super(id, 0, "table-root", "", glitterNodes, null)
  }
}

export class tableRowNode extends HornNode {
  children: Array<HornNode> = []
  constructor(id: number, glitterNodes?: ParsedGlitter) {
    super(id, 0, "table-row", "", glitterNodes, null)
  }
}
