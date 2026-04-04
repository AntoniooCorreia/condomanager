import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  users, payments, works, reservations, securityLogs, paymentSchedules
} from "../client/src/shared/schema";

const schema = { users, payments, works, reservations, securityLogs, paymentSchedules };
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
