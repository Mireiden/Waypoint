import app from "./app.js";
import config from "./config/config.js";

const port: number = config.server.port;

const server = app.listen(port, () => {
  console.log(`⚡ Server listening on port http://localhost:${String(port)}`);
});

process.on("unhandledRejection", (err: Error) => {
  console.error(`Shutting down due to Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
