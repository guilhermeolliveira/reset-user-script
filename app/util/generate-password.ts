import crypto from "crypto";

export function generatePassword(quantity = 1) {
  const symbols = [
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "_",
    "-",
    '"',
  ];

  const alphabet = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];

  const generatedSymbols: string[] = [];
  let basePassword = "";

  for (let i = 0; i <= quantity; i++) {
    const randomNumber = crypto.randomInt(symbols.length);
    const symbol = symbols[randomNumber];
    generatedSymbols.push(symbol);
  }

  for (let i = 0; i < 8; i++) {
    const randomNumber = crypto.randomInt(alphabet.length);
    const letter = alphabet[randomNumber];
    basePassword += i % 2 === 0 ? letter.toUpperCase() : letter.toLowerCase();
  }

  return basePassword + generatedSymbols.join("") + crypto.randomInt(10);
}