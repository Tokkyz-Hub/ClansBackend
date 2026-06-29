const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.get("/player/:tag", async (req, res) => {
    try {
        const tag = encodeURIComponent("#" + req.params.tag.replace("#", ""));

        const response = await axios.get(
            `https://cocproxy.royaleapi.dev/v1/players/${tag}`,
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
