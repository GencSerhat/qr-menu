import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import http, { getAuthToken, setAuthToken } from "../../../lib/http";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [meToken, setMeToken] = useState(getAuthToken());

  // Özetler
  const [cats, setCats] = useState([]);
  const [prods, setProds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // --- Kategori Ekle form state ---
  const [catTitle, setCatTitle] = useState("");
  const [catCoverUrl, setCatCoverUrl] = useState("");
  const [catOrder, setCatOrder] = useState(0);
  const [catActive, setCatActive] = useState(true);
  const [catSaving, setCatSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- Ürün Ekle form state ---
  const [prdTitle, setPrdTitle] = useState("");
  const [prdPrice, setPrdPrice] = useState("");
  const [prdCategoryId, setPrdCategoryId] = useState("");
  const [prdImageUrl, setPrdImageUrl] = useState("");
  const [prdDesc, setPrdDesc] = useState("");
  const [prdOrder, setPrdOrder] = useState(0);
  const [prdActive, setPrdActive] = useState(true);
  const [prdSaving, setPrdSaving] = useState(false);
  const [prdUploading, setPrdUploading] = useState(false);

  // Token yoksa login'e at
  useEffect(() => {
    if (!meToken) {
      navigate("/admin/login", { replace: true });
    }
  }, [meToken, navigate]);

  // Özetleri çek
  useEffect(() => {
    let alive = true;
    async function load() {
      if (!meToken) return;
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          http.get("/categories"),
          http.get("/products"),
        ]);
        if (!alive) return;
        const cs = catsRes.data?.data || [];
        const ps = prodsRes.data?.data || [];
        setCats(cs);
        setProds(ps);
        // Ürün formu için varsayılan kategori
        if (cs.length && !prdCategoryId) setPrdCategoryId(cs[0]._id || cs[0].id || "");
        setErr("");
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Panel verileri alınamadı");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [meToken]); // prdCategoryId burada bilinçli yok: ilk yüklemede set edilsin

  function logout() {
    setAuthToken(null);
    setMeToken(null);
    navigate("/admin/login", { replace: true });
  }

  // --- Cloudinary upload (Kategori kapak) ---
  async function handleCoverUpload(file) {
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("image", file);
      const res = await http.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.data?.url;
      if (url) setCatCoverUrl(url);
    } catch (e) {
      alert(e.message || "Görsel yüklenemedi");
    } finally {
      setUploading(false);
    }
  }

  // --- Kategori ekleme submit ---
  async function handleCreateCategory(e) {
    e.preventDefault();
    if (!catTitle.trim()) {
      alert("Başlık zorunludur.");
      return;
    }
    try {
      setCatSaving(true);
      const payload = {
        title: catTitle.trim(),
        coverImageUrl: catCoverUrl.trim(),
        order: Number(catOrder) || 0,
        isActive: Boolean(catActive),
      };
      const res = await http.post("/categories", payload);
      const created = res.data?.data;
      if (created) {
        setCats((prev) => [
          ...prev,
          {
            _id: created.id,
            title: created.title,
            slug: created.slug,
            coverImageUrl: created.coverImageUrl,
            order: created.order,
            isActive: created.isActive,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          },
        ]);
        setCatTitle("");
        setCatCoverUrl("");
        setCatOrder(0);
        setCatActive(true);
        alert("Kategori eklendi.");
      }
    } catch (e) {
      alert(e.message || "Kategori eklenemedi");
    } finally {
      setCatSaving(false);
    }
  }

  // --- Cloudinary upload (Ürün görseli) ---
  async function handleProductImageUpload(file) {
    if (!file) return;
    try {
      setPrdUploading(true);
      const fd = new FormData();
      fd.append("image", file);
      const res = await http.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data?.data?.url;
      if (url) setPrdImageUrl(url);
    } catch (e) {
      alert(e.message || "Görsel yüklenemedi");
    } finally {
      setPrdUploading(false);
    }
  }

  // --- Ürün ekleme submit ---
  async function handleCreateProduct(e) {
    e.preventDefault();
    if (!prdTitle.trim()) {
      alert("Ürün adı zorunludur.");
      return;
    }
    if (!prdCategoryId) {
      alert("Kategori seçmelisiniz.");
      return;
    }
    const priceNum = Number(prdPrice);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      alert("Geçerli bir fiyat girin.");
      return;
    }

    try {
      setPrdSaving(true);
      const payload = {
        title: prdTitle.trim(),
        price: priceNum,
        categoryId: prdCategoryId,
        imageUrl: prdImageUrl.trim(),
        description: prdDesc.trim(),
        order: Number(prdOrder) || 0,
        isActive: Boolean(prdActive),
      };
      const res = await http.post("/products", payload);
      const created = res.data?.data;
      if (created) {
        setProds((prev) => [
          ...prev,
          {
            _id: created.id,
            title: created.title,
            price: created.price,
            imageUrl: created.imageUrl,
            description: created.description,
            categoryId: created.categoryId,
            order: created.order,
            isActive: created.isActive,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          },
        ]);
        // formu temizle
        setPrdTitle("");
        setPrdPrice("");
        setPrdImageUrl("");
        setPrdDesc("");
        setPrdOrder(0);
        setPrdActive(true);
        alert("Ürün eklendi.");
      }
    } catch (e) {
      alert(e.message || "Ürün eklenemedi");
    } finally {
      setPrdSaving(false);
    }
  }

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <h1 className={styles.title}>Yönetim Paneli</h1>
        <div className={styles.actions}>
          <Link to="/" className={styles.link}>← Menüye Dön</Link>
          <button onClick={logout} className={styles.logout}>Çıkış Yap</button>
        </div>
      </header>

      {err && <div className={styles.error}>{err}</div>}

      <section className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Kategoriler</div>
          {loading ? (
            <div className={styles.skeleton} />
          ) : (
            <div className={styles.cardBody}>
              <div className={styles.metric}>
                <span className={styles.metricNumber}>{cats.length}</span>
                <span className={styles.metricLabel}>Toplam Kategori</span>
              </div>
              <div className={styles.btnRow}>
                <a href="#cat-form" className={styles.btn}>Ekle</a>
              </div>
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Ürünler</div>
          {loading ? (
            <div className={styles.skeleton} />
          ) : (
            <div className={styles.cardBody}>
              <div className={styles.metric}>
                <span className={styles.metricNumber}>{prods.length}</span>
                <span className={styles.metricLabel}>Toplam Ürün</span>
              </div>
              <div className={styles.btnRow}>
                <a href="#prod-form" className={styles.btn}>Ekle</a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* -------- Kategori Ekle -------- */}
      <section id="cat-form" className={styles.formCard}>
        <h2 className={styles.formTitle}>Kategori Ekle</h2>
        <form onSubmit={handleCreateCategory}>
          <div className={styles.formRow}>
            <div>
              <label className={styles.label}>Başlık *</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Örn: Yiyecekler"
                value={catTitle}
                onChange={(e) => setCatTitle(e.target.value)}
              />
            </div>
            <div>
              <label className={styles.label}>Sıra (order)</label>
              <input
                className={styles.number}
                type="number"
                min={0}
                value={catOrder}
                onChange={(e) => setCatOrder(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div>
              <label className={styles.label}>Kapak Görseli URL</label>
              <input
                className={styles.url}
                type="url"
                placeholder="https://..."
                value={catCoverUrl}
                onChange={(e) => setCatCoverUrl(e.target.value)}
              />
            </div>
            <div>
              <label className={styles.label}>Veya Dosya Yükle</label>
              <input
                className={styles.input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleCoverUpload(e.target.files?.[0])}
                disabled={uploading}
              />
              {uploading ? <small>Yükleniyor…</small> : null}
              {catCoverUrl ? <small>Görsel yüklendi.</small> : null}
            </div>
          </div>

          <div className={styles.switchRow}>
            <input
              id="active"
              type="checkbox"
              checked={catActive}
              onChange={(e) => setCatActive(e.target.checked)}
            />
            <label htmlFor="active" className={styles.switchLabel}>Aktif</label>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => { setCatTitle(""); setCatCoverUrl(""); setCatOrder(0); setCatActive(true); }}
            >
              Temizle
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={catSaving || uploading}>
              {catSaving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>
      </section>

      {/* -------- Ürün Ekle -------- */}
      <section id="prod-form" className={styles.formCard}>
        <h2 className={styles.formTitle}>Ürün Ekle</h2>
        <form onSubmit={handleCreateProduct}>
          <div className={styles.formRow}>
            <div>
              <label className={styles.label}>Ürün Adı *</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Örn: Hamburger"
                value={prdTitle}
                onChange={(e) => setPrdTitle(e.target.value)}
              />
            </div>
            <div>
              <label className={styles.label}>Fiyat (₺) *</label>
              <input
                className={styles.number}
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={prdPrice}
                onChange={(e) => setPrdPrice(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div>
              <label className={styles.label}>Kategori *</label>
              <select
                className={styles.input}
                value={prdCategoryId}
                onChange={(e) => setPrdCategoryId(e.target.value)}
              >
                <option value="">Seçiniz</option>
                {cats.map((c) => (
                  <option key={c.slug} value={c._id || c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.label}>Sıra (order)</label>
              <input
                className={styles.number}
                type="number"
                min={0}
                value={prdOrder}
                onChange={(e) => setPrdOrder(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div>
              <label className={styles.label}>Görsel URL</label>
              <input
                className={styles.url}
                type="url"
                placeholder="https://..."
                value={prdImageUrl}
                onChange={(e) => setPrdImageUrl(e.target.value)}
              />
            </div>
            <div>
              <label className={styles.label}>Veya Dosya Yükle</label>
              <input
                className={styles.input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleProductImageUpload(e.target.files?.[0])}
                disabled={prdUploading}
              />
              {prdUploading ? <small>Yükleniyor…</small> : null}
              {prdImageUrl ? <small>Görsel yüklendi.</small> : null}
            </div>
          </div>

          <div className={styles.formRow}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className={styles.label}>Açıklama</label>
              <textarea
                className={styles.textarea}
                placeholder="Örn: Klasik burger"
                value={prdDesc}
                onChange={(e) => setPrdDesc(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.switchRow}>
            <input
              id="prd-active"
              type="checkbox"
              checked={prdActive}
              onChange={(e) => setPrdActive(e.target.checked)}
            />
            <label htmlFor="prd-active" className={styles.switchLabel}>Aktif</label>
          </div>

          <div className={styles.actionsRow}>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => {
                setPrdTitle("");
                setPrdPrice("");
                setPrdCategoryId(cats[0]?._id || cats[0]?.id || "");
                setPrdImageUrl("");
                setPrdDesc("");
                setPrdOrder(0);
                setPrdActive(true);
              }}
            >
              Temizle
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={prdSaving || prdUploading}>
              {prdSaving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.note}>
        <p>
          Not: Bir sonraki adımda kategori/ürün <strong>listeleme & düzenleme</strong> ekranlarını panele ekleyeceğiz
          (güncelleme/silme butonları ve küçük bir tablo/grid).
        </p>
      </section>
    </main>
  );
}


// Notlar

// Ürün ekleme formu /products POST çağrısını yapar, başarılı olunca panelde ürün sayısını artırır.

// Görsel için hem URL hem de dosya yükleme yolu var. Dosya yükleme Cloudinary endpoint’ini kullanır.

// Kategori seçimi için mevcut kategoriler dropdown’da gösterilir.