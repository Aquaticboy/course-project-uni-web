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
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_AUTH_KEY = process.env.TMDB_API_AUTH_KEY;


// Initialize Express app
const app = express();
app.use(cors());              // during dev
app.use(express.json());

// Initialize SQLite database connection
const db = new Database("./database/database.db"); // path to SQLite file






// ------------------ BLOGS API ROUTES (For database) ------------------ //
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


















// // GET featured films for home page
// app.get("/getFeaturedMovies", async (req, res) => {
//   const featuredIds = [
//     "tt0111161",
//     "tt0068646",
//     "tt0468569",
//     "tt0137523",
//     "tt0110912",
//     "tt0109830",
//     "tt0133093",
//     "tt1375666",
//     "tt0167260",
//     "tt0080684",
//   ];
//   try {
//     const promises = featuredIds.map(id =>
//       fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`)
//         .then(r => r.json())
//     );

//     const movies = await Promise.all(promises);
//     res.json(movies); // send array of 10 movies
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



// // GET movie details by imdbID
// app.get("/getMovieDetails/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const response = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`);
//     const movie = await response.json();
//     res.json(movie);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });






























// Допоміжна функція для налаштувань запиту (щоб не дублювати код)
const getFetchOptions = () => ({
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${TMDB_API_AUTH_KEY}`
    }
});


// --- API ENDPOINTS ---

// 1. Отримати список популярних (Featured) фільмів
app.get("/getFeaturedMovies", async (req, res) => {
    const featuredIds = [
        "tt0111161", "tt0068646", "tt0468569", "tt0137523", "tt0110912",
        "tt0109830", "tt0133093", "tt1375666", "tt0167260", "tt0080684",
    ];

    try {
        // Проходимо по кожному ID і робимо запит до TMDB
        const promises = featuredIds.map(async (imdbId) => {
            // А. Find ID
            const findUrl = new URL(`${TMDB_BASE_URL}/find/${imdbId}`);
            findUrl.searchParams.set('external_source', 'imdb_id');
            findUrl.searchParams.set('language', 'uk-UA');
            
            const findRes = await fetch(findUrl, getFetchOptions());
            const findData = await findRes.json();
            
            if (!findData.movie_results?.[0]) return null;
            const tmdbId = findData.movie_results[0].id;

            // Б. Get Details (щоб отримати постер і опис)
            const detailsUrl = new URL(`${TMDB_BASE_URL}/movie/${tmdbId}`);
            detailsUrl.searchParams.set('language', 'uk-UA');
            
            const detailsRes = await fetch(detailsUrl, getFetchOptions());
            const movie = await detailsRes.json();

            // В. Повертаємо чистий об'єкт
            return {
                ...movie,
                poster_full_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                backdrop_full_url: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null
            };
        });

        const results = await Promise.all(promises);
        // Відфільтрувати null, якщо якийсь фільм не знайшовся
        res.json(results.filter(m => m !== null));

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch featured movies" });
    }
});


// Новий ендпоінт: Отримання деталей за TMDB ID (швидше і простіше)
app.get('/movieInfoByID/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const detailsUrl = new URL(`${TMDB_BASE_URL}/movie/${id}`);
        
        // 1. Основна мова (для тексту, назви, опису)
        detailsUrl.searchParams.set('language', 'uk-UA');
        
        // 2. ВАЖЛИВО: Дозволяємо картинки англійською та без мови (для Галереї)
        // 'null' - це картинки без тексту (чисті фони), 'en' - англійські, 'uk' - українські
        detailsUrl.searchParams.set('include_image_language', 'uk,en,null'); 
        
        // 3. Додаємо це для відео, щоб знаходило англ. трейлери, якщо немає укр.
        detailsUrl.searchParams.set('include_video_language', 'uk,en'); 

        // 4. Підключаємо додаткові блоки
        detailsUrl.searchParams.set('append_to_response', 'credits,videos,images,similar');

        const response = await fetch(detailsUrl, getFetchOptions());

        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: 'Фільм не знайдено' });
            }
            throw new Error(`TMDB Error: ${response.status}`);
        }

        const data = await response.json();

        // Форматуємо головні картинки
        data.poster_full_url = data.poster_path 
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}` 
            : null;
        
        data.backdrop_full_url = data.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` 
            : null;

        res.json(data);

    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ error: 'Не вдалося отримати дані фільму' });
    }
});


// Отримання даних про актора
app.get('/actor/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const url = new URL(`${TMDB_BASE_URL}/person/${id}`);
        url.searchParams.set('language', 'uk-UA');
        // Отримуємо також фільмографію та фото
        url.searchParams.set('append_to_response', 'movie_credits,images,external_ids');

        const response = await fetch(url, getFetchOptions());

        if (!response.ok) {
            return res.status(404).json({ error: 'Актора не знайдено' });
        }

        const data = await response.json();

        // Форматуємо головне фото
        data.profile_full = data.profile_path 
            ? `https://image.tmdb.org/t/p/h632${data.profile_path}` 
            : null;

        res.json(data);

    } catch (error) {
        console.error('Actor Error:', error.message);
        res.status(500).json({ error: 'Server error' });
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
