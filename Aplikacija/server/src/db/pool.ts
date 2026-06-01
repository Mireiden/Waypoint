import { Pool } from "pg";
import config from "../config/config.js";

const connectionString = config.db.url;

const pool = new Pool({
  connectionString,
});

pool.on("connect", () => {
  console.log("Connection pool established with database");
});

export default pool;
