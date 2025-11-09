import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NewLogoBloomUpWhite } from "../icons";

export default function FamilyAddChild() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userId = state?.userId;

  const [form, setForm] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    medicalHistory: "",
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        navigate("/login");
        return;
      }
      if (!userId) {
        alert("User ID is missing. Please try again.");
        return;
      }

      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/users/${userId}/children`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        // If in onboarding mode, return to family-setup to add more children
        // Otherwise, return to dashboard (existing user adding a child)
        const isOnboarding =
          sessionStorage.getItem("onboardingMode") === "true";
        if (isOnboarding) {
          navigate("/family-setup");
        } else {
          navigate("/dashboard");
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

  return (
    <div className="min-h-screen w-full bg-white flex font-['DM_Sans']">
      {/* Left Side - Gradient Background with Content */}
      <div
        className="hidden lg:flex lg:w-[39%] relative overflow-hidden flex-shrink-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(35, 141, 136, 1) 21%, rgba(75, 169, 165, 1) 63%, rgba(180, 245, 242, 1) 100%)",
        }}
      >
        {/* Decorative Circles */}
        <div className="absolute -left-[40px] -bottom-[60px] w-[300px] h-[300px] rounded-full opacity-20 bg-white" />
        <div className="absolute -left-[80px] -bottom-[100px] w-[400px] h-[400px] rounded-full opacity-20 bg-white" />
        <div className="absolute -right-[200px] -top-[100px] w-[480px] h-[480px] rounded-full opacity-20 bg-white" />
        <div className="absolute -right-[270px] -top-[160px] w-[640px] h-[640px] rounded-full opacity-10 bg-white" />

        {/* Logo */}
        <div className="absolute left-[29px] top-[20px] z-10">
          <NewLogoBloomUpWhite width={187} height={75} />
        </div>

        {/* Content */}
        <div
          className="absolute flex flex-col z-10"
          style={{
            left: "55px",
            top: "323px",
            width: "564px",
            gap: "33px",
          }}
        >
          <h1
            className="text-white font-extrabold leading-[1.302]"
            style={{
              fontSize: "50px",
              fontWeight: 800,
            }}
          >
            Build your family
            <br />
            space.
          </h1>
          <p
            className="text-white font-medium leading-[1.4]"
            style={{
              fontSize: "20px",
              fontWeight: 500,
            }}
          >
            Give your family a name and start organizing everyone in one place.
            BloomUp helps you manage multiple kids easily.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div
        className="flex-1 flex flex-col items-center"
        style={{ paddingTop: "111px" }}
      >
        <div
          className="flex flex-col items-center"
          style={{ width: "651px", gap: "50px" }}
        >
          {/* Title */}
          <h2
            className="text-center font-semibold"
            style={{
              fontSize: "40px",
              fontWeight: 600,
              lineHeight: "1.4",
              color: "#232527",
            }}
          >
            We're almost there!
          </h2>

          {/* Form Container */}
          <form
            onSubmit={onSubmit}
            className="w-full flex flex-col"
            style={{
              backgroundColor: "rgba(0, 143, 136, 0.15)",
              borderRadius: "24px",
              padding: "40px 95px 70px",
              gap: "10px",
            }}
          >
            {/* Form Content */}
            <div
              className="flex flex-col items-center"
              style={{ width: "460px", gap: "42px" }}
            >
              {/* Form Title */}
              <h3
                className="text-center font-semibold"
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  lineHeight: "1.302",
                  color: "#161616",
                }}
              >
                Add Child Profile
              </h3>

              {/* Form Fields */}
              <div
                className="flex flex-col"
                style={{ width: "461px", gap: "20px" }}
              >
                {/* Avatar Placeholder */}
                <div className="flex flex-col items-center gap-2 mb-4">
                  <div
                    className="rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
                    style={{ width: "80px", height: "80px" }}
                  >
                    {/* Placeholder for avatar */}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="15" r="8" fill="#999999" />
                      <path
                        d="M32 35C32 28.3726 26.6274 23 20 23C13.3726 23 8 28.3726 8 35"
                        fill="#999999"
                      />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500">Add photo (optional)</p>
                </div>

                {/* Name Field */}
                <div className="flex flex-col" style={{ gap: "5px" }}>
                  <label
                    className="font-medium"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                      color: "#636363",
                    }}
                  >
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Enter child's name"
                    required
                    className="w-full bg-white font-medium outline-none"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                      color: "#000000",
                      borderRadius: "15px",
                      padding: "14px",
                    }}
                  />
                </div>

                {/* Date of Birth Field */}
                <div className="flex flex-col" style={{ gap: "5px" }}>
                  <label
                    className="font-medium"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                      color: "#636363",
                    }}
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={onChange}
                    required
                    className="w-full bg-white font-medium outline-none"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                      color: "#000000",
                      borderRadius: "15px",
                      padding: "14px",
                    }}
                  />
                </div>

                {/* Gender Field */}
                <div className="flex flex-col" style={{ gap: "5px" }}>
                  <label
                    className="font-medium"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                      color: "#636363",
                    }}
                  >
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={onChange}
                    required
                    className="w-full bg-white font-medium outline-none"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                      color: form.gender ? "#000000" : "#999999",
                      borderRadius: "15px",
                      padding: "14px",
                    }}
                  >
                    <option value="">Select gender</option>
                    <option value="Boy">Boy</option>
                    <option value="Girl">Girl</option>
                  </select>
                </div>

                {/* Medical History Field */}
                <div className="flex flex-col" style={{ gap: "5px" }}>
                  <label
                    className="font-medium"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                      color: "#636363",
                    }}
                  >
                    Medical History
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={form.medicalHistory}
                    onChange={onChange}
                    placeholder="Enter any medical conditions or allergies (optional)"
                    rows={3}
                    className="w-full bg-white font-medium outline-none resize-none"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                      color: "#000000",
                      borderRadius: "15px",
                      padding: "14px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3" style={{ marginTop: "30px" }}>
              {/* Save Button */}
              <button
                type="submit"
                className="flex items-center justify-center font-semibold text-white hover:opacity-90 transition-opacity"
                style={{
                  width: "461px",
                  height: "54px",
                  backgroundColor: "#238D88",
                  borderRadius: "15px",
                  padding: "15px 136px",
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: "1.4",
                }}
              >
                Save child
              </button>

              {/* Skip Button */}
              <button
                type="button"
                onClick={() => {
                  const isOnboarding =
                    sessionStorage.getItem("onboardingMode") === "true";
                  navigate(isOnboarding ? "/family-setup" : "/dashboard");
                }}
                className="flex items-center justify-center font-semibold hover:opacity-80 transition-opacity"
                style={{
                  width: "461px",
                  height: "54px",
                  backgroundColor: "transparent",
                  borderRadius: "15px",
                  fontSize: "16px",
                  fontWeight: 600,
                  lineHeight: "1.4",
                  color: "#636363",
                }}
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
