// Import required packages
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define the /donate endpoint
app.post("/donate", async (req, res) => {
  const { amount, donorName, donorPhone } = req.body;

  try {
    // Step 1: Get the OAuth token from Jenga API
    const tokenResponse = await axios.post(
      "https://uat.finserve.africa/authentication/api/v3/authenticate/merchant",
      {
        // This is the raw JSON body required by the API
        merchantCode: process.env.MERCHANT_CODE,
        consumerSecret: process.env.JENGA_CONSUMER_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Api-Key": process.env.JENGA_API_KEY, // Store this in .env file
        },
      }
    );

    const accessToken = tokenResponse.data.accessToken;
    console.log(accessToken, "access token");

    // Step 2: Make the payment request to Jenga API
    const paymentResponse = await axios.post(
      "https://uat.finserve.africa/transaction/v2/remittance",
      {
        source: {
          accountNumber: process.env.JENGA_ACCOUNT_NUMBER,
        },
        destination: {
          type: "bank",
          name: donorName,
          accountNumber: process.env.JENGA_ACCOUNT_NUMBER,
          amount: amount,
          currency: "KES",
        },
        transfer: {
          type: "PesaLink",
          amount: amount,
          currency: "KES",
          reference: "Donation",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Step 3: Respond with the result
    res.json({
      success: true,
      message: "Donation processed successfully",
      data: paymentResponse.data,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Error processing donation",
      error: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
