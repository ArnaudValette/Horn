export class TreeParserProto {
  forest: Forest
  path: tKeys
  next: tKeys
  mem: string
  matched: Boolean
  toggle: Boolean
  toggleChar: string
  start: number = 0
  end: number = 0
  nodeMap: TreeParserNodes = []
  textDelimitations: TextDelimitations = []

  constructor(parserValidTrees: Forest, wakeUpChar: string) {
    this.toggleChar = wakeUpChar
    this.forest = parserValidTrees
    this.next = Object.keys(parserValidTrees)
    this.path = []
    this.mem = ""
    this.toggle = false
    this.matched = false
  }

  parseChar(
    cond: (char: string, name?: string) => boolean,
    children: tKeys,
    char: string,
    target: string,
    isRedundant?: boolean
  ) {
    if (cond(char, target)) {
      this.next = [...children]
      this.push(target, isRedundant)
      this.matched = true
      this.mem = this.mem.concat(char)
      return true
    }
    return false
  }

  forestDive(o: Forest, a: tKeys, i: number): Forest | Function {
    //@ts-ignore
    return a[i + 1] && o[a[i]][a[i + 1]]
      ? this.forestDive(o[a[i]] as Forest, a, i + 1)
      : o[a[i]]
  }

  push(target: string, isRedundant?: boolean) {
    if (isRedundant) {
      const last = this.path[this.path.length - 1]
      if (!last || last !== target) {
        this.path.push(target)
      }
      this.next.push(target)
    } else {
      this.path.push(target)
    }
  }
  handleOver(char: string, i: number) {
    if (this.toggle && this.path.length > 0) {
      const depths = this.forestDive(this.forest, this.path, 0) as Forest
      if (depths[char] && (depths[char] as orgBracketNode).done) {
        //console.log(this.mem)
        this.handleNode(i, (depths[char] as orgBracketNode).type)
        this.resetState()
      }
    }
  }

  handleNode(i: number, type: orgBracketType) {
    this.end = i
    const node = {
      start: this.start,
      end: this.end + 1,
      textContent: "[" + this.mem + "]",
      type,
    }
    this.nodeMap.push(node)
  }

  delimitText(len:number) {
    const nodeLimitations = this.nodeMap.map((e: TreeParserNode) => [
      e.start,
      e.end,
    ])
    if (!nodeLimitations || nodeLimitations.length === 0) return this.textDelimitations.push([0, len])
    if (nodeLimitations[0][0] !== 0) {
      this.textDelimitations.push([0, nodeLimitations[0][0]])
    }
    for (let i = 0, j = nodeLimitations.length; i < j; i++) {
      if(!nodeLimitations[i+1] && nodeLimitations[i][1] < len){
        this.textDelimitations.push([nodeLimitations[i][1], len])
      }
      else if (nodeLimitations[i+1] && nodeLimitations[i][1] < nodeLimitations[i + 1][0] - 1) {
        this.textDelimitations.push([
          nodeLimitations[i][1],
          nodeLimitations[i + 1][0],
        ])
      }
    }
  }

  getLastNodes(): [Forest, Forest] {
    const [l, o, a] = [this.path.length, this.forest, this.path]
    const curr = l > 0 ? this.forestDive(o, a, 0) : o
    const prev = l > 1 ? this.forestDive(o, a.slice(0, a.length - 1), 0) : o
    return [curr as Forest, prev as Forest]
  }

  resetAll() {
    this.resetState()
    this.matched = false
    this.start = 0
    this.end = 0
    this.nodeMap = []
    this.textDelimitations = []
  }
  resetState() {
    this.path = []
    this.next = Object.keys(this.forest)
    this.toggle = false
    this.mem = ""
  }

  shouldToggle(char: string) {
    return char === this.toggleChar && !this.toggle
  }
  shouldNotToggle(char: string, i: number) {
    const should = this.shouldToggle(char)
    if (should) {
      this.start = i
      this.toggle = true
      return false
    }
    return true
  }
}
