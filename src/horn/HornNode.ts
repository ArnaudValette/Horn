export class HornNode {
  children: HornNode[] = []
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
}
