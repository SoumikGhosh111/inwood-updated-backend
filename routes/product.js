const express = require("express");
const protect = require("../middleware/authMiddleware");
const { createFood, getAllFoods, getFoodById } = require("../controllers/product");
router = express.Router();

router.post("/addfood", createFood)
router.get("/getAllFood", getAllFoods)
router.get("/getFood/:id", getFoodById)

module.exports = router;