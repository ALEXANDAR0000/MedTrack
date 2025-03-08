import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";

export default function Appointments() {
  const { token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchApprovedAppointments() {
      try {
        const res = await fetch("/api/doctor/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch doctor appointments");
        }

        const data = await res.json();
        const approved = data.filter((appt) => appt.status === "approved");
        approved.sort((a, b) => new Date(a.date) - new Date(b.date));
        setAppointments(approved);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        setLoading(false);
      }
    }

    fetchApprovedAppointments();
  }, [token]);

  if (loading) {
    return <p className="text-center mt-10">Loading appointments...</p>;
  }

  if (!appointments.length) {
    return <p className="text-center mt-10">No approved appointments.</p>;
  }

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
        timeZone: "UTC",
      }),
      time: dateObj.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }),
    };
  }

  function handleStart(appointmentId) {
    navigate(`/doctor/appointments/in-progress/${appointmentId}`);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">Approved Appointments</h1>

      {appointments.map((appt) => {
        const { date, time } = formatDateTime(appt.date);
        return (
          <div
            key={appt.id}
            className="bg-white shadow-md rounded-lg p-4 mb-4 flex flex-col"
          >
            <p>
              <strong>Patient:</strong>{" "}
              {appt.patient
                ? `${appt.patient.first_name} ${appt.patient.last_name}`
                : "N/A"}
            </p>
            <p>
              <strong>Date:</strong> {date}
            </p>
            <p>
              <strong>Time:</strong> {time}
            </p>
            <button
              onClick={() => handleStart(appt.id)}
              className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 mt-2 w-fit"
            >
              Start
            </button>
          </div>
        );
      })}
    </div>
  );
}
