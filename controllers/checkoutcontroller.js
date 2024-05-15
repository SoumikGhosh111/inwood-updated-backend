const Stripe = require("stripe");
const { Order } = require("../models/Order");
require("dotenv").config();
const zlib = require('zlib');

const stripe = Stripe(process.env.STRIPE_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    
  const { cartData, amount, userData } = req.body.data;
  const compressedCartData = zlib.gzipSync(JSON.stringify(cartData)).toString('base64');
    const customer = await stripe.customers.create({
      metadata: {
        userId: userData.userId,
        cartData: compressedCartData,
      },
    });
    const unitAmount = Math.round(amount.total * 100);


    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [ 
        { 
          price_data: { 
            currency: "usd",
            product_data: { 
              name: "Total Amount", 
            }, 
            unit_amount: unitAmount, 
          }, 
          quantity: 1,
        }
      ], 
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      // shipping_options: shippingOptions,
      phone_number_collection: {
        enabled: true,
      },
      mode: "payment",
      customer: customer.id,
      success_url: `${process.env.CLIENT_URL}/checkout-success`,
      cancel_url: `${process.env.CLIENT_URL}/checkout`,
    });

    // Send the URL of the checkout session to the client
    res.send({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};

// const cartDataPrint = (cartToData) =>{
//   console.log("bbdbdbhbdbhhbdf",cartToData);
// }

const createOrder = async (customer, data) => {
  try {
    // Parse the compressed cartData from customer metadata
    const compressedCartData = customer.metadata.cartData;
    const decompressedCartData = zlib.gunzipSync(Buffer.from(compressedCartData, 'base64')).toString();

    // Parse the decompressed cartData
    const Items = JSON.parse(decompressedCartData);
    console.log("Parsed cart items:", Items);

    // Rest of your code remains the same...
    const products = Items.map((item) => {
      // Extract topping names from each topping object, or show "No description" if no toppings are available
      const toppingNames = item.toppings.length > 0 ? item.toppings.map(topping => topping.text) : ["No description"];
      return {
          productId: item.id,
          productName: item.name,
          extraTopings: toppingNames.join(', '), // Join topping names into a string
          quantity: item.qty,
          imageUrl: item.img,
      };
  });  


    console.log(products)

    const newOrder = new Order({
      userId: customer.metadata.userId,
      customerId: data.customer,
      paymentIntentId: data.payment_intent,
      products,
      subtotal: data.amount_subtotal / 100,
      total: data.amount_total / 100,
      shipping: data.customer_details,
      payment_status: data.payment_status,
      transactionId: data.payment_intent,
    });

    const savedOrder = await newOrder.save();
    console.log("Processed Order:", savedOrder);
  } catch (error) {
    console.log(error);
  }
};


const handleWebhook = async (req, res) => {
  try {
    let data;
    let eventType;

    let webhookSecret;
    //webhookSecret = process.env.STRIPE_WEB_HOOK;

    if (webhookSecret) {
      let event;
      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (error) {
        console.log(`⚠  Webhook signature verification failed:  ${error}`);
        return res.sendStatus(400);
      }
      data = event.data.object;
      eventType = event.type;
    } else {
      data = req.body.data.object;
      eventType = req.body.type;
    }

    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            await createOrder(customer, data);
          } catch (error) {
            console.log(error);
          }
        })
        .catch((error) => console.log(error.message));
    }

    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server Error",
      success: false,
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
      // const orderItems = await Order.find();
      const orderItems = await Order.find().sort({ createdAt: -1 });

       res.status(200).json({
          message: "View Order Successfully",
          successz: true,
          data:{
              order: orderItems,
          }
       })
  } catch (error) {
      console.log(error);
      res.status(500).json({
          error: "Internal Server Error",
          success: false,
      });
  }
};

module.exports = { createCheckoutSession, createOrder, handleWebhook, getAllOrders};