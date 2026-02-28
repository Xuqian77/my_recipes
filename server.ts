import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("recipes.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    difficulty INTEGER DEFAULT 3,
    time_minutes INTEGER,
    flavor TEXT,
    image_data TEXT,
    video_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: Check if image_data exists, if not add it (for users who had the old version)
try {
  db.prepare("SELECT image_data FROM recipes LIMIT 1").get();
} catch (e) {
  try {
    db.exec("ALTER TABLE recipes ADD COLUMN image_data TEXT");
    console.log("Added image_data column to recipes table");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.get("/api/recipes", (req, res) => {
    const recipes = db.prepare("SELECT * FROM recipes ORDER BY created_at DESC").all();
    res.json(recipes);
  });

  app.get("/api/recipes/:id", (req, res) => {
    const recipe = db.prepare("SELECT * FROM recipes WHERE id = ?").get(req.params.id);
    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({ error: "Recipe not found" });
    }
  });

  app.post("/api/recipes", (req, res) => {
    const { name, ingredients, instructions, difficulty, time_minutes, flavor, image_data, video_url } = req.body;
    const info = db.prepare(`
      INSERT INTO recipes (name, ingredients, instructions, difficulty, time_minutes, flavor, image_data, video_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, ingredients, instructions, difficulty, time_minutes, flavor, image_data, video_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/recipes/:id", (req, res) => {
    const { name, ingredients, instructions, difficulty, time_minutes, flavor, image_data, video_url } = req.body;
    db.prepare(`
      UPDATE recipes 
      SET name = ?, ingredients = ?, instructions = ?, difficulty = ?, time_minutes = ?, flavor = ?, image_data = ?, video_url = ?
      WHERE id = ?
    `).run(name, ingredients, instructions, difficulty, time_minutes, flavor, image_data, video_url, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/recipes/:id", (req, res) => {
    db.prepare("DELETE FROM recipes WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
