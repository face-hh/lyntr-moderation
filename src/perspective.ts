import { inspect } from "bun";
import { google } from "googleapis";
import { SeverityType } from "./analyzer";

if (!Bun.env.PERSPECTIVE_TOKEN) {
  throw new Error("PERSPECTIVE_TOKEN is not specified");
}

const API_KEY = Bun.env.PERSPECTIVE_TOKEN;
const DISCOVERY_URL = `https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1`;

const client = await google.discoverAPI(DISCOVERY_URL);

async function sendRequest(text: string) {
  const analyzeRequest = {
    comment: {
      text,
    },
    requestedAttributes: {
      TOXICITY: {},
      SEVERE_TOXICITY: {},
      IDENTITY_ATTACK: {},
      INSULT: {},
      THREAT: {},
      // PROFANITY: {},
    },
  };

  return new Promise((resolve, reject) => {
    (client.comments as any).analyze(
      {
        key: API_KEY,
        resource: analyzeRequest,
      },
      (err: Error, response: any) => {
        if (err) return reject(err);
        resolve(response.data);
      }
    );
  });
}

export type ClassType =
  | "PROBABILITY"
  | "SEVERE_TOXICITY"
  | "IDENTITY_ATTACK"
  | "INSULT"
  | "THREAT"
  | "PROFANITY";

export interface ClassData {
  spanScores: Array<{
    begin: number;
    end: number;
    score: { value: number; type: ClassType };
  }>;
  summaryScore: {
    value: number;
    type: ClassType;
  };
}

export interface Response {
  attributeScores: {
    INSULT: ClassData;
    SEVERE_TOXICITY: ClassData;
    THREAT: ClassData;
    PROFANITY: ClassData;
    TOXICITY: ClassData;
    IDENTITY_ATTACK: ClassData;
  };
}

export async function analyze(
  text: string
): Promise<{ type: ClassType; value: number }[]> {
  const resp = (await sendRequest(text)) as Response;
  const classes: { type: ClassType; value: number }[] = [];

  for (const _k in resp.attributeScores) {
    const key = _k as keyof Response["attributeScores"];
    const value = resp.attributeScores[key];

    if (value.summaryScore.value > 0.85) {
      classes.push({ type: key as ClassType, value: value.summaryScore.value });
    }
  }
  return classes;
}
