import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import http from "../../lib/http";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./Category.module.css";

export default function Category() {
  const { slug } = useParams();
  const [catTitle, setCatTitle] = useState();
  const [coverImage, setCoverImage] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        setLoading(true);
        setErr("");
        // 1) Kategori başlık + kapak görseli için kategorileri çekip slug ile bul
        const catsRes = await http.get("/categories");
        const cats = catsRes.data?.data || [];
        const found = cats.find((c) => c.slug === slug);
        if (found) {
          setCatTitle(found.title);
          setCoverImage(found.coverImageUrl || "");
        } else {
          setCatTitle("");
          setCoverImage("");
        }
        // 2) Ürünleri slug ile çek
        const prodRes = await http.get("/products", {
          params: { categorySlug: slug },
        });
        const list = prodRes.data?.data || [];
        if (!alive) return;
        setItems(list);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Ürünler yüklenemedi");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [slug]);

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <Link to="/" className={styles.back} aria-label="Ana sayfaya dön">
          ← Menü
        </Link>
        <h1 className={styles.heading}>{catTitle || "Kategori"}</h1>
      </div>

      {coverImage ? (
        <div className={styles.coverWrap}>
          <img src={coverImage} alt={catTitle} className={styles.cover} />
          <div className={styles.coverOverlay} />
          {catTitle ? (
            <div className={styles.coverTitle}>{catTitle}</div>
          ) : null}
        </div>
      ) : null}

      {err && <div className={styles.error}>{err}</div>}

      {loading ? (
        <div className={styles.grid}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>Bu kategoride ürün bulunmuyor.</div>
      ) : (
        <div className={styles.grid}>
          {items.map((p) => (
            <ProductCard
              key={p.id}
              title={p.title}
              price={p.price}
              imageUrl={p.imageUrl || "https://picsum.photos/640/400?product"}
              description={p.description}
            />
          ))}
        </div>
      )}
    </main>
  );
}
