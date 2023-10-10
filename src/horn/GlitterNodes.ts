/*
type orgBracketType =
    | "cookiePercent"
    | "cookieRatio"
    | "date"
    | "checkboxEmpty"
    | "image"
    | "link"
    | "footnote"

let flags = {
    "*": 0b100000,
    "/": 0b010000,
    _: 0b001000,
    "+": 0b000100,
    "~": 0b000010,
    "=": 0b000001,
}


 The type of a glitter node can be any of the flags or orgBracketType
   i.e. a number, or a string. Depending on this type parameter, the glitterNode
   should have specific parameters.
*/ 

export class GlitterNode {
  text: string = ""
  position: number = 0
  gType: number
  constructor(text: string, position: number, type: number) {
    this.text = text
    this.position = position
    this.gType = type
  }
}

//{ start: 9, end: 16, textContent: '[28%]', type: 'cookiePercent' }
export class CookiePercent extends GlitterNode{

}
