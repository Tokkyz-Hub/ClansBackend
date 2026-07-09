const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Piccola rotta di comodo per verificare rapidamente da browser che il
// servizio sia sveglio e che il token sia configurato (senza esporlo).
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    hasToken: Boolean(process.env.CLASH_TOKEN),
  });
});

// ROTTA UNIVERSALE PROXY
app.get("/proxy", async (req, res) => {
  let endpoint = req.query.endpoint;

  if (!endpoint || typeof endpoint !== "string") {
    return res.status(400).json({ error: "Parametro 'endpoint' mancante" });
  }

  // Un endpoint deve sempre iniziare con "/", altrimenti la concatenazione
  // sotto produrrebbe un URL malformato.
  if (!endpoint.startsWith("/")) {
    endpoint = `/${endpoint}`;
  }

  // IMPORTANTISSIMO: qualunque "#" grezzo rimasto nella stringa va convertito
  // in "%23" PRIMA di costruire l'URL. Se un "#" arriva non codificato,
  // Node/Axios lo interpretano come inizio di un fragment e troncano
  // silenziosamente tutto ciò che segue (es. "/clans/#2ABC/currentwar"
  // diventerebbe solo "/clans/", perdendo il resto della richiesta).
  // Usiamo una regex globale (non .replace singolo) per coprire anche il
  // caso — raro ma possibile con i tag di guerra CWL — in cui compaiano
  // più occorrenze nello stesso endpoint.
  endpoint = endpoint.replace(/#/g, "%23");

  const urlCompleto = `https://cocproxy.royaleapi.dev/v1${endpoint}`;

  if (!process.env.CLASH_TOKEN) {
    console.error("CLASH_TOKEN non configurato sul server.");
    return res.status(500).json({
      reason: "missingToken",
      message: "Il server non ha un CLASH_TOKEN configurato.",
    });
  }

  try {
    const response = await axios.get(urlCompleto, {
      headers: {
        Authorization: `Bearer ${process.env.CLASH_TOKEN}`,
      },
      timeout: 15000, // evita richieste appese all'infinito
    });
    res.json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const body = err.response?.data || { message: err.message };
    // Log lato server: fondamentale per capire dai log di Render cosa
    // sta effettivamente fallendo (endpoint richiesto + risposta upstream).
    console.error(`[proxy] ${urlCompleto} -> ${status}`, body);
    res.status(status).json(body);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Proxy universale avviato sulla porta ${PORT}`));