const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Usiamo una RegEx pura (.*) che cattura TUTTO quello che viene dopo la barra iniziale
app.get("/proxy", async (req, res) => {
    try {
        // req.params[0] conterrà l'intero percorso (es. "players/%23TAG" o "clans/%23TAG")
        const endpoint = req.query.endpoint;
        
        if (!endpoint) {
            return res.status(400).json({ error: "Parametro 'endpoint' mancante" });
        }

        const response = await axios.get(
            `https://cocproxy.royaleapi.dev/v1${endpoint}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CLASH_TOKEN}`
                }
            }
        );

        res.json(response.data);

    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || err.message);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));