/*
   A tree-based parser for org mode that allows for character by character parsing.
   This is used to collect :

  - [X] checkboxes in lists
  - [-] timestamps 
    - [ ] active : <2023-10-03 Tue>
    - [X] inactive : [2023-10-03 Tue] 
  - [X] statistic cookie [100%] [2/2]
    - [X] On lists
    - [X] on headings with TODO
  - [X] links 
    - [X] [[file:~/.emacs.d/init.el][init.el]]
    - [X] [[http://www.google.fr][google]]
  - [X] images
    - [X] local [[./img/a.jpg]]
    - [X] remote [[https://www.example.com]]
  - [X] footnotes : [fn:1] 

   It is implemented according to these considerations:
   Everytime a character "[" is recognized for the first time, we enter parsing mode.
   We parse according to a tree of possibilities:
   e.g. if after the first [, our next character is <space>, then we now that the only possibility
   to form a correct org mode element is to conclude with ] (=> [ ] , a checkbox).
   e.g. if after the first [ the next character is a digit, we now that the next character should be:
   another digit, or %, or /, or - (=> [12 , [1% , [1/ , [1- , a date, a stat cookie, a stat cookie, a date, respectively)

   any character we encounter that doesn't allow us to pursue our route in the tree reset the state of the parser.
   i.e. after [2023- you cannot have a character "b", so we consider [2023-b verbatim, as a text element of the document.

   A test should be made to understand if this is less preferable than a regex based parser, performance wise.

 */
import {
  orgCommandMap,
  orgForest,
  orgSleepToken,
  orgTreeChars,
  orgWakeUpChar,
} from "./OrgParserData"
import { TreeParserProto } from "./TreeParserProto"

export class OrgBracketElementsParser extends TreeParserProto {
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
      this.parseChar((x, y) => x === y, children, char, name, false)
  }

  registerCommandMap(name: string, cond: Function, isRedundant: boolean) {
    this.commandMap[name] = (char: string, children: tKeys) =>
      this.parseChar((x, y) => cond(x), children, char, name, isRedundant)
  }

  parse(line: string): [TreeParserNodes, TextDelimitations] {
    this.resetAll()
    for (let i = 0, j = line.length; i < j; i++) {
      const char = line[i]
      if (this.shouldNotToggle(char, i)) {
        this.handleOver(char, i)
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
    this.delimitText(line.length)
    return [this.nodeMap, this.textDelimitations]
  }
}

// const txt =
//   "there are dates [2023-10-03 Tue], false [ brackets and [ also ] sometimes [[file:/file][nameFile]] some [[~/img.png]] [fn:3] ]] ]] [ ] (checkbox) and : [fnde] [232545857685-222222-444565 Mon] [0%] [100%] [0/] [0/2]"
//
// const orgparser = new OrgBracketElementsParser()
// orgparser.parse(txt)
// const b = performance.now()
// //console.log(orgparser.nodeMap)
// //You can call another parser e.g. FormatParser on the textDelimitations
// orgparser.textDelimitations.forEach((lim) =>
//   console.log(txt.substring(lim[0], lim[1]))
// )
// console.log(`${b - a} milliseconds`)
