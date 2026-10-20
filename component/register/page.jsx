"use client";
import { useRegisterForm } from "@/hooks/useRegisterForm";
export default function Register() {
  const { form, onChange, error, onSubmitUser, saving } = useRegisterForm();
  return (
    <div className="flex justify-center items-center flex-col">
      <h1>สมัครการใช้งาน</h1>
      <form onSubmit={onSubmitUser}>
        <div>
          <h1>ชื่อผู้ใช้งาน </h1>
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
          <h1>อีเมล </h1>
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
        <button disabled={saving}>
          {saving ? "กำลังดำเนินการ" : "สมัครสมาชิก"}
        </button>
      </form>
    </div>
  );
}
