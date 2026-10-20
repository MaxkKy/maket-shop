import { apiClient } from "@/services/api/apiClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApiError } from "./useApiError";
import { AppError } from "@/lib/errors/AppError";

export function useRegisterForm() {
  const [form, setform] = useState({ username: "", gmail: "", password: "" });
  const [saving, setsaving] = useState(false);
  const [error, seterror] = useState("");
  const onChange = (e) => setform({ ...form, [e.target.name]: e.target.value });
  const { handleError } = useApiError();
  const router = useRouter();
  async function onSubmitAdmin(e) {
    e.preventDefault();
    if (!validateRegister()) return;
    setsaving(true);
    try {
      await apiClient.post("/admin/register", {
        username: form.username,
        gmail: form.gmail,
        password: form.password,
      });
      router.push("/admin/login");
    } catch (err) {
      if (AppError.isAppError(err) && err.code === "DUPLICATE_NAME") {
        seterror({ gmail: "อีเมลนี้ถูกใช้งานแล้ว"});
      } else {
        handleError(err);
      }
    } finally {
      setsaving(false);
    }
  }
  async function onSubmitUser(e) {
    e.preventDefault();
    if (!validateRegister()) return;
    setsaving(true);
    try {
      await apiClient.post("/register", {
        username: form.username,
        gmail: form.gmail,
        password: form.password,
      });
      router.push("/login");
    } catch (err) {
      if (AppError.isAppError(err) && err.code === "DUPLICATE_NAME") {
        seterror({ password: "อีเมลนี้ถูกใช้งานแล้ว" });
      } else {
        handleError(err);
      }
    } finally {
      setsaving(false);
    }
  }
  function validateRegister() {
    const newError = {};
    const checkGmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!form.username) {
      newError.username = "โปรดกรอกชื่อ";
    }
    if (!form.password) {
      newError.password = "โปรดกรอกรหัสผ่าน";
    } else if (!form.password?.trim()) {
      newError.password = "โปรดกรอกรหัสผ่านให้ถูกต้อง";
    } else if (form.password.length < 8) {
      newError.password = "กรอก Password อย่างน้อย 8 ตัวอักษร";
    }
    if (!form.gmail) {
      newError.gmail = "โปรดกรอกอีเมล";
    } else if (!checkGmail.test(form.gmail)) {
      newError.gmail = "กรุณากรอกอีเมลให้ถูกต้อง";
    }
    seterror(newError);
    return Object.keys(newError).length === 0;
  }
  return { form, onChange, error, onSubmitUser, saving, onSubmitAdmin };
}
