import { ROLES } from "@/app/utils/roles";
import Dashboard from "@/component/admin/dashboard/page";
import ProtectRoute from "@/context/ProtectedRoute";

export default function Page() {
  return(
    <ProtectRoute roles={[ROLES.ADMIN,ROLES.PRODUCT_MANAGER]}>
       <Dashboard />
    </ProtectRoute>
   
  )
   
}