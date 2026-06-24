import app from "./app.js";
import config from "./config/config.js";
import { prisma } from "./lib/prisma.js";

const port: number = config.server.port;

const server = app.listen(port, () => {
  console.log(`⚡ Server listening on port http://localhost:${String(port)}`);
});

let shuttingDown = false;

const shutdown = (signal: string) => {
  if (shuttingDown) return; //received other signal in the meantime - ignore
  shuttingDown = true;
  console.log(`${signal} received: shutting down.`);

  server.close(() => {
    void prisma.$disconnect().finally(() => {
      console.log("HTTP server closed, DB disconnected");
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref(); //this timer doesn't keep the process alive
};

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
});
process.on("SIGINT", () => {
  shutdown("SIGINT");
});

const crash = (label: string, err: unknown) => {
  console.error(`${label}:`, err);
  process.exit(1); //corrupt state - bail out and let the platform restart
};

process.on("uncaughtException", (err) => {
  crash("Uncaught Exception", err);
});
process.on("unhandledRejection", (err) => {
  crash("Unhandled Rejection", err);
});
