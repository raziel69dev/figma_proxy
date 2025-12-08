// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
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

// --- IMAGE PROXY ---
app.get("/img", async (req, res) => {
  const url = req.query.url;
  requestCount++;

  if (!url) {
    return res.status(400).json({ error: "url param is missing" });
  }

  try {
    const img = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      }
    });

    res.set("Content-Type", img.headers["content-type"] || "image/jpeg");
    res.send(img.data);

  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({
      error: "failed to fetch image",
      details: err.message
    });
  }
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

// --- START SERVER ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Proxy running on port", PORT);
});
