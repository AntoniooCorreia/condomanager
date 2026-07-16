const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const env = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
const m = env.match(/DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/);
if (!m) { console.error("DATABASE_URL nao encontrado no .env"); process.exit(1); }
const sql = fs.readFileSync(path.join(__dirname, process.argv[2]), "utf8");
const pool = new Pool({ connectionString: m[1], ssl: { rejectUnauthorized: false } });
pool.query(sql).then(() => { console.log("OK ->", process.argv[2]); return pool.end(); })
  .then(() => process.exit(0)).catch((e) => { console.error("ERRO SQL:", e.message); process.exit(1); });