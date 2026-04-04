const express = require('express');
const router = express.Router();



module.exports = (container) => {
    router.get('/status', (req, res) => res.status(204).end());

    router.post('/payment/create', async (req, res) => {
        try {
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

            if (!response.ok) return res.status(response.status).json({error: "Flow API Error", detail: data});

            if (data.token) {
                await redis.saveValue(token);
            }

            res.json(data);
        } catch (error) {
            res.status(500).json({error: "Internal Server Error", message: error.message});
        }
    });

    return router;
}