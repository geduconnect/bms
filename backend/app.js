import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import orderedStockRoutes from "./routes/orderedStockRoutes.js";
import receivedStockRoutes from "./routes/receivedStockRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import challanRoutes from "./routes/challanRoutes.js";
import igcRoutes from "./routes/igcRoutes.js";
import userRoutes from "./routes/userRoutes.js";
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/stock/ordered", orderedStockRoutes);
app.use("/api/stock/received", receivedStockRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/igcs", igcRoutes);
app.use("/api/users", userRoutes);
export default app;