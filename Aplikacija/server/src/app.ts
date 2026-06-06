import cors from "cors";
import express, { type Application } from "express";
import config from "./config/config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";

const app: Application = express();

app.use(express.json());
app.use(cors({ origin: config.cors.frontendUrl }));

app.use("/api/", routes);

app.use(errorHandler);

export default app;
