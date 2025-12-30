import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


// Loading API key
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_temporary_key_123";

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

// Middleware для захисту роутів (перевіряє токен)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};



// Middleware: Перевірка, чи юзер є адміном (ОГОЛОШУЄМО ТІЛЬКИ ТУТ)
const checkAdmin = (req, res, next) => {
    // Перевіряємо, чи є роль і чи вона admin
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};


// ==================================================================
// AUTH ROUTES
// ==================================================================

// Проста регулярка для перевірки пошти
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 1. РЕЄСТРАЦІЯ
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Всі поля обов’язкові' });
    }

    // --- НОВА ПЕРЕВІРКА: ВАЛІДАЦІЯ ПОШТИ ---
    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Введіть коректну електронну пошту (наприклад: user@example.com)' });
    }

    // Хешуємо пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Записуємо в БД
    const stmt = db.prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
    const info = stmt.run(name, email, hashedPassword);

    const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ 
        token, 
        user: { id: info.lastInsertRowid, username: name, email } 
    });

  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      if (err.message.includes('users.username')) {
          return res.status(400).json({ error: 'Це ім\'я користувача вже зайняте' });
      }
      if (err.message.includes('users.email')) {
          return res.status(400).json({ error: 'Цей Email вже зареєстрований' });
      }
      return res.status(400).json({ error: 'Користувач з таким Email або іменем вже існує' });
    }
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});
// 2. ВХІД (LOGIN)
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Шукаємо по username
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    
    if (!user) return res.status(400).json({ error: 'Користувача з таким логіном не знайдено' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Невірний пароль' });

    // Генеруємо токен (можна додати сюди role, щоб рідше лазити в БД)
    const token = jwt.sign(
        { id: user.id, role: user.role }, 
        JWT_SECRET, 
        { expiresIn: '30d' }
    );

    res.json({ 
      token, 
      user: { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          avatar: user.avatar_url,
          role: user.role
      } 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 3. ОТРИМАТИ СВОЇ ДАНІ (При оновленні сторінки)
app.get('/auth/me', authenticateToken, (req, res) => {
  try {
    // ВАЖЛИВО: Додаємо avatar_url та role у вибірку
    const user = db.prepare("SELECT id, username, email, avatar_url, role FROM users WHERE id = ?").get(req.user.id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Формуємо об'єкт для фронтенда
    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar_url, // Мапимо avatar_url -> avatar
        role: user.role          // <--- Щоб не губилися права після F5
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ==================================================================
// BOOKMARKS (ЗАКЛАДКИ)
// ==================================================================

// 2. ДОДАТИ В ЗАКЛАДКИ
app.post('/bookmarks', authenticateToken, (req, res) => {
    try {
        const { content_type, content_id, title, poster_path } = req.body;
        const user_id = req.user.id;

        const stmt = db.prepare(`
            INSERT INTO bookmarks (user_id, content_type, content_id, title, poster_path)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        stmt.run(user_id, content_type, String(content_id), title, poster_path);
        res.json({ message: 'Added to bookmarks' });

    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Вже у вибраному' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. ВИДАЛИТИ З ЗАКЛАДОК
app.delete('/bookmarks/:type/:id', authenticateToken, (req, res) => {
    try {
        const { type, id } = req.params;
        const user_id = req.user.id;

        const stmt = db.prepare("DELETE FROM bookmarks WHERE user_id = ? AND content_type = ? AND content_id = ?");
        const result = stmt.run(user_id, type, String(id));

        if (result.changes === 0) return res.status(404).json({ error: 'Bookmark not found' });
        
        res.json({ message: 'Removed from bookmarks' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. ПЕРЕВІРИТИ, ЧИ Є В ЗАКЛАДКАХ (Для зафарбовування сердечка)
app.get('/bookmarks/check/:type/:id', authenticateToken, (req, res) => {
    try {
        const { type, id } = req.params;
        const user_id = req.user.id;

        const bookmark = db.prepare("SELECT id FROM bookmarks WHERE user_id = ? AND content_type = ? AND content_id = ?")
                           .get(user_id, type, String(id));

        res.json({ isBookmarked: !!bookmark }); // Повертає true або false

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. ОТРИМАТИ ВСІ ЗАКЛАДКИ КОРИСТУВАЧА (Для профілю)
app.get('/bookmarks', authenticateToken, (req, res) => {
    try {
        const user_id = req.user.id;
        const bookmarks = db.prepare("SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC").all(user_id);
        res.json(bookmarks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});




// ==================================================================
// COMMENTS (КОМЕНТАРІ)
// ==================================================================


// 2. ОТРИМАТИ КОМЕНТАРІ (з даними користувача)
app.get('/comments/:type/:id', (req, res) => {
    try {
        const { type, id } = req.params;
        // Робимо JOIN, щоб одразу отримати ім'я та аватарку автора коментаря
        const comments = db.prepare(`
            SELECT comments.*, users.username, users.avatar_url 
            FROM comments 
            JOIN users ON comments.user_id = users.id
            WHERE content_type = ? AND content_id = ?
            ORDER BY created_at DESC
        `).all(type, String(id));
        
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. ДОДАТИ КОМЕНТАР
app.post('/comments', authenticateToken, (req, res) => {
    try {
        const { content_type, content_id, text } = req.body;
        const user_id = req.user.id;

        if (!text || !text.trim()) return res.status(400).json({ error: 'Коментар не може бути пустим' });

        const stmt = db.prepare("INSERT INTO comments (user_id, content_type, content_id, text) VALUES (?, ?, ?, ?)");
        const info = stmt.run(user_id, content_type, String(content_id), text);

        // Повертаємо створений коментар (щоб одразу показати на фронті без перезавантаження)
        res.json({ 
            id: info.lastInsertRowid, 
            user_id, 
            content_type, 
            content_id, 
            text, 
            created_at: new Date().toISOString() 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. ВИДАЛИТИ КОМЕНТАР (Тільки свій)
app.delete('/comments/:id', authenticateToken, (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        // Перевіряємо, чи цей коментар належить користувачу
        const comment = db.prepare("SELECT user_id FROM comments WHERE id = ?").get(commentId);
        
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.user_id !== userId) return res.status(403).json({ error: 'Не можна видаляти чужі коментарі' });

        db.prepare("DELETE FROM comments WHERE id = ?").run(commentId);
        res.json({ message: 'Deleted' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});




// ==================================================================
// SETTINGS (НАЛАШТУВАННЯ)
// ==================================================================
// ОНОВЛЕННЯ ПРОФІЛЮ (Аватар, Ім'я)
app.put('/auth/update', authenticateToken, (req, res) => {
    try {
        const { username, avatar_url } = req.body;
        const userId = req.user.id;

        // Оновлюємо дані в базі
        const stmt = db.prepare("UPDATE users SET username = ?, avatar_url = ? WHERE id = ?");
        stmt.run(username, avatar_url, userId);

        // Отримуємо оновленого юзера
        const updatedUser = db.prepare("SELECT id, username, email, avatar_url FROM users WHERE id = ?").get(userId);
        
        // ВАЖЛИВО: Перетворюємо avatar_url -> avatar для фронтенда
        res.json({ 
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                avatar: updatedUser.avatar_url // <-- Ось це виправлення
            } 
        });

    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Це ім\'я вже зайняте' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ЗМІНА ПАРОЛЯ
app.put('/auth/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // 1. Отримуємо поточний хеш пароля
        const user = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(userId);
        
        // 2. Перевіряємо старий пароль
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Старий пароль невірний' });

        // 3. Хешуємо новий
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 4. Оновлюємо
        db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashedNewPassword, userId);

        res.json({ message: 'Пароль успішно змінено' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// ==================================================================
// ADMIN PANEL (МАРШРУТИ ДЛЯ АДМІНКИ)
// ==================================================================



// 1. ОТРИМАТИ СПИСОК ВСІХ КОРИСТУВАЧІВ
app.get('/admin/users', authenticateToken, checkAdmin, (req, res) => {
    try {
        // Вибираємо основні дані про користувачів
        const users = db.prepare("SELECT id, username, email, role, created_at, avatar_url FROM users ORDER BY created_at DESC").all();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. ОТРИМАТИ СПИСОК ВСІХ КОМЕНТАРІВ (Для модерації)
app.get('/admin/comments', authenticateToken, checkAdmin, (req, res) => {
    try {
        const comments = db.prepare(`
            SELECT c.id, c.text, c.created_at, c.content_type, c.content_id, u.username, u.avatar_url
            FROM comments c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
            LIMIT 50
        `).all();
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. ВИДАЛИТИ КОРИСТУВАЧА (Адмінська дія)
app.delete('/admin/users/:id', authenticateToken, checkAdmin, (req, res) => {
    try {
        const targetId = req.params.id;
        if (targetId == req.user.id) {
            return res.status(400).json({ error: 'Не можна видалити самого себе' });
        }
        
        // Видаляємо всі сліди користувача
        db.prepare("DELETE FROM comments WHERE user_id = ?").run(targetId);
        db.prepare("DELETE FROM bookmarks WHERE user_id = ?").run(targetId);
        db.prepare("DELETE FROM friends WHERE sender_id = ? OR receiver_id = ?").run(targetId, targetId);
        db.prepare("DELETE FROM users WHERE id = ?").run(targetId);

        res.json({ message: 'Користувача видалено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. ВИДАЛИТИ КОМЕНТАР (Адмінська дія)
app.delete('/admin/comments/:id', authenticateToken, checkAdmin, (req, res) => {
    try {
        db.prepare("DELETE FROM comments WHERE id = ?").run(req.params.id);
        res.json({ message: 'Коментар видалено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});




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



// ==================================================================
// FRIENDS & PUBLIC PROFILE (ДРУЗІ ТА ПУБЛІЧНІ ПРОФІЛІ)
// ==================================================================

// 2. ОТРИМАТИ ПУБЛІЧНІ ДАНІ КОРИСТУВАЧА (По ID)
app.get('/users/public/:id', (req, res) => {
    try {
        const userId = req.params.id;
        // Беремо тільки безпечні дані (без пароля!)
        const user = db.prepare("SELECT id, username, avatar_url, created_at FROM users WHERE id = ?").get(userId);
        
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Також рахуємо кількість закладок (для статистики)
        const counts = db.prepare(`
            SELECT 
                (SELECT COUNT(*) FROM bookmarks WHERE user_id = ? AND content_type = 'movie') as movie_count,
                (SELECT COUNT(*) FROM bookmarks WHERE user_id = ? AND content_type = 'book') as book_count
        `).get(userId, userId);

        res.json({ ...user, stats: counts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. ОТРИМАТИ ЗАКЛАДКИ КОРИСТУВАЧА (Публічні)
app.get('/bookmarks/public/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        const bookmarks = db.prepare("SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC").all(userId);
        res.json(bookmarks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. СТАТУС ДРУЖБИ (Перевірка + Відправка запиту)
// Перевірити статус
app.get('/friends/status/:targetId', authenticateToken, (req, res) => {
    try {
        const myId = req.user.id;
        const targetId = req.params.targetId;

        // Шукаємо будь-який зв'язок між цими двома
        const relation = db.prepare(`
            SELECT * FROM friends 
            WHERE (sender_id = ? AND receiver_id = ?) 
               OR (sender_id = ? AND receiver_id = ?)
        `).get(myId, targetId, targetId, myId);

        if (!relation) return res.json({ status: 'none' });

        // Якщо запит відправив Я
        if (relation.sender_id === myId) {
            return res.json({ status: relation.status === 'accepted' ? 'friends' : 'request_sent' });
        }
        
        // Якщо запит відправили МЕНІ
        if (relation.receiver_id === myId) {
            return res.json({ status: relation.status === 'accepted' ? 'friends' : 'request_received' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Відправити запит
app.post('/friends/request', authenticateToken, (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        if (senderId == receiverId) return res.status(400).json({ error: 'Не можна додати себе' });

        const stmt = db.prepare("INSERT INTO friends (sender_id, receiver_id) VALUES (?, ?)");
        stmt.run(senderId, receiverId);

        res.json({ message: 'Запит відправлено' });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Запит вже існує' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// ==================================================================
// FRIENDS MANAGEMENT (УПРАВЛІННЯ ДРУЗЯМИ)
// ==================================================================


// 1. ПОШУК КОРИСТУВАЧІВ (за нікнеймом)
app.get('/users/search', authenticateToken, (req, res) => {
    try {
        const { q } = req.query;
        const myId = req.user.id;
        
        if (!q) return res.json([]);

        // Шукаємо схожих, крім себе
        const users = db.prepare(`
            SELECT id, username, avatar_url 
            FROM users 
            WHERE username LIKE ? AND id != ?
            LIMIT 10
        `).all(`%${q}%`, myId);

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 2. ОТРИМАТИ СПИСОК ДРУЗІВ (Вже підтверджених)
app.get('/friends/list', authenticateToken, (req, res) => {
    try {
        const myId = req.user.id;
        // Друг може бути або sender, або receiver, головне що status='accepted'
        const friends = db.prepare(`
            SELECT u.id, u.username, u.avatar_url, f.id as relation_id
            FROM users u
            JOIN friends f ON (u.id = f.sender_id OR u.id = f.receiver_id)
            WHERE (f.sender_id = ? OR f.receiver_id = ?)
            AND f.status = 'accepted'
            AND u.id != ?
        `).all(myId, myId, myId);

        res.json(friends);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 3. ОТРИМАТИ ВХІДНІ ЗАЯВКИ (Мені надіслали)
app.get('/friends/requests/received', authenticateToken, (req, res) => {
    try {
        const myId = req.user.id;
        const requests = db.prepare(`
            SELECT u.id, u.username, u.avatar_url, f.id as relation_id, f.created_at
            FROM users u
            JOIN friends f ON u.id = f.sender_id
            WHERE f.receiver_id = ? AND f.status = 'pending'
        `).all(myId);

        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 4. ОТРИМАТИ ВИХІДНІ ЗАЯВКИ (Я надіслав)
app.get('/friends/requests/sent', authenticateToken, (req, res) => {
    try {
        const myId = req.user.id;
        const requests = db.prepare(`
            SELECT u.id, u.username, u.avatar_url, f.id as relation_id, f.created_at
            FROM users u
            JOIN friends f ON u.id = f.receiver_id
            WHERE f.sender_id = ? AND f.status = 'pending'
        `).all(myId);

        res.json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 5. ПРИЙНЯТИ ЗАЯВКУ
app.post('/friends/accept', authenticateToken, (req, res) => {
    try {
        const { relationId } = req.body;
        const myId = req.user.id;

        // Перевіряємо, чи це дійсно заявка мені
        const request = db.prepare("SELECT * FROM friends WHERE id = ?").get(relationId);
        
        if (!request || request.receiver_id !== myId) {
            return res.status(403).json({ error: 'Немає доступу' });
        }

        db.prepare("UPDATE friends SET status = 'accepted' WHERE id = ?").run(relationId);
        res.json({ message: 'Заявку прийнято' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// 6. ВИДАЛИТИ ДРУГА / ВІДХИЛИТИ / СКАСУВАТИ ЗАЯВКУ
// Цей один роут працює для всіх випадків видалення зв'язку
app.delete('/friends/remove/:relationId', authenticateToken, (req, res) => {
    try {
        const { relationId } = req.params;
        const myId = req.user.id;

        // Перевіряємо, чи я учасник цього зв'язку
        const relation = db.prepare("SELECT * FROM friends WHERE id = ?").get(relationId);
        
        if (!relation || (relation.sender_id !== myId && relation.receiver_id !== myId)) {
            return res.status(403).json({ error: 'Немає доступу' });
        }

        db.prepare("DELETE FROM friends WHERE id = ?").run(relationId);
        res.json({ message: 'Видалено' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
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





// Отримання деталей фільму за ID + Watch Providers
app.get('/movieInfoByID/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const detailsUrl = new URL(`${TMDB_BASE_URL}/movie/${id}`);
        detailsUrl.searchParams.set('language', 'uk-UA');
        detailsUrl.searchParams.set('include_image_language', 'uk,en,null');
        detailsUrl.searchParams.set('include_video_language', 'uk,en');
        detailsUrl.searchParams.set(
            'append_to_response',
            'credits,videos,images,similar,watch/providers'
        );

        const response = await fetch(detailsUrl, getFetchOptions());
        if (!response.ok) throw new Error('TMDB error');

        const data = await response.json();

        // Повні URL картинок
        data.poster_full_url = data.poster_path
            ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
            : null;

        data.backdrop_full_url = data.backdrop_path
            ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
            : null;

        // --- WATCH PROVIDERS ---
        const providersByCountry = data['watch/providers']?.results || {};

        // Пріоритет регіонів
        const regionPriority = ['UA', 'PL', 'US'];
        let selectedProviders = null;

        for (const region of regionPriority) {
            if (providersByCountry[region]) {
                selectedProviders = {
                    ...providersByCountry[region],
                    region,
                };
                break;
            }
        }

        data.watch_providers = selectedProviders;
        delete data['watch/providers'];

        res.json(data);

    } catch (err) {
        console.error(err);
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
