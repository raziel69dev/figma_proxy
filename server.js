const express = require('express');
const fetch = require('node-fetch'); // Если используете Node < 18. В Node 18+ fetch встроен.
const app = express();
const PORT = process.env.PORT || 3000;

// 1. САМОЕ ВАЖНОЕ: Middleware для CORS
app.use((req, res, next) => {
    // Разрешаем запросы с ЛЮБОГО источника (включая Figma plugin)
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    next();
});

app.get('/img', async (req, res) => {
    const imageUrl = req.query.url;

    if (!imageUrl) {
        return res.status(400).send('URL is required');
    }

    try {
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // 2. Передаем тип контента (image/jpeg, image/png и т.д.)
        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType);

        // 3. Отправляем картинку как поток байтов
        response.body.pipe(res);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching image');
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
