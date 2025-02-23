import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

export default function Doctors() {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    async function fetchDoctors() {
      const res = await fetch("/api/admin/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDoctors(data);
    }
    fetchDoctors();
  }, [token]);

  async function handleDelete() {
    if (!selectedDoctor) return;
    const res = await fetch(`/api/admin/users/${selectedDoctor.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setDoctors(doctors.filter((doc) => doc.id !== selectedDoctor.id));
      setSelectedDoctor(null);
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="title text-center mb-4">Doctors</h1>
      <div className="flex justify-center space-x-2 mb-3">
        <button
          className="primary-btn px-6 py-2"
          onClick={() => navigate("/admin/doctors/add")}
        >
          Add Doctor
        </button>
        <button
          className="primary-btn px-6 py-2"
          disabled={!selectedDoctor}
          onClick={() => navigate(`/admin/doctors/update/${selectedDoctor.id}`)}
        >
          Update
        </button>
        <button
          className="primary-btn bg-red-500 hover:bg-red-600 px-6 py-2"
          disabled={!selectedDoctor}
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
              <th>Doctor Type</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr
                key={doctor.id}
                className={
                  selectedDoctor?.id === doctor.id ? "bg-blue-200" : ""
                }
                onClick={() => setSelectedDoctor(doctor)}
              >
                <td>{doctor.id}</td>
                <td>{doctor.first_name}</td>
                <td>{doctor.last_name}</td>
                <td>{doctor.email}</td>
                <td>{doctor.doctor_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
