export default function handler(req, res) {
  if (req.method === "POST") {
    const { billId, status, amount } = req.body;

    try {
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
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
