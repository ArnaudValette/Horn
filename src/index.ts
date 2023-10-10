/*
   1 : translate org file into data structure
   2 : translate data structure into project
 */
import { FormatParser } from "./horn/FormatParser"
import { OrgBracketElementsParser } from "./horn/OrgBracketParser"
import Parser from "./parser/Parser"
import * as fs from "fs"

const a = performance.now()
let flags = {
  "*": 0b100000,
  "/": 0b010000,
  _: 0b001000,
  "+": 0b000100,
  "~": 0b000010,
  "=": 0b000001,
}

const formatParser = new FormatParser(flags)
const bracketParser = new OrgBracketElementsParser()
const x = new Parser(bracketParser, formatParser)

const data = fs.readFileSync("./data/org.org")
x.parseOrg(data)

x.state.roots.forEach((value: HornNode, index: number) => {
  recurseInNode(value, index)
})

function recurseInNode(x: HornNode, i?: number) {
  if (i) console.log(i)
  if (x.glitterNodes && x.glitterNodes.length > 0) {
    //console.log(x.textContent)
    //console.log(x.glitterNodes)
    x.glitterNodes.forEach((g) => console.log("formated: ", g.text))
  } else {
    console.log(x.nType, x.textContent)
  }
  if (x.children.length > 0) {
    x.children.forEach((y) => recurseInNode(y as HornNode))
  }
}

const b = performance.now()
console.log(`TIMING: ${b - a} ms`)
