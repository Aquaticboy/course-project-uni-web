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
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

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
















// Пошукова сторінка фільмів
// 1. Ендпоінт для отримання жанрів
app.get('/genres', async (req, res) => {
    try {
        const url = new URL(`${TMDB_BASE_URL}/genre/movie/list`);
        url.searchParams.set('language', 'uk-UA');
        
        const response = await fetch(url, getFetchOptions());
        const data = await response.json();
        
        // Віддаємо масив жанрів
        res.json(data.genres || []);
    } catch (error) {
        console.error('Genres Error:', error);
        res.status(500).json([]);
    }
});

// 2. Розумний пошук фільмів (Об'єднує пошук по тексту і фільтри)
app.get('/movies', async (req, res) => {
    // Отримуємо параметри від нашого фронтенду
    const { query, page = 1, genre, year, sort_by } = req.query;

    try {
        let endpoint;
        const params = new URLSearchParams({
            language: 'uk-UA',
            page: page,
            include_adult: false
        });

        // ЛОГІКА:
        // Якщо є текст пошуку -> використовуємо endpoint /search/movie
        // Якщо тексту немає -> використовуємо endpoint /discover/movie (для фільтрів)
        if (query && query.trim() !== '') {
            endpoint = `${TMDB_BASE_URL}/search/movie`;
            params.set('query', query);
            
            // Search API дозволяє фільтрувати рік виходу
            if (year) params.set('primary_release_year', year);
        } else {
            endpoint = `${TMDB_BASE_URL}/discover/movie`;
            
            // Discover API має більше фільтрів
            if (genre) params.set('with_genres', genre);
            if (year) params.set('primary_release_year', year);
            if (sort_by) params.set('sort_by', sort_by);
        }

        const url = `${endpoint}?${params.toString()}`;
        const response = await fetch(url, getFetchOptions());
        const data = await response.json();

        // Додаємо повні шляхи до картинок
        if (data.results) {
            data.results = data.results.map(movie => ({
                ...movie,
                poster_full_url: movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                    : null
            }));
        }

        res.json(data);

    } catch (error) {
        console.error('Search Error:', error.message);
        res.status(500).json({ error: 'Помилка пошуку фільмів' });
    }
});











// Google Books API usage
// // Ендпоінт для пошуку книг
// app.get('/books/search', async (req, res) => {
//     const { query, page = 0 } = req.query;
    
//     if (!query) {
//         return res.json({ items: [] });
//     }

//     try {
//         // Google Books API: startIndex - це зміщення (пагінація)
//         // maxResults - максимум 40
//         const startIndex = page * 20; 
//         const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}&langRestrict=uk`;

//         const response = await fetch(url);
//         const data = await response.json();

//         if (!data.items) {
//             return res.json({ results: [] });
//         }

//         // Форматуємо дані, щоб вони були схожі на структуру фільмів (для зручності фронтенду)
//         const formattedBooks = data.items.map(book => {
//             const info = book.volumeInfo;
            
//             // Витягуємо картинку (іноді Google дає http, міняємо на https)
//             let image = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
//             if (image) image = image.replace('http://', 'https://');

//             return {
//                 id: book.id,
//                 title: info.title,
//                 authors: info.authors || ['Невідомий автор'],
//                 description: info.description || 'Опис відсутній.',
//                 release_date: info.publishedDate,
//                 poster_full_url: image, // Використовуємо ту ж назву поля, що і у фільмів, щоб перевикористати BadgeCard!
//                 rating: info.averageRating || 0,
//                 rating_count: info.ratingsCount || 0,
//                 page_count: info.pageCount,
//                 categories: info.categories || []
//             };
//         });

//         res.json({ 
//             results: formattedBooks, 
//             total_results: data.totalItems 
//         });

//     } catch (error) {
//         console.error('Books Search Error:', error);
//         res.status(500).json({ error: 'Помилка пошуку книг' });
//     }
// });



