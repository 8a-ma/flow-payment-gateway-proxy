// src/main.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const container = require('./infrastructure/container');
const routes = require('./interface/routes');

const app = express();

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

app.use('/v1', routes(container));

const PORT = process.env.PORT || 8080;

(
    async () => {
        try {
            await container.redis.connect();
            app.listen(PORT, () => {
                console.log(`[${process.env.APP_NAME || 'Proxy'}] on port ${PORT}`);
            });
        } catch (err) {
            console.log("Critical failure at the start:", err);
            process.exit(1);
        }
    }
)();