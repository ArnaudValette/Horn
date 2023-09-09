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
    parent?: HornNode | null,
  ) {
    this.id = id
    this.level = level
    this.nType = nType
    this.textContent = textContent
    if (parent) {
      this.parent = parent
    }
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
