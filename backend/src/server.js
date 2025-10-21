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

const app= express();

//Orjin ayarı : geliştirmede serbest bırakyoruz.

app.use(cors({origin:process.env.CLIENT_URL || "*"}));
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));


app.use("/categories", categoryRoutes);
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/upload", uploadRoutes);
//Sağlık kontrolü
app.get("/health", (req,res)=>{
    res.json({ok:true, env:process.env.NODE_ENV ||"dev"});
});

//404 handler 
app.use((req,res)=>{
    res.status(404).json({error:"Not Found"});
});

const PORT = process.env.PORT || 4000;
await connectDB(process.env.MONGODB_URI);
app.listen(PORT,()=>{
    console.log(`QR Menu API running on http://localhost:${PORT}`);
});
