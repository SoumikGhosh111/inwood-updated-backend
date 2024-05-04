// const Stripe = require("stripe");
// const { Order } = require("../models/Order");
// require("dotenv").config();

// const stripe = Stripe(process.env.STRIPE_KEY);

// const createCheckoutSession = async (req, res) => {
//   try {
//     const customer = await stripe.customers.create({
//       metadata: {
//         userId: req.body.data.userData.userId,
//         cart: JSON.stringify(req.body.data.cartItems),
//       },
//     });

//     const line_items = req.body.data.cartItems.map((item) => {
//         const unitAmount = Math.round(data.amount.total * 100);
//       return {
//         price_data: {
//           currency: "usd",
//           product_data: {
//             name: item.name,
//             // images: [item.image],
//             // description: item.desc,
//             metadata: {
//               id: item.id,
//             },
//           },
//           unit_amount: unitAmount,
//         },
//         quantity: item.qty,
//       };
//     });

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//     //   phone_number_collection: {
//     //     enabled: true,
//     //   },
//       line_items,
//       mode: "payment",
//       customer: customer.id,
//       success_url: `${process.env.CLIENT_URL}/checkout-success`,
//       cancel_url: `${process.env.CLIENT_URL}/cart`,
//     });

//     res.send({ url: session.url });
//   } catch (error) {
//     console.error("Error creating checkout session:", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// };

// module.exports = {
//   createCheckoutSession,
// };



const Stripe = require("stripe");
const { Order } = require("../models/Order");
require("dotenv").config();

const stripe = Stripe(process.env.STRIPE_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, userData, amount } = req.body.data; // Extract data from req.body

    // Create a customer with metadata
    const customer = await stripe.customers.create({
      metadata: {
        userId: userData.userId,
        cart: JSON.stringify(cartItems),
      },
    });

    // Create line_items array for the checkout session
    const tax = parseFloat(amount.estimatedTax); 
    const line_items = cartItems.map((item) => {

        const unitAmount = Math.round(item.price * 100)
    
        const totalAmnt = Math.round(unitAmount);
        console.log(unitAmount) 
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            metadata: {
              id: item.id,
            },
          },
          unit_amount: totalAmnt, 
        },
        quantity: item.qty,
      };
    });

    // Create a new checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "KE"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: tax * 100,
              currency: "usd",
            },
            display_name: "Tax",
            // Delivers between 5-7 business days
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount:( tax * 100) + 1000,
              currency: "usd",
            },
            display_name: "Delivery & Tax",
            // Delivers in exactly 1 business day
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      line_items,
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

module.exports = {
  createCheckoutSession,
};

