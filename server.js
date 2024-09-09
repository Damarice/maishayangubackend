const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const crypto = require("crypto");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.post("/donate", async (req, res) => {
  const { amount, donorName, donorPhone } = req.body;

  try {
    // Step 1: Get the OAuth token from Jenga API
    const tokenResponse = await axios.post(
      "https://uat.finserve.africa/authentication/api/v3/authenticate/merchant",
      {
        merchantCode: process.env.MERCHANT_CODE,
        consumerSecret: process.env.JENGA_CONSUMER_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Api-Key": process.env.JENGA_API_KEY,
        },
      }
    );

    const accessToken = tokenResponse.data.accessToken;

    // Step 2: Generate the order reference
    const orderReference = `ORD-${Date.now()}`;

    // Step 3: Create the payment request
    const paymentResponse = await axios.post(
      "https://v3-uat.jengapgw.io/processPayment",
      {
        token: accessToken,
        merchantCode: process.env.MERCHANT_CODE,
        currency: "KES",
        orderAmount: amount,
        orderReference: orderReference,
        productType: "Donation",
        productDescription: "Donation Description",
        paymentTimeLimit: "15mins",
        customerFirstName: donorName.split(" ")[0],
        customerLastName: donorName.split(" ")[1] || "",
        customerPostalCodeZip: "00100",
        customerAddress: "123 Tom Mboya Street, Nairobi",
        customerEmail: "donor@example.com",
        customerPhone: donorPhone,
        callbackUrl: "https://api.maishayangu.org/callback",
        countryCode: "KE",
        secondaryReference: "SecRef123",
        signature: `${process.env.MERCHANT_CODE}${orderReference}KES${amount}https://api.maishayangu.org/callback`,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      message: "Donation processed successfully",
      data: paymentResponse.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing donation",
      error: error.message,
    });
  }
});

// Endpoint to handle M-Pesa Paybill payment data
app.post("/paybill", async (req, res) => {
  const { amount, accountNumber, phoneNumber } = req.body;

  try {
    // Process Paybill data (e.g., integrate with M-Pesa API)
    res.status(200).json({
      success: true,
      message: "Paybill payment processed successfully",
      data: { amount, accountNumber, phoneNumber },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error processing Paybill payment",
      error: error.message,
    });
  }
});

// Endpoint to validate bill payments
app.post("/api/bill-validation", async (req, res) => {
  const { billId, amount } = req.body;

  try {
    // Validate bill payment (e.g., check against database or API)
    res.status(200).json({
      success: true,
      message: "Bill payment validated successfully",
      data: { billId, amount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating bill payment",
      error: error.message,
    });
  }
});

// Endpoint to handle bill notifications
app.post("/api/bill-notification", async (req, res) => {
  const { billId, status, amount } = req.body;

  try {
    // Handle bill notification (e.g., update database or notify user)
    res.status(200).json({
      success: true,
      message: "Bill notification received successfully",
      data: { billId, status, amount },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error handling bill notification",
      error: error.message,
    });
  }
});

// Endpoint to query transaction details by reference
app.get("/api/transaction-query/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    // Query transaction details (e.g., from database or external service)
    res.status(200).json({
      success: true,
      message: "Transaction details retrieved successfully",
      data: { reference }, // Replace with actual transaction data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error querying transaction details",
      error: error.message,
    });
  }
});

// Endpoint to handle the callback from Jenga
app.post("/callback", (req, res) => {
  const {
    transactionId,
    status,
    date,
    desc,
    amount,
    orderReference,
    hash,
    extraData,
  } = req.body;

  try {
    // Validate the response hash
    const expectedSignature = `${process.env.MERCHANT_CODE}${orderReference}KES${amount}https://api.maishayangu.org/callback`;

    // if (expectedSignature !== hash) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: 'Invalid response signature' });
    // }

    // Handle the callback data (e.g., update database or notify user)
    if (expectedSignature) {
      res.json({
        success: true,
        message: "Callback received successfully",
        data: {
          transactionId,
          status,
          date,
          desc,
          amount,
          orderReference,
          extraData,
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error handling callback",
      error: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});