// Ендпоінт для "Популярних книг" на головну (шукаємо, наприклад, популярну художню літературу)
app.get('/getFeaturedBooks', async (req, res) => {
    try {
        const apiKey = process.env.GOOGLE_BOOKS_API_KEY || 'ВАШ_КЛЮЧ'; // Або вставте ключ прямо сюди
        // orderBy=newest дасть свіжі книги
        const url = `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=newest&maxResults=20&langRestrict=uk&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.items) {
            return res.json([]);
        }

        // Мапимо дані так, щоб вони підходили під структуру вашого BadgeCard
        const formattedBooks = data.items.map(book => {
            const info = book.volumeInfo;
            
            // Обробка картинки
            let image = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
            if (image) image = image.replace('http://', 'https://');

            // Обробка категорій (перетворюємо їх у масив об'єктів як у фільмів: [{id, name}])
            const genres = info.categories 
                ? info.categories.map((cat, idx) => ({ id: idx, name: cat })) 
                : [];

            return {
                id: book.id,
                title: info.title,
                // Використовуємо release_date, щоб картка показувала рік
                release_date: info.publishedDate, 
                // Використовуємо poster_full_url, щоб картка показала фото
                poster_full_url: image, 
                // Рейтинг (у Google Books він від 1 до 5, у TMDB до 10. Можна помножити на 2 для краси)
                vote_average: (info.averageRating || 0) * 2, 
                vote_count: info.ratingsCount || 0,
                genres: genres,
                // Додаємо тип, щоб потім знати, куди клікати (на книгу чи фільм)
                media_type: 'book',

                overview: info.description || 'Опис відсутній у попередньому перегляді.'
            };
        });

        res.json(formattedBooks);

    } catch (error) {
        console.error('Featured Books Error:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});




// Отримання детальної інформації про книгу за ID
app.get('/book/:id', async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || ''; 

    try {
        // langRestrict=uk допомагає, але залежить від наявності книги в базі
        const url = `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}&langRestrict=uk`;
        const response = await fetch(url);
        
        if (!response.ok) {
            return res.status(404).json({ error: 'Книгу не знайдено' });
        }

        const data = await response.json();
        const info = data.volumeInfo;
        const access = data.accessInfo; // <--- ВАЖЛИВО: Інформація про доступ

        let image = info.imageLinks?.extraLarge || info.imageLinks?.large || info.imageLinks?.medium || info.imageLinks?.thumbnail || null;
        if (image) {
            image = image.replace('http://', 'https://');
            image = image.replace('&edge=curl', ''); 
        }

        const bookData = {
            id: data.id,
            title: info.title,
            subtitle: info.subtitle,
            authors: info.authors || ['Невідомий автор'],
            description: info.description ? info.description.replace(/<[^>]+>/g, '') : 'Опис відсутній.',
            publishedDate: info.publishedDate,
            pageCount: info.pageCount,
            categories: info.categories || [],
            rating: info.averageRating || 0,
            ratingCount: info.ratingsCount || 0,
            poster_full: image,
            language: info.language,
            
            // --- НОВІ ПОЛЯ ДЛЯ ЧИТАННЯ ---
            previewLink: info.previewLink, // Посилання на сторінку книги
            webReaderLink: access.webReaderLink, // Посилання на "читалку"
            viewability: access.viewability, // NO_PAGES, PARTIAL, ALL_PAGES
            isEbook: data.saleInfo?.isEbook // Чи є це електронною книгою
        };

        res.json(bookData);

    } catch (error) {
        console.error('Book Detail Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});















// УНІВЕРСАЛЬНИЙ ПОШУК КНИГ
app.get('/books/search', async (req, res) => {
    let { query, source, genre, page } = req.query;

    query = query || '';
    source = source || 'google';
    genre = genre || 'all';
    
    // --- ЗМІНИ ТУТ ---
    const pageNum = parseInt(page) || 1;
    const limit = 40; // Вантажимо по 40 книг (максимум Google)
    const startIndex = (pageNum - 1) * limit; // Зсув: 0, 40, 80...

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || ''; 
    let effectiveQuery = query.trim() === '' ? 'fiction' : query;

    console.log(`---> Batch: ${pageNum}, Offset: ${startIndex}, Limit: ${limit}`);

    try {
        let results = [];

        // GOOGLE BOOKS
        if (source === 'google') {
            let qParam = encodeURIComponent(effectiveQuery);
            if (genre && genre !== 'all') {
                qParam += `+subject:${genre}`;
            }

            const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=${qParam}&startIndex=${startIndex}&maxResults=${limit}&langRestrict=uk&key=${apiKey}`;
            
            const response = await fetch(googleUrl);
            if (!response.ok) throw new Error(`Google API Error: ${response.statusText}`);
            const data = await response.json();
            const items = data.items || [];

            results = items.map(book => {
                const info = book.volumeInfo;
                let image = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
                if (image) image = image.replace('http://', 'https://');
                return {
                    id: book.id,
                    title: info.title,
                    release_date: info.publishedDate,
                    poster_full_url: image,
                    vote_average: (info.averageRating || 0) * 2,
                    genres: info.categories ? info.categories.slice(0, 2).map((c, i) => ({id: i, name: c})) : [],
                    overview: info.description || 'Опис відсутній.',
                    media_type: 'book_google'
                };
            });
        }
        
        // OPEN LIBRARY
        else if (source === 'ol') {
            let olUrl = `https://openlibrary.org/search.json?limit=${limit}&offset=${startIndex}`;
            olUrl += `&q=${encodeURIComponent(effectiveQuery)}`;
            
            if (genre && genre !== 'all') {
                olUrl += `&subject=${encodeURIComponent(genre.toLowerCase())}`;
            }
            if (effectiveQuery === 'fiction') {
                olUrl += `&sort=editions`;
            }

            const response = await fetch(olUrl);
            if (!response.ok) throw new Error(`OL API Error: ${response.statusText}`);
            const data = await response.json();
            const docs = data.docs || [];

            results = docs.map(book => {
                const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null;
                return {
                    id: book.key.replace('/works/', ''),
                    title: book.title,
                    release_date: book.first_publish_year ? book.first_publish_year.toString() : 'N/A',
                    poster_full_url: coverUrl,
                    vote_average: book.ratings_average ? parseFloat(book.ratings_average.toFixed(1)) * 2 : 0,
                    genres: book.subject ? book.subject.slice(0, 2).map((s, i) => ({ id: i, name: s })) : [],
                    overview: book.first_sentence ? book.first_sentence[0] : 'Класична література.',
                    media_type: 'book_ol'
                };
            });
        }

        res.json({ results });

    } catch (error) {
        console.error('SEARCH ERROR:', error);
        res.json({ results: [], error: error.message });
    }
});


















