# Table of Contents

1.  [Horn](#org6c305cd)
    1.  [Usage](#orgf8c08c1)
        1.  [Parsing](#org5d9edaa)
        2.  [Data structure](#orgd1b630d)
    2.  [Supported syntax](#orgb759850)
        1.  [Greater elements | Horn-nodes](#orgd9bbea9)
        2.  [Lesser elements | Glitter-Nodes](#org1743525)


<a id="org6c305cd"></a>

# Horn


<a id="orgf8c08c1"></a>

## Usage

<a id="org5d9edaa"></a>

Installation :

    npm install org-horn-parser
    
    
### Parsing

To parse an `.org` file and print its
structure :

    import {Parser} from "org-horn-parser"
    import * as fs from "fs"
    
    const p:Parser= new Parser()
   
    const d = fs.readFileSync("path/to/file")
   
    p.parseOrg(d)
    
    console.dir(p.state.roots,  {depth: null})


<a id="orgd1b630d"></a>

### Data structure

Horn represents org files as a Forest, following the behavior
you obtain in emacs when you fold a heading.

Due to the composite nature of a line in org, two main abstractions
are used :

1.  HornNodes (Higher elements)
2.  GlitterNodes (Lesser elements)

A HornNode represent the type of a line, a GlitterNode
represent the type of its content.

**HornNodes** are used to represent headings, list elements,
blocks, horizontal rules etc&#x2026;

**GlitterNodes** are used to represent if some part of the line
is **bold**, *italic*, or if there's a timestamp in it, or a file and etc&#x2026;

1.  Example input

        * _Node 1_
        this is a paragraph with /italicized/ words and a timestamp [2023-10-13 Fri].
        there's a list in Node 1 :
        - a
        - b
        ** child of node 1
        * Node 2

2.  Example output

         [
          HornNode {
            children: [
              HornNode {
                children: [],
                glitterNodes: [
                  orgFormat {
                    start: 0,
                    end: 25,
                    text: 'this is a paragraph with ',
                    type: 0
                  },
                  orgFormat {
                    start: 25,
                    end: 36,
                    text: 'italicized',
                    type: 16
                  },
                  orgFormat {
                    start: 36,
                    end: 60,
                    text: ' words and a timestamp ',
                    type: 0
                  },
                  orgDate {
                    start: 60,
                    end: 76,
                    text: '[2023-10-13 Fri]',
                    type: 'date',
                    year: 2023,
                    month: 10,
                    day: 13,
                    weekday: 'Fri'
                  },
                  orgFormat { start: 76, end: 77, text: '.', type: 0 }
                ],
                tags: [],
                id: 1,
                level: 0,
                nType: 'paragraph',
                textContent: 'this is a paragraph with /italicized/ words and a timestamp [2023-10-13 Fri].'
              },
              HornNode {
                children: [],
                glitterNodes: [
                  orgFormat {
                    start: 0,
                    end: 26,
                    text: "there's a list in Node 1 :",
                    type: 0
                  }
                ],
                tags: [],
                id: 2,
                level: 0,
                nType: 'paragraph',
                textContent: "there's a list in Node 1 :"
              },
              HornNode {
                children: [],
                glitterNodes: [ orgFormat { start: 0, end: 1, text: 'a', type: 0 } ],
                tags: [],
                id: 3,
                level: 1,
                nType: 'list',
                textContent: 'a'
              },
              HornNode {
                children: [],
                glitterNodes: [ orgFormat { start: 0, end: 1, text: 'b', type: 0 } ],
                tags: [],
                id: 4,
                level: 1,
                nType: 'list',
                textContent: 'b'
              },
              HornNode {
                children: [],
                glitterNodes: [
                  orgFormat {
                    start: 0,
                    end: 15,
                    text: 'child of node 1',
                    type: 0
                  }
                ],
                tags: [],
                id: 5,
                level: 2,
                nType: 'heading',
                textContent: 'child of node 1'
              }
            ],
            glitterNodes: [ orgFormat { start: 0, end: 7, text: 'Node 1', type: 8 } ],
            tags: [],
            id: 0,
            level: 1,
            nType: 'heading',
            textContent: '_Node 1_'
          },
          HornNode {
            children: [
              HornNode {
                children: [],
                glitterNodes: [],
                tags: [],
                id: 7,
                level: 0,
                nType: 'empty',
                textContent: ''
              }
            ],
            glitterNodes: [ orgFormat { start: 0, end: 6, text: 'Node 2', type: 0 } ],
            tags: [],
            id: 6,
            level: 1,
            nType: 'heading',
            textContent: 'Node 2'
          }
        ] 

3.  Complex text formatting

    The parser support complex overlapping text formatting
    
    1.  example
    
            /this para*graph/ contains* complex+ text _ formatting+
        
        Is parsed like this:
        
            HornNode {
              children: [],
              glitterNodes: [
                orgFormat { start: 0, end: 10, text: 'this para', type: 16 },
                orgFormat { start: 10, end: 16, text: 'graph', type: 48 },
                orgFormat { start: 16, end: 26, text: ' contains', type: 32 },
                orgFormat { start: 26, end: 35, text: ' complex', type: 0 },
                orgFormat {
                  start: 35,
                  end: 54,
                  text: ' text _ formatting',
                  type: 4
                }
              ],
              tags: [],
              id: 0,
              level: 0,
              nType: 'paragraph',
              textContent: '/this para*graph/ contains* complex+ text _ formatting+'
            }
    
    2.  orgFormat.type
    
        GlitterNodes that allow for the parsing of the text format expresses
        the type of format via a bit flag whose specification is :
        
            bold = 32
            italic = 16
            underline = 8
            strike = 4
            code = 2
            verbatim = 1
        
        This allows for compound text formats (48 : bold+italic). 


<a id="orgb759850"></a>

## Supported syntax


<a id="orgd9bbea9"></a>

### Greater elements | Horn-nodes

Headlines:

    * H1
    ** H2
    . . .

Lists:

    - a
    
    - b
      - b1
      - b2
        - b2.a
      - b3
    . . .

Blocks:

    #+begin_src js
     . . .
    #+end_src

    #+begin_quote
    . . .
    #+end_quote

Tables:

    |   |   |   |   |   |
    |---+---+---+---+---|
    |   |   |   |   |   |

Horizontal rules:

    -----

Org code:

    : some code...

Footnotes:

    [fn:1] some text ...


<a id="org1743525"></a>

### Lesser elements | Glitter-Nodes

Formatted text:

    /italic/ *bold* _underline_ +strike+ ~code~ =verbatim=

Overlapping text format:

    /italic *bold italic/ only bold*
    /italic _ italic + strike italic *bold strike italic+*/

Checkboxes:

    [ ] unchecked
    [X] checked

Timestamps:

    [2023-10-03 Tue]

Statistic cookies:

    - [1/3]
    - [ ] a
    - [X] b
    - [ ] c
    
    - [25%]
    - [X] a
    - [ ] b
    - [ ] c
    - [ ] d

Links:

    [[~/.emacs.d/init.el][init file]]
    [[https://github.com][github]]

Images:

    [[~/image.png]]

Footnote calls:

    ...some text [fn:1] some text...
