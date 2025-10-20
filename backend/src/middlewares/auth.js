import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function authRequired(req,res,next){
    try {
        const auth = req.headers.authorization || "";
        const token = auth.startsWith("Bearer") ? auth.slice(7) : null;

        if(!token) {
            return res.status(401).json({error:"Yetkilendirme gerekli (token yok"});
        }
        const secret = process.env.JWT_SECRET;
        if(!secret){
            return res.status(500).json({error:"Sunucu yapılandırma hatası (JWT_SECRET yok)"});

        }
        const payload = jwt.verify(token,secret); // {sub,role,iat, exp}
        const user = await User.findById(payload.sub).select("_id name email role isActive");
        if(!user || !user.isActive) {
            return res.status(401).json({error:"Geçersiz veya pasif kullanıcı"});
        }
        req.user={
            id:user._id.toString(),
            name:user.name,
            email:user.email,
            role:user.role,

        };
        next();

    } catch (err) {
        console.error("authRequired error:",err?.message ||err);
        return res.status(401).json({error:"Geçersiz veya süresi dolmuş token"});
    }
}

export function adminOnly(req,res,next) {
    try {
        if(!req.user){
            return res.status(401).json({error:"Yetkilendirme gerekli"});
        }
        if(req.user.role !== "admin") {
            return res.status(403).json({error:"Yalnızca admin erişebilir"});
        }
        next();
    } catch (error) {
        console.error("adminOnly error:",err?.message ||err);
        return res.status(403).json({error:"Erişim reddedildi"});
    }
}