export default function handler(req, res) {
  if (req.method === "GET") {
    const { reference } = req.query;

    try {
      res.status(200).json({
        success: true,
        message: "Transaction details retrieved successfully",
        data: { reference },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error querying transaction details",
        error: error.message,
      });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
