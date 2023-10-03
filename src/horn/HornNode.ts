import { X509Certificate } from "crypto"

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
  /* should remove from the textContent the found token, and store in the glitterNodes array the
    associated object
    the problem in a regex based way of processing the textContent
    is that we will perform a lot of passes.
    a way to fix this would be to write a parser
    based on the interpretation of symbols
    there are different kinds of tokens :
    [] based ones, format tokens, and TODO/DONE
    This has to be optimized in the near future
    I think a good solution would be to treat at least simple
    problems such as textFormatting options
    as a pair matching operation
    */
  processGlitterNodes() {
    this.replaceFiles()
    this.replaceLinks()
    this.replaceImages()
    this.replaceTimeStamps()
    this.replaceCookie()
    this.replaceFN()
    this.replaceCheckboxes()
    this.replaceTODO()
    this.replaceTextFormat()
    // this.replaceBold()
    // this.replaceItalic()
    // this.replaceUnderline()
    // this.replaceStrike()
    // this.replaceCode()
    // this.replaceVerbatim()
  }
  // TODO:
  replaceFiles() {}
  replaceLinks() {}
  replaceImages() {}
  replaceTimeStamps() {}
  replaceCookie() {}
  replaceFN() {}
  replaceCheckboxes() {}
  replaceTODO() {}

  replaceTextFormat() {
    let flags = {
      "*": 0b100000,
      "/": 0b010000,
      _: 0b001000,
      "+": 0b000100,
      "~": 0b000010,
      "=": 0b000001,
    }
    let state = { type: 0b000000, matching: 0, content: "", prev: 0 }
    for (let i = 0, j = this.textContent.length; i < j; i++) {
      // process text character per character
      const char = this.textContent[i]
      let currentType = flags[char as keyof typeof flags] || 0
      console.log(currentType)
    }
  }
}

// a glitterNode is a marker that keeps a text in memory and tracks a position where
// a more complete text has this special kind of token
// ex : hello, *this is bold text*
// "this is bold text", 7, bold
export class GlitterNode {
  text: string = ""
  position: number = 0
  gType: string = "unknow"
  constructor(text: string, position: number, type: string) {
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
