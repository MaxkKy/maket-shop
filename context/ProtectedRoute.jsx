"use client";
import { useEffect } from "react";
import { useUserContext } from "./ContextProvider";
import { usePathname, useRouter } from "next/navigation";
import { AppError } from "@/lib/errors/AppError";
import ErrorMessage from "@/component/ErrorMessage";

export default function ProtectRoute({ children, roles = [] }) {
  const { role, loading, authenticated } = useUserContext();
  const router = useRouter();
  const pathName = usePathname();
  const FORBIDDEN = new AppError("สิทธิ์คุณไม่ถึง", "FORBIDDEN", 403);

  useEffect(() => {
    if (!loading && !authenticated) {
      const loginPath = pathName?.startsWith("/admin")
        ? "/admin/login"
        : "/login";
      if (pathName !== loginPath) {
        router.replace(loginPath);
      }
    }
  }, [loading, authenticated, pathName, router]);

  if (loading) {
    return null;
  }

  if (!authenticated) {
    return null;
  }

  if (!roles.includes(role)) {
    return (
      <div>
        <ErrorMessage
          error={FORBIDDEN}
          retry={() => router.push("/admin/dashboard")}
        />
      </div>
    );
  }

  return children;
}
