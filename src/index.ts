/*
   1 : translate org file into data structure
   2 : translate data structure into project
 */
import { FormatParser } from "./horn/FormatParser"
import {
  Format,
  orgCookiePercent,
  orgDate,
  orgFootnote,
  orgImage,
  orgLink,
} from "./horn/GlitterNodes"
import { OrgBracketElementsParser } from "./horn/OrgBracketParser"
import Parser from "./parser/Parser"
import * as fs from "fs"

const a = performance.now()

// const formatParser = new FormatParser()
// const bracketParser = new OrgBracketElementsParser()
//const x = new Parser(bracketParser, formatParser)
const x = new Parser()

const data = fs.readFileSync("./data/example.org")
x.parseOrg(data)

// x.state.roots.forEach((value: HornNode, index: number) => {
//   recurseInNode(value, index)
// })
//
function recurseInNode(x: HornNode, i?: number) {
  if (x.glitterNodes && x.glitterNodes.length > 0) {
    x.glitterNodes.forEach((g) => {})
    //console.log(g)
    //console.log(g.text)
  } else {
  }
  if (x.children.length > 0) {
    x.children.forEach((y) => recurseInNode(y as HornNode))
  }
}

console.dir(x.state.roots, { depth: null })
const b = performance.now()
console.log(`TIMING: ${b - a} ms`)
