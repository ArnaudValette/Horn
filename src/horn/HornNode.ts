import { GlitterNode, NodesToGN } from "./GlitterNodes"

export class HornNode {
  children: Array<HornNode> = []
  id: number
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
    glitterNodes?: ParsedGlitter
  ) {
    this.id = id
    this.level = level
    this.nType = nType
    this.textContent = textContent
    this.glitterNodes = this.processGlitterNodes(glitterNodes)
  }
  processGlitterNodes(gN: ParsedGlitter | undefined): GlitterNode[] {
    if (!gN) return []
    return NodesToGN(gN)
  }
  replaceTODO() {}
}

export class FootNode extends HornNode {
  //children: Array<HornNode> = []
  noteId: number = 0
  constructor(
    id: number,
    level: number,
    textContent: string,
    glitterNodes?: ParsedGlitter
  ) {
    super(id, 0, "footNote", textContent, glitterNodes)
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
    glitterNodes?: ParsedGlitter
  ) {
    super(id, level, nType, "", glitterNodes)
    this.StructureType = secondType
    this.Info = textContent
  }
}

// Prototyping:
export class tableRootNode extends HornNode {
  children: Array<tableRowNode> = []
  constructor(id: number, glitterNodes?: ParsedGlitter) {
    super(id, 0, "table-root", "", glitterNodes)
  }
}

export class tableRowNode extends HornNode {
  children: Array<HornNode> = []
  constructor(id: number, glitterNodes?: ParsedGlitter) {
    super(id, 0, "table-row", "", glitterNodes)
  }
}
