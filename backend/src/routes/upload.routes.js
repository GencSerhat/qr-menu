import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { authRequired, adminOnly } from "../middlewares/auth.js";

const router = Router();

// Multer: belleğe al (dosyayı diske yazmıyoruz)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const okTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!okTypes.includes(file.mimetype)) {
      return cb(new Error("Yalnızca JPEG/PNG7WEBP kabul edilebilir."));
    }
    cb(null, true);
  },
});

// Cloudinary config (ENV’den)
function ensureCloudnaryConfigured() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  return true;
}

/**
 * POST /upload/image (admin)
 * form-data: image (file)
 * return: { url, width, height, format, bytes, public_id }
 */

router.post(
  "/image",
  authRequired,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!ensureCloudnaryConfigured()) {
        return res
          .status(500)
          .json({ error: "Cloudinary yapılandırması eksik" });
      }
      if (!req.file || !req.file.buffer) {
        return res
          .status(400)
          .json({ error: "Dosya bulunamadı (image alanı boş)" });
      }

      //Buffer'ı Cloudinary'e stream ile gönderilir
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "qr-menu", // istersen ENV ile yönetebiliriz
            resource_type: "image",
            overWrite: true,
          },
          (err, uploaded) => {
            if (err) return reject(err);
            resolve(uploaded);
          }
        );
        stream.end(req.file.buffer);
      });
      return res.status(201).json({
        data: {
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          public_id: result.public_id,
        },
      });
    } catch (err) {
      console.error("POST /upload/image error:", err);
      const msg = err?.message?.includes("File size too large")
        ? "Dosya 5MB sınırını aşıyor"
        : err?.message || "Internal Server Error";
      return res.status(400).json({ error: msg });
    }
  }
);

export default router;