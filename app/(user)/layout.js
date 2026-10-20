import Navbar from "@/component/navbar/page";
import ProtectRoute from "@/context/ProtectedRoute";
import { ROLES } from "../utils/roles";

export default function MainLayout({ children }) {
  return (
    <div>
        <Navbar />
        {children}
     
    </div>
  );
}
