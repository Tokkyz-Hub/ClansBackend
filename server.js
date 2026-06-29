const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.get("/:endpoint*", async (req, res) => {
    try {
        // Recupera l'endpoint completo combinando il primo parametro con il resto della rotta catturata
        const endpoint = req.params.endpoint + (req.params[0] || "");
        
        // Mantiene intatti eventuali parametri di ricerca (es. ?name=ClanName)
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';

        const response = await axios.get(
            `https://cocproxy.royaleapi.dev/v1/${endpoint}${queryString}`,
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
app.listen(PORT, () => console.log("Server avviato"));
