import { Router } from "express";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { authRequired, adminOnly } from "../middlewares/auth.js";

const router = Router();

/**
 * POST /products (admin)
 * body: { title, price, categoryId, imageUrl?, description?, order?, isActive? }
 */

router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const {
      title,
      price,
      categoryId,
      imageUrl = "",
      description = "",
      order = 0,
      isActive = true,
    } = req.body || {};

    // Basit doğrulamalar
    if (!title || String(title).trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Ürün adı en az 2 karakter olmalı" });
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: "Geçerli bir fiyat giriniz." });
    }
    if (!categoryId) {
      return res.status(400).json({ error: "CategoryId zorunludur" });
    }

    // Kategori var mı?
    const cat = await Category.findById(categoryId).select("_id isActive");
    if (!cat || !cat._id) {
      return res.status(404).json({ error: "Kategori bulunamadı" });
    }
    if (!cat.isActive) {
      return res.status(400).json({ error: "Pasif kategoriye ürün eklenmez" });
    }
    const doc = await Product.create({
      title: String(title).trim(),
      price: priceNum,
      imageUrl: String(imageUrl || "").trim(),
      description: String(description || "").trim(),
      categoryId: cat._id,
      order: Number(order) || 0,
      isActive: Boolean(isActive),
    });

    return res.status(201).json({
      data: {
        id: doc._id.toString(),
        title: doc.title,
        price: doc.price,
        imageUrl: doc.imageUrl,
        description: doc.descripition,
        categoryId: doc.categoryId.toString(),
        order: doc.order,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    console.error("POST /products error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * GET /products (public)
 * query: ?category=<categoryId> | ?categorySlug=<slug>
 * Aktif ürünleri sıralı döner.
 */
router.get("/", async (req, res) => {
  try {
    const { category, categorySlug } = req.query || {};
    let categoryId = category;

    //slug geldiyse Category den id bul
    if (!categoryId && categorySlug) {
      const cat = await Category.findOne({
        slug: String(categorySlug).toLowerCase(),
        isActive: true,
      }).select("_id");
      if (!cat) return res.status(404).json({ error: "Kategori bulunamadı" });
      categoryId = cat._id.toString();
    }
    const filter = { isActive: true };
    if (categoryId) filter.categoryId = categoryId;

    const items = await Product.find(filter)
      .sort({ order: 1, creadetAt: 1 })
      .select(
        "_id title price imageUrl description categoryId order isActive creadedAt updatedAt"
      );

    res.json({
      data: items.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        price: p.price,
        imageUrl: p.imageUrl,
        description: p.descripition,
        categoryId: p.categoryId.toString(),
        order: p.order,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (err) {
    console.error("GET /products error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * PATCH /products/:id (admin)
 * body: { title?, price?, imageUrl?, description?, categoryId?, order?, isActive? }
 */

router.patch("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, imageUrl, description, categoryId, order, isActive } =
      req.body || {};

    const update = {};
    if (title !== undefined) update.title = String(title).trim();

    if (price !== undefined) {
      const priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: "Geçerli bir fiyat giriniz" });
      }
      update.price = priceNum;
    }

    if (imageUrl !== undefined) update.imageUrl = String(imageUrl || "").trim();
    if (description !== undefined)
      update.description = String(description || "").trim();
    if (categoryId !== undefined) {
      const cat = await Category.findById(categoryId).select("_id isActive");
      if (!cat) return res.status(404).json({ error: "Kategori bulunamadı" });
      if (!cat.isActive)
        return res
          .status(400)
          .json({ error: "Pasif kategoriye ürün taşınamaz" });
      update.categoryId = cat._id;
    }
    if (order !== undefined) update.order = Number(order) || 0;
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const doc = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ error: "Ürün bulunamadı" });
    return res.json({
      data: {
        id: doc._id.toString(),
        title: doc.title,
        price: doc.price,
        imageUrl: doc.imageUrl,
        description: doc.description,
        categoryId: doc.categoryId.toString(),
        order: doc.order,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (err) {
    console.error("PATCH /products/:id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


/**
 * DELETE /products/:id (admin)
 */

router.delete("/:id",authRequired,adminOnly, async(req,res)=>{
    try {
       const {id} = req.params;
       
       const doc = await Product.findByIdAndDelete(id);
       if(!doc) return res.status(404).json({error:"Ürün bulunamadı"});
       return res.status(204).send();
    } catch (err) {
           console.error("DELETE /products/:id error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
    }
});
export default router;
