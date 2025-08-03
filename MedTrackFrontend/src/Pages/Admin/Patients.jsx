import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import AdminDataTable from "../../Components/AdminDataTable";
import ConfirmationModal from "../../Components/ConfirmationModal";

export default function Patients() {
  const { token } = useContext(AppContext);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function fetchPatients() {
      const res = await fetch("/api/admin/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPatients(data);
    }
    fetchPatients();
  }, [token]);

  function handleDeleteClick() {
    if (!selectedPatient) return;
    setShowDeleteModal(true);
  }

  async function handleDeleteConfirm() {
    if (!selectedPatient) return;
    const res = await fetch(`/api/admin/users/${selectedPatient.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setPatients(patients.filter((pat) => pat.id !== selectedPatient.id));
      setSelectedPatient(null);
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
    { key: "gender", header: "Gender", width: "w-20" },
    { key: "date_of_birth", header: "Birth Date", width: "w-32" },
    { key: "city", header: "City", width: "min-w-[100px]" },
    { key: "address", header: "Address", width: "min-w-[150px]", className: "break-words" },
  ];

  return (
    <>
      <AdminDataTable
        title="Patients"
        data={patients}
        columns={columns}
        selectedItem={selectedPatient}
        onSelectItem={setSelectedPatient}
        onDelete={handleDeleteClick}
        addPath="/admin/patients/add"
        updatePath="/admin/patients/update/:id"
        entityName="Patient"
      />
      
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient"
        message={`Are you sure you want to delete ${selectedPatient?.first_name} ${selectedPatient?.last_name}? This action cannot be undone and will remove all their medical records.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
