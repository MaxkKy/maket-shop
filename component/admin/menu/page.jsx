"use client";
import { useApiError } from "@/hooks/useApiError";
import { apiClient } from "@/services/api/apiClient";
import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";

export default function Menu() {
  const [form, setform] = useState({
    name: "",
    price: "",
    stock: "",
    type: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    stock: "",
    type: "",
  });
  const [saving, setsaving] = useState(false);

  const onChange = (e) => setform({ ...form, [e.target.name]: e.target.value });
  const onEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const { handleError } = useApiError();
  const [editId, seteditId] = useState(null);
  const [message, setmessage] = useState("");
  const [menu, setmenu] = useState([]);
  function cancelClick() {
    seteditId(null);
  }
  function editClick(item) {
    seteditId(item.id);
    setEditForm({
      name: item.name,
      price: item.price,
      stock: item.stock,
      type: item.type,
    });
  }
  async function fetchMenus() {
    try {
      const res = await apiClient.get(`/menu`);
      setmenu(res.data);
    } catch (err) {
      handleError(err);
    }
  }
  useEffect(() => {
    fetchMenus();
  }, []);
  async function handleSave(itemId) {
    setsaving(itemId);
    try {
      const res = await apiClient.put(`/admin/menu/${itemId}`, {
        name: editForm.name,
        price: editForm.price,
        stock: Number(editForm.stock),
        type: editForm.type,
      });
      setmenu((prev) =>
        prev.map((item) => (item.id === itemId ? res.data.UpdateMenu : item)),
      );
      seteditId(null);
    } catch (err) {
      console.log(err);
      handleError(err);
    } finally {
      setsaving(false);
    }
  }
  async function onSubmit(e) {
    e.preventDefault();
    setsaving(true);
    try {
      await apiClient.post("/menu", {
        name: form.name,
        price: form.price,
        stock: Number(form.stock),
        type: form.type,
      });
      setmessage("เพิ่มเมนูสำเร็จ");
      setform({ name: "", price: "", stock: "", type: "" });
      fetchMenus();
    } catch (err) {
      handleError(err);
    } finally {
      setsaving(false);
    }
  }
  return (
    <main>
      <h1>จัดการเมนูและ stock</h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="สินค้า"
        />
        <h1>
          ราคา :{" "}
          <NumericFormat
            placeholder="ราคา"
            name="price"
            value={form.price}
            thousandSeparator=","
            thousandsGroupStyle="thousand"
            suffix=" บาท"
            fixedDecimalScale
            decimalScale={2}
            onValueChange={(v) => setform({ ...form, price: v.value})}
          />
        </h1>
        <NumericFormat
          value={form.stock}
          thousandSeparator=","
          thousandsGroupStyle="thousand"
          suffix=" จำนวน"
          placeholder="กรอกจำนวน"
          onValueChange={(v) => setform({ ...form, stock: v.floatValue })}
        />
        <select name="type" value={form.type} onChange={onChange}>
          <option value="">โปรดเลือกประเภทสินค้า</option>
          <option value="อาหาร/นำ้ดื่ม">อาหาร/นำ้ดื่ม</option>
          <option value="อุปกรณ์เครื่องใช้ไฟฟ้า">อุปกรณ์เครื่องใช้ไฟฟ้า</option>
          <option value="เครื่องใช้ในครัว">เครื่องใช้ในครัว</option>
        </select>
        <button disabled={saving}>
          {saving ? "กำลังเพิ่ม" : "เพิ่ม Menu"}
        </button>
        {message && <div style={{ color: "crimson" }}>{message}</div>}
      </form>

      <section>
        <div>
          <h1>รายการสินค้า</h1>
          {menu.map((item) => {
            const isEditing = editId === item.id;
            return (
              <div key={item.id} className="flex gap-4">
                <div>
                  <h1>
                    สินค้า : {item.name} ราคา : {item.price}
                  </h1>
                  <h1>stock : {item.stock} ประเภทสินค้า : {item.type}</h1>
                  <button onClick={() => editClick(item)}>แก้ไข</button>
                </div>
                {isEditing && (
                  <div className="shadow-md justify-end">
                    <h1>แก้ไขข้อมูล</h1>
                    <div>
                      <h1>ชื่อสินค้า</h1>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={onEditChange}
                      />
                    </div>
                    <div>
                      <h1>ราคา</h1>
                      <NumericFormat
                        suffix=" บาท"
                        value={editForm.price}
                        thousandSeparator=","
                        thousandsGroupStyle="thousand"
                        placeholder="กรอกราคา"
                        decimalScale={2}
                        fixedDecimalScale
                        onValueChange={(v) =>
                          setEditForm({ ...editForm, price: v.floatValue })
                        }
                      />
                    </div>
                    <div>
                      <h1>จำนวน</h1>
                      <NumericFormat
                        thousandSeparator=","
                        thousandsGroupStyle="thousand"
                        value={editForm.stock}
                        suffix=" จำนวน"
                        placeholder="กรอกจำนวน"
                        onValueChange={(v) => setEditForm({...editForm,stock:v.floatValue })}
                      />
                    </div>
                    <div>
                      <h1>ประเภทสินค้า</h1>
                      <select
                        name="type"
                        value={editForm.type}
                        onChange={onEditChange}
                      >
                        <option value="">โปรดเลือกประเภทสินค้า</option>
                        <option value="อาหาร/นำ้ดื่ม">อาหาร/นำ้ดื่ม</option>
                        <option value="อุปกรณ์เครื่องใช้ไฟฟ้า">
                          อุปกรณ์เครื่องใช้ไฟฟ้า
                        </option>
                        <option value="เครื่องใช้ในครัว">
                          เครื่องใช้ในครัว
                        </option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleSave(item.id)}
                      disabled={saving}
                    >
                      {saving ? "กำลังบันทึก" : "อัพเดทสินค้า"}
                    </button>
                    <div>
                      <button onClick={cancelClick}>ยกเลิก</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
