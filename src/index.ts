import Elysia, { t } from "elysia";
import * as perspective from "./perspective";
import { checkHardcore } from "./analyzer";

new Elysia()
  .post(
    "/analyze",
    async ({ body }) => {
      const strings = [
        body.user.username,
        body.user.handle,
        body.user.bio,
        body.content,
      ];

      for (const str of strings) {
        if (checkHardcore(str)) {
          return { verdict: "ban", reason: "hardcore filter" };
        }
      }

      const combinedString = strings.join("\n");
      const resp = await perspective.analyze(combinedString);

      if (resp.THREAT.summaryScore.value > 0.80) {
        return { verdict: "delete", reason: "threat filter >0.80" };
      }

      if (resp.IDENTITY_ATTACK.summaryScore.value > 0.93) {
        return { verdict: "delete", reason: "identity attack filter >0.93" };
      }


      return { verdict: "neutral", reason: "" };
    },
    {
      body: t.Object({
        content: t.String(),
        user: t.Object({
          id: t.String(),
          username: t.String(),
          handle: t.String(),
          bio: t.String(),
          email: t.String(),
        }),
      }),
      response: t.Object({
        reason: t.String(),
        verdict: t.Union([
          t.Literal("neutral"),
          t.Literal("ban"),
          t.Literal("delete"),
        ]),
      }),
    }
  )
  .listen(4141, () => console.log("listening on port 4141"));
