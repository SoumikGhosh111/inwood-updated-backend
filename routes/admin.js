const express = require("express");
const protect = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");
const { getAllUsers, deleteUser, getAdmin } = require("../controllers/admin");

const router = express.Router();

router.get("/alluser", getAllUsers); //verifyAdmin, protect,
router.delete("/deleteUser/:id", deleteUser); //verifyAdmin, protect,
router.get("/isAdmin/:email", getAdmin); // verifyAdmin,  protect,

module.exports = router;