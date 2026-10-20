import { ROLES } from "@/app/utils/roles";
import Buy from "@/component/buy/page";
import ProtectRoute from "@/context/ProtectedRoute";

export default function page() {
  return(
  <ProtectRoute roles={[ROLES.USER]}>
    <Buy />
  </ProtectRoute>)
}
