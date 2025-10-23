import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Sayfaları lazy yükleyelim (henüz oluşturmadık; sırayla yapacağız)
const HomePage = lazy(() => import("../pages/Home/Home.jsx"));
const CategoryPage = lazy(() => import("../pages/Category/Category.jsx"));
const AdminLoginPage = lazy(() => import("../pages/admin/Login/Login.jsx"));
const AdminDashboardPage = lazy(() => import("../pages/admin/Dashboard/Dashboard.jsx"));

function Loader() {
  return <div style={{ padding: 16 }}>Yükleniyor...</div>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/*Public*/}
          <Route path="/" element={<HomePage />} />
          <Route path="/c/:slug" element={<CategoryPage />} />

          {/*Admin*/}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />

          {/*404*/}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
