import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool, types } = pkg;

types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL + "?sslmode=verify-full",
  ssl: { rejectUnauthorized: true },
});

let connected = false;
pool.on("connect", () => {
  if (!connected) {
    console.log("Connected to the database");
    connected = true;
  }
});

pool.on("error", (err) => {
  console.error("Unexpected postgress error ", err);
  process.exit(-1);
});

export default pool;