// Open Library API usage
app.get('/getOpenLibraryBooks', async (req, res) => {
    try {
        const url = `https://openlibrary.org/search.json?subject=fiction&sort=editions&first_publish_year:[2023 TO 2026]&limit=20`;
        const response = await fetch(url);
        const data = await response.json();

        const formattedBooks = data.docs.map(book => {
            const olId = book.key.replace('/works/', '');
            const coverUrl = book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null;

            return {
                id: olId,
                title: book.title,
                release_date: book.first_publish_year ? book.first_publish_year.toString() : 'N/A',
                poster_full_url: coverUrl,
                vote_average: book.ratings_average ? parseFloat(book.ratings_average.toFixed(1)) * 2 : 0,
                genres: book.subject ? book.subject.slice(0, 3).map((s, i) => ({ id: i, name: s })) : [],
                media_type: 'book_ol',

                // --- ВИПРАВЛЕННЯ ТУТ: OL дає лише перше речення в пошуку ---
                overview: book.first_sentence ? book.first_sentence[0] : 'Класична література (Опис доступний при кліку).'
            };
        });
        res.json(formattedBooks);
    } catch (error) {
        console.error('Open Library Error:', error);
        res.json([]);
    }
});

// 4. ДЕТАЛІ: Open Library
app.get('/book/ol/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const workUrl = `https://openlibrary.org/works/${id}.json`;
        const workRes = await fetch(workUrl);
        if (!workRes.ok) return res.status(404).json({ error: 'Not found' });
        const workData = await workRes.json();

        // Автор
        let authorName = 'Unknown';
        if (workData.authors?.length > 0) {
            const authorRes = await fetch(`https://openlibrary.org${workData.authors[0].author.key}.json`);
            const authorData = await authorRes.json();
            authorName = authorData.name;
        }

        // Опис
        let description = 'Опис відсутній.';
        if (typeof workData.description === 'string') description = workData.description;
        else if (workData.description?.value) description = workData.description.value;

        const image = workData.covers?.length > 0 ? `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg` : null;

        res.json({
            id: id,
            title: workData.title,
            authors: [authorName],
            description: description,
            publishedDate: workData.first_publish_date,
            poster_full: image,
            categories: workData.subjects || [],
            previewLink: `https://openlibrary.org/works/${id}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



app.listen(3001, () => console.log("API running on http://localhost:3001"));
