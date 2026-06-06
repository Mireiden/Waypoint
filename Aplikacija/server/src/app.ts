import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import config from "./config/config.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import userRoutes from "./routes/user.routes.js";

const app: Application = express();

app.use(express.json());
app.use(cors({ origin: config.cors.frontendUrl }));

app.use("/", userRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.use("/", errorHandler);

export default app;
