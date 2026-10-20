"use client";
import { useLoginForm } from "@/hooks/useLoginForm";
import Link from "next/link";

export default function Login() {
  const { form, error, onChange, saving, onSubmitUser } = useLoginForm();

  return (
    <div>
      <form onSubmit={onSubmitUser}>
        <div>
          <input
            type="email"
            name="gmail"
            value={form.gmail}
            onChange={onChange}
            placeholder="Gmail"
          />
          {error.gmail && (
            <div style={{ color: "crimson" }}>{error.gmail}</div>
          )}
        </div>
        <div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            placeholder="Password"
          />
          {error.password && (
            <div style={{ color: "crimson" }}>{error.password}</div>
          )}
        </div>

        <button disabled={saving}>{saving ? "กำลังดำเนินการ" : "Login"}</button>
      </form>
      <Link href={"/register"}>Register</Link>
    </div>
  );
}
