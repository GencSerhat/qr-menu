import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import http, { setAuthToken } from "../../../lib/http";
import styles from "./Login.module.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr("E-posta ve şifre gereklidir.");
      return;
    }
    try {
      setLoading(true);
      const res = await http.post("/auth/login", { email, password });
      const token = res.data?.token;
      if (!token) {
        setErr("Beklenmeyen yanıt : token alınamadı");
        return;
      }
      setAuthToken(token);
      navigate("/admin", { replace: true });
    } catch (e) {
      setErr(e.message || "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className={styles.cotainer}>
      <form className={styles.card} onSubmit={onSubmit}>
        <h1 className={styles.title}>Yönetici Girişi</h1>
        {err ? <div className={styles.error}>{err}</div> : null}
        <label className={styles.label}>
          <span className={styles.labelText}>E-posta</span>
          <input
            className={styles.input}
            type="email"
            placeholder="admin@qrmenu.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className={styles.label}>
          <span className={styles.labelText}>Şifre</span>
          <input
            className={styles.input}
            type="password"
            placeholder="........"
            value={password}
            onChange={(e) => setPassword(e.targetvalue)}
            autoComplete="current-password"
          />
        </label>
        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
        <div className={styles.footer}>
          <Link to="/" className={styles.backLink}>
            ← Menüye Dön
          </Link>
        </div>
      </form>
    </main>
  );
}
