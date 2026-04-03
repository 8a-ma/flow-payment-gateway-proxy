// src/main.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const hmac = require('node:crypto');

const app = express();

// Middlewares de seguridad y logs
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

const PORT = process.env.PORT || 8080; // Prioriza la variable de entorno
const APP_NAME = process.env.APP_NAME || 'Flow Proxy';
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY;
const FLOW_API_KEY = process.env.FLOW_API_KEY;
const FLOW_API_URL = process.env.FLOW_API_URL;

app.get('/v1/status', (req, res) => {
    res.status(204).end()
})


app.post('/v1/payment/create', async (req, res) => {

    try {
        const paymentPayload = {
            apiKey: FLOW_API_KEY,
            ...req.body
        };

        const keys = Object.keys(paymentPayload);
        keys.sort();

        let toSign = "";

        for (const key of keys) {
            toSign += key + paymentPayload[key];
        }

        const signature = hmac
            .createHmac("sha256", FLOW_SECRET_KEY)
            .update(toSign)
            .digest("hex");
        
        paymentPayload["s"] = signature;

        const body = new URLSearchParams(paymentPayload).toString();

        const response = await fetch(`${FLOW_API_URL}/payment/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: "Error from the Flow API",
                detail: data
            });
        }

        res.json(data);
    } catch (error) {
        console.log("Error on Flow Payment Create:", error);

        res.status(500).json({
            error: "Internal Server Error",
            message: error.message
        })
    }

});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});