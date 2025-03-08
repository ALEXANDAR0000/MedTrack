import { useState, useContext } from "react";
import { AppContext } from "../../Context/AppContext";

export default function MedicalRecords() {
  const { token } = useContext(AppContext);

  const [patientId, setPatientId] = useState("");
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setRecords([]);

    if (!patientId.trim()) {
      setError("Please enter a Patient ID.");
      return;
    }

    try {
      const res = await fetch(`/api/patients/${patientId}/medical-records`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch medical records");
      }
      const data = await res.json();
      if (!data || !Array.isArray(data) || data.length === 0) {
        setError("No medical records found for this patient.");
        return;
      }
      setRecords(data);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      setError("An error occurred while fetching medical records.");
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return "Invalid date";
    return dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center mb-6">Search Patient Medical Records</h1>

      <form
        onSubmit={handleSearch}
        className="flex items-center space-x-2 mb-6"
      >
        <input
          type="text"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Enter Patient ID"
          className="input-field w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Search
        </button>
      </form>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {records.map((record) => (
        <div key={record.id} className="bg-white shadow-md rounded-lg p-4 mb-4">
          <p>
            <strong>Record ID:</strong> {record.id}
          </p>
          <p>
            <strong>Date:</strong> {formatDate(record.created_at)}
          </p>
          <p>
            <strong>Notes:</strong> {record.notes}
          </p>
        </div>
      ))}
    </div>
  );
}
