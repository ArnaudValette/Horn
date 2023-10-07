interface Forest {
  [key: string]: Forest | string
}

type tKeys = Array<keyof Forest>
type CommandMap = { [key: string]: Function }
type parserCheck = (char: string) => boolean
type parserCommand = [string, parserCheck, boolean]
type CommandMapArray = Array<parserCommand>
type TreeChar = string
type TreeChars = Array<TreeChar>

const orgCommandMap: CommandMapArray = [
  ["digit", (char: string) => /[0-9]/.test(char), true],
  ["Capital", (char: string) => /[A-Z]/.test(char), false],
  ["low", (char: string) => /[a-z]/.test(char), false],
  ["any", (char: string) => /[^\s\[\]]/.test(char), true],
  ["ANY", (char: string) => /[^\[\]]/.test(char), true],
]

const orgTreeChars: TreeChars = ["f", "n", "%", "/", "-", "]", "[", ":", " "]

const orgForest: Forest = {
  digit: {
    "%": { "]": "over" },
    "/": { digit: { "]": "over" } },
    "-": {
      digit: {
        "-": {
          digit: { " ": { Capital: { low: { low: { "]": "over" } } } } },
        },
      },
    },
  },
  " ": { "]": "over" },
  "[": {
    any: { "]": { "]": "over", "[": { ANY: { "]": { "]": "over" } } } } },
  },
  f: { n: { ":": { any: { "]": "over" } } } },
}

const orgWakeUpChar = "["
const orgSleepToken = "over"

class TreeBasedParser {
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

class OrgBracketElementsParser extends TreeBasedParser {
  commandMap: CommandMap = {}
  constructor() {
    super(orgForest, orgWakeUpChar, orgSleepToken)
    orgCommandMap.forEach((c: parserCommand) =>
      this.registerCommandMap(c[0], c[1], c[2])
    )
    orgTreeChars.forEach((c: TreeChar) => this.registerCharCommands(c))
  }

  registerCharCommands(name: TreeChar) {
    this.commandMap[name] = (char: string, children: tKeys) =>
      this.parseChar((x, y) => x === y, children, char, name, false)
  }

  registerCommandMap(name: string, cond: Function, isRedundant: boolean) {
    this.commandMap[name] = (char: string, children: tKeys) =>
      this.parseChar((x, y) => cond(x), children, char, name, isRedundant)
  }

  parse(line: string) {
    for (let i = 0, j = line.length; i < j; i++) {
      const char = line[i]
      if (this.shouldNotToggle(char)) {
        this.handleOver(char)
        this.matched = false
        if (this.toggle) {
          const [curr, prev] = this.getLastNodes()
          for (let x = 0, y = this.next.length; x < y && !this.matched; x++) {
            const k = this.next[x]
            const b = Object.keys(curr[k] || prev[k])
            const fn = this.commandMap[k]
            this.matched = fn(char, b)
          }
          if (!this.matched) {
            this.resetState()
          }
        }
      }
    }
  }
}

const txt =
  "there are dates [2023-10-03 Tue], false [ brackets and [ also ] sometimes [[file:/file][nameFile]] some [[~/img.png]] [fn:3] ]] ]] [ ] (checkbox) and : [fnde] [232545857685-222222-444565 Mon] [0%] [100%] [0/] [0/2]"

const orgparser = new OrgBracketElementsParser()
orgparser.parse(txt)
