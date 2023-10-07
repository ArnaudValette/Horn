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
  ["Capital", (char: string) => /[A-Z]/.test(char), true],
  ["low", (char: string) => /[a-z]/.test(char), true],
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

class TreeBasedParser {
  forest: Forest
  path: tKeys
  next: tKeys
  mem: string
  matched: Boolean
  toggle: Boolean
  toggleChar: string

  constructor(validTrees: Forest, wakeUpChar: string) {
    this.toggleChar = wakeUpChar
    this.forest = validTrees
    this.next = Object.keys(validTrees)
    this.path = []
    this.mem = ""
    this.toggle = false
    this.matched = false
  }

  parseChar(
    cond: boolean,
    children: tKeys,
    char: string,
    target: string,
    isRedundant?: boolean
  ) {
    if (cond) {
      this.next = [...children]
      this.push(target, isRedundant)
      this.matched = true
      this.mem = this.mem.concat(char)
      return true
    }
    return false
  }

  forestDive(i: number): Forest {
    const a = this.path
    const o = this.forest
    //@ts-ignore
    return a[i + 1] && o[a[i]][a[i + 1]] ? this.forestDive(i + 1) : o[a[i]]
  }

  push(target: string, isRedundant?: boolean) {
    if (isRedundant) {
      const last = this.path[this.path.length - 1]
      if (!last || last !== target) {
        this.path.push(target)
      }
    } else {
      this.path.push(target)
    }
  }
}

class OrgBracketElementsParser extends TreeBasedParser {
  commandMap: CommandMap = {}
  constructor() {
    super(orgForest, orgWakeUpChar)
    orgCommandMap.forEach((c: parserCommand) =>
      this.registerCommandMap(c[0], c[1], c[2])
    )
    orgTreeChars.forEach((c: TreeChar) => this.registerCharCommands(c))
  }
  registerCharCommands(name: TreeChar) {
    this.commandMap[name] = (char: string, children: tKeys) =>
      this.parseChar(char === name, children, char, char, false)
  }
  registerCommandMap(name: string, cond: Function, isRedundant: boolean) {
    this.commandMap[name] = (char: string, children: tKeys) =>
      this.parseChar(cond(char), children, char, name, isRedundant)
  }
}
