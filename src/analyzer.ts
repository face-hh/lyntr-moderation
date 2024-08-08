import latinize from "latinize";
import stringSimilarity from "string-similarity-js";

export const words: Array<string> = [
  "nigga",
  "nigger",
  "faggot",
  "fag",
  "retard",
  "ching chong",
  "hitler",
  "nazi"
];

export function cleanUp(msg: string): string[] {
  msg = latinize(msg);
  msg = msg.trim().toLowerCase().normalize("NFKD");
  const inputs = msg.split(/\s/g);
  return inputs;
}

export function checkHardcore(msg: string): boolean {
  const inputs = cleanUp(msg);
  for (const input of inputs) {
    for (const word of words) {
      if (input === word || input.includes(word)) {
        return true;
      } else if (stringSimilarity(word, input) >= 0.90) {
        return true;
      }
    }
  }
  return false;
}
