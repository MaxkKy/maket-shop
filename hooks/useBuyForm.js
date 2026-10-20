import { useEffect, useRef, useState } from "react";
import { useApiError } from "./useApiError";
import { apiClient } from "@/services/api/apiClient";

export function useBuyForm() {
  const [message, setMessage] = useState("");
  const [menus, setmenus] = useState([]);
  const [quantities, setquantities] = useState({});
  const [error, seterror] = useState("");
  const [pick, setpick] = useState([]);
  const [details, setdetails] = useState({});
  const { handleError } = useApiError();
  async function fetchData() {
    try {
      const menu = await apiClient.get("/menu");
      setmenus(menu.data);
    } catch (err) {
      handleError(err);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  function complete() {
    setMessage("สั่งซื้อสำเร็จ");
    setpick([]);
    setquantities({});
    setdetails({})
  }
  function validateQTY() {
    seterror("");
    setMessage("");
    for (const m of menus) {
      if (pick.includes(m.id)) {
        const qty = Number(quantities[m.id]);
        if (m.stock < qty) {
          seterror("Stock ไม่พอ");
          return false;
        }
      }
    }
    return true;
  }
  function validateCheckBox() {
    for (const m of menus) {
      if (pick.length === 0) {
        seterror("เลือกอย่างน้อย 1 รายการ");
        return false;
      }
    }
    return true;
  }
  return {  
    complete,
    message,
    error,
    validateQTY,
    setquantities,
    quantities,
    menus,
    pick,
    setpick,
    validateCheckBox,
    fetchData,
    details,
    setdetails,
  };
}
