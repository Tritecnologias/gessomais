import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import BlogListPage from "./pages/BlogListPage";
import BlogPostPage from "./pages/BlogPostPage";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsPage from "./pages/admin/ProductsPage";
import ServicesPage from "./pages/admin/ServicesPage";
import TestimonialsPage from "./pages/admin/TestimonialsPage";
import FaqsPage from "./pages/admin/FaqsPage";
import ConfigPage from "./pages/admin/ConfigPage";
import UsersPage from "./pages/admin/UsersPage";
import JobOpeningsPage from "./pages/admin/JobOpeningsPage";
import JobApplicationsPage from "./pages/admin/JobApplicationsPage";
import LeadsPage from "./pages/admin/LeadsPage";
import StockPage from "./pages/admin/StockPage";
import PortfolioPage from "./pages/admin/PortfolioPage";
import PostsPage from "./pages/admin/PostsPage";
import PartnersPage from "./pages/admin/PartnersPage";
import AgendaPage from "./pages/admin/AgendaPage";
import CalculadoraConfigPage from "./pages/admin/CalculadoraConfigPage";
import TasksPage from "./pages/admin/TasksPage";
import AuditLogPage from "./pages/admin/AuditLogPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dicas" element={<BlogListPage />} />
      <Route path="/dicas/:slug" element={<BlogPostPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="faqs" element={<FaqsPage />} />
        <Route path="vagas" element={<JobOpeningsPage />} />
        <Route path="candidatos" element={<JobApplicationsPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="estoque" element={<StockPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="blog" element={<PostsPage />} />
        <Route path="parceiros" element={<PartnersPage />} />
        <Route path="agenda" element={<AgendaPage />} />
        <Route path="tarefas" element={<TasksPage />} />
        <Route path="calculadora" element={<CalculadoraConfigPage />} />
        <Route path="auditoria" element={<AuditLogPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
