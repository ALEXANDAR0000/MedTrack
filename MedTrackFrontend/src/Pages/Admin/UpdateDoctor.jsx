import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

export default function UpdateDoctor() {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    doctor_type: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchDoctor() {
      const res = await fetch(`/api/admin/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFormData(data);
    }
    fetchDoctor();
  }, [id, token]);

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(`/api/admin/doctors/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      navigate("/admin/doctors");
    } else {
      setErrors(data.errors || {});
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">Update Doctor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
              className="input-field"
            />
            {errors.first_name && <p className="error">{errors.first_name}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
              className="input-field"
            />
            {errors.last_name && <p className="error">{errors.last_name}</p>}
          </div>
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="input-field"
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div>
          <select
            value={formData.doctor_type}
            onChange={(e) =>
              setFormData({ ...formData, doctor_type: e.target.value })
            }
            className="input-field"
          >
            <option value="">Select Specialization</option>
            <option value="cardiologist">Cardiologist</option>
            <option value="neurologist">Neurologist</option>
            <option value="orthopedic">Orthopedic</option>
            <option value="dermatologist">Dermatologist</option>
            <option value="pediatrician">Pediatrician</option>
            <option value="surgeon">Surgeon</option>
            <option value="ophthalmologist">Ophthalmologist</option>
            <option value="gastroenterologist">Gastroenterologist</option>
            <option value="pulmonologist">Pulmonologist</option>
            <option value="psychiatrist">Psychiatrist</option>
          </select>
          {errors.doctor_type && <p className="error">{errors.doctor_type}</p>}
        </div>
        <button type="submit" className="primary-btn w-full">
          Update Doctor
        </button>
      </form>
    </div>
  );
}
