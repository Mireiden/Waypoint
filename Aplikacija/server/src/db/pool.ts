import { Pool } from "pg";
import config from "../config/config.js";

const pool = new Pool({
  connectionString: config.db.url,
});

pool.on("error", (error) => {
  console.error("Unexpected error on idle PostgreSQL client", error);
  process.exit(1);
});

pool.on("connect", () => {
  console.log("Connection pool established with database");
});

export default pool;
