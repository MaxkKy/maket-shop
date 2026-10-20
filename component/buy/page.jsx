"use client";

import { ROLES } from "@/app/utils/roles";
import { useUserContext } from "@/context/ContextProvider";
import { useApiError } from "@/hooks/useApiError";
import { useBuyForm } from "@/hooks/useBuyForm";
import { apiClient } from "@/services/api/apiClient";
import { useState } from "react";
import { NumericFormat } from "react-number-format";
export default function Buy() {
  const [saving, setsaving] = useState(false);
  const { role } = useUserContext();
  const canPlaceOrder = role === ROLES.USER;
  const { handleError } = useApiError();
  const {
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
    details,
    setdetails,
  } = useBuyForm();
  async function onSubmit(e) {
    e.preventDefault();
    if (!validateQTY()) return;
    if (!validateCheckBox()) return;
    setsaving(true);
    const selectMenu = menus
      .filter((menu) => pick.includes(menu.id))
      .map((menu) => ({
        menuId: Number(menu.id),
        quantity: Number(quantities[menu.id] || 1),
        details: details[menu.id],
      }));
    try {
      await apiClient.post("/buy", { item: selectMenu });
      complete();
    } catch (err) {
      handleError(err);
    } finally {
      setsaving(false);
    }
  }
  return (
    <div>
      {menus.length === 0 ? (
        <h1>รอการอัพเดท</h1>
      ) : !canPlaceOrder ? (
        <div>
          <p>คุณสามารถดูเมนูได้ แต่ไม่มีสิทธิ์สั่งซื้อ</p>
          {menus.map((m) => (
            <div key={m.id}>
              <h2>{m.name}</h2>
              <p>ราคา: {m.price}</p>
              <p>คงเหลือ: {m.stock} จำนวน</p>
              <p>ประเภท: {m.type}</p>
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          {menus.map((m) => (
            <div key={m.id}>
              <label>
                <input
                  type="checkbox"
                  checked={pick.includes(m.id)}
                  onChange={() =>
                    setpick((check) =>
                      check.includes(m.id)
                        ? check.filter((id) => id !== m.id)
                        : [...check, m.id],
                    )
                  }
                />
                Product : {m.name} Price : {m.price}
                <h1> stock : {m.stock} จำนวน</h1>
                ประเภท : {m.type}
              </label>
              {pick.includes(m.id) && (
                <div>
                  <NumericFormat
                    thousandSeparator=","
                    value={quantities[m.id] ?? 1}
                    thousandsGroupStyle="thousand"
                    suffix=" จำนวน"
                    placeholder="จำนวน"
                    onValueChange={(v) =>
                      setquantities({ ...quantities, [m.id]: v.floatValue })
                    }
                  />
                  <textarea
                    value={details[m.id] || ""}
                    rows={5}
                    cols={30}
                    onChange={(e) =>
                      setdetails({ ...details, [m.id]: e.target.value })
                    }
                    placeholder="รายละเอียด"
                  />
                </div>
              )}
            </div>
          ))}
          <button disabled={saving}>
            {saving ? "กำลังดำเนินการ" : "สั่งซื้อ"}
          </button>
          {message && <div style={{ color: "green" }}>{message}</div>}
          {error && <div style={{ color: "crimson" }}>{error}</div>}
        </form>
      )}
    </div>
  );
}
