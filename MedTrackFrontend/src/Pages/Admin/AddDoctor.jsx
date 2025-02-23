import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

export default function AddDoctor() {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    doctor_type: "",
  });

  const [errors, setErrors] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/admin/doctors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.errors) {
      setErrors(data.errors);
    } else {
      navigate("/admin/doctors");
      setErrors({});
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">Add Doctor</h1>
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
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="input-field"
          />
          {errors.password && <p className="error">{errors.password}</p>}
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
            <option value="kardiolog">Kardiolog</option>
            <option value="neurolog">Neurolog</option>
            <option value="ortoped">Ortoped</option>
            <option value="dermatolog">Dermatolog</option>
            <option value="pedijatar">Pedijatar</option>
            <option value="hirurg">Hirurg</option>
            <option value="oftalmolog">Oftalmolog</option>
            <option value="gastroenterolog">Gastroenterolog</option>
            <option value="pulmolog">Pulmolog</option>
            <option value="psihijatar">Psihijatar</option>
          </select>
          {errors.doctor_type && <p className="error">{errors.doctor_type}</p>}
        </div>
        <button type="submit" className="primary-btn w-full">
          Add Doctor
        </button>
      </form>
    </div>
  );
}
