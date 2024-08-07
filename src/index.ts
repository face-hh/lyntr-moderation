import Elysia, { t } from "elysia";
import * as perspective from "./perspective";
import { basicEval, SeverityType } from "./analyzer";

new Elysia()
  .post(
    "/analyze",
    async ({ body }) => {
      const perspectiveClasses = await perspective.analyze(body.text);
      const basicClasses = basicEval(body.text);

      const combined = new Set(basicClasses);
      for (const cls of perspectiveClasses) {
        if (
          cls.type === "IDENTITY_ATTACK" ||
          cls.type === "SEVERE_TOXICITY" ||
          cls.type === "THREAT"
        ) {
          if (cls.value > 0.7) {
            combined.add(SeverityType.Medium);
          } else if (cls.value > 0.8) {
            combined.add(SeverityType.High);
          }
        }
      }

      return [...combined];
    },
    {
      body: t.Object({ text: t.String() }),
      response: t.Array(t.Enum(SeverityType)),
    }
  )
  .listen(4141, () => console.log("listening on port 4141"));
