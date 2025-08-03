import { useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { useNavigate } from "react-router-dom";

export default function MyProfile() {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  if (!user) {
    return <p className="text-center mt-10">Loading user data...</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="title text-center">My Profile</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4 flex flex-col items-center">
        {/* Profile Picture */}
        <img
          src="/default-avatar.avif"
          alt="Profile"
          className="w-24 h-24 rounded-full "
        />

        <p>
          <strong>First Name:</strong> {user.first_name}
        </p>
        <p>
          <strong>Last Name:</strong> {user.last_name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Gender:</strong> {user.gender}
        </p>
        <p>
          <strong>Date of Birth:</strong> {user.date_of_birth.split("T")[0]}
        </p>
        <p>
          <strong>City:</strong> {user.city}
        </p>
        <p>
          <strong>Address:</strong> {user.address}
        </p>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4"
          onClick={() => navigate("/patient/profile/edit")}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
