import ParserState from "../parser/ParserState"
import { HornNode, tableRootNode, tableRowNode } from "./HornNode"

class Table {
  data: Array2D<string>
  width: Int

  constructor() {
    this.data = []
    this.width = 0
  }

  copyData(state: ParserState) {
    /* Maybe we should return HornNodes
       with the idea, like lists, that data will be processed further more
       to fit html type of syntax (org is line by line, html is truly "nodal" or
       "nodular")
       we could say : here is a rootTableHornNode, with children being an
       array of tableRowHornNodes, with children of tableRowHornNodes being
       actual tableCellHornNodes
     */
    const root = new tableRootNode(state.count)
    state.inc()
    // rebuilding stuff, note that in the future, this should be done
    // directly while "appending" data
    for (let i = 0, end1 = this.data.length; i < end1; i++) {
      root.children.push(new tableRowNode(state.count))
      state.inc()
      for (let j = 0, end2 = this.data[i].length; j < end2; j++) {
        root.children[i].children.push(
          new HornNode(state.count, 0, "tableCell", this.data[i][j]),
        )
        state.inc()
      }
    }
    //return [...this.data]
    return root
  }
  publishRow(s: string, t: TableRowType) {
    // we do not treat |----+----+---| for now
    /* we use strings as a way to type stuff
       should convert it to enum later
    */
    if (t.includes("row")) {
      const array: Array<string> = s
        .replace(/\|/g, " ")
        .replace(/\s+/g, " ")
        .replace(/(^\s)|(\s$)/g, "")
        .split(" ")
      if (t.includes("first")) {
        this.width = array.length
        this.data.push(array)
      } else {
        const res: Array<string> = []
        for (let i = 0, j = this.width; i < j; i++) {
          if (array[i]) {
            res.push(array[i])
          } else {
            res.push("")
          }
        }
        this.data.push(res)
      }
    }
  }
}

export default Table
