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
          return "ban";
        }
      }

      const combinedString = strings.join("\n");
      const resp = await perspective.analyze(combinedString);

      if (resp.THREAT.summaryScore.value > 0.8) {
        return "delete";
      }

      if (resp.IDENTITY_ATTACK.summaryScore.value > 0.93) {
        return "delete";
      }

      return "neutral";
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
      response: t.Union([
        t.Literal("neutral"),
        t.Literal("ban"),
        t.Literal("delete"),
      ]),
    }
  )
  .listen(4141, () => console.log("listening on port 4141"));
