import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { useContext } from "react";
import { AppContext } from "./Context/AppContext";

export default function App() {
  const { user } = useContext(AppContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/register" element={user ? <Home /> : <Register />} />
          <Route path="/login" element={user ? <Home /> : <Login />} />

          {/* ADMIN ROUTES - dodajemo samo ako je user admin */}
          {user && user.role === "admin" && (
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
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
