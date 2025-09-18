import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { config } from "dotenv";
import * as schema from "./schema";

config();

// Create MySQL connection pool
const poolConnection = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Create Drizzle database instance
export const db = drizzle(poolConnection, { mode: "default", schema });

// Test database connection
export async function testConnection() {
  try {
    const [result] = await poolConnection.execute("SELECT 1");
    console.log("✅ Database connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

export default db;
