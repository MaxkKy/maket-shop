import { ROLES } from "@/app/utils/roles";
import Menu from "@/component/admin/menu/page";
import ProtectRoute from "@/context/ProtectedRoute";


export default function page(){
    return (
        <ProtectRoute roles={[ROLES.PRODUCT_MANAGER,ROLES.ADMIN]}>
         <Menu/>    
        </ProtectRoute>
   
)
}