"use client";

import { useLoginForm } from "@/hooks/useLoginForm";
import Link from "next/link";

export default function AdminLogin() {
  const { form, error, onChange, saving, onSubmitAdmin } = useLoginForm();

  return (
    <div>
      <form onSubmit={onSubmitAdmin}>
        <h1>เข้าสู่ระบบพนักงาน</h1>
        <div>
          <input
            type="email"
            name="gmail"
            value={form.gmail}
            onChange={onChange}
            placeholder="โปรดกรอกอีเมล"
            autoComplete="username"
          />
          {error.gmail && <div style={{ color: "crimson" }}>{error.gmail}</div>}
        </div>
        <div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="โปรดกรอกรหัสผ่าน"
            autoComplete="new-password"
          />
          {error.password && (
            <div style={{ color: "crimson" }}>{error.password}</div>
          )}
        </div>

        <button disabled={saving}>
          {saving ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบ"}
        </button>
        <div>
          <Link href="/admin/register">สมัครสมาชิก</Link>
        </div>
      </form>
    </div>
  );
}
