const express = require("express");
const axios = require("axios");
const cors = require("cors"); // <-- Questa è la riga che mancava!
require("dotenv").config();

const app = express();

// Abilita i CORS per permettere alla tua app di comunicare con il server
app.use(cors());
app.use(express.json());

// ROTTA UNIVERSALE PROXY
// ROTTA UNIVERSALE PROXY (CORRETTA)
app.get("/proxy", async (req, res) => {
    try {
        let endpoint = req.query.endpoint;

        if (!endpoint) {
            return res.status(400).json({ error: "Parametro 'endpoint' mancante" });
        }

        // Se Express ha trasformato il %23 in un #, noi lo ritrasformiamo in %23 per Axios
        if (endpoint.includes("#")) {
            endpoint = endpoint.replace("#", "%23");
        }

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