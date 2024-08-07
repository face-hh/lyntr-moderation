import Elysia, { t } from "elysia";
import * as perspective from "./perspective";
import { checkHardcore } from "./analyzer";
import { logger } from "./logger";

new Elysia()
  .onError(({ error, route, request }) => {
    logger.error(`${request.method.toUpperCase()} ${route} - ${error.message}`);
  })
  .onAfterHandle(({ request, route, set, response, body }) => {
    logger.info(
      `${request.method.toUpperCase()} ${route} - ${
        set.status
      } - ${JSON.stringify(body)} - ${JSON.stringify(response)}`
    );
  })
  .post(
    "/classify",
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
  .listen(4000, () => {
    logger.info("listening on port 4000");
  });
