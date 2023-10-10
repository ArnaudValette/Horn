export const orgCommandMap: CommandMapArray = [
  ["digit", (char: string) => /[0-9]/.test(char), true],
  ["Capital", (char: string) => /[A-Z]/.test(char), false],
  ["low", (char: string) => /[a-z]/.test(char), false],
  ["any", (char: string) => /[^\s\[\]]/.test(char), true],
  ["ANY", (char: string) => /[^\[\]]/.test(char), true],
]

export const orgTreeChars: TreeChars = [
  "f",
  "n",
  "%",
  "/",
  "-",
  "]",
  "[",
  ":",
  " ",
  "X",
]

export const orgForest: Forest = {
  digit: {
    "%": { "]": { done: true, type: "cookiePercent" } },
    "/": { digit: { "]": { done: true, type: "cookieRatio" } } },
    "-": {
      digit: {
        "-": {
          digit: {
            " ": {
              Capital: { low: { low: { "]": { done: true, type: "date" } } } },
            },
          },
        },
      },
    },
  },
  " ": { "]": { done: true, type: "checkboxEmpty" } },
  X: { "]": { done: true, type: "checkboxCheck" } },
  "[": {
    any: {
      "]": {
        "]": { done: true, type: "image" },
        "[": { ANY: { "]": { "]": { done: true, type: "link" } } } },
      },
    },
  },
  f: { n: { ":": { any: { "]": { done: true, type: "footnote" } } } } },
}

export const orgWakeUpChar = "["
export const orgSleepToken = "over"
