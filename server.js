const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json()); // Permette al server di leggere dati JSON inviati dall'app

// ROTTA UNIVERSALE PROXY
app.get("/proxy", async (req, res) => {
    try {
        // L'app invia l'endpoint specifico nei parametri della richiesta (es. ?endpoint=/v1/clans/%23ABC123)
        const endpoint = req.query.endpoint;

        if (!endpoint) {
            return res.status(400).json({ error: "Parametro 'endpoint' mancante" });
        }

        // Uniamo il proxy di RoyaleAPI con l'endpoint richiesto dall'app
        const urlCompleto = `https://cocproxy.royaleapi.dev${endpoint}`;

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