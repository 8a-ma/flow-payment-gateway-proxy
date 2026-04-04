const express = require('express');
const router = express.Router();
const authMiddleware = require('./authMiddleware');

module.exports = (container) => {
    router.use(express.urlencoded({ extended: true }));

    router.get('/status', (req, res) => res.status(204).end());

    router.post('/payment/create', authMiddleware, async (req, res) => {
        const { flow, redis, crypto } = container;
        const paymentPayload = {
            apiKey: flow.apiKey,
            urlConfirmation: `${proxy.proxyUrl}/v1/payment/confirmation`,
            ...req.body
        };

        const toSign = Object.keys(paymentPayload)
            .sort()
            .map(key => key + paymentPayload[key])
            .join('')
            
        const signature = crypto.sign(toSign, flow.secretKey);
        paymentPayload["s"] = signature;

        const response = await fetch(`${flow.apiUrl}/payment/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(paymentPayload).toString()
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error("Flow API rejection payout order");
            error.status = response.status;
            error.detail = data;

            throw error;
        }

        if (data.token) await redis.saveToken(token, signature);

        res.json(data);
    });

    router.post('/payment/confirmation', async (req, res) => {
        const { redis, flow, crypto } = container;
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: "No token provided by Flow" });
        }

        const savedSignature = await redis.getValue(token);

        if (!savedSignature) {
            console.error(`Token ${token} not found or expired in Redis`);
            return res.status(404).json({ error: "Token expired or invalid" });
        }

        const params = new URLSearchParams({
            apiKey: flow.apiKey,
            token: token,
            s: savedSignature
        });

        const response = await fetch(`${flow.apiUrl}/payment/getStatus?${params.toString()}`, {
            method: 'GET'
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error("Flow API rejection: get status");
            error.status = response.status;
            error.detail = data;
            throw error;
        }
        
        await redis.updateValue(token, JSON.stringify(data));


        res.json({status: "ok"});

    });

    router.get('/payment/status/:token', authMiddleware, async (req, res) => {
        const { redis } = container;
        const { token } = req.params;

        const rawData = await redis.getValue(token);

        if (!rawData) {
            return res.status(404).json({
                error: "Not Found",
                message: "Token expired or doesn't exist"
            });
        }

        let parsedData;

        try {
            parsedData = JSON.parse(rawData);
        } catch (e) {
            parsedData = rawData;
        }

        res.status(200).json({
            status: "ok",
            data: parsedData
        });
    });

    return router;
}