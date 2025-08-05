import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { AppContext } from "../../Context/AppContext";

export default function Availability() {
  const { token } = useContext(AppContext);

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [editingDay, setEditingDay] = useState(null);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/doctor/schedule", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch schedule");
        return;
      }

      const data = await res.json();
      setSchedule(data.schedule || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  async function updateDay(dayData) {
    setErrors({});

    try {
      const res = await fetch("/api/doctor/schedule/day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dayData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.errors) {
          setErrors(data.errors);
        } else if (data?.message) {
          setErrors({ general: data.message });
        }
        return;
      }

      fetchSchedule();
      setEditingDay(null);
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "An error occurred. Please try again." });
    }
  }

  function handleDayUpdate(day) {
    updateDay(day);
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="title mb-6">Weekly Schedule</h1>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {errors.general}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Working Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slot Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedule.map((day) => (
                <DayRow
                  key={day.day_of_week}
                  day={day}
                  isEditing={editingDay === day.day_of_week}
                  onEdit={() => setEditingDay(day.day_of_week)}
                  onCancel={() => setEditingDay(null)}
                  onSave={handleDayUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DayRow({ day, isEditing, onEdit, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    day_of_week: day.day_of_week,
    start_time: day.start_time,
    end_time: day.end_time,
    slot_duration: day.slot_duration,
    is_active: day.is_active,
  });

  useEffect(() => {
    setFormData({
      day_of_week: day.day_of_week,
      start_time: day.start_time,
      end_time: day.end_time,
      slot_duration: day.slot_duration,
      is_active: day.is_active,
    });
  }, [day]);

  function handleSave() {
    onSave(formData);
  }

  if (isEditing) {
    return (
      <tr className="bg-yellow-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {day.day_name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            value={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.value === "true" })
            }
            className="text-sm border rounded px-2 py-1"
          >
            <option value={true}>Active</option>
            <option value={false}>Inactive</option>
          </select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {formData.is_active ? (
            <div className="flex space-x-2">
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className="text-sm border rounded px-2 py-1 w-20"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                className="text-sm border rounded px-2 py-1 w-20"
              />
            </div>
          ) : (
            <span className="text-gray-400">Not working</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {formData.is_active ? (
            <select
              value={formData.slot_duration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slot_duration: parseInt(e.target.value),
                })
              }
              className="text-sm border rounded px-2 py-1"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
              <option value={120}>120 min</option>
            </select>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {day.day_name}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            day.is_active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {day.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {day.is_active ? `${day.start_time} - ${day.end_time}` : "Not working"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {day.is_active ? `${day.slot_duration} minutes` : "-"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

DayRow.propTypes = {
  day: PropTypes.shape({
    day_of_week: PropTypes.number.isRequired,
    day_name: PropTypes.string.isRequired,
    start_time: PropTypes.string,
    end_time: PropTypes.string,
    slot_duration: PropTypes.number,
    is_active: PropTypes.bool.isRequired,
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};
