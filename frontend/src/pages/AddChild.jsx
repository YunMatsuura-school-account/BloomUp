import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function AddChild() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userId = state?.userId;
  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    medicalNotes: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/children`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (res.ok) navigate("/family-setup"); // returns to FamilySetup; it will re-fetch
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen w-full grid place-items-center bg-gray-100 p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-[560px]"
      >
        <h2 className="text-center text-xl font-semibold mb-6">Add child</h2>

        <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-6" />

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

        <label className="block text-sm font-medium mb-1">Medical Notes</label>
        <input
          name="medicalNotes"
          value={form.medicalNotes}
          onChange={onChange}
          className="w-full border rounded px-3 py-2 mb-6"
        />

        <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}
