const express = require('express');
const router = express.Router();
const { generateInvoice } = require('../controllers/invoice');

// Route to generate and download an invoice
router.get('/pdf/:orderId', generateInvoice);

module.exports = router;