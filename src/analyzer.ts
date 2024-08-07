import latinize from "latinize";
import stringSimilarity from "string-similarity-js";

export enum SeverityType {
  High,
  Medium,
  Low,
}

export const words: Array<[string, SeverityType]> = [
  ["nigga", SeverityType.High],
  ["nigger", SeverityType.High],
  ["faggot", SeverityType.High],
  ["fag", SeverityType.High],
  ["retard", SeverityType.High],
  ["ching", SeverityType.High],
  ["chong", SeverityType.High],
];

export function basicEval(msg: string) {
  // process
  msg = latinize(msg);
  msg = msg.trim().toLowerCase().normalize("NFKD");
  const inputs = msg.split(/\s/g);
  const classes: SeverityType[] = [];

  for (const input of inputs) {
    for (const [word, type] of words) {
      if (input === word || input.includes(word)) {
        classes.push(type);
      } else if (stringSimilarity(word, input) >= 0.85) {
        classes.push(type);
      }
    }
  }

  return classes;
}
