import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function AddEventModal({
  open,
  onClose,
  onAddEvent,
  editingEvent,
}) {
  const [form, setForm] = useState({
    title: "",
    date: "",
    type: "birthday",
    note: "",
  });

  useEffect(() => {
    if (editingEvent) {
      setForm({
        title: editingEvent.title.replace(/^🎂 |^🕯️ |^📝 |^💍 /, ""),
        date: editingEvent.date,
        type: editingEvent.type || "birthday",
        note: editingEvent.note || "",
      });
    } else {
      setForm({
        title: "",
        date: "",
        type: "birthday",
        note: "",
      });
    }
  }, [editingEvent, open]);

  if (!open) return null;

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.date) {
      alert("Vui lòng nhập tên sự kiện và ngày");
      return;
    }

    const iconMap = {
      birthday: "🎂",
      death: "🕯️",
      meeting: "📝",
      anniversary: "💍",
    };

    onAddEvent({
      id: editingEvent ? editingEvent.id : Date.now(),
      title: `${iconMap[form.type]} ${form.title}`,
      date: form.date,
      type: form.type,
      note: form.note,
    });

    setForm({
      title: "",
      date: "",
      type: "birthday",
      note: "",
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-amber-100">
        <div className="flex items-center justify-between p-5 border-b border-amber-100">
          <h2 className="text-xl font-bold text-brand-800">
            {editingEvent ? "Sửa sự kiện" : "Thêm sự kiện"}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-amber-50"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-semibold text-stone-700">
              Tên sự kiện
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ví dụ: Giỗ ông An"
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-stone-700">
              Ngày
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-stone-700">
              Loại sự kiện
            </label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="input-field mt-1"
            >
              <option value="birthday">Sinh nhật</option>
              <option value="death">Ngày giỗ</option>
              <option value="meeting">Họp mặt</option>
              <option value="anniversary">Kỷ niệm</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-stone-700">
              Ghi chú
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Ví dụ: Chuẩn bị hoa quả, gọi người thân..."
              className="input-field mt-1 min-h-[90px]"
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {editingEvent ? "Lưu thay đổi" : "Lưu sự kiện"}
          </button>
        </form>
      </div>
    </div>
  );
}