import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import personIcon from "../icons/person_icon.png";

const ALLOWED = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];
const MAX_SIZE = 5 * 1024 * 1024;

export default function AddChild() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userId = state?.userId;
  const editChild = state?.child || null;
  const childId = state?.childId || null;
  let returnPath = state?.returnPath || null;
  const isEdit = !!editChild && !!childId;

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    medicalHistory: "",
  });

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: editChild.name || "",
        dateOfBirth: editChild.dateOfBirth
          ? new Date(editChild.dateOfBirth).toISOString().slice(0, 10)
          : "",
        gender: editChild.gender || "",
        medicalHistory: editChild.medicalHistory || "",
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
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
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
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        alert(`Failed to save: ${errorData.message || "Unknown error"}`);
      }
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message || "Unknown error occurred"}`);
    }
  };

  const BASE = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const pickFile = () => fileInputRef.current?.click();

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const validateImage = (file) => {
    if (!ALLOWED.includes(file.type)) {
      return "Only images are allowed.";
    }
    if (file.size > MAX_SIZE) {
      return "File size is too large. (> 5MB)";
    }
    return null;
  };

  const uploadImage = async (file) => {
    const err = validateImage(file);
    if (err) {
      return alert(err);
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    if (!userId || !childId) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE}/api/users/${userId}/children/${childId}/photo`,
        {
          method: "POST",
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }
      const { url: publicUrl } = await res.json();

      setForm((f) => ({ ...f, imageUrl: publicUrl })); //save URL
      setPreview(null);
    } catch (e) {
      console.error(e);
    }
  };

  const storedUrl = form?.imageUrl || editChild?.imageUrl || null;
  const absoluteUrl = storedUrl
    ? storedUrl.startsWith("/static")
      ? `${BASE}${storedUrl}`
      : `${BASE}/static/child-images/${storedUrl}`
    : null;

  const avatarSrc = editChild?.imageUrl
    ? editChild.imageUrl.startsWith("/static/")
      ? `${BASE}${editChild.imageUrl}`
      : `${BASE}/static/child-images/${editChild.imageUrl}`
    : null;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this child?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token){
        alert("Authentication required. Please login again.");
        return; //redirect to login page
      }
      if (!userId || !childId) {
        alert("User ID or Child ID is missing. Please try again.");
        return; //redirect to add child page
      }
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/children/${childId}`,
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
    <div className="min-h-screen w-full grid place-items-center bg-gray-100 p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-[560px]"
      >
        <h2 className="text-center text-xl font-semibold mb-6">
          {isEdit ? "Edit child" : "Add child"}
        </h2>

        <div
          className="mx-auto mb-6 w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
          onClick={pickFile}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : absoluteUrl ? (
            <img
              src={absoluteUrl}
              alt="child avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <img src={personIcon} alt="" className="w-10 h-10 opacity-80" />
          )}
        </div>

        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium mb-1">Date of birth</label>
        <input
          type="date"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={onChange}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium mb-1">Gender</label>
        <select
          name="gender"
          value={form.gender}
          onChange={onChange}
          className="w-full border rounded px-3 py-2 mb-4"
        >
          <option value="">Select</option>
          <option>Boy</option>
          <option>Girl</option>
        </select>

        <label className="block text-sm font-medium mb-1">
          Medical History
        </label>
        <input
          name="medicalHistory"
          value={form.medicalHistory}
          onChange={onChange}
          className="w-full border rounded px-3 py-2 mb-6"
        />

        <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded">
          Save
        </button>
        { isEdit && (
          <button 
          type="button"
          className="w-full bg-[#F3BE08] hover:bg-orange-700 text-black font-semibold mt-4 py-2 rounded" onClick={handleDelete}>
            Delete Profile
          </button>
        )}
      </form>
    </div>
  );
}
