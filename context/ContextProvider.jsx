"use client";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "@/services/api/apiClient";
import { AppError } from "@/lib/errors/AppError";
export const userContext = createContext();

export default function ContextProvider({ children }) {
  const [role, setrole] = useState(null);
  const [authenticated, setauthenticated] = useState(false);
  const [checkedPath, setCheckedPath] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    async function fetchRole() {
      try {
        const endpoint = pathname?.startsWith("/admin")
          ? "/api/admin/role"
          : "/api/user/role";
        const res = await apiClient.get(endpoint);
        if (!active) return;

        setrole(res.data.role);
        setauthenticated(res.data.authenticated);
      } catch (err) {
        if (!active) return;

        setrole(null);
        setauthenticated(false);
      } finally {
        if (active) {
          setCheckedPath(pathname);
        }
      }
    }

    fetchRole();
    return () => {
      active = false;
    };
  }, [pathname]);

  const loading =
    checkedPath !== pathname 

  return (
    <userContext.Provider
      value={{
        role,
        authenticated,
        loading,
      }}
    >
      {children}
    </userContext.Provider>
  );
}
export function useUserContext() {
  return useContext(userContext);
}
