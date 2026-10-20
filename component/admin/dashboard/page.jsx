"use client";

import { ROLES } from "@/app/utils/roles";
import ContextProvider, { useUserContext } from "@/context/ContextProvider";
import ProtectRoute from "@/context/ProtectedRoute";
import Link from "next/link";
export default function Dashboard() {
  const { role } = useUserContext();
  const manageStock = [ROLES.ADMIN, ROLES.PRODUCT_MANAGER].includes(role);
  const isAdmin = role === ROLES.ADMIN;
  return (
    <main>
      <h1>จัดการระบบ</h1>
      <nav className="flex gap-4">
        {manageStock && (
          <>
            <Link href="/admin/menu">จัดการเมนูและ stock</Link>
            <Link href="/admin/orders">จัดการคำสั่งซื้อ</Link>
          </>
        )}
        {isAdmin && (<Link href={"/admin/roleAllow"}>แก้ไขตำแหน่งพนักงาน</Link>)}
      </nav>
    </main>
  );
}
