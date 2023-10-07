const validTrees = {
  digit: {
    "%": { "]": "over" },
    "/": { digit: { "]": "over" } },
    "-": {
      digit: {
        "-": {
          digit: { " ": { Capital: { low: { low: { "]": "over" } } } } },
        },
      },
    },
  },
  " ": { "]": "over" },
  "[": {
    any: { "]": { "]": "over", "[": { ANY: { "]": { "]": "over" } } } } },
  },
  f: { n: { ":": { any: { "]": "over" } } } },
}

const dispatcher = {
  digit: digit,
  "%": isChar,
  "/": isChar,
  "-": isChar,
  "]": isChar,
  "[": isChar,
  ":": isChar,
  f: isChar,
  n: isChar,
  " ": isChar,
  Capital: Capital,
  low: low,
  any: isX,
  ANY: isUnRestrictedX,
}

const st = {
  treeStack: [],
  next: ["digit", " ", "[", "f"],
  on: false,
  str: "",
  res: false,
}

const text =
  "there are dates [2023-10-03 Tue], false [ brackets and [ also ] sometimes [[file:/file][nameFile]] some [[~/img.png]] [fn:3] ]] ]] [ ] (checkbox) and : [fnde] [232545857685-222222-444565 Mon] [0%] [100%] [0/] [0/2]"

for (let i = 0, j = text.length; i < j; i++) {
  const char = text[i]
  if (char === "[" && !st.on) {
    st.on = true
  } else {
    if (st.treeStack.length > 0 && st.on) {
      const depth = ReachObjectDepth(validTrees, st.treeStack, 0)
      if (
        depth === "over" ||
        (char === "]" && depth["]"] && depth["]"] === "over")
      ) {
        console.log(st.str)
        st.treeStack = []
        st.next = ["digit", " ", "[", "f"]
        st.on = false
        st.str = ""
      }
    }
    st.res = false
    if (st.on) {
      const currentNode =
        st.treeStack.length > 0
          ? ReachObjectDepth(validTrees, st.treeStack, 0)
          : validTrees
      const parentNode =
        st.treeStack.length > 1
          ? ReachObjectDepth(
              validTrees,
              st.treeStack.slice(0, st.treeStack.length - 1),
              0
            )
          : validTrees
      for (let x = 0, y = st.next.length, z = false; x < y && !z; x++) {
        const key = st.next[x] // digit
        let node = currentNode[key] || parentNode[key]
        if (!node) {
          if (parentNode) {
            node = parentNode[key]
          }
        } else {
          const branches = Object.keys(node) //"%":{},"/":{},"-":{} => ["%", "/", "-"]
          //@ts-ignore
          const fn = dispatcher[key]
          z = fn(branches, char, key)
          if (z) {
            st.str = st.str.concat(char)
            st.res = true
          }
        }
      }
      if (!st.res) {
        console.log("no match")
        st.treeStack = []
        st.next = ["digit", " ", "[", "f"]
        st.on = false
        st.str = ""
      }
    }
  }
}

//@ts-ignore
function ReachObjectDepth(obj, arr, index) {
  return arr[index + 1] && obj[arr[index]][arr[index + 1]]
    ? ReachObjectDepth(obj[arr[index]], arr, index + 1)
    : obj[arr[index]]
}

function digit(children: Array<string>, char: string, target?: string) {
  if (/[0-9]/.test(char)) {
    st.next = [...children, "digit"]
    //@ts-ignore
    if (st.treeStack[st.treeStack.length - 1] !== "digit") {
      //@ts-ignore
      st.treeStack.push("digit")
    }
    return true
  }
  return false
}

function isChar(children: Array<string>, char: string, target: string) {
  if (char === target) {
    st.next = [...children]
    //@ts-ignore
    st.treeStack.push(target)
    return true
  }
  return false
}

function Capital(children: Array<string>, char: string, target?: string) {
  if (/[A-Z]/.test(char)) {
    st.next = [...children]
    //@ts-ignore
    st.treeStack.push("Capital")
    return true
  }
  return false
}
function low(children: Array<string>, char: string, target?: string) {
  if (/[a-z]/.test(char)) {
    st.next = [...children]
    //@ts-ignore
    st.treeStack.push("low")
    return true
  }
  return false
}
function isX(children: Array<string>, char: string, target?: string) {
  if (/[^\s\[\]]/.test(char)) {
    st.next = [...children, "any"]
    //@ts-ignore
    if (st.treeStack[st.treeStack.length - 1] !== "any") {
      //@ts-ignore
      st.treeStack.push("any")
    }
    return true
  }
  return false
}
function isUnRestrictedX(
  children: Array<string>,
  char: string,
  target?: string
) {
  if (/[^\[\]]/.test(char)) {
    st.next = [...children, "ANY"]
    //@ts-ignore
    if (st.treeStack[st.treeStack.length - 1] !== "ANY") {
      //@ts-ignore
      st.treeStack.push("ANY")
    }
    return true
  }
  return false
}
