import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

export default function Patients() {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    async function fetchPatients() {
      const res = await fetch("/api/admin/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPatients(data);
    }
    fetchPatients();
  }, [token]);

  async function handleDelete() {
    if (!selectedPatient) return;
    const res = await fetch(`/api/admin/users/${selectedPatient.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setPatients(patients.filter((pat) => pat.id !== selectedPatient.id));
      setSelectedPatient(null);
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="title text-center mb-4">Patients</h1>
      <div className="flex justify-center space-x-2 mb-3">
        <button
          className="primary-btn px-6 py-2"
          onClick={() => navigate("/admin/patients/add")}
        >
          Add Patient
        </button>
        <button
          className="primary-btn px-6 py-2"
          disabled={!selectedPatient}
          onClick={() =>
            navigate(`/admin/patients/update/${selectedPatient.id}`)
          }
        >
          Update
        </button>
        <button
          className="primary-btn bg-red-500 hover:bg-red-600 px-6 py-2"
          disabled={!selectedPatient}
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>City</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className={
                  selectedPatient?.id === patient.id ? "bg-blue-200" : ""
                }
                onClick={() => setSelectedPatient(patient)}
              >
                <td>{patient.id}</td>
                <td>{patient.first_name}</td>
                <td>{patient.last_name}</td>
                <td>{patient.email}</td>
                <td>{patient.gender}</td>
                <td>{patient.date_of_birth.split("T")[0]}</td>
                <td>{patient.city}</td>
                <td>{patient.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
