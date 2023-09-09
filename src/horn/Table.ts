import ParserState from "../parser/ParserState"
import { HornNode, tableRootNode, tableRowNode } from "./HornNode"

class Table {
  data: Array<tableRowNode>
  width: Int

  constructor() {
    this.data = []
    this.width = 0
  }

  copyData(state: ParserState) {
    const root = new tableRootNode(state.count)
    state.inc()
    root.children = this.data
    return root
  }

  publishRow(s: string, rowType:rowTypeEnum , state:ParserState) {
    // we do not treat |----+----+---| for now
    if (rowType !== 0) {
      const array: Array<string> = s
        .replace(/\|/g, " ")
        .replace(/\s+/g, " ")
        .replace(/(^\s)|(\s$)/g, "")
        .split(" ")
      const res = new tableRowNode(state.count)
      state.inc()
      for (let i = 0, j = array.length; i < j; i++) {
          if (array[i]) {
          res.children.push(new HornNode(state.count, 0, "tableCell", array[i]))
          } else {
          res.children.push(new HornNode(state.count, 0, "tableCell", ""))
          }
        state.inc()
      }
      this.data.push(res)
    }
  }
}

export default Table
