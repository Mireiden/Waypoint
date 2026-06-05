import cors from "cors";
import express, { type Application, type Request, type Response } from "express";

const app: Application = express();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello world!");
});

export default app;
