import mysql from "mysql2/promise";

const requiredInProduction = (name: string, fallback: string) => {
  const value = process.env[name]?.trim();

  if (process.env.NODE_ENV === "production" && !value) {
    throw new Error(`${name} is required in production.`);
  }

  return value || fallback;
};

const port = Number(process.env.DB_PORT || 3307);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error("DB_PORT must be a valid TCP port.");
}

const db = mysql.createPool({
  host: requiredInProduction("DB_HOST", "localhost"),
  user: requiredInProduction("DB_USER", "root"),
  password: process.env.DB_PASSWORD || "",
  database: requiredInProduction("DB_NAME", "careerflow"),
  port,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: "Z",
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        }
      : undefined,
});

export default db;