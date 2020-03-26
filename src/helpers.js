
export const stringToHex = (input) => {
  let str = ""
  for (const char of input) {
    str += char.charCodeAt(0).toString(16)
  }
  return str
}