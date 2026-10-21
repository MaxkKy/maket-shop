"use client";

import { useApiError } from "@/hooks/useApiError";
import { apiClient } from "@/services/api/apiClient";
import { useEffect, useState } from "react";

export default function History() {
  const [post, setpost] = useState([]);
  const [search, setsearch] = useState("");
  const [sort, setsort] = useState("desc");
  const [loading, setloading] = useState(true);
  const [appliedSearch, setappliedSearch] = useState("");
  const { handleError } = useApiError();
  async function fetchData() {
    try {
      const query = new URLSearchParams({
        search: appliedSearch,
        sort,
      }).toString();
      const res = await apiClient.get(`/buy?${query}`);
      setpost(res.data);
    } catch (err) {
      handleError(err);
    } finally {
      setloading(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);
  async function onDelete(buyId) {
    if (!confirm("Delete this Order? This cannot be undone")) return;
    try {
      await apiClient.delete(`/buy/${buyId}`);
      setpost((post) => post.filter((p) => p.id !== buyId));
    } catch (err) {
      handleError(err);
    }
  }
  async function handleFilterChange(e) {
    e.preventDefault();
    setappliedSearch(search);
    fetchData();
  }
  // select: {
  //     id: true,
  //     createdAt: true,
  //     status: true,
  //     updateAt: true,item: {select: {quantity: true,details: true,menu: {select: {
  //             id: true,name: true,price: true,stock: true,type: true,
  if (loading) return <div>Loading...</div>;
  return (
    <div>
      <form onSubmit={handleFilterChange}>
        <input
          type="text"
          value={search}
          placeholder="ค้นหาชื่อสินค้าที่สั่งไว้"
          onChange={(e) => setsearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setsort(e.target.value)}>
          <option value="">Select Sort</option>
          <option value="desc">ใหม่ ไป เก่า</option>
          <option value="asc">เก่า ไป ใหม่</option>
        </select>
        <button>Search</button>
        {post.map((buy) => {
          const matchItem = buy.item.filter((i) =>
            i.menu.name.includes(appliedSearch),
          );
          if(matchItem.length === 0){
            return null
          }
          return (
            <div
              key={buy.id}
              className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium"
            >
              {matchItem.map((item) => (
                <div
                  key={item.menu.id}
                  className="bg-neutral-primary-soft block max-w-sm p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium"
                >
                  <h1>
                    สินค้า : {item.menu.name} ราคา : {item.menu.price} บาท
                  </h1>
                  <h1>รายละเอียด : {item.details || "ไม่มี"}</h1>
                  <h1>จำนวน : {item.quantity}</h1>
                  <div className="flex gap-4">
                    <h1>
                      วันที่สั่ง : {new Date(buy.createdAt).toLocaleString()}{" "}
                    </h1>
                    <h1>
                      วันที่อัพเดทสถานะ :{" "}
                      {new Date(buy.updateAt).toLocaleString()}
                    </h1>
                  </div>
                </div>
              ))}

              <h1>สถานะ : {buy.status}</h1>
              <button onClick={() => onDelete(buy.id)}>Delete</button>
            </div>
          );
        })}
      </form>
    </div>
  );
}
