const express = require("express");
const protect = require("../middleware/authMiddleware");
const { createFood, getAllFoods, getFoodById, foodByCatagory } = require("../controllers/product");
router = express.Router();

router.post("/addfood", createFood)
router.get("/getAllFood/:catagory", getAllFoods)
router.get("/getFood/:id", getFoodById)
// router.get("/foodByCatagory/:catagory", foodByCatagory)

module.exports = router;