import { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import ConfirmationModal from "../../Components/ConfirmationModal";

export default function Availability() {
  const { token } = useContext(AppContext);

  const [templates, setTemplates] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("templates");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState("template");
  const [errors, setErrors] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, ruleId: null, ruleName: "" });

  const [formData, setFormData] = useState({
    day_of_week: "",
    specific_date: "",
    start_time: "09:00",
    end_time: "17:00",
    is_available: true,
    slot_duration: 60,
    reason: "",
  });

  const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  useEffect(() => {
    fetchAvailability();
  }, [token]);

  async function fetchAvailability() {
    try {
      const res = await fetch("/api/doctor/availability", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch availability");
        return;
      }

      const data = await res.json();
      setTemplates(data.templates || []);
      setExceptions(data.exceptions || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      day_of_week: "",
      specific_date: "",
      start_time: "09:00",
      end_time: "17:00",
      is_available: true,
      slot_duration: 60,
      reason: "",
    });
    setErrors({});
    setShowAddForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    const endpoint = formType === "template" 
      ? "/api/doctor/availability/template" 
      : "/api/doctor/availability/exception";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Response data:", data); // Debug log
        if (data?.errors) {
          setErrors(data.errors);
        } else if (data?.message) {
          setErrors({ general: data.message });
        } else {
          console.error("Error:", data);
          setErrors({ general: "An error occurred. Please try again." });
        }
        return;
      }

      resetForm();
      fetchAvailability();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function openDeleteModal(rule) {
    const ruleName = rule.rule_type === "template" 
      ? `${dayNames[rule.day_of_week]} (${rule.start_time} - ${rule.end_time})`
      : `${new Date(rule.specific_date).toLocaleDateString()} (${rule.start_time} - ${rule.end_time})`;
    
    setDeleteModal({
      isOpen: true,
      ruleId: rule.id,
      ruleName: ruleName
    });
  }

  function closeDeleteModal() {
    setDeleteModal({ isOpen: false, ruleId: null, ruleName: "" });
  }

  async function handleDeleteConfirm() {
    try {
      const res = await fetch(`/api/doctor/availability/${deleteModal.ruleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchAvailability();
        closeDeleteModal();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function openAddForm(type) {
    setFormType(type);
    setShowAddForm(true);
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="title mb-6">Manage Availability</h1>

      {/* Tab Navigation with Add Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "templates"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Weekly Templates
          </button>
          <button
            onClick={() => setActiveTab("exceptions")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "exceptions"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Date Exceptions
          </button>
        </div>
        
        <div>
          {activeTab === "templates" && (
            <button
              onClick={() => openAddForm("template")}
              className="primary-btn whitespace-nowrap"
            >
              Add Weekly Template
            </button>
          )}
          {activeTab === "exceptions" && (
            <button
              onClick={() => openAddForm("exception")}
              className="primary-btn whitespace-nowrap"
            >
              Add Date Exception
            </button>
          )}
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              Add {formType === "template" ? "Weekly Template" : "Date Exception"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.general}
                </div>
              )}
              
              {formType === "template" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day of Week:
                  </label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) =>
                      setFormData({ ...formData, day_of_week: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="">Select day</option>
                    {dayNames.map((day, index) => (
                      <option key={index} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                  {errors.day_of_week && <p className="error">{errors.day_of_week}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specific Date:
                  </label>
                  <input
                    type="date"
                    value={formData.specific_date}
                    onChange={(e) =>
                      setFormData({ ...formData, specific_date: e.target.value })
                    }
                    className="input-field"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  {errors.specific_date && <p className="error">{errors.specific_date}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time:
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                  {errors.start_time && <p className="error">{errors.start_time}</p>}
                  {errors.time && <p className="error">{errors.time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time:
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                  {errors.end_time && <p className="error">{errors.end_time}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available:
                  </label>
                  <select
                    value={formData.is_available}
                    onChange={(e) =>
                      setFormData({ ...formData, is_available: e.target.value === "true" })
                    }
                    className="input-field"
                  >
                    <option value={true}>Available</option>
                    <option value={false}>Unavailable</option>
                  </select>
                </div>

                {formData.is_available && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slot Duration (minutes):
                    </label>
                    <select
                      value={formData.slot_duration}
                      onChange={(e) =>
                        setFormData({ ...formData, slot_duration: parseInt(e.target.value) })
                      }
                      className="input-field"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>60 minutes</option>
                      <option value={90}>90 minutes</option>
                      <option value={120}>120 minutes</option>
                    </select>
                  </div>
                )}
              </div>

              {formType === "exception" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason:
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., Vacation, Conference, etc."
                    required
                  />
                  {errors.reason && <p className="error">{errors.reason}</p>}
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <button type="submit" className="primary-btn flex-1">
                  Save Rule
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="secondary-btn flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Weekly Templates</h2>
          {templates.length === 0 ? (
            <p className="text-gray-500">No weekly templates defined. Add one to get started.</p>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {dayNames[template.day_of_week]}
                    </h3>
                    <p className="text-gray-600">
                      {template.start_time} - {template.end_time}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            template.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {template.is_available ? "Available" : "Unavailable"}
                        </span>
                        {template.is_available && (
                          <span className="text-sm text-gray-500">
                            {template.slot_duration} min slots
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => openDeleteModal(template)}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    {template.reason && (
                      <p className="text-sm text-gray-500 mt-1">{template.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exceptions Tab */}
      {activeTab === "exceptions" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Date Exceptions</h2>
          {exceptions.length === 0 ? (
            <p className="text-gray-500">No date exceptions defined.</p>
          ) : (
            <div className="grid gap-4">
              {exceptions.map((exception) => (
                <div key={exception.id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {new Date(exception.specific_date).toLocaleDateString()}
                      {exception.reason && ` - ${exception.reason}`}
                    </h3>
                    <p className="text-gray-600">
                      {exception.start_time} - {exception.end_time}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            exception.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {exception.is_available ? "Available" : "Unavailable"}
                        </span>
                        {exception.is_available && (
                          <span className="text-sm text-gray-500">
                            {exception.slot_duration} min slots
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => openDeleteModal(exception)}
                        className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded border border-red-300 hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Availability Rule"
        message={`Are you sure you want to delete the availability rule for "${deleteModal.ruleName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}