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

  function formatAppointment(appointment) {
    if (!appointment.date) return { date: "Invalid Date", time: "Invalid Time" };

    const dateObj = new Date(appointment.date);
    if (isNaN(dateObj.getTime()))
      return { date: "Invalid Date", time: "Invalid Time" };

    const date = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Format time from start_time and end_time fields
    const formatTime = (timeStr) => {
      if (!timeStr) return "00:00";
      if (timeStr.includes('T')) {
        return timeStr.split('T')[1].substring(0, 5);
      }
      return timeStr;
    };

    const startTime = formatTime(appointment.start_time);
    const endTime = formatTime(appointment.end_time);
    const time = `${startTime} - ${endTime}`;

    return { date, time };
  }

  function handleStart(appointmentId) {
    navigate(`/doctor/appointments/in-progress/${appointmentId}`);
  }

  function isToday(dateString) {
    if (!dateString) return false;
    const appointmentDate = new Date(dateString);
    const today = new Date();
    
    return appointmentDate.toDateString() === today.toDateString();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">Approved Appointments</h1>

      {appointments.map((appt) => {
        const { date, time } = formatAppointment(appt);
        const isTodayAppointment = isToday(appt.date);
        return (
          <div
            key={appt.id}
            className={`shadow-md rounded-lg p-4 mb-4 flex flex-col ${
              isTodayAppointment 
                ? "bg-blue-50 border-2 border-blue-300" 
                : "bg-white"
            }`}
          >
            <p>
              <strong>Patient:</strong>{" "}
              {appt.patient
                ? `${appt.patient.first_name} ${appt.patient.last_name}`
                : "N/A"}
            </p>
            <p>
              <strong>Date:</strong> {date}
              {isTodayAppointment && (
                <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                  TODAY
                </span>
              )}
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
