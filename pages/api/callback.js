export default function handler(req, res) {
  if (req.method === "POST") {
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
      const expectedSignature = `${process.env.MERCHANT_CODE}${orderReference}KES${amount}https://api.maishayangu.org/api/callback`;

      if (expectedSignature) {
        res.status(200).json({
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
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
