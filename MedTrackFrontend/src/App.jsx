import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./Pages/Layout";
import Home from "./Pages/Home";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import Patients from "./Pages/Admin/Patients";
import Doctors from "./Pages/Admin/Doctors";
import AddPatient from "./Pages/Admin/AddPatient";
import AddDoctor from "./Pages/Admin/AddDoctor";
import UpdatePatient from "./Pages/Admin/UpdatePatient";
import UpdateDoctor from "./Pages/Admin/UpdateDoctor";
import MyProfile from "./Pages/Patients/MyProfile";
import MyAppointments from "./Pages/Patients/MyAppointments";
import ScheduleAppointment from "./Pages/Patients/ScheduleAppointment";
import { useContext } from "react";
import { AppContext } from "./Context/AppContext";
import EditMyProfile from "./Pages/Patients/EditMyProfile";
import Inbox from "./Pages/Doctors/Inbox";
import Appointments from "./Pages/Doctors/Appointments";
import MedicalRecords from "./Pages/Doctors/MedicalRecords";
import InProgressAppointment from "./Pages/Doctors/InProgressAppointment";
import Availability from "./Pages/Doctors/Availability";

export default function App() {
  const { user } = useContext(AppContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/register" element={user ? <Home /> : <Register />} />
          <Route path="/login" element={user ? <Home /> : <Login />} />

          {/* Admin routes */}
          {user && user.role === "admin" ? (
            <>
              <Route path="/admin/patients" element={<Patients />} />
              <Route path="/admin/doctors" element={<Doctors />} />
              <Route path="/admin/patients/add" element={<AddPatient />} />
              <Route path="/admin/doctors/add" element={<AddDoctor />} />
              <Route
                path="/admin/patients/update/:id"
                element={<UpdatePatient />}
              />
              <Route
                path="/admin/doctors/update/:id"
                element={<UpdateDoctor />}
              />
            </>
          ) : null}

          {/* Patient routes */}
          {user && user.role === "patient" ? (
            <>
              <Route path="/patient/profile" element={<MyProfile />} />
              <Route path="/patient/profile/edit" element={<EditMyProfile />} />
              <Route
                path="/patient/appointments"
                element={<MyAppointments />}
              />
              <Route
                path="/patient/schedule"
                element={<ScheduleAppointment />}
              />
            </>
          ) : null}

          {/* Doctor routes */}
          {user && user.role === "doctor" ? (
            <>
              <Route path="/doctor/inbox" element={<Inbox />} />
              <Route path="/doctor/appointments" element={<Appointments />} />
              <Route
                path="/doctor/appointments/in-progress/:id"
                element={<InProgressAppointment />}
              />
              <Route
                path="/doctor/medical-records"
                element={<MedicalRecords />}
              />
              <Route path="/doctor/availability" element={<Availability />} />
            </>
          ) : null}

          {!user && (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
          {user && !["admin", "patient", "doctor"].includes(user.role) && (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
