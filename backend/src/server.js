// server.js (güncel)
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import categoryRoutes from "./routes/category.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

dotenv.config();

const app = express();

// CORS
const allowList = (process.env.CORS_ORIGIN || "https://demo3.karyasoft.net")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);                 // health/postman gibi originsiz istekler
    if (allowList.includes(origin)) return cb(null, true);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));           // <-- YETERLİ
// app.options("*", cors(corsOptions)); // <-- BUNU KALDIR

// Helmet (API için CORP kapalı)
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Sağlık
app.get("/health", (req,res)=> res.status(200).json({ ok:true, env:process.env.NODE_ENV || "dev" }));

// Rotalar
app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/upload", uploadRoutes);

// 404
app.use((_,res)=> res.status(404).json({ error:"Not Found" }));

const PORT = process.env.PORT || 4000;
await connectDB(process.env.MONGODB_URI);
app.listen(PORT, ()=> {
  console.log(`QR Menu API running on port ${PORT}`);
  console.log("Allowed origins:", allowList);
});
