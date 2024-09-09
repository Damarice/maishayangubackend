export default function handler(req, res) {
  if (req.method === "POST") {
    const { amount, accountNumber, phoneNumber } = req.body;

    try {
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
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
