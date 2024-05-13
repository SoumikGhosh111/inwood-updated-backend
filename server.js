const express = require('express');
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/product');
const adminRoutes = require("./routes/admin")
const imageRoutes = require('./routes/image')
const stripeRoutes = require('./routes/stripe')
const invoiceRoutes = require('./routes/invoice');
const cors = require("cors")

const app = express();
dotenv.config();

// Middleware
app.use(bodyParser.json({ limit: "3mb" }));
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/product', productRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/invoice', invoiceRoutes); 

// Admin Routes
app.use('/admin', adminRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
