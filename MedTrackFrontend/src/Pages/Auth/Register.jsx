import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

export default function Register() {
  const { setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    address: "",
    city: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  async function handleRegister(e) {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.errors) {
      setErrors(data.errors);
    } else {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      navigate("/");
      setErrors({});
    }
  }

  return (
    <>
      <h1 className="title">Register a new account</h1>
      <form onSubmit={handleRegister} className="w-1/2 mx-auto space-y-4">
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender:
          </label>
          <div className="flex space-x-4 mt-1">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="mr-2"
              />
              Male
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="mr-2"
              />
              Female
            </label>
          </div>
          {errors.gender && <p className="error">{errors.gender}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth:
          </label>
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
        <button type="submit" className="primary-btn">
          Register
        </button>
      </form>
    </>
  );
}
