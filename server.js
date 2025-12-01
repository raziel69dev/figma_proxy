const express = require("express");
const cors = require("cors");
const axios = require("axios").default;

const app = express();
app.use(cors());

app.get("/img", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("no url");

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer"
    });

    res.set("Content-Type", "image/jpeg");
    res.send(response.data);

  } catch (err) {
    res.status(500).send("download error");
  }
});

// Render fix
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("proxy running on " + PORT));
