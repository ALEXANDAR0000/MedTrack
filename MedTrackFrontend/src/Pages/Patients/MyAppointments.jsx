import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../Context/AppContext";

export default function MyAppointments() {
  const { token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch("/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await res.json();

        const sortedAppointments = data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setAppointments(sortedAppointments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [token]);

  function getStatusColor(status) {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "completed":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  }

  if (loading)
    return <p className="text-center mt-10">Loading appointments...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">My Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-center mt-4 text-gray-500">No appointments found.</p>
      ) : (
        appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white shadow-md rounded-lg p-4 mb-4 flex flex-col"
          >
            <p>
              <strong>Date:</strong>{" "}
              {new Date(appointment.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date(appointment.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {appointment.doctor ? (
              <p>
                <strong>Doctor:</strong> {appointment.doctor.first_name}{" "}
                {appointment.doctor.last_name}
              </p>
            ) : (
              <p className="text-red-500">Doctor information not available</p>
            )}

            <p className={`font-bold ${getStatusColor(appointment.status)}`}>
              {appointment.status.toUpperCase()}
            </p>

            {appointment.status === "completed" && (
              <button className="bg-blue-500 text-white py-2 px-4 mt-2 rounded hover:bg-blue-700">
                View Prescription
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
