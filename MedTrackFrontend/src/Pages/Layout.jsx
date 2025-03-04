import { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";

export default function Layout() {
  const { user, token, setUser, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  async function handleLogout(e) {
    e.preventDefault();
    const res = await fetch("/api/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    console.log(data);
    if (res.ok) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      navigate("/");
    }
  }

  return (
    <>
      <header>
        <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
          {user ? (
            <p className="text-slate-400 text-xs">
              {user.first_name} {user.last_name} -{" "}
              <span className="text-blue-400 font-bold">{user.role}</span>
            </p>
          ) : (
            <div></div>
          )}
          <div className="flex items-center space-x-4">
            <Link to="/" className="nav-link">
              Home
            </Link>
            {/* Admin */}
            {user?.role === "admin" && (
              <>
                <Link to="/admin/patients" className="nav-link">
                  Patients
                </Link>
                <Link to="/admin/doctors" className="nav-link">
                  Doctors
                </Link>
              </>
            )}

            {/* Patient */}
            {user?.role === "patient" && (
              <>
                <Link to="/patient/schedule" className="nav-link">
                  Schedule Appointment
                </Link>
                <Link to="/patient/appointments" className="nav-link">
                  My Appointments
                </Link>
                <Link to="/patient/profile" className="nav-link">
                  My Profile
                </Link>
              </>
            )}
            {/* Doctor */}
            {user?.role === "doctor" && (
              <>
                <Link to="/doctor/inbox" className="nav-link">
                  Inbox
                </Link>
                <Link to="/doctor/appointments" className="nav-link">
                  Appointments
                </Link>
                <Link to="/doctor/medical-records" className="nav-link">
                  Medical Records
                </Link>
              </>
            )}

            {user ? (
              <form onSubmit={handleLogout}>
                <button className="nav-link">Logout</button>
              </form>
            ) : (
              <>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
