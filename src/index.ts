/*
   1 : translate org file into data structure
   2 : translate data structure into project
 */
import { HornNode } from "./horn/HornNode"
import { OrgBracketElementsParser } from "./horn/OrgBracketParser"
import Parser from "./parser/Parser"
import * as fs from "fs"

let flags = {
    "*": 0b100000,
    "/": 0b010000,
    _: 0b001000,
    "+": 0b000100,
    "~": 0b000010,
    "=": 0b000001,
}

const formatParser=new FormatParser(flags)
const bracketParser = new OrgBracketElementsParser()
const x = new Parser(bracketParser, formatParser)

fs.readFile("./data/example.org", (err, data) => {
  if (err) {
    return console.log(err)
  }
  x.parseOrg(data)
  ;(x.state.roots as Array<HornNode>)[0].processGlitterNodes()
  //console.log(x.state)
  //@ts-ignore
  //console.log(x.state.lastHeading.children[3].children[0].children)
})
