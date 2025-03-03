import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";

export default function ScheduleAppointment() {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();

  const [doctorTypes] = useState([
    "cardiologist",
    "neurologist",
    "orthopedic",
    "dermatologist",
    "pediatrician",
    "surgeon",
    "ophthalmologist",
    "gastroenterologist",
    "pulmonologist",
    "psychiatrist",
  ]);

  const [selectedType, setSelectedType] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedType) {
      setDoctors([]);
      setSelectedDoctor(null);
      return;
    }

    async function fetchDoctors() {
      const res = await fetch("/api/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch doctors");
        return;
      }

      const data = await res.json();
      setDoctors(data.filter((doc) => doc.doctor_type === selectedType));
      setSelectedDoctor(null);
    }

    fetchDoctors();
  }, [selectedType, token]);

  useEffect(() => {
    if (!selectedDoctor || !date) {
      setAvailableSlots([]);
      return;
    }

    async function fetchAvailableSlots() {
      const res = await fetch(
        `/api/appointments/available/${selectedDoctor.id}/${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch available slots");
        return;
      }

      const data = await res.json();
      setAvailableSlots(data.available_slots);
      setSelectedSlot("");
    }

    fetchAvailableSlots();
  }, [selectedDoctor, date, token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const appointmentDate = `${date}T${selectedSlot}:00`;

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        doctor_id: selectedDoctor.id,
        date: appointmentDate,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      navigate("/patient/appointments");
    } else {
      setErrors(data.errors || {});
    }

    setLoading(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">Schedule Appointment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Doctor Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field"
          >
            <option value="">Select a type</option>
            {doctorTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          {errors.doctor_type && <p className="error">{errors.doctor_type}</p>}
        </div>

        <div>
          <label>Doctor:</label>
          <select
            value={selectedDoctor ? selectedDoctor.id : ""}
            onChange={(e) =>
              setSelectedDoctor(
                doctors.find((doc) => doc.id === parseInt(e.target.value))
              )
            }
            className="input-field"
            disabled={!selectedType || doctors.length === 0}
          >
            <option value="">Select a doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.first_name} {doc.last_name}
              </option>
            ))}
          </select>
          {errors.doctor_id && <p className="error">{errors.doctor_id}</p>}
        </div>

        <div>
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            min={new Date().toISOString().split("T")[0]}
            disabled={!selectedDoctor}
          />
          {errors.date && <p className="error">{errors.date}</p>}
        </div>

        <div>
          <label>Available Slots:</label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="input-field"
            disabled={!date || availableSlots.length === 0}
          >
            <option value="">Select a time slot</option>
            {availableSlots.map((slot, index) => (
              <option key={index} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {errors.slot && <p className="error">{errors.slot}</p>}
        </div>

        <button type="submit" className="primary-btn w-full" disabled={loading}>
          {loading ? "Scheduling..." : "Schedule Appointment"}
        </button>
      </form>
    </div>
  );
}
