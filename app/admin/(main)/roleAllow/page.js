import { ROLES } from "@/app/utils/roles";
import AllowRole from "@/component/admin/allowRole/page";
import ProtectRoute from "@/context/ProtectedRoute";

export default function page() {
  return (
    <ProtectRoute roles={[ROLES.ADMIN]}>
      <AllowRole />
    </ProtectRoute>
  );
}
