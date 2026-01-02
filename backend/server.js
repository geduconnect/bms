import dotenv from "dotenv";
import app from "./app.js";

dotenv.config(); // 🔴 REQUIRED

const PORT = process.env.PORT || 8008;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});