const express = require("express");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "shanbelkibre",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "student_registration",
  port: Number(process.env.DB_PORT || 5432),
};

const shouldUseSSL = String(process.env.DB_SSL || "").toLowerCase() === "true";

let pool;
let dbInitPromise;

async function connectDB() {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        pool = new Pool({
          ...dbConfig,
          ...(shouldUseSSL ? { ssl: { rejectUnauthorized: false } } : {}),
        });

        await pool.query(`
          CREATE TABLE IF NOT EXISTS students (
            id BIGSERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            age INT NOT NULL,
            course VARCHAR(100) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);

        console.log("Connected to PostgreSQL");
      } catch (err) {
        console.error("Database connection error", err.message);
        throw err;
      }
    })();
  }

  return dbInitPromise;
}

app.post("/add-student", async (req, res) => {
  try {
    await connectDB();

    const name = String(req.body?.name ?? "").trim();
    const course = String(req.body?.course ?? "").trim();
    const age = Number(req.body?.age);

    if (!name || !course || !Number.isInteger(age) || age <= 0) {
      return res.status(400).send("Invalid student data");
    }

    await pool.query(
      "INSERT INTO students (name, age, course) VALUES ($1, $2, $3)",
      [name, age, course],
    );

    if (
      req.is("application/json") ||
      req.get("accept")?.includes("application/json")
    ) {
      return res.status(201).json({ ok: true });
    }

    res.redirect("/?msg=added");
  } catch (error) {
    console.error("Add student failed:", error.message);
    res.status(500).send("Failed to add student");
  }
});

app.get("/", async (req, res) => {
  try {
    await connectDB();
    const { rows: students } = await pool.query(
      "SELECT id, name, age, course FROM students ORDER BY id DESC",
    );
    res.render("index", { students });
  } catch (error) {
    console.error("Home route query failed:", error.message);
    res.status(200).render("index", {
      students: [],
      dbError: `Database error: ${error.message}`,
    });
  }
});

app.get("/delete/:id", async (req, res) => {
  try {
    await connectDB();
    const id = Number(req.params.id);
    await pool.query("DELETE FROM students WHERE id = $1", [id]);
    res.redirect("/?msg=deleted");
  } catch (error) {
    res.status(500).send("Failed to delete student");
  }
});

app.get("/edit/:id", async (req, res) => {
  try {
    await connectDB();
    const id = Number(req.params.id);
    const { rows } = await pool.query(
      "SELECT id, name, age, course FROM students WHERE id = $1 LIMIT 1",
      [id],
    );

    if (!rows.length) {
      return res.status(404).send("Student not found");
    }

    res.render("edit", { student: rows[0] });
  } catch (error) {
    res.status(500).send("Failed to load student");
  }
});

app.post("/update/:id", async (req, res) => {
  try {
    await connectDB();

    const id = Number(req.params.id);
    const name = String(req.body?.name ?? "").trim();
    const course = String(req.body?.course ?? "").trim();
    const age = Number(req.body?.age);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).send("Invalid student id");
    }

    if (!name || !course || !Number.isInteger(age) || age <= 0) {
      return res.status(400).send("Invalid student data");
    }

    await pool.query(
      "UPDATE students SET name = $1, age = $2, course = $3 WHERE id = $4",
      [name, age, course, id],
    );

    if (
      req.is("application/json") ||
      req.get("accept")?.includes("application/json")
    ) {
      return res.status(200).json({ ok: true });
    }

    res.redirect("/?msg=updated");
  } catch (error) {
    console.error("Update student failed:", error.message);
    res.status(500).send("Failed to update student");
  }
});

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
module.exports.connectDB = connectDB;
