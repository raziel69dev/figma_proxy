const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// Разрешаем CORS для всех (важно для плагина Figma)
app.use(cors());
app.use(express.json());

let requestCount = 0;
const startTime = Date.now();

// --- BASIC STATUS ---
app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

// --- SERVER STATUS ---
app.get("/status", (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  res.json({
    status: "online",
    uptime_seconds: uptimeSeconds,
    requests: requestCount
  });
});

// --- ROOT ---
app.get("/", (req, res) => {
  res.json({
    ok: true,
    msg: "Proxy server is running",
    endpoints: {
      ping: "/ping",
      status: "/status",
      proxy_image: "/img?url=YOUR_IMAGE_URL"
    }
  });
});

// --- IMAGE PROXY ---
app.get("/img", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "url param is missing" });
  }

  requestCount++;

  try {
    // Скачиваем картинку как буфер байтов
    const response = await axios.get(url, {
      responseType: "arraybuffer", // Обязательно для картинок
      timeout: 15000, // Тайм-аут 15 сек
      headers: {
        // Притворяемся браузером, чтобы сайты не блокировали запрос
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    // Передаем тот тип контента, который вернул исходный сервер (jpg, png и т.д.)
    const contentType = response.headers["content-type"] || "image/jpeg";
    res.set("Content-Type", contentType);
    
    // Отправляем данные картинки
    res.send(response.data);

  } catch (err) {
    console.error("Proxy error:", err.message);
    // Если ошибка, возвращаем JSON с описанием
    res.status(500).json({
      error: "failed to fetch image",
      details: err.message
    });
  }
});

// --- GENERIC PROXY ---
app.get("/proxy", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "url param is missing" });
  }

  requestCount++;

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
      }
    });

    const contentType = response.headers["content-type"] || "application/octet-stream";
    res.set("Content-Type", contentType);
    res.send(response.data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({
      error: "failed to fetch url",
      details: err.message
    });
  }
});

// --- START SERVER ---
// Render выдает порт через process.env.PORT, иначе используем 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Proxy running on port", PORT);
});
