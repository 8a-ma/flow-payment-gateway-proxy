const express = require('express');
const router = express.Router();



module.exports = (container) => {
    router.get('/status', (req, res) => res.status(204).end());

    router.post('/payment/create', async (req, res) => {
        const { flow, redis, crypto } = container;
        const paymentPayload = { apiKey: flow.apiKey, ...req.body};

        const toSign = Object.keys(paymentPayload)
            .sort()
            .map(key => key + paymentPayload[key])
            .join('')
            
        paymentPayload["s"] = crypto.sign(toSign, flow.secretKey);

        const response = await fetch(`${flow.apiUrl}/payment/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(paymentPayload).toString()
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error("Flow API rejection");
            error.status = response.status;
            error.detail = data;

            throw error;
        }

        if (data.token) await redis.saveValue(token);
    });

    return router;
}