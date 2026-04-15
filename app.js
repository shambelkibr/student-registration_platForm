const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "shanbelkibre",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "student_registration",
  port: Number(process.env.DB_PORT || 3306),
};

let pool;
let dbInitPromise;

async function connectDB() {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      try {
        pool = mysql.createPool({
          ...dbConfig,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });

        await pool.query(`
          CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            age INT NOT NULL,
            course VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        console.log("Connected to MySQL");
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
    const { name, age, course } = req.body;
    await pool.query(
      "INSERT INTO students (name, age, course) VALUES (?, ?, ?)",
      [name, Number(age), course],
    );
    res.redirect("/?msg=added");
  } catch (error) {
    res.status(500).send("Failed to add student");
  }
});

app.get("/", async (req, res) => {
  try {
    await connectDB();
    const [students] = await pool.query(
      "SELECT id, name, age, course FROM students ORDER BY id DESC",
    );
    res.render("index", { students });
  } catch (error) {
    res.status(200).render("index", {
      students: [],
      dbError: "Database is not reachable right now.",
    });
  }
});

app.get("/delete/:id", async (req, res) => {
  try {
    await connectDB();
    const id = Number(req.params.id);
    await pool.query("DELETE FROM students WHERE id = ?", [id]);
    res.redirect("/?msg=deleted");
  } catch (error) {
    res.status(500).send("Failed to delete student");
  }
});

app.get("/edit/:id", async (req, res) => {
  try {
    await connectDB();
    const id = Number(req.params.id);
    const [rows] = await pool.query(
      "SELECT id, name, age, course FROM students WHERE id = ? LIMIT 1",
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
    const { name, age, course } = req.body;
    await pool.query(
      "UPDATE students SET name = ?, age = ?, course = ? WHERE id = ?",
      [name, Number(age), course, id],
    );
    res.redirect("/?msg=updated");
  } catch (error) {
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
