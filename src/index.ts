/*
   1 : translate org file into data structure
   2 : translate data structure into project
 */
import { HornNode } from "./horn/HornNode"
import Parser from "./parser/Parser"
import * as fs from "fs"

const x = new Parser()

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
