import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ChildAvatar from "../components/ChildAvatar";
import AvatarSelectionModal from "../components/AvatarSelectionModal";
import cameraIcon from "../icons/cameraIcon.svg";
import chevronLeftIcon from "../icons/chevron-left.svg";

export default function AddChild() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const userId = state?.userId;
  const editChild = state?.child || null;
  const childId = state?.childId || null;
  const isEdit = !!editChild && !!childId;

  // Get the previous page path dynamically
  const handleGoBack = () => {
    if (returnPath) {
      navigate(returnPath);
    } else if (isEdit) {
      // If editing and no returnPath, try to go back in history
      navigate(-1);
    } else {
      // If adding new child and no returnPath, go to account page
      navigate("/account");
    }
  };

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    medicalHistory: "",
  });

  // Avatar selection state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState({
    avatarIndex: null, // null means no avatar selected (will show initials)
    avatarName: null,
    backgroundColor: null,
  });

  useEffect(() => {
    if (isEdit && editChild) {
      setForm({
        name: editChild.name || "",
        dateOfBirth: editChild.dateOfBirth
          ? new Date(editChild.dateOfBirth).toISOString().slice(0, 10)
          : "",
        gender: editChild.gender || "",
        medicalHistory: editChild.medicalHistory || "",
      });

      // Load existing avatar data if available
      if (
        editChild.avatarIndex !== null &&
        editChild.avatarIndex !== undefined
      ) {
        setSelectedAvatar({
          avatarIndex: editChild.avatarIndex,
          avatarName: editChild.avatarName || null,
          backgroundColor: editChild.backgroundColor || "#0073E7",
        });
      } else {
        // No avatar selected, will show initials
        setSelectedAvatar({
          avatarIndex: null,
          avatarName: null,
          backgroundColor: null,
        });
      }
    }
  }, [isEdit, editChild]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }
      if (!userId) {
        alert("User ID is missing. Please try again.");
        return;
      }
      const url = isEdit
        ? `${
            import.meta.env.VITE_BACKEND_URL
          }/api/users/${userId}/children/${childId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/children`;
      const method = isEdit ? "PUT" : "POST";

      // Include avatar data in the request
      const formData = {
        ...form,
        avatarIndex: selectedAvatar.avatarIndex,
        avatarName: selectedAvatar.avatarName,
        backgroundColor: selectedAvatar.backgroundColor,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) navigate("/family-setup"); // returns to FamilySetup; it will re-fetch
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message || "Unknown error occurred"}`);
    }
  };

  // Create a temporary child object for displaying the avatar
  const displayChild = {
    name: form.name || editChild?.name || "",
    avatarIndex: selectedAvatar.avatarIndex,
    avatarName: selectedAvatar.avatarName,
    backgroundColor: selectedAvatar.backgroundColor,
    ...(editChild || {}),
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this child?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        return; //redirect to login page
      }
      if (!userId || !childId) {
        alert("User ID or Child ID is missing. Please try again.");
        return; //redirect to add child page
      }
      const res = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/${userId}/children/${childId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        // Always return to /account after deleting a child
        navigate("/account");
      } else {
        throw new Error("Failed to delete child");
      }
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message || "Unknown error occurred"}`);
    }
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Back button - Mobile only */}
      <div className="md:hidden p-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <img src={chevronLeftIcon} alt="Back" className="w-6 h-6" />
        </button>
      </div>

      <div className="grid place-items-center p-4 md:p-8">
        <form
          onSubmit={onSubmit}
          className="p-8 rounded-xl shadow w-full max-w-[560px] md:max-w-4xl md:px-16 md:py-12"
          style={{ backgroundColor: "rgba(0, 143, 136, 0.15)" }}
        >
          <div className="md:max-w-md md:mx-auto">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
              aria-label="Select avatar"
            >
              <div className="flex h-32 w-32 items-center justify-center rounded-full overflow-hidden">
                <ChildAvatar child={displayChild} width={128} height={128} />
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              aria-label="Change avatar"
            >
              <img src={cameraIcon} alt="Camera icon" className="w-10 h-10" />
            </button>
          </div>
        </div>

        <h2 className="text-center text-xl font-semibold mb-6">
          {isEdit ? "Edit child" : "Add child"}
        </h2>

        {/* Avatar Selection Modal */}
        <AvatarSelectionModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          onSave={(avatarData) => {
            setSelectedAvatar(avatarData);
          }}
          initialAvatar={selectedAvatar.avatarIndex}
          initialColor={selectedAvatar.backgroundColor}
        />

        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full rounded-lg px-3 py-2 mb-4"
          style={{ backgroundColor: "#FFFFFF" }}
        />

        <label className="block text-sm font-medium mb-1">Date of birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={onChange}
          className="w-full rounded-lg px-3 py-2 mb-4"
          style={{ backgroundColor: "#FFFFFF" }}
        />

        <label className="block text-sm font-medium mb-1">Gender</label>
        <select
          name="gender"
          value={form.gender}
          onChange={onChange}
          className="w-full rounded-lg px-3 py-2 mb-4 appearance-none"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <option value="">Select</option>
          <option>Boy</option>
          <option>Girl</option>
          <option>Prefer not to say</option>
        </select>

        <label className="block text-sm font-medium mb-1">
          Medical Note
        </label>
        <input
          name="medicalHistory"
          value={form.medicalHistory}
          onChange={onChange}
          className="w-full rounded-lg px-3 py-2 mb-6"
          style={{ backgroundColor: "#FFFFFF" }}
        />

        {/* Buttons - Unified layout: Cancel/Delete left, Save right (both mobile and desktop) */}
        <div className="flex gap-4">
          {/* Cancel/Delete button - left */}
          {isEdit ? (
            <button
              type="button"
              className="flex-1 hover:bg-gray-50 text-black font-semibold py-2 rounded-lg"
              style={{ backgroundColor: "#FFFFFF" }}
              onClick={handleDelete}
            >
              Delete
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoBack}
              className="flex-1 hover:bg-gray-50 text-black font-semibold py-2 rounded-lg"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              Cancel
            </button>
          )}
          {/* Save button - right */}
          <button
            type="submit"
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg"
            style={{ backgroundColor: "#238D88" }}
          >
            Save
          </button>
        </div>
          </div>
      </form>
      </div>
    </div>
  );
}
