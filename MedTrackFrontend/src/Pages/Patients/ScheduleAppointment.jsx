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
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedType) {
      setDoctors([]);
      setSelectedDoctor(null);
      return;
    }

    async function fetchDoctors() {
      try {
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
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchDoctors();
  }, [selectedType, token]);

  useEffect(() => {
    if (!selectedDoctor || !date) {
      setAvailableSlots([]);
      return;
    }

    async function fetchAvailableSlots() {
      try {
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
        setSelectedSlot(null);
      } catch (error) {
        console.error("Error:", error);
      }
    }

    fetchAvailableSlots();
  }, [selectedDoctor, date, token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const localErrors = {};

    if (!selectedType) {
      localErrors.type = "Please select a doctor type.";
    }
    if (!selectedDoctor) {
      localErrors.doctor_id = "Please select a doctor.";
    }
    if (!date) {
      localErrors.date = "Please select a date.";
    }
    if (!selectedSlot) {
      localErrors.slot = "Please select a time slot.";
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          date: date,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.errors) {
          setErrors(data.errors);
        } else {
          console.error("Unknown error scheduling appointment:", data);
        }
        setLoading(false);
        return;
      }

      navigate("/patient/appointments");
    } catch (error) {
      console.error("Error scheduling appointment:", error);
    }

    setLoading(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">Schedule Appointment</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
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
          {errors.type && <p className="error">{errors.type}</p>}
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
            value={selectedSlot?.id || ""}
            onChange={(e) => {
              const slotId = e.target.value;
              const slot = availableSlots.find(s => s.id == slotId);
              setSelectedSlot(slot || null);
            }}
            className="input-field"
            disabled={!date || availableSlots.length === 0}
          >
            <option value="">Select a time slot</option>
            {availableSlots.map((slot) => {
              // Handle both time strings (HH:MM) and datetime strings
              const formatTime = (timeStr) => {
                if (timeStr.includes('T')) {
                  // It's a datetime string, extract just the time part
                  return timeStr.split('T')[1].substring(0, 5);
                } else {
                  // It's already a time string
                  return timeStr;
                }
              };
              
              const startTime = formatTime(slot.start_time);
              const endTime = formatTime(slot.end_time);
              
              return (
                <option key={slot.id} value={slot.id}>
                  {startTime} - {endTime}
                </option>
              );
            })}
          </select>
          {errors.slot && <p className="error">{errors.slot}</p>}
        </div>

        <div className="flex justify-end">
          <button type="submit" className="primary-btn !w-auto" disabled={loading}>
            {loading ? "Scheduling..." : "Schedule Appointment"}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
