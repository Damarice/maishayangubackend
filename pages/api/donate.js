import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { amount, donorName, donorPhone } = req.body;

    try {
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
      const orderReference = `ORD-${Date.now()}`;

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
          callbackUrl: "https://api.maishayangu.org/api/callback",
          countryCode: "KE",
          secondaryReference: "SecRef123",
          signature: `${process.env.MERCHANT_CODE}${orderReference}KES${amount}https://api.maishayangu.org/api/callback`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({
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
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
