"use client";

import { useApiError } from "@/hooks/useApiError";
import { apiClient } from "@/services/api/apiClient";
import { useEffect, useState } from "react";

export default function UpdateStatus() {
  const [user, setUser] = useState([]);
  const [loading, setloading] = useState(true);
  const [status, setstatus] = useState({});
  const [search, setsearch] = useState("");
  const [sort, setsort] = useState("desc");
  const [appliedSearch, setappliedSearch] = useState("");
  const [saving, setsaving] = useState(null);
  const { handleError } = useApiError();
  async function fetchUser() {
    try {
      const query = new URLSearchParams({
        search: appliedSearch,
        sort,
      }).toString();
      const res = await apiClient.get(`/admin/users?${query}`);
      setUser(res.data);
    } catch (err) {
      handleError(err);
    } finally {
      setloading(false);
    }
  }
  useEffect(() => {
    fetchUser();
  }, []);
  async function handleFilter(e) {
    e.preventDefault();
    setappliedSearch(search);
    fetchUser();
  }
  const calculateItemTotal = (item) => {
    if (Array.isArray(item)) {
      return item.reduce((sum, i) => sum + i.menu?.price * i.quantity, 0);
    }
  };
  async function updateStatus(buyId, current) {
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
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <form onSubmit={handleFilter}>
        <input
          type="text"
          placeholder="ค้นหา"
          value={search}
          onChange={(e) => setsearch(e.target.value)}
        />
        <button>ค้นหา</button>
        {user.map((u) => (
          <div
            key={u.id}
            className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium"
          >
            <div>
              <h1>ชื่อผู้ใช้ : {u.username}</h1>
              <h1>Email ของผู้ใช้ : {u.gmail}</h1>
            </div>
            <div>
              {u.buy?.map((b) => {
                const matchItem = b.item?.filter((item) =>
                  item.menu.name
                    .toLowerCase()
                    .includes(appliedSearch.toLowerCase()),
                );

                if (matchItem.length === 0) {
                  return null;
                }
                const orderTotal = calculateItemTotal(b.item);
                return (
                  <div
                    key={b.id}
                    className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium"
                  >
                    {matchItem.map((i) => (
                      <div key={i.menu?.id}>
                        <h1>สินค้า : {i.menu?.name}</h1>
                        <h1>ราคา : {i.menu?.price}</h1>
                        <h1>จำนวน : {i.quantity}</h1>
                        <h1>รายละเอียด : {i.details || "ไม่มี"}</h1>
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
                      </div>
                    ))}
                    <h3>ราคารวม: {orderTotal} บาท</h3>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </form>
    </div>
  );
}
