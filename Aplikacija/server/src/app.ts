import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: config.cors.frontendUrl }));

app.use("/api/", routes);

app.use(errorHandler);

export default app;
