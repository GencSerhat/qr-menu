import { Router } from "express";
import Category from "../models/Category.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";

const router = Router();
/**
 * GET /categories (public)
 * Aktif kategorileri sıralı döner.
 */

router.get("/", async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select(
        "_id title slug coverImageUrl order is Active createdAt updateAt"
      );

    res.json({ data: cats });
  } catch (error) {
    console.error("GET /categories error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * POST /categories (admin)
 * body: { title, coverImageUrl?, order?, isActive? }
 */

router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const {
      title,
      coverImageUrl = "",
      order = 0,
      isActive = true,
    } = req.body || {};
    if (!title || String(title).trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Başlık (title) en az 2 karakter olmalı" });
    }
    const doc = await Category.create({
      title: String(title).trim(),
      coverImageUrl: String(coverImageUrl || "").trim(),
      order: Number(order) || 0,
      isActive: Boolean(isActive),
    });

    //Minimal Dönüş

    return res.status(201).json({
      data: {
        id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug,
        coverImageUrl: doc.coverImageUrl,
        order: doc.order,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    // Duplicate key (slug unique) vb.
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ error: "Bu başlıkla bir kategori zaten var" });
    }
    console.error("POST /categories error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PATCH /categories/:id (admin)
 * body: { title?, coverImageUrl?, order?, isActive? }
 */

router.patch("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, coverImageUrl, order, isActive } = req.body || {};

    const update = {};
    if (typeof title === "string") update.title = title.trim();
    if (typeof coverImageUrl === "string")
      update.coverImageUrl = coverImageUrl.trim();
    if (order !== undefined) update.order = Number(order) || 0;
    if (isActive !== undefined) update.isActive = Boolean(isActive);
    const doc = await Category.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!doc) return res.status(404).json({ error: "Kategori bulunamadı" });
    return res.json({
      data: {
        id: doc._id.toString(),
        title: doc.title,
        slug: doc.slug, // title değiştiyse pre-validate ile güncellenir
        coverImageUrl: doc.coverImageUrl,
        order: doc.order,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ error: "Bu başlıkla bir kategori zaten var" });
    }
    // console.error("PATCH /categories/:id error:", err);
    // return res.status(500).json({ error: "Internal Server Error" });
    console.error("PATCH /categories/:id gerçek hata:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /categories/:id (admin)
 * Not: İleride "bu kategoriye bağlı ürün var mı?" kontrolü ekleyebiliriz.
 */

router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Category.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "Kategori bulunamadı" });

    //Silme Başarılı -> İçerik yok
    
    return res.status(204).send();
  } catch (err) {
    console.error("DELETE /categories/:id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
