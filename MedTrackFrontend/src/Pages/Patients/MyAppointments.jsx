import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../Context/AppContext";

export default function MyAppointments() {
  const { token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openedPrescriptionId, setOpenedPrescriptionId] = useState(null);
  const [currentPrescription, setCurrentPrescription] = useState(null);
  const [prescriptionError, setPrescriptionError] = useState("");

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await fetch("/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");

        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [token]);

  function formatDateTime(dateString) {
    if (!dateString) return "Invalid Date";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return "Invalid Date";

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

  async function handleDelete(appointmentId) {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete appointment");

      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  }

  async function handleTogglePrescription(appt) {
    if (openedPrescriptionId === appt.id) {
      setOpenedPrescriptionId(null);
      setCurrentPrescription(null);
      setPrescriptionError("");
      return;
    }

    try {
      setPrescriptionError("");
      const res = await fetch(`/api/prescriptions/${appt.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404) {
          setPrescriptionError("No prescription found for this appointment.");
        } else {
          setPrescriptionError("Failed to fetch prescription.");
        }
        setOpenedPrescriptionId(appt.id);
        setCurrentPrescription(null);
        return;
      }

      const data = await res.json();
      setOpenedPrescriptionId(appt.id);
      setCurrentPrescription(data);
    } catch (error) {
      console.error("Error fetching prescription:", error);
      setPrescriptionError("An error occurred while fetching prescription.");
      setOpenedPrescriptionId(appt.id);
      setCurrentPrescription(null);
    }
  }

  if (loading) {
    return <p className="text-center mt-10">Loading appointments...</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">My Appointments</h1>
      {appointments.length === 0 ? (
        <p className="text-center mt-4 text-gray-500">No appointments found.</p>
      ) : (
        appointments.map((appointment) => {
          const { date, time } = formatDateTime(appointment.date);
          const isViewingPrescription = openedPrescriptionId === appointment.id;

          return (
            <div
              key={appointment.id}
              className="bg-white shadow-md rounded-lg p-4 mb-4 flex flex-col"
            >
              {!isViewingPrescription && (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <p>
                        <strong>Date:</strong> {date}
                      </p>
                      <p>
                        <strong>Time:</strong> {time}
                      </p>
                      {appointment.doctor ? (
                        <p>
                          <strong>Doctor:</strong>{" "}
                          {appointment.doctor.first_name}{" "}
                          {appointment.doctor.last_name}
                        </p>
                      ) : (
                        <p className="text-red-500">
                          Doctor information not available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p
                      className={`font-bold ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.toUpperCase()}
                    </p>
                    <div>
                      {appointment.status === "rejected" && (
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      )}
                      {appointment.status === "completed" && (
                        <button
                          onClick={() => handleTogglePrescription(appointment)}
                          className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                        >
                          View Prescription
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {isViewingPrescription && (
                <div className="mt-2">
                  <p className="font-bold mb-2">
                    Prescription for Appointment:
                  </p>

                  {prescriptionError ? (
                    <p className="text-red-500 mb-2">{prescriptionError}</p>
                  ) : currentPrescription ? (
                    <div className="bg-gray-100 p-3 rounded">
                      <p className="mb-2">
                        <strong>ID:</strong> {currentPrescription.id}
                      </p>
                      <p>
                        <strong>Details:</strong> {currentPrescription.details}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600">Loading prescription...</p>
                  )}

                  <button
                    onClick={() => handleTogglePrescription(appointment)}
                    className="bg-blue-500 text-white mt-3 py-1 px-3 rounded hover:bg-blue-600"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
