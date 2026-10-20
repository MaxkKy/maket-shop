"use client";

import { useApiError } from "@/hooks/useApiError";
import { apiClient } from "@/services/api/apiClient";
import { useEffect, useState } from "react";

export default function AllowRole() {
  const [admins, setadmins] = useState([]);
  const [role, setrole] = useState({});
  const { handleError } = useApiError();
  const [saving, setsaving] = useState(null);
  const [message, setmessage] = useState({});
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await apiClient.get("/admins");
        setadmins(res.data);
      } catch (err) {
        handleError(err);
      }
    }
    fetchData();
  }, []);
  async function updateRole(postId, current) {
    setsaving(postId);
    try {
      const res = await apiClient.patch(`/admin/${postId}`, {
        role: role[postId] ?? current,
      });
      const updateRole = res.data.admins;
      setadmins((prev) =>
        prev.map((admins) =>
          admins === postId ? { ...admins, role: updateRole.role } : admins,
        ),
      );
      setmessage((prev) => ({ ...prev, [postId]: "Update Success" }));
      setTimeout(() => {
        setmessage((prev) => ({ ...prev, [postId]: "" }));
      }, 3000);
    } catch (err) {
      handleError(err);
    } finally {
      setsaving(null);
    }
  }
  return (
    <div>
      {admins.map((item) => (
        <div
          key={item.id}
          className="flex flex-col items-center bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs md:flex-row md:max-w-xl md:flex-row md:max-w-xl"
        >
          <div className="flex flex-col justify-between md:p-4 leading-normal">
            <div className="mb-2 text-2xl font-bold tracking-tight text-heading">
              <h1>{item.username}</h1>
            </div>
            <div className="mb-6 text-body">
              <p>{item.gmail}</p>
            </div>

            <div className="inline-flex items-center w-auto text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
              <select
                name="role"
                value={role[item.id] ?? item.role}
                onChange={(e) =>
                  setrole({ ...role, [item.id]: e.target.value })
                }
              >
                <option value="ADMIN">Admin</option>
                <option value="PRODUCT_MANAGER">Product Manager</option>
              </select>
              <button
                disabled={saving === item.id}
                onClick={() => updateRole(item.id, item.status)}
              >
                {setsaving === item.id ? "โปรดรอซักครู่" : "ยืนยัน"}
              </button>
            </div>
            {message[item.id] && (
              <div style={{ color: "green" }}>{message[item.id]}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
