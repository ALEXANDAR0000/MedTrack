import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

export default function InProgressAppointment() {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);

  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchAppointment() {
      try {
        const res = await fetch(`/api/doctor/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch appointment");
        const data = await res.json();

        const found = data.find((appt) => appt.id === parseInt(id));
        if (!found) {
          console.error("Appointment not found");
          return navigate("/doctor/appointments");
        }
        setAppointment(found);

        if (found.status === "approved") {
          const startRes = await fetch(`/api/appointments/${id}/start`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!startRes.ok) {
            console.error("Failed to start appointment");
            return navigate("/doctor/appointments");
          } else {
            found.status = "in_progress";
            setAppointment({ ...found });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        navigate("/doctor/appointments");
      }
    }

    fetchAppointment();

    const handleBeforeUnload = async () => {
      if (appointment && appointment.status === "in_progress") {
        await finishAppointment();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [token]);

  async function finishAppointment() {
    try {
      const body = { notes, prescription };
      const res = await fetch(`/api/appointments/${id}/finish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error("Failed to finish appointment");
      }
      navigate("/doctor/appointments");
    } catch (error) {
      console.error("Error finishing appointment:", error);
    }
  }

  async function markNoShow() {
    try {
      const res = await fetch(`/api/appointments/${id}/noshow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to mark appointment as no-show");
      }
      navigate("/doctor/appointments");
    } catch (error) {
      console.error("Error marking as no-show:", error);
    }
  }

  function handleFinishClick() {
    const newErrors = {};

    if (!notes.trim()) {
      newErrors.notes = "Notes field is required.";
    }
    if (!prescription.trim()) {
      newErrors.prescription = "Prescription field is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    finishAppointment();
  }

  function handleNoShowClick() {
    let updatedNotes = notes.trim();
    let updatedPrescription = prescription.trim();

    if (!updatedNotes) {
      updatedNotes = "Patient did not show up.";
      setNotes(updatedNotes);
    }
    if (!updatedPrescription) {
      updatedPrescription = "Patient did not show up.";
      setPrescription(updatedPrescription);
    }

    markNoShow();
  }

  if (loading) {
    return <p className="text-center mt-10">Loading appointment...</p>;
  }

  if (!appointment) {
    return null;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center mb-4">In Progress Appointment</h1>

      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <p>
          <strong>Patient:</strong>{" "}
          {appointment.patient
            ? `${appointment.patient.first_name} ${appointment.patient.last_name}`
            : "N/A"}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(appointment.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </p>
        <p>
          <strong>Time:</strong>{" "}
          {new Date(appointment.date).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </p>
      </div>

      {appointment.status === "in_progress" ? (
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-bold mb-2">
            Add Medical Record & Prescription
          </h2>

          <div className="mb-4">
            <label className="block font-medium mb-1">
              Medical Record (notes):
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setErrors((prev) => ({ ...prev, notes: undefined }));
              }}
              rows={4}
              className="w-full p-2 border rounded"
              placeholder="Type patient notes..."
            />
            {errors.notes && (
              <p className="error text-red-600">{errors.notes}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">Prescription:</label>
            <textarea
              value={prescription}
              onChange={(e) => {
                setPrescription(e.target.value);
                setErrors((prev) => ({ ...prev, prescription: undefined }));
              }}
              rows={4}
              className="w-full p-2 border rounded"
              placeholder="Type prescription details..."
            />
            {errors.prescription && (
              <p className="error text-red-600">{errors.prescription}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleFinishClick}
              className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
            >
              Finish
            </button>
            <button
              onClick={handleNoShowClick}
              className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
            >
              Mark as NoShow
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center mt-4 text-gray-600">
          This appointment is not in progress.
        </p>
      )}
    </div>
  );
}
