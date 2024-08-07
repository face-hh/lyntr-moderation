import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.prettyPrint(),
  defaultMeta: { service: "moderation-svc" },
  transports: [new winston.transports.Console()],
});
