import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

export default function UpdatePatient() {
  const { token } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
    date_of_birth: "",
    city: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true); // Dodato da sprečimo praznu formu

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/admin/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error("Failed to fetch patient data");
          return;
        }

        const data = await res.json();

        // ✅ Konverzija datuma u ispravan format za HTML input
        if (data.date_of_birth) {
          data.date_of_birth = data.date_of_birth.split("T")[0];
        }

        setFormData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patient:", error);
      }
    }
    fetchPatient();
  }, [id, token]);

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(`/api/admin/patients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (res.ok) {
      navigate("/admin/patients");
    } else {
      setErrors(data.errors || {});
    }
  }

  if (loading)
    return <p className="text-center mt-10">Loading patient data...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">Update Patient</h1>
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
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            className="input-field"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <p className="error">{errors.gender}</p>}
        </div>
        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            value={formData.date_of_birth}
            onChange={(e) =>
              setFormData({ ...formData, date_of_birth: e.target.value })
            }
            className="input-field"
          />
          {errors.date_of_birth && (
            <p className="error">{errors.date_of_birth}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="input-field"
          />
          {errors.city && <p className="error">{errors.city}</p>}
        </div>
        <div>
          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="input-field"
          />
          {errors.address && <p className="error">{errors.address}</p>}
        </div>
        <button type="submit" className="primary-btn w-full">
          Update Patient
        </button>
      </form>
    </div>
  );
}
