"use client";
import { useApiError } from "@/hooks/useApiError";
import { apiClient } from "@/services/api/apiClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setuser] = useState({});
  const { handleError } = useApiError();
  const router = useRouter();
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiClient.get("/user");
        setuser(res.data);
      } catch (err) {
        handleError(err);
      }
    }
    fetchUser();
  }, []);

  async function onLogOut() {
    try {
      await apiClient.post("/logout");
      router.push("/login");
    } catch (err) {
      handleError(err);
    }
  }
  return (
    <div>
      <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="brand-mark text-2xl font-bold text-ink transition-opacity hover:opacity-80 sm:text-[1.65rem]"
          >
            {user.username}
          </Link>
          <button
            type="button"
            className="rounded-md p2 text-foreground md:hidden"
            aria-label="เปิดเมนู"
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <ul className="hidden items-center gap-1 md:flex">
            <li>
              <Link
                href="/buy"
                className="relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/history"
                className="relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
              >
                รายการที่สั่ง
              </Link>
            </li>

            <li>
              <button
                onClick={onLogOut}
                className="relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
