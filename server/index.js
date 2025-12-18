import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from 'url';

// Loading API key
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
const apiKey = process.env.IMDB_API_KEY;

// Initialize Express app
const app = express();
app.use(cors());              // during dev
app.use(express.json());

// Initialize SQLite database connection
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








// GET featured films for home page
app.get("/getFeaturedMovies", async (req, res) => {
  const featuredIds = [
    "tt0111161",
    "tt0068646",
    "tt0468569",
    "tt0137523",
    "tt0110912",
    "tt0109830",
    "tt0133093",
    "tt1375666",
    "tt0167260",
    "tt0080684",
  ];
  try {
    const promises = featuredIds.map(id =>
      fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
        .then(r => r.json())
    );

    const movies = await Promise.all(promises);
    res.json(movies); // send array of 10 movies
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// GET movie details by imdbID
app.get("/getMovieDetails/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`);
    const movie = await response.json();
    res.json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
