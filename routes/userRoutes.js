const express = require("express");
const {registerController, authController, loginController, verifyOTPController, updateUserProfile, changePassword, verifyOTP, sendOtp} = require("../controllers/user");
const protect = require("../middleware/authMiddleware");
router = express.Router();

router.post("/register",registerController)
router.post("/get-user",protect,authController)
router.post("/login",loginController)
router.post("/otpVerify",verifyOTPController)
router.put("/update",updateUserProfile)
router.post('/sendOtp', sendOtp);
router.post('/verifyOtp', verifyOTP);
router.post('/changePassword', changePassword);

module.exports = router;