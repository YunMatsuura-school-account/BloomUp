import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NewLogoBloomUpWhite } from "../icons";
import AvatarSelectionModal from "../components/AvatarSelectionModal";
import {
  FoxAvatar,
  CapybaraAvatar,
  MooseAvatar,
  SealAvatar,
  WhiteBearAvatar,
  RabbitAvatar,
  BrownBearAvatar,
  RaccoonAvatar,
} from "../components/avatars";

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

  const dateInputRef = useRef(null);

  // Avatar selection state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState({
    avatarIndex: 0,
    avatarName: "Fox",
    backgroundColor: "#0073E7",
  });

  // Avatar components array
  const AVATARS = [
    { name: "Fox", component: FoxAvatar },
    { name: "Capybara", component: CapybaraAvatar },
    { name: "Moose", component: MooseAvatar },
    { name: "Seal", component: SealAvatar },
    { name: "White Bear", component: WhiteBearAvatar },
    { name: "Rabbit", component: RabbitAvatar },
    { name: "Brown Bear", component: BrownBearAvatar },
    { name: "Raccoon", component: RaccoonAvatar },
  ];

  const SelectedAvatarComponent = AVATARS[selectedAvatar.avatarIndex].component;

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

      // Include avatar data in the request
      const formData = {
        ...form,
        avatarIndex: selectedAvatar.avatarIndex,
        avatarName: selectedAvatar.avatarName,
        backgroundColor: selectedAvatar.backgroundColor,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-['DM_Sans']">
      {/* Left Side - Gradient Background with Content */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden flex-shrink-0">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(35, 141, 136, 1) 21%, rgba(75, 169, 165, 1) 58%, rgba(180, 245, 242, 1) 100%)",
          }}
        />

        {/* Decorative Circles */}
        <div className="absolute -left-[40px] -bottom-[60px] w-[300px] h-[300px] rounded-full opacity-20 bg-white" />
        <div className="absolute -left-[80px] -bottom-[100px] w-[400px] h-[400px] rounded-full opacity-20 bg-white" />
        <div className="absolute -right-[200px] -top-[100px] w-[480px] h-[480px] rounded-full opacity-20 bg-white" />
        <div className="absolute -right-[270px] -top-[160px] w-[640px] h-[640px] rounded-full opacity-10 bg-white" />

        {/* Logo */}
        <div className="absolute left-[40px] top-[50px] z-10">
          <NewLogoBloomUpWhite width={220} height={88} />
        </div>

        {/* Marketing Text */}
        <div className="absolute left-[50px] right-[50px] top-[30%] flex flex-col gap-6 z-10">
          <h2
            className="text-white text-[40px] lg:text-[48px] xl:text-[54px] font-extrabold leading-[1.15]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Add your child's
            <br />
            profile.
          </h2>
          <p
            className="text-white text-[16px] lg:text-[18px] xl:text-[20px] font-medium leading-[1.5]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            This helps BloomUp tailor reminders and insights that fit
            <br />
            your child's age and needs.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-[60%] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-10 overflow-y-auto">
        <div className="w-full max-w-[600px] lg:max-w-[650px] flex flex-col items-center gap-6 lg:gap-8">
          {/* Form Container */}
          <form
            onSubmit={onSubmit}
            className="w-full flex flex-col bg-[rgba(0,143,136,0.15)] rounded-[24px] px-5 py-8 sm:px-8 sm:py-10 lg:px-[80px] lg:py-[50px] gap-6 lg:gap-8"
          >
            {/* Form Content */}
            <div className="flex flex-col items-center w-full gap-6 lg:gap-8">
              {/* Form Title */}
              <h3 className="text-center font-semibold text-[22px] sm:text-[24px] leading-[1.3] text-[#161616]">
                Add child
              </h3>

              {/* Avatar Selection */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="relative flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
                  aria-label="Select avatar"
                >
                  <SelectedAvatarComponent
                    width={120}
                    height={120}
                    backgroundColor={selectedAvatar.backgroundColor}
                  />
                  {/* Edit Icon */}
                  <div className="absolute bottom-0 right-0 w-10 h-10 bg-[#238D88] rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M12.5 4.1667L15.8334 7.50003M17.645 5.6767C18.0856 5.23622 18.3332 4.63876 18.3333 4.01574C18.3333 3.39273 18.0859 2.79521 17.6454 2.35462C17.205 1.91403 16.6075 1.66646 15.9845 1.66638C15.3615 1.6663 14.764 1.91372 14.3234 2.3542L3.20169 13.4784C3.00821 13.6713 2.86512 13.9088 2.78503 14.17L1.68419 17.7967C1.66266 17.8688 1.66103 17.9453 1.67949 18.0182C1.69794 18.0912 1.73579 18.1577 1.78902 18.2109C1.84225 18.264 1.90888 18.3018 1.98183 18.3201C2.05477 18.3384 2.13133 18.3367 2.20336 18.315L5.83086 17.215C6.09183 17.1357 6.32934 16.9934 6.52253 16.8009L17.645 5.6767Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col w-full max-w-[460px] gap-4">
                {/* Avatar Selection moved above */}

                {/* Name Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm sm:text-base font-medium text-[#636363]">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Tommy"
                    required
                    className="w-full bg-white font-medium outline-none rounded-[15px] py-[14px] px-4 text-base text-[#000000]"
                  />
                </div>

                {/* Date of Birth Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm sm:text-base font-medium text-[#636363]">
                    Date of birth
                  </label>
                  <div className="relative">
                    <input
                      ref={dateInputRef}
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={onChange}
                      required
                      className="w-full bg-white font-medium outline-none rounded-[15px] py-[14px] px-4 pr-12 text-base text-[#000000] date-input-custom"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (dateInputRef.current) {
                          if ("showPicker" in dateInputRef.current) {
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
                </div>

                {/* Gender Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm sm:text-base font-medium text-[#636363]">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={onChange}
                      required
                      className="w-full text-black bg-white font-medium outline-none rounded-[15px] py-[14px] px-4 pr-10 text-base appearance-none"
                      style={{
                        color: form.gender ? "#000000" : "#999999",
                      }}
                    >
                      <option value="">Select</option>
                      <option value="Boy">Boy</option>
                      <option value="Girl">Girl</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="#666666"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Medical Notes Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm sm:text-base font-medium text-[#636363]">
                    Medical Notes
                  </label>
                  <textarea
                    name="medicalHistory"
                    value={form.medicalHistory}
                    onChange={onChange}
                    placeholder="Allergic to peanut"
                    rows={1}
                    className="w-full bg-white font-medium outline-none resize-none rounded-[15px] py-[14px] px-4 text-base text-[#000000] min-h-[50px]"
                  />
                </div>

                {/* Other Field */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm sm:text-base font-medium text-[#636363]">
                    Other
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white font-medium outline-none rounded-[15px] py-[14px] px-4 text-base text-[#000000]"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-[460px] mt-4 lg:mt-6">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  const isOnboarding =
                    sessionStorage.getItem("onboardingMode") === "true";
                  navigate(isOnboarding ? "/family-setup" : "/dashboard");
                }}
                className="w-full sm:w-auto flex-1 sm:min-w-[160px] h-[54px] flex items-center justify-center font-semibold bg-white hover:bg-gray-50 transition-colors rounded-[15px] text-base text-[#161616] border border-gray-200"
              >
                Cancel
              </button>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full sm:w-auto flex-1 sm:min-w-[160px] h-[54px] flex items-center justify-center font-semibold text-white bg-[#238D88] hover:opacity-90 transition-opacity rounded-[15px] text-base"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

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
    </div>
  );
}
