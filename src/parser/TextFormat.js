var text = "Ok let's *go / there* and +see /what is possible to * make+ ple/ase";
var flags = {
    "*": 32,
    "/": 16,
    _: 8,
    "+": 4,
    "~": 2,
    "=": 1,
};
for (var i = 0, j = text.length; i < j; i++) {
    var char = text[i];
    if (flags[char]) {
        console.log(char);
    }
}
