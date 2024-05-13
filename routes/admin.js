const express = require("express");
const protect = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");
const { getAllUsers, deleteUser, getAdmin, orderStatusController } = require("../controllers/admin");

const router = express.Router();

router.get("/alluser", getAllUsers); //verifyAdmin, protect,
router.delete("/deleteUser/:id", deleteUser); //verifyAdmin, protect,
router.get("/isAdmin/:email", getAdmin); // verifyAdmin,  protect,
router.put(
    "/order-status/:orderId",
    // requireSignIn,
    // isAdmin,
    orderStatusController
  );

module.exports = router;