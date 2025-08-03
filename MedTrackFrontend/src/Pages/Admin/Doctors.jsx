import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import AdminDataTable from "../../Components/AdminDataTable";
import ConfirmationModal from "../../Components/ConfirmationModal";

export default function Doctors() {
  const { token } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  function handleDeleteClick() {
    if (!selectedDoctor) return;
    setShowDeleteModal(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedDoctor) return;
    const res = await fetch(`/api/admin/users/${selectedDoctor.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setDoctors(doctors.filter((doc) => doc.id !== selectedDoctor.id));
      setSelectedDoctor(null);
    }
    setShowDeleteModal(false);
  }

  function handleDeleteCancel() {
    setShowDeleteModal(false);
  }

  const columns = [
    { key: "id", header: "ID", width: "w-16" },
    { key: "first_name", header: "First Name", width: "min-w-[120px]" },
    { key: "last_name", header: "Last Name", width: "min-w-[120px]" },
    { key: "email", header: "Email", width: "min-w-[200px]", className: "break-all" },
    { key: "doctor_type", header: "Doctor Type", width: "min-w-[150px]" },
  ];

  return (
    <>
      <AdminDataTable
        title="Doctors"
        data={doctors}
        columns={columns}
        selectedItem={selectedDoctor}
        onSelectItem={setSelectedDoctor}
        onDelete={handleDeleteClick}
        addPath="/admin/doctors/add"
        updatePath="/admin/doctors/update/:id"
        entityName="Doctor"
      />
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Doctor"
        message={`Are you sure you want to delete Dr. ${selectedDoctor?.first_name} ${selectedDoctor?.last_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
