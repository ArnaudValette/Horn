/*
type orgBracketType =
    | "cookiePercent"
    | "cookieRatio"
    | "date"
    | "checkboxEmpty"
    | "checkboxCheck"
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
  start: number
  end: number
  text: string
  type: string | number
  constructor(start: number, end: number, text: string, type: string | number) {
    this.start = start
    this.end = end
    this.text = text
    this.type = type
  }
}

//{ start: 9, end: 16, text: '[28%]', type: 'cookiePercent' }
export class orgCookiePercent extends GlitterNode {}
export class orgCookieRatio extends GlitterNode {}
export class orgDate extends GlitterNode {}
export class orgCheckBoxEmpty extends GlitterNode {}
export class orgImage extends GlitterNode {}
export class orgLink extends GlitterNode {}
export class orgFootnote extends GlitterNode {}

//{start:0, end:15, adjective:0, type:0, text:"dddd"}
export class Format extends GlitterNode {}
