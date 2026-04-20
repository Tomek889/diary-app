const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/stats", (req, res) => {
  const email = req.header("X-User-Email") || "";

  if (!email) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // test data, todo: connect to db
  return res.json({
    overallTasksCompletion: 0.75,
    monthTasksCompletion: 0.5,
    overallMoodAvg: 3.5,
    monthMoodAvg: 4,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
