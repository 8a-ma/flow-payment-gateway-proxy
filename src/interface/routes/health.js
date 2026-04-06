const express = require('express');
const router = express.Router();

router.get('/health/status', (req, res) => res.status(204).end());

