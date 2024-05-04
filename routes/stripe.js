const express = require("express");
const { createCheckoutSession } = require("../controllers/checkoutcontroller")

const router = express.Router();

router.post("/create-checkout-session", createCheckoutSession);

module.exports = router