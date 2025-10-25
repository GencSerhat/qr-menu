import { useEffect, useState } from "react";
import http from "../../lib/http";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import styles from "./Home.module.css";

export default function Home() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        const res = await http.get("/categories");
        if (!alive) return;
        setCats(res.data?.data || []);
        setErr("");
      } catch (e) {
        setErr(e.message || "Kategoriler yükelenemdi");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Menü</h1>
      {err && <div className={styles.error}>{err}</div>}

      {loading ? (
        <div className={styles.grid}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      ) : cats.length === 0 ? (
        <div className={styles.empty}>Henüz Kategori eklenmemiş.</div>
      ) : (
        <div className={styles.grid}>
          {" "}
        {cats.map((c) => {
  const id = c._id || c.id || c.slug;
const img = (c.coverImageUrl || "").trim() || "https://picsum.photos/800/500?category";
   return (
    <CategoryCard key={c._id || c.id || c.slug} title={c.title} slug={c.slug} imageUrl={img} />
   );
 })}
        </div>
      )}
    </main>
  );
}

// Notlar

// Home, /categories endpoint’inden veri çekiyor ve CategoryCard bileşenleriyle grid gösteriyor.

// Kapak görseli boşsa geçici olarak picsum.photos kullanıyoruz (admin panelinden yükleyince gerçek URL’yi koyarsın).

// Tamamen CSS Modules kullanıldı, inline stil yok.
