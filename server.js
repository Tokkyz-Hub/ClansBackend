const express = require("express");
const axios = require("axios");
const cors = require("cors"); // <-- Questa è la riga che mancava!
require("dotenv").config();

const app = express();

// Abilita i CORS per permettere alla tua app di comunicare con il server
app.use(cors());
app.use(express.json());

// ROTTA UNIVERSALE PROXY
app.get("/proxy", async (req, res) => {
    try {
        const endpoint = req.query.endpoint;

        if (!endpoint) {
            return res.status(400).json({ error: "Parametro 'endpoint' mancante" });
        }

        // Uniamo il proxy con /v1 fisso e l'endpoint inviato dall'app
        const urlCompleto = `https://cocproxy.royaleapi.dev/v1${endpoint}`;

        const response = await axios.get(urlCompleto, {
            headers: {
                Authorization: `Bearer ${process.env.CLASH_TOKEN}`
            }
        });

        res.json(response.data);

    } catch (err) {
        res.status(err.response?.status || 500).json(err.response?.data || err.message);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Proxy universale avviato sulla porta ${PORT}`));