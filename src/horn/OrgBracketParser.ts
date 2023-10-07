import { TreeParserProto } from "./TreeParserProto"

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

class OrgBracketElementsParser extends TreeParserProto {
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
