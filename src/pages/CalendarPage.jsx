import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { mockEvents } from "../data/mockEvents";
import AddEventModal from "../components/AddEventModal";
import EventDetailModal from "../components/EventDetailModal";
import Navbar from "../components/Navbar";

export default function CalendarPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem("legacy_calendar_events");
    return savedEvents ? JSON.parse(savedEvents) : mockEvents;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "legacy_calendar_events",
      JSON.stringify(events)
    );

    window.dispatchEvent(
      new Event("legacy-events-updated")
    );
  }, [events]);

  function handleAddEvent(newEvent) {
    setEvents([...events, newEvent]);
  }

  function handleDeleteEvent(eventId) {
    setEvents(events.filter((event) => event.id !== eventId));
  }

  function handleEditEvent(updatedEvent) {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  }

  function handleCloseCalendar() {
    localStorage.setItem(
      "legacy_calendar_events",
      JSON.stringify(events)
    );

    window.dispatchEvent(
      new Event("legacy-events-updated")
    );

    navigate("/home");
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#FDF8F0] px-4 py-6">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-amber-100 p-6 relative">
          <button
            onClick={handleCloseCalendar}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-amber-50 text-stone-500"
            title="Đóng lịch"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 flex items-start justify-between gap-4 pr-10">
            <div>
              <h1 className="text-3xl font-bold text-brand-800">
                📅 Heritage Calendar
              </h1>

              <p className="text-stone-500 mt-2">
                Lịch gia đình: giỗ, sinh nhật và các sự kiện quan trọng.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingEvent(null);
                setModalOpen(true);
              }}
              className="btn-primary"
            >
              + Thêm sự kiện
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-2xl border border-amber-100 p-3">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                height={380}
                eventClick={(info) => {
                  const found = events.find(
                    (event) => event.title === info.event.title
                  );

                  setSelectedEvent(found);
                  setDetailOpen(true);
                }}
              />
            </div>

            <div className="lg:col-span-4">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <h2 className="text-lg font-bold text-brand-800 mb-4">
                  🔔 Sự kiện sắp tới
                </h2>

                <div className="space-y-3 max-h-[380px] overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setDetailOpen(true);
                      }}
                      className="p-3 rounded-xl bg-white border border-amber-100 cursor-pointer hover:bg-amber-100 transition"
                    >
                      <p className="font-semibold text-stone-800">
                        {event.title}
                      </p>

                      <p className="text-sm text-stone-500 mt-1">
                        {event.date}
                      </p>

                      {event.note && (
                        <p className="text-sm text-stone-600 mt-2">
                          Ghi chú: {event.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <AddEventModal
            open={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditingEvent(null);
            }}
            onAddEvent={(event) => {
              if (editingEvent) {
                handleEditEvent(event);
              } else {
                handleAddEvent(event);
              }
            }}
            editingEvent={editingEvent}
          />

          <EventDetailModal
            event={selectedEvent}
            open={detailOpen}
            onClose={() => setDetailOpen(false)}
            onDelete={handleDeleteEvent}
            onEdit={(event) => {
              setEditingEvent(event);
              setDetailOpen(false);
              setModalOpen(true);
            }}
          />
        </div>
      </div>
    </>
  );
}