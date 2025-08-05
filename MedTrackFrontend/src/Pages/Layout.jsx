import { useContext, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { Menu, X } from "lucide-react";

export default function Layout() {
  const { user, token, setUser, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout(e) {
    e.preventDefault();
    const res = await fetch("/api/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      navigate("/");
      setOpen(false);
    }
  }

  const NavLinks = () => {
    const linkClass = "nav-link";
    const closeMenu = () => setOpen(false);

    return (
      <>
        <Link to="/" className={linkClass} onClick={closeMenu}>
          Home
        </Link>
        {user?.role === "admin" && (
          <>
            <Link
              to="/admin/patients"
              className={linkClass}
              onClick={closeMenu}
            >
              Patients
            </Link>
            <Link to="/admin/doctors" className={linkClass} onClick={closeMenu}>
              Doctors
            </Link>
          </>
        )}
        {user?.role === "patient" && (
          <>
            <Link
              to="/patient/schedule"
              className={linkClass}
              onClick={closeMenu}
            >
              Schedule Appointment
            </Link>
            <Link
              to="/patient/appointments"
              className={linkClass}
              onClick={closeMenu}
            >
              My Appointments
            </Link>
            <Link
              to="/patient/profile"
              className={linkClass}
              onClick={closeMenu}
            >
              My Profile
            </Link>
          </>
        )}
        {user?.role === "doctor" && (
          <>
            <Link to="/doctor/inbox" className={linkClass} onClick={closeMenu}>
              Inbox
            </Link>
            <Link
              to="/doctor/appointments"
              className={linkClass}
              onClick={closeMenu}
            >
              Appointments
            </Link>
            <Link
              to="/doctor/medical-records"
              className={linkClass}
              onClick={closeMenu}
            >
              Medical Records
            </Link>
            <Link
              to="/doctor/availability"
              className={linkClass}
              onClick={closeMenu}
            >
              Availability
            </Link>
          </>
        )}
        {user ? (
          <form onSubmit={handleLogout}>
            <button className="nav-link w-full text-left md:w-auto">
              Logout
            </button>
          </form>
        ) : (
          <>
            <Link to="/register" className={linkClass} onClick={closeMenu}>
              Register
            </Link>
            <Link to="/login" className={linkClass} onClick={closeMenu}>
              Login
            </Link>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <header>
        <nav className="flex items-center justify-between">
          {user ? (
            <p className="text-slate-400 text-xs">
              {user.first_name} {user.last_name} –{" "}
              <span className="text-blue-400 font-bold">{user.role}</span>
            </p>
          ) : (
            <div />
          )}

          {user ? (
            <div className="flex items-center">
              <button onClick={() => setOpen(!open)} className="md:hidden ml-2">
                {open ? (
                  <X size={30} className="text-white" />
                ) : (
                  <Menu size={30} className="text-white" />
                )}
              </button>
              <div
                className={`${open ? "flex animate-slideDown" : "hidden"}
                            fixed top-16 right-0 z-20 w-48 flex-col 
                            bg-slate-800 p-4 shadow-lg
                            md:static md:flex md:top-auto md:right-auto
                            md:z-auto md:w-auto md:flex-row md:bg-transparent
                            md:p-0 md:shadow-none`}
              >
                <NavLinks />
              </div>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              <NavLinks />
            </div>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}
