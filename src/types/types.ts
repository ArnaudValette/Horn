export type Int = number
export type Key = string | number | symbol
export type Obj<T> = Record<Key, T>
export type Tag = string
export type TableRowType = "row" | "first-row" | "ruler"
export type Tags = Array<Tag>
export type Array2D<T> = Array<Array<T>>
export type R = RegExpExecArray | null
export type Rr = RegExpExecArray
export type Regs = { [k in HornType]: RegExp }
export type ParsingResult = {
  level: number
  text: string
  type: HornType
  glitterNodes?: ParsedGlitter
}
export type NextMethod = () => ParsingResult | NextMethod

export type ParserOptions = {
  withLesserElements: boolean
}
export type FunctionDispatcher = Obj<(p: ParsingResult) => void>
export type HornType =
  | "clock"
  | "heading"
  | "list"
  | "nList"
  | "sTemplate"
  | "sTemplateEnd"
  | "nSrc"
  | "table"
  | "tableSep"
  | "empty"
  | "HR"
  | "orgCode"
  | "footNote"
  | "paragraph"
export type GlitterType = string
export type Flag = number
export type FlagsType = { [key: string]: Flag }
export type Marker = {
  type: Flag
  start: number
  first?: boolean
  adjective?: Flag
  end?: number
}
export type MarkerWithTextContent = Marker & { text: string }
export type MarkerWithTextContentAndEnd = Marker & { text: string; end: number }
export type TreeParserNodes = Array<TreeParserNode>
export type TextDelimitations = Array<Array<number>>

export type Markers = { [key: number]: Marker }

export type PreGlitter = TreeParserNode | MarkerWithTextContentAndEnd
export type ParsedGlitter = Array<PreGlitter>

export enum rowTypeEnum {
  isRuler = 0,
  isRow,
  isFirstRow,
}

interface GlitterNode {
  start: number
  end: number
  text: string
  type: string | number
}
// type GlitterNode = GenericNode & {
//   href: string
//   src: string
//   start: Int
//   end: Int
// }
//
export interface HornNode {
  children: Array<HornNode>
  id: Int
  level: Int
  glitterNodes: GlitterNode[]
  tags: Tags
  nType: string
  textContent: string
}

export type Roots = Array<HornNode>

export interface _ParserState {
  headings: Object
  lists: Object
  listMode: Boolean
  srcMode: string | null
  count: Int
}

export type orgBracketType =
  | "cookiePercent"
  | "cookieRatio"
  | "date"
  | "checkboxEmpty"
  | "checkboxCheck"
  | "image"
  | "link"
  | "footnote"

export interface orgBracketNode {
  done: boolean
  type: orgBracketType
}
export interface Forest {
  [key: string]: Forest | string | orgBracketNode
}

export type tKeys = Array<keyof Forest>
export type CommandMap = { [key: string]: Function }
export type parserCheck = (char: string) => boolean
export type parserCommand = [string, parserCheck, boolean]
export type CommandMapArray = Array<parserCommand>
export type TreeChar = string
export type TreeChars = Array<TreeChar>

export type TreeParserNode = {
  start: number
  end: number
  text: string
  type: orgBracketType
}
