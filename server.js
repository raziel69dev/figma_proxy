import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

// Разрешаем CORS
app.use(cors());
app.use(express.json());

app.get('/image', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("No URL provided");

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).send("Failed to fetch image");
    }

    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");

    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error(err);
    return res.status(500).send("Proxy error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
