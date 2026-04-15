const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config();

const shouldUseSSL = String(process.env.DB_SSL || "").toLowerCase() === "true";

async function main() {
  const client = new Client({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "student_registration",
    ...(shouldUseSSL ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  try {
    await client.connect();
    await client.query(schemaSql);
    console.log("PostgreSQL schema applied successfully.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Database initialization failed:", error.message);
  process.exit(1);
});
