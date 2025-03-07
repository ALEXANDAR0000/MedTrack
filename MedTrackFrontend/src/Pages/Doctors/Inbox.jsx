import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";

export default function Inbox() {
  const { token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch("/api/doctor/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch doctor appointments");
        }

        const data = await res.json();
        const pendingAppointments = data.filter(
          (appointment) => appointment.status === "pending"
        );

        pendingAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

        setAppointments(pendingAppointments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [token]);

  function formatDateTime(dateString) {
    if (!dateString) return { date: "Invalid Date", time: "Invalid Time" };

    const dateObj = new Date(dateString);

    if (isNaN(dateObj.getTime()))
      return { date: "Invalid Date", time: "Invalid Time" };

    return {
      date: dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: dateObj.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }),
    };
  }

  async function handleStatusChange(appointmentId, newStatus) {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update appointment status");
      }

      setAppointments((prevAppointments) =>
        prevAppointments.filter((appt) => appt.id !== appointmentId)
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  }

  if (loading) {
    return <p className="text-center mt-10">Loading appointments...</p>;
  }

  if (!appointments.length) {
    return <p className="text-center mt-10">No pending appointments.</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">Pending Appointments</h1>

      {appointments.map((appointment) => {
        const { date, time } = formatDateTime(appointment.date);
        return (
          <div
            key={appointment.id}
            className="bg-white shadow-md rounded-lg p-4 mb-4 flex flex-col"
          >
            <p>
              <strong>Patient:</strong>{" "}
              {appointment.patient
                ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
                : "N/A"}
            </p>
            <p>
              <strong>Date:</strong> {date}
            </p>
            <p>
              <strong>Time:</strong> {time}
            </p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={() => handleStatusChange(appointment.id, "approved")}
                className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange(appointment.id, "rejected")}
                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
