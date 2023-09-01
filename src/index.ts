/*
   1 : translate org file into data structure
   2 : translate data structure into project
 */
import Parser from "./parser/Parser"
import * as fs from "fs"

const x = new Parser()

fs.readFile("./data/example.org", (err, data) => {
  if (err) {
    return console.log(err)
  }
  x.parseOrg(data)
  console.log(x.state.lists)
})
