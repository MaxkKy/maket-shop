"use client";

import { useApiError } from "@/hooks/useApiError";
import { apiClient } from "@/services/api/apiClient";
import { useEffect, useState } from "react";

export default function UpdateStatus() {
  const [user, setUser] = useState([]);
  const [loading, setloading] = useState(true);
  const [status, setstatus] = useState({});
  const [saving, setsaving] = useState(null);
  const { handleError } = useApiError();
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await apiClient.get("/admin/users");
        setUser(res.data);
      } catch (err) {
        handleError(err);
      } finally {
        setloading(false);
      }
    }
    fetchUser();
  }, []);
  const calculateItemTotal = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, i) => sum + ((i.menu?.price ?? 0) * (i.quantity ?? 1)), 0);
  };
  async function updateStatus(buyId , current) {
    setsaving(buyId);
    try {
      const res = await apiClient.patch(`/admin/buy/${buyId}`, {
        status: status[buyId] ?? current,
      });
      const updateStatus = res.data.UpdateStatus;
      setUser((prev) =>
        prev.map((u) => ({
          ...u,
          post: u.buy.map((b) =>
            b.id === buyId ? { ...b, status: updateStatus } : b,
          ),
        })),
      );
    } catch (err) {
      handleError(err);
    } finally {
      setsaving(null);
    }
  }
  return (
    <div>
      {user.map((u) => (
        <div key={u.id} className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium">
          <div>
            <h1>ชื่อผู้ใช้ : {u.username}</h1>
            <h1>Email ของผู้ใช้ : {u.gmail}</h1>
          </div>
          <div className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium">
            {u.buy?.map((b) => (
              <div key={b.id} className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium">
                {b.item?.map((i) => (
                  <div key={i.menu?.id}>
                    <h1>สินค้า : {i.menu?.name}</h1>
                    <h1>ราคา : {i.menu?.price}</h1>
                    <h1>จำนวน : {i.quantity}</h1>
                    <h1>รายละเอียด : {i.details || "ไม่มี"}</h1>
                  </div>
                ))}
                <h1>สถานะปัจจุบัน : {b.status}</h1>
                <select
                  name="status"
                  value={status[b.id] ?? b.status}
                  onChange={(e) =>
                    setstatus({ ...status, [b.id]: e.target.value })
                  }
                >
                  <option value="Waiting">กำลังดำเนินการ</option>
                  <option value="Shipping">กำลังส่ง</option>
                  <option value="Received">ได้รับแล้ว</option>
                </select>
                <button
                  onClick={() => updateStatus(b.id, b.status)}
                  disabled={saving === b.id}
                >
                  {saving ? "กำลังอัพเดทสถานะ" : "อัพเดทสถานะ"}
                </button>
                <h3>ราคารวม: {calculateItemTotal(b.item)} บาท</h3>

              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
