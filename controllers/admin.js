const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const User = require("../models/User"); 
const { Order } = require("../models/Order");
require('dotenv').config();


const getAllUsers = async(req, res) => {
    try {
        const user = await User.find({})
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

const deleteUser = async(req, res) => {
    const userId = req.params.id;
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        // if user not found
        if(!deletedUser){
            return res.status(404).json({message: "user not found!"});
        }
        res.status(200).json({message: "User Deleted Successfully!"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

// get admin
const getAdmin = async (req, res) => {
    const email = req.params.email;
    const query = {email: email};
    try {
        const user = await User.findOne(query);
        // console.log(user)
        if(email !== req.decoded.email){
            return res.status(403).send({message: "Forbidden access"})
        }
        let admin = false;
        if(user ){
            admin = user?.role === "admin";
        }
        res.status(200).json({admin})
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

 const orderStatusController = async (req, res) => {
    try {
      const { orderId } = req.params;
      const { delivery_status } = req.body;
      const orders = await Order.findByIdAndUpdate(
        orderId,
        { delivery_status },
        { new: true }
      );
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error While Updateing Order",
        error,
      });
    }
  };

module.exports = {
    getAllUsers,
    deleteUser,
    getAdmin,
    orderStatusController
}