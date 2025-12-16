import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
app.use(cors());              // during dev
app.use(express.json());

const db = new Database("./database/database.db"); // path to SQLite file

// GET all blogs
app.get("/getAllBlogs", (req, res) => {
  const rows = db.prepare("SELECT * FROM blogs").all();
  res.json(rows);
});


// GET certain blog by {id}
app.get("/getAllBlogs/:id", (req, res) =>{
  const {id} = req.params;
  const row = db.prepare("SELECT * FROM blogs WHERE id = ?").get(id);
  res.json(row);
});


// // POST create/add new blog
app.post("/insertNewBlog", (req, res) => {
  try {
    const { title, body, author } = req.body;

    const stmt = db.prepare("INSERT INTO blogs (title, author, body) VALUES (?, ?, ?)");
    const result = stmt.run(title, author, body);

    return res.status(201).json({
      message: "Values Inserted",
      id: result.lastInsertRowid,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to insert blog" });
  }
});

// DELETE blog by {id}
app.delete("/deleteBlogByID/:id", (req, res) => {
  try {
    const { id } = req.params;

    const stmt = db.prepare("DELETE FROM blogs WHERE id = ?");
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    return res.json({ message: "Blog deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete blog" });
  }
});


// // POST create/add new blog
// app.post("/insertNewBlog", (req, res) =>{
//   const { title, body, author } = req.params;
//   const stmt = db.request("INSERT INTO blogs (title, author, body) VALUES (?, ?, ?)");
//   // const result = stmt.run(title, author, body);
  
//   if(error){
//     console.log(error);
//   } else {
//     res.send("Values Inserted");
//   }

// });


// // POST create note
// app.post("/api/notes", (req, res) => {
//   const { title } = req.body;
//   if (!title?.trim()) return res.status(400).json({ error: "title required" });

//   const stmt = db.prepare("INSERT INTO notes (title) VALUES (?)");
//   const result = stmt.run(title.trim());
//   const created = db.prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);

//   res.status(201).json(created);
// });

app.listen(3001, () => console.log("API running on http://localhost:3001"));
