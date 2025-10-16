const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// ✅ Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

const dbURI =
  "mongodb+srv://admin:admin123@node-database.v5dizls.mongodb.net/student?retryWrites=true&w=majority&appName=node-database";

const client = new MongoClient(dbURI);
let studentsCollection;

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB ✅");
    const db = client.db("student");
    studentsCollection = db.collection("students");
  } catch (err) {
    console.error("Database connection error ❌", err);
  }
}
connectDB();

// ✅ Home Page: Display all students
app.get("/", async (req, res) => {
  const students = await studentsCollection.find().toArray();
  res.render("index", { students });
});

// ✅ Add Student
app.post("/add-student", async (req, res) => {
  const { name, age, course } = req.body;
  await studentsCollection.insertOne({
    name,
    age: parseInt(age),
    course,
  });
  res.redirect("/");
});

// ✅ Delete Student
app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  await studentsCollection.deleteOne({ _id: new ObjectId(id) });
  res.redirect("/");
});

// ✅ Edit Page
app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const student = await studentsCollection.findOne({ _id: new ObjectId(id) });
  res.render("edit", { student });
});

// ✅ Update Student
app.post("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { name, age, course } = req.body;
  await studentsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { name, age: parseInt(age), course } }
  );
  res.redirect("/");
});

// ✅ Start Server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000 🚀");
});

app.post("/add-student", async (req, res) => {
  const { name, age, course } = req.body;
  await studentsCollection.insertOne({ name, age: parseInt(age), course });
  res.redirect("/?msg=added");
});

app.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  await studentsCollection.deleteOne({ _id: new ObjectId(id) });
  res.redirect("/?msg=deleted");
});

app.post("/update/:id", async (req, res) => {
  const id = req.params.id;
  const { name, age, course } = req.body;
  await studentsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { name, age: parseInt(age), course } }
  );
  res.redirect("/?msg=updated");
});
