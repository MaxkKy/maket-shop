import { AppError } from "@/lib/errors/AppError";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApiError } from "./useApiError";
import { apiClient } from "@/services/api/apiClient";

export function useLoginForm() {
  const [form, setform] = useState({ gmail: "", password: "" });
  const [error, seterror] = useState("");
  const onChange = (e) => setform({ ...form, [e.target.name]: e.target.value });
  const router = useRouter();
  const [saving, setsaving] = useState(false);
  const { handleError } = useApiError();
  function validateLogin() {
    const newError = {};
    const checkGmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    if (!form.gmail) {
      newError.gmail = "โปรดกรอก Gmail";
    } else if (!checkGmail.test(form.gmail)) {
      newError.gmail = "กรุณากรอก Gmail ให้ถูกต้อง";
    }
    if (!form.password) {
      newError.password = "โปรดกรอก Password";
    } else if (form.password.length < 8) {
      newError.password = "กรอก Password อย่างน้อย 8 ตัวอักษร";
    }
    seterror(newError);
    return Object.keys(newError).length === 0;
  }

  async function onSubmitUser(e) {
    e.preventDefault();
    if (!validateLogin()) return;
    setsaving(true);
    try {
      await apiClient.post("/login", {
        gmail: form.gmail,
        password: form.password,
      });
      router.push("/");
    } catch (err) {
      if (AppError.isAppError(err) && err.code === "INVALID_CREDENTIALS") {
        seterror({ password: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      } else {
        handleError(err);
      }
    } finally {
      setsaving(false);
    }
  }
  async function onSubmitAdmin(e) {
    e.preventDefault();
    if (!validateLogin()) return;
    setsaving(true);
    try {
      await apiClient.post("/admin/login", {
        gmail: form.gmail,
        password: form.password,
      });
      router.push("/admin/dashboard");
    } catch (err) {
      if (AppError.isAppError(err) && err.code === "INVALID_CREDENTIALS") {
        seterror({ password: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      } else {
        handleError(err);
      }
    } finally {
      setsaving(false);
    }
  }
  return {
    form,
    error,
    onChange,
    saving,
    onSubmitUser,
    onSubmitAdmin,
  };
}
