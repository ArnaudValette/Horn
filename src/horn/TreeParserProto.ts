export class TreeParserProto {
  forest: Forest
  path: tKeys
  next: tKeys
  mem: string
  matched: Boolean
  toggle: Boolean
  toggleChar: string
  disableChar: string

  constructor(parserValidTrees: Forest, wakeUpChar: string, sleepChar: string) {
    this.toggleChar = wakeUpChar
    this.disableChar = sleepChar
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
  handleOver(char: string) {
    if (this.toggle && this.path.length > 0) {
      const depths = this.forestDive(this.forest, this.path, 0) as Forest
      if (depths[char] === this.disableChar) {
        console.log(this.mem)
        this.resetState()
      }
    }
  }

  getLastNodes(): [Forest, Forest] {
    const [l, o, a] = [this.path.length, this.forest, this.path]
    const curr = l > 0 ? this.forestDive(o, a, 0) : o
    const prev = l > 1 ? this.forestDive(o, a.slice(0, a.length - 1), 0) : o
    return [curr as Forest, prev as Forest]
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
  shouldNotToggle(char: string) {
    const should = this.shouldToggle(char)
    if (should) {
      this.toggle = true
      return false
    }
    return true
  }
}
