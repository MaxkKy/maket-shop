import Navbar from "@/component/admin/navbar/page";

export default function AdminLayout({ children }) {
  return (
    <div>
        <Navbar />
        {children}
    </div>
  );
}
