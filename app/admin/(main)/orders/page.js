import { ROLES } from "@/app/utils/roles";
import UpdateStatus from "@/component/admin/updateStatus/page";
import ProtectRoute from "@/context/ProtectedRoute";

export default function page() {
  return (
    <ProtectRoute roles={[ROLES.ADMIN, ROLES.PRODUCT_MANAGER]}>
      <UpdateStatus />
    </ProtectRoute>
  );
}
