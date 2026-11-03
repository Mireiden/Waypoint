import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";

import config from "./config/config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import routes from "./routes/index.js";

const app: Application = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: config.cors.frontendUrl }));

app.use("/api/", routes);

app.use(errorHandler);

export default app;
