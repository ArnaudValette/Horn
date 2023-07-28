/*
   HORN

   type annotations

*/
type Int = number
type Key = string | number | symbol
type Obj<T> = Record<Key, T>
type Tag = string
type Tags = Array<Tag>

type HornType = string
type GlitterType = string

type GenericNode = {
  nType: HornType
  textContent: string
}

type GlitterNode = GenericNode & {
  href: string
  src: string
  start: Int
  end: Int
}
type HornNode = GenericNode & {
  children: Array<HornNode>
  id: Int
  parent: HornNode
  level: Int
  glitterNodes: Array<GlitterNode>
  tags: Tags
}

type Roots = Array<HornNode>

interface _ParserState {
  headings: Object
  lists: Object
  lastHeading: HornNode | null
  lastList: HornNode | null
  lastSrc: HornNode | null
  listMode: Boolean
  srcMode: Boolean
  count: Int
}
