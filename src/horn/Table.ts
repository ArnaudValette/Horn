class Table {
  data: Array2D<string>
  width: Int

  constructor() {
    this.data = []
    this.width = 0
  }

  copyData() {
    return [...this.data]
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
