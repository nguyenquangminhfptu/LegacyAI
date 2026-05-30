import { X, Trash2 } from "lucide-react";

export default function EventDetailModal({
  event,
  open,
  onClose,
  onDelete,
  onEdit,
}) {
  if (!open || !event) return null;

  function handleDelete() {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa sự kiện này không?"
    );

    if (!confirmDelete) return;

    onDelete(event.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-amber-100">
        <div className="p-5 border-b border-amber-100 flex justify-between items-center">
          <h2 className="font-bold text-xl text-brand-800">
            Chi tiết sự kiện
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-amber-50"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-lg text-stone-800">
            {event.title}
          </h3>

          <p className="mt-3 text-stone-600">
            📅 {event.date}
          </p>

          <p className="mt-3 text-stone-600">
            📝 {event.note || "Không có ghi chú"}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => onEdit(event)}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2.5 rounded-xl transition"
            >
              ✏️ Sửa sự kiện
            </button>

            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
              Xóa sự kiện
            </button>

            <button
              onClick={onClose}
              className="w-full btn-secondary"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}