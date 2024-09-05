const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());

function generateSignature(amount, currencyCode, reference, accountNumber) {
  const data = `${amount}${currencyCode}${reference}${accountNumber}`;
  return data;
  //   return crypto.createHash("sha256").update(data).digest("hex");
}

app.post("/donate", async (req, res) => {
  try {
    const { amount, donorName, donorPhone } = req.body;

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

    const sourceAccountNumber = process.env.JENGA_ACCOUNT_NUMBER;
    const destinationMobileNumber = donorPhone;
    const reference = "S001946981113"; // Example reference
    const currencyCode = process.env.CURRENCY;
    const callbackUrl = "http://localhost:3000/handle-callback";

    const signature = generateSignature(
      amount,
      currencyCode,
      reference,
      sourceAccountNumber
    );

    const payload = {
      source: {
        countryCode: "KE",
        name: "Security Test",
        accountNumber: sourceAccountNumber,
      },
      destination: {
        type: "mobile",
        countryCode: "KE",
        name: donorName,
        mobileNumber: destinationMobileNumber,
        walletName: "Mpesa",
      },
      transfer: {
        type: "MobileWallet",
        amount: amount,
        currencyCode: currencyCode,
        reference: reference,
        date: new Date().toISOString().split("T")[0],
        description: "Donation",
        callbackUrl: callbackUrl,
      },
    };

    const paymentResponse = await axios.post(
      "https://uat.finserve.africa/v3-apis/transaction-api/v3.0/remittance/sendmobile",
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          signature: signature,
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
      error: error.response ? error.response.data : error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
