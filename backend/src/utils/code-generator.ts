import { randomInt } from "node:crypto";

const ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; // base62

// 62^7 is about 3.5 trillion possible codes
export function generateCode(length = 7): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)]; // crypto-secure, unbiased
  }
  return code;
}