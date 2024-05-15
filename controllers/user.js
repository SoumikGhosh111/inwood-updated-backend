const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const nodemailer = require("nodemailer")
const otpGenerator = require("otp-generator")
const { Order } = require("../models/Order"); 
require('dotenv').config();


const registerController = async (req, res) =>{
    try{
        const existingUser = await User.findOne({email: req.body.email});
        if(existingUser){
            return res.status(200).send({
                message: "User already exist",
                success: false,
            })
        }

        const password = req.body.password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)
        req.body.password = hashPassword;

        const confrimPassword = await bcrypt.hash(req.body.passwordConfirm, salt);

        const otp = otpGenerator.generate(6, {
            digits: true,
            upperCase: false,
            specialChars: false,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
        });
        

        req.body.passwordConfirm = confrimPassword
        if(req.body.password === req.body.passwordConfirm){
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm,
                otp: otp,
            });
            await newUser.save();

            const token = jwt.sign({id : newUser._id}, process.env.JWT_SECRET, {
                expiresIn: "1d",
            })
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.GMAIL_USERNAME,
                    pass: process.env.GMAIL_PASS
                },
            });

            const mailOptions = {
                from: " Inwood Pizza Shop",
                to: req.body.email,
                subject: "OTP for Email verification",
                text: ` Your Verify OTP is ${otp}`
            };

            transporter.sendMail(mailOptions), (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).send({
                        message: "Error sending email",
                        success: false,
                    });
                }
            }
            return res.status(201).send({
                message: "Register Successfully. OTP Sent to email",
                success: true,
                data: {
                    user: newUser,
                    token,
                },
            });
        }
        else{
            return res.status(201).send({
                message: "Password not Match",
                success: false,
            });
        }
    } catch (error){
        console.log(error);
        return res.status(500).send({
            message: "Register error",
            success: false
        });
    }
};

const authController = async (req, res) => {
    try {
        const user = await User.findOne({_id: req.body.userId});
        if(!user){
            return res.status(200).send({
                message: "user not found",
                success: false,
            })
        } else{
            console.log(user);
            return res.status(200).send({
                message: "Register Successfully",
                data: {
                    user,
                },
                success: true,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Auth error",
        });
    }
};

const loginController = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).select(
            "+password"
        );
        if (!user) {
            return res.status(200).send({
                message: "User not found",
                success: false,
            });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(500).send({
                success: false,
                message: "Invalid Password",
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        return res.status(201).send({
            message: "Login Successfully",
            data: {
                user,
                token,
            },
            success: true,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Authentication error",
        });
    }
};

const verifyOTPController = async (req, res) => {
    console.log("hello"); 
    try {
        const user = await User.findOne({ email: req.body.email });

        if (user.otp === req.body.combineOtp) {
            user.isVerified = true;
            await user.save();
            return res.status(200).send({
                success: true,
                message: `OTP verified`,
            });
        } else {
            return res.status(200).send({
                success: false,
                message: `Invalid OTP`,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: `Failed to verify OTP`,
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const {name,profileImg,userId,zipCode,country,state,city,street} = req.body;

        const user =await User.findById(userId);
        if(!user){
            return res.status(200).send({
                message: "User Not Found!",
                success: false
            });
        }

        user.name = name || user.name
        user.profileImg = profileImg || user.profileImg
        user.street = street || user.street,
        user.country = country || user.country
        user.city = city || user.city
        user.state = state || user.state
        user.zipCode = zipCode || user.zipCode
        
        await user.save();
        return res.status(201).send({
            success: true,
            message: "Profile Updated Succesfully",
        });
    } catch (error) {
        console.log(error);
        res.status(200).send({
            success: false,
            message: "User error",
        });
    }
}
const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        
        const userDetails = await User.findOne({ email });

        if (!userDetails) {
            return res.status(404).json({
                error: "User not found",
                success: false
            });
        }

        res.status(200).json({
            message: "User Details",
            success: true,
            data: {
                user: userDetails 
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Internal Server Error",
            success: false,
        });
    }
};
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user with the provided email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate OTP
        const generateOtp = otpGenerator.generate(6, { digits: true, upperCase: false, specialChars: false });

        // Update user record with OTP
        user.passwordResetOTP = generateOtp;
        await user.save();

        // Send OTP to user's email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.GMAIL_USERNAME,
                pass: process.env.GMAIL_PASS
            },
        });

        const mailOptions = {
            from: process.env.GMAIL_USERNAME,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${generateOtp}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Failed to send OTP' });
            }
            return res.status(200).json({ message: 'OTP sent to your email' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Check if OTP matches
        if (user && user.passwordResetOTP === otp) {
            return res.status(200).json({ message: 'OTP verified successfully', userId: user._id });
        } else {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const changePassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });    
         }
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserOrders = async (req, res) => {
    const { userId } = req.params;
    try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 }); 
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports = {registerController, authController, loginController, verifyOTPController, updateUserProfile,getUserByEmail, sendOtp, verifyOTP, changePassword, getUserOrders};