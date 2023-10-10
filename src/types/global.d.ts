/*
   HORN

   type annotations

*/
type Int = number
type Key = string | number | symbol
type Obj<T> = Record<Key, T>
type Tag = string
type TableRowType = "row" | "first-row" | "ruler"
type Tags = Array<Tag>
type Array2D<T> = Array<Array<T>>
type R = RegExpExecArray | null
type Rr = RegExpExecArray
type Regs = { [k in HornType]: RegExp }
type ParsingResult = {
  level: number
  text: string
  type: HornType
  glitterNodes?: ParsedGlitter
}
type NextMethod = () => ParsingResult | NextMethod

type FunctionDispatcher = Obj<(p: ParsingResult) => void>
type HornType =
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
type GlitterType = string
type Flag = number
type FlagsType = { [key: string]: Flag }
type Marker = {
  type: Flag
  start: number
  first?: boolean
  adjective?: Flag
  end?: number
}
type MarkerWithTextContent = Marker & { text: string }
type MarkerWithTextContentAndEnd = Marker & { text: string; end: number }
type TreeParserNodes = Array<TreeParserNode>
type TextDelimitations = Array<Array<number>>

type Markers = { [key: number]: Marker }

type PreGlitter = TreeParserNode | MarkerWithTextContentAndEnd
type ParsedGlitter = Array<PreGlitter>

type GenericNode = {
  nType: HornType
  textContent: string
}

enum rowTypeEnum {
  isRuler = 0,
  isRow,
  isFirstRow,
}

// type GlitterNode = GenericNode & {
//   href: string
//   src: string
//   start: Int
//   end: Int
// }
//
interface HornNode extends GenericNode {
  children: Array<HornNode>
  id: Int
  level: Int
  glitterNodes: GlitterNode[]
  tags: Tags
  nType: string
  textContent: string
}

type Roots = Array<HornNode>

interface _ParserState {
  headings: Object
  lists: Object
  listMode: Boolean
  srcMode: string | null
  count: Int
}

type orgBracketType =
  | "cookiePercent"
  | "cookieRatio"
  | "date"
  | "checkboxEmpty"
  | "checkboxCheck"
  | "image"
  | "link"
  | "footnote"

interface orgBracketNode {
  done: boolean
  type: orgBracketType
}
interface Forest {
  [key: string]: Forest | string | orgBracketNode
}

type tKeys = Array<keyof Forest>
type CommandMap = { [key: string]: Function }
type parserCheck = (char: string) => boolean
type parserCommand = [string, parserCheck, boolean]
type CommandMapArray = Array<parserCommand>
type TreeChar = string
type TreeChars = Array<TreeChar>

type TreeParserNode = {
  start: number
  end: number
  text: string
  type: orgBracketType
}
