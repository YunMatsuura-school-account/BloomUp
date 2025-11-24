import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import ChildAvatar from "../components/ChildAvatar";
import AvatarSelectionModal from "../components/AvatarSelectionModal";
import pencilIcon from "../icons/pencil.svg";
import cameraIcon from "../icons/cameraIcon.svg";
import chevronLeftIcon from "../icons/chevron-left.svg";

// Background colors for avatars (must match AvatarSelectionModal)
const BACKGROUND_COLORS = [
  "#0073E7", // Blue
  "#8CC7D8", // Light Blue
  "#0CC68E", // Green
  "#B76EF6", // Purple
  "#6400C7", // Dark Purple
  "#FF95B8", // Pink
  "#F3BE08", // Yellow
  "#E95900", // Orange
];

export default function AddChild() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const userId = state?.userId;
  const editChild = state?.child || null;
  const childId = state?.childId || null;
  let returnPath = state?.returnPath || null;
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
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const genderSelectRef = useRef(null);

  const dateInputRef = useRef(null);

  // Avatar selection state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState({
    // Default to White Bear (index 4) for Add child, null for Edit child
    avatarIndex: isEdit ? null : 4, // 4 = White Bear
    avatarName: isEdit ? null : "White Bear",
    backgroundColor: isEdit ? null : "#0073E7", // Default background color
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
    } else if (!isEdit) {
      // Set default White Bear avatar for Add child mode
      setSelectedAvatar({
        avatarIndex: 4, // 4 = White Bear
        avatarName: "White Bear",
        backgroundColor: BACKGROUND_COLORS[6], // Yellow (#F3BE08) - default background color
      });
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
      if (res.ok) {
        if (returnPath) {
          navigate(returnPath); // returns to the previous page if returnPath is provided
        } else if (isEdit) {
          navigate("/family-setup"); // returns to FamilySetup for edit without returnPath
        } else {
          navigate("/dashboard"); // returns to Dashboard for new child without returnPath
        }
      } else {
        const errorData = await res
          .json()
          .catch(() => ({ message: "Unknown error" }));
        alert(`Failed to save: ${errorData.message || "Unknown error"}`);
      }
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message || "Unknown error occurred"}`);
    }
  };

  // Create a temporary child object for displaying the avatar
  // Spread editChild first, then override with selectedAvatar values to ensure latest selection is shown
  const displayChild = {
    ...(editChild || {}),
    name: form.name || editChild?.name || "",
    avatarIndex: selectedAvatar.avatarIndex,
    avatarName: selectedAvatar.avatarName,
    backgroundColor: selectedAvatar.backgroundColor,
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

  const pageBody = (
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
          <div className="md:max-w-[463px] md:mx-auto">
        {/* Title - shown above avatar for both Add child and Edit child (mobile), and Add child (desktop) */}
        {!isEdit && (
          <h2 className="text-center font-semibold mb-6" style={{ fontFamily: "'Inter', sans-serif", fontSize: "24px" }}>
            Add child
          </h2>
        )}
        {isEdit && (
          <h2 className="md:hidden text-center font-semibold mb-6" style={{ fontFamily: "'Inter', sans-serif", fontSize: "20px" }}>
            Edit child
          </h2>
        )}
        
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
              aria-label="Select avatar"
            >
              <div className="flex h-32 w-32 md:h-[130px] md:w-[130px] items-center justify-center rounded-full overflow-hidden">
                <div className="md:hidden">
                  <ChildAvatar child={displayChild} width={128} height={128} />
                </div>
                <div className="hidden md:block">
                  <ChildAvatar child={displayChild} width={130} height={130} />
                </div>
              </div>
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 w-10 h-10 md:w-[44px] md:h-[44px] rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity border border-black"
                aria-label="Change avatar"
              >
                <img src={cameraIcon} alt="Camera icon" className="w-10 h-10 md:w-[44px] md:h-[44px]" />
              </button>
            )}
          </div>
        </div>

        {/* Edit child title - Desktop only, shown below avatar */}
        {isEdit && (
          <h2 className="hidden md:block text-center font-normal mb-6" style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: "18px" }}>
            Edit child
          </h2>
        )}

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

        <label className="block font-medium mb-1" style={{ fontSize: "22px" }}>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full rounded-lg px-3 py-2 mb-4"
          style={{ backgroundColor: "#FFFFFF", fontSize: "22px" }}
        />

        <label className="block font-medium mb-1" style={{ fontSize: "22px" }}>Date of birth</label>
        <div className="relative mb-4">
          <input
            ref={dateInputRef}
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={onChange}
            className="w-full rounded-lg px-3 py-2 pr-10 date-input-custom"
            style={{ backgroundColor: "#FFFFFF", fontSize: "22px" }}
          />
          <button
            type="button"
            onClick={() => {
              if (dateInputRef.current) {
                if ('showPicker' in dateInputRef.current) {
                  dateInputRef.current.showPicker();
                } else {
                  dateInputRef.current.click();
                }
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            aria-label="Open date picker"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" 
                stroke="#808080" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <label className="block font-medium mb-1" style={{ fontSize: "22px" }}>Gender</label>
        <div className="relative mb-4">
          <select
            ref={genderSelectRef}
            name="gender"
            value={form.gender}
            onChange={(e) => {
              onChange(e);
              // onChange後に少し遅延して閉じる（リストが閉じるのを待つ）
              setTimeout(() => setIsGenderOpen(false), 100);
            }}
            onFocus={() => setIsGenderOpen(true)}
            onBlur={() => {
              // onBlurは少し遅延させて、onChangeが先に実行されるようにする
              setTimeout(() => setIsGenderOpen(false), 200);
            }}
            onMouseDown={() => setIsGenderOpen(true)}
            className="w-full rounded-lg px-3 py-2 pr-10 appearance-none"
            style={{ backgroundColor: "#FFFFFF", fontSize: "22px", marginTop: "4px" }}
          >
            <option value="">Select</option>
            <option>Boy</option>
            <option>Girl</option>
            <option>Prefer not to say</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {isGenderOpen ? (
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 6L8 10L12 6" 
                  stroke="#808080" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M6 4L10 8L6 12" 
                  stroke="#808080" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>

        <label className="block font-medium mb-1" style={{ fontSize: "22px" }}>
          Medical Note
        </label>
        <div className="mb-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: "14px", lineHeight: "14px", color: "#686868" }}>
          Write your child's notes
        </div>
        <input
          name="medicalHistory"
          value={form.medicalHistory}
          onChange={onChange}
          className="w-full rounded-lg px-3 py-2 mb-12"
          style={{ backgroundColor: "#FFFFFF", fontSize: "22px" }}
        />

        {/* Buttons - Unified layout: Cancel/Delete left, Save right (both mobile and desktop) */}
        <div className="flex gap-4 md:max-w-[463px]">
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

  return pageBody;
}
