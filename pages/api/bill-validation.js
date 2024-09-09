export default function handler(req, res) {
  if (req.method === "POST") {
    const { billId, amount } = req.body;

    try {
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
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
