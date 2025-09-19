import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import { config } from "dotenv";

config();

const runMigrate = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true, // Important for running multiple SQL statements
    });

    // Drop existing tables first
    console.log("Dropping existing tables...");
    await connection.execute(
      "DROP TABLE IF EXISTS tabTrays, tabOpticalCount, __drizzle_migrations"
    );

    const db = drizzle(connection);

    console.log("⏳ Running migrations...");
    await migrate(db, { migrationsFolder: "drizzle" });

    console.log("✅ Migrations completed!");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

runMigrate().catch((err) => {
    console.error("❌ Migration failed");
  console.error(err);
    process.exit(1);
  });
