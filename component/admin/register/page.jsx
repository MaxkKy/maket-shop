"use client";
import { useRegisterForm } from "@/hooks/useRegisterForm";
export default function AdminRegister() {
  const { form, onChange, error, onSubmitAdmin, saving } = useRegisterForm();
  return (
    <div>
      <form onSubmit={onSubmitAdmin}>
        <h1>สมัครสมาชิกพนักงาน</h1>
        <div>
          <h1>ชื่อผู้ใช้</h1>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="ชื่อผู้ใช้"
          />
          {error.username && (
            <div style={{ color: "crimson" }}>{error.username}</div>
          )}
        </div>
        <div>
          <h1>อีเมล</h1>
          <input
            type="email"
            name="gmail"
            value={form.gmail}
            onChange={onChange}
            placeholder="อีเมล"
          />
          {error.gmail && <div style={{ color: "crimson" }}>{error.gmail}</div>}
        </div>
        <div>
          <h1>รหัสผ่าน</h1>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="รหัสผ่าน"
            autoComplete="new-password"
          />
          {error.password && (
            <div style={{ color: "crimson" }}>{error.password}</div>
          )}
        </div>
        <button disabled={saving}>{saving ? "โปรดรอสักครู่" : "Register"}</button>
      </form>
    </div>
  );
}
