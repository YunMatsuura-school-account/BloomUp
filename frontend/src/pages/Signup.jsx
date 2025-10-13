import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Canada");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    try {
      const name = `${firstName} ${lastName}`.trim();
      const res = await fetch("http://localhost:8888/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Signup successful!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(data?.message || "Signup failed");
      }
    } catch (err) {
      setMessage("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row">
      {/* Left Side - Gradient Background with Text */}
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
          <div className="text-white text-2xl font-bold tracking-wide">
            {/* BLOOM UP LOGO */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="132"
              height="64"
              viewBox="0 0 132 64"
              fill="none"
            >
              <path
                d="M48.7165 29.4992C44.087 23.4597 44.4882 12.4958 44.4882 12.4958C44.4882 12.4958 56.247 12.4958 61.5246 16.646C70.1662 23.4288 67.0182 35.0121 67.0182 35.0121C67.0182 35.0121 56.0001 38.9454 48.7165 29.4992Z"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
              />
              <path
                d="M67.0186 35.0119C67.0186 35.0119 65.3828 26.6186 54.2104 20.4553"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
                strokeLinecap="round"
              />
              <path
                d="M86.4367 29.5074C91.0601 23.4758 90.6594 12.5261 90.6594 12.5261C90.6594 12.5261 78.9158 12.5261 73.6451 16.6709C65.0147 23.4449 68.1586 35.0132 68.1586 35.0132C68.1586 35.0132 79.1624 38.9414 86.4367 29.5074Z"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
              />
              <path
                d="M68.1582 35.013C68.1582 35.013 69.7918 26.6307 80.9497 20.4753"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
                strokeLinecap="round"
              />
              <path
                d="M21.2327 14.1122C23.0939 15.2159 24.5603 16.7441 25.6602 18.6684C26.7318 20.5928 27.2676 22.7436 27.2676 25.1207C27.2676 27.4979 26.7036 29.6486 25.6038 31.6013C24.5039 33.554 22.9811 35.0821 21.0635 36.1858C19.1459 37.2895 17.0026 37.8555 14.6338 37.8555C12.265 37.8555 10.1217 37.2895 8.2041 36.1858C6.28647 35.0821 4.76364 33.554 3.66383 31.6013C2.56401 29.6486 2 27.4979 2 25.1207V14.3952C2 14.1971 2 14.0839 2.0564 13.9707V3.78287C2.0564 3.27348 2.2256 2.84899 2.53581 2.50939C2.84601 2.1698 3.26902 2 3.77663 2C4.28424 2 4.70724 2.1698 5.04565 2.50939C5.38405 2.84899 5.55325 3.27348 5.55325 3.78287V17.1685C6.62487 15.697 7.95029 14.565 9.61412 13.716C11.2497 12.867 13.0546 12.4708 15.0286 12.4708C17.341 12.4708 19.4279 13.0368 21.2891 14.1405L21.2327 14.1122ZM19.3433 33.4408C20.7533 32.5918 21.8531 31.4598 22.6709 30.0165C23.4605 28.5733 23.8835 26.9602 23.8835 25.149C23.8835 23.3378 23.4887 21.7248 22.6709 20.2815C21.8531 18.8382 20.7533 17.7062 19.3433 16.8856C17.9332 16.0649 16.354 15.6404 14.6338 15.6404C12.2368 15.6404 10.2063 16.4045 8.5143 17.9326C6.82227 19.4608 5.83526 21.4135 5.52505 23.7906C5.52505 23.8755 5.52505 23.9604 5.46865 24.017C5.44045 24.2717 5.41225 24.6396 5.41225 25.149C5.41225 26.9602 5.80706 28.5733 6.62487 30.0165C7.44268 31.4598 8.5425 32.5918 9.92432 33.4408C11.3061 34.2898 12.8854 34.686 14.6056 34.686C16.3258 34.686 17.905 34.2615 19.3151 33.4408H19.3433Z"
                fill="white"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
              />
              <path
                d="M33.1073 35.6051C31.9311 34.1267 31.3286 32.2218 31.3286 29.8905V3.73427C31.3286 3.22252 31.5007 2.79606 31.845 2.48332C32.1893 2.17058 32.5909 2 33.1073 2C33.6237 2 34.054 2.17058 34.3695 2.48332C34.6851 2.79606 34.8572 3.22252 34.8572 3.73427V29.8905C34.8572 31.1983 35.1154 32.2787 35.6605 33.1032C36.2056 33.9277 36.8941 34.3541 37.726 34.3541H38.8736C39.3326 34.3541 39.7055 34.5247 39.9924 34.8375C40.2793 35.1502 40.4227 35.5767 40.4227 36.0884C40.4227 36.6002 40.2219 37.0266 39.849 37.3394C39.476 37.6521 38.9596 37.8227 38.3572 37.8227H37.7547C35.8613 37.8227 34.3409 37.0835 33.136 35.6051H33.1073Z"
                fill="white"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
              />
              <path
                d="M125.588 13.8274C126.974 14.6772 128.049 15.8954 128.841 17.4536C129.604 19.0117 130 20.8531 130 22.9212V36.0946C130 36.6045 129.859 37.0295 129.519 37.3411C129.18 37.6527 128.784 37.8227 128.275 37.8227C127.766 37.8227 127.342 37.6527 127.002 37.3411C126.663 37.0295 126.493 36.6045 126.493 36.0946V22.9212C126.493 20.7682 125.927 19.04 124.824 17.7652C123.721 16.4904 122.251 15.8671 120.469 15.8671C118.546 15.8671 116.99 16.5187 115.802 17.7935C114.614 19.0684 114.049 20.7398 114.077 22.8079V36.0663C114.077 36.5762 113.907 37.0012 113.596 37.3128C113.285 37.6244 112.861 37.7944 112.352 37.7944C111.842 37.7944 111.418 37.6244 111.079 37.3128C110.739 37.0012 110.57 36.5762 110.57 36.0663V22.8929C110.57 20.7398 110.004 19.0117 108.901 17.7369C107.798 16.462 106.327 15.8388 104.545 15.8388C102.65 15.8388 101.095 16.462 99.8787 17.7085C98.6625 18.9551 98.0403 20.5699 98.0403 22.4963V36.0379C98.0403 36.5479 97.8706 36.9728 97.5595 37.2844C97.2484 37.5961 96.8241 37.7661 96.315 37.7661C95.8059 37.7661 95.3817 37.5961 95.0423 37.2844C94.7029 36.9728 94.5332 36.5479 94.5332 36.0379V14.5639C94.5332 14.054 94.7029 13.629 95.0423 13.2891C95.3817 12.9491 95.8059 12.7791 96.315 12.7791C96.8241 12.7791 97.2484 12.9491 97.5595 13.2891C97.8706 13.629 98.0403 14.054 98.0403 14.5639V15.5555C98.8888 14.5923 99.907 13.8274 101.067 13.2891C102.226 12.7508 103.499 12.4958 104.885 12.4958C106.554 12.4958 108.053 12.8641 109.41 13.629C110.739 14.3939 111.814 15.4705 112.606 16.8303C113.483 15.4705 114.643 14.3939 116.057 13.629C117.471 12.8641 119.055 12.4958 120.837 12.4958C122.618 12.4958 124.23 12.9208 125.616 13.7707L125.588 13.8274Z"
                fill="white"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
              />
              <path
                d="M67.7051 35.0847V40.6375"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
                strokeLinecap="round"
              />
              <path
                d="M65.4068 45.602C65.5669 45.7627 65.6381 45.9591 65.6381 46.2091V56.5468C65.6381 56.7968 65.5669 56.9932 65.4068 57.1539C65.2466 57.3146 65.0331 57.4038 64.784 57.4038C64.5349 57.4038 64.3392 57.3324 64.1791 57.1539C64.019 56.9932 63.9478 56.7789 63.9478 56.5468V55.7969C63.4674 56.3326 62.8803 56.7611 62.1864 57.0646C61.4925 57.3681 60.7631 57.5288 59.9446 57.5288C58.9127 57.5288 57.9697 57.3146 57.1513 56.8682C56.3328 56.4218 55.6745 55.7791 55.212 54.9399C54.7494 54.1008 54.5181 53.083 54.5181 51.9225V46.2091C54.5181 45.977 54.5892 45.7806 54.7672 45.6199C54.9273 45.4592 55.123 45.3699 55.3543 45.3699C55.6034 45.3699 55.7991 45.4592 55.977 45.6199C56.1371 45.7806 56.2083 45.977 56.2083 46.2091V51.9225C56.2083 53.2259 56.5641 54.2257 57.2936 54.9042C58.0231 55.5827 58.9661 55.9219 60.1225 55.9219C60.8342 55.9219 61.4925 55.7791 62.0619 55.5113C62.6312 55.2256 63.0938 54.8506 63.4318 54.3507C63.7699 53.8686 63.93 53.3152 63.93 52.7081V46.1912C63.93 45.9412 64.0012 45.7448 64.1613 45.5842C64.3214 45.4235 64.5172 45.3521 64.7662 45.3521C65.0153 45.3521 65.211 45.4235 65.389 45.5842L65.4068 45.602Z"
                fill="#238D88"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
              />
              <path
                d="M79.0136 45.9275C79.9388 46.4631 80.6683 47.1951 81.202 48.1414C81.7358 49.0877 82.0027 50.1233 82.0027 51.266C82.0027 52.4087 81.7358 53.4442 81.2198 54.3727C80.7038 55.3011 79.9922 56.0331 79.0848 56.5688C78.1952 57.1044 77.181 57.3722 76.0779 57.3722C75.135 57.3722 74.2631 57.1758 73.4625 56.7652C72.6797 56.3545 72.0214 55.801 71.5054 55.1047V61.5502C71.5054 61.8001 71.4342 61.9965 71.2563 62.1751C71.0962 62.3358 70.8827 62.425 70.6514 62.425C70.4201 62.425 70.2066 62.3358 70.0464 62.1751C69.8863 62.0144 69.8152 61.8001 69.8152 61.5502V56.6223C69.8152 56.6223 69.7974 56.5152 69.7974 56.4259V51.266C69.7974 50.1233 70.0642 49.0877 70.598 48.1414C71.1318 47.1951 71.8612 46.4631 72.7864 45.9275C73.7116 45.3918 74.7435 45.124 75.8822 45.124C77.0209 45.124 78.0528 45.3918 78.978 45.9275H79.0136ZM78.1774 55.2475C78.8535 54.8547 79.3872 54.3012 79.7787 53.6049C80.1701 52.9086 80.3658 52.123 80.3658 51.266C80.3658 50.409 80.1701 49.6234 79.7787 48.927C79.3872 48.2307 78.8535 47.6772 78.1774 47.2844C77.5013 46.8738 76.7362 46.6774 75.9 46.6774C75.0638 46.6774 74.3165 46.8738 73.6404 47.2844C72.9643 47.6951 72.4306 48.2307 72.0569 48.927C71.6655 49.6234 71.4698 50.409 71.4698 51.266C71.4698 51.5159 71.4698 51.6945 71.4876 51.8195C71.4876 51.8552 71.5054 51.8909 71.5054 51.9266C71.6477 53.0693 72.1281 54.0156 72.9465 54.7476C73.765 55.4796 74.7435 55.8546 75.9 55.8546C76.7362 55.8546 77.4835 55.6582 78.1774 55.2654V55.2475Z"
                fill="#238D88"
                stroke="white"
                strokeWidth="2.27353"
                strokeMiterlimit="10"
              />
            </svg>
            {/* BloomUP */}
          </div>
        </div>

        {/* Marketing Text */}
        <div className="absolute left-[50px] right-[50px] top-[38%] flex flex-col gap-[28px] z-10">
          <h2
            className="text-white text-[38px] lg:text-[44px] xl:text-[50px] font-extrabold leading-[1.3]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Let's make parenting
            <br />
            easier together.
          </h2>
          <p
            className="text-white text-[16px] lg:text-[18px] xl:text-[20px] font-medium leading-[1.4]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Organize your family life, track budgets,
            <br />
            and never miss a school event again
            <br />
            all in one calm, supportive space made for parents like you.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-[60%] flex flex-col items-center justify-start px-4 lg:px-8 xl:px-12">
        {/* Header Text */}
        <div className="w-full flex justify-center mt-[60px] lg:mt-[70px] xl:mt-[80px] mb-[40px] lg:mb-[50px]">
          <h1
            className="text-[34px] lg:text-[38px] xl:text-[40px] font-semibold text-center leading-[1.4] text-[#232527]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Let's get started
          </h1>
        </div>

        {/* Sign Up Card */}
        <div
          className="w-full max-w-[500px] lg:max-w-[640px] rounded-[24px] px-[45px] lg:px-[70px] py-[38px] lg:py-[42px] "
          style={{ background: "rgba(0, 143, 136, 0.15)" }}
        >
          <form
            onSubmit={handleSignup}
            className="flex flex-col items-center gap-[38px] lg:gap-[42px]"
          >
            {/* Title */}
            <h2
              className="text-[22px] lg:text-[23px] xl:text-[24px] font-semibold leading-[1.3] text-center text-[#161616]"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Sign Up
            </h2>

            {/* Form Fields */}
            <div className="w-full flex flex-col gap-[15px]">
              {/* First Name & Last Name Row */}
              <div className="flex flex-col sm:flex-row justify-between gap-[15px]">
                <div className="flex flex-col gap-[6px] flex-1">
                  <label
                    className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#636363]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    First name
                  </label>
                  <div className="bg-white rounded-[15px] px-[22px] lg:px-[24px] py-[14px] h-[52px] lg:h-[54px] flex items-center">
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full bg-transparent outline-none text-[15px] lg:text-[16px] font-normal leading-[1.4] text-[#232527]"
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-[6px] flex-1">
                  <label
                    className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#636363]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    Last name
                  </label>
                  <div className="bg-white rounded-[15px] px-[22px] lg:px-[24px] py-[14px] h-[52px] lg:h-[54px] flex items-center">
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full bg-transparent outline-none text-[15px] lg:text-[16px] font-normal leading-[1.4] text-[#232527]"
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-[6px]">
                <label
                  className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#636363]"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Enter email
                </label>
                <div className="bg-white rounded-[15px] px-[22px] lg:px-[24px] py-[14px] h-[52px] lg:h-[54px] flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent outline-none text-[15px] lg:text-[16px] font-normal leading-[1.4] text-[#232527]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                </div>
              </div>

              {/* Country & State Row */}
              <div className="flex flex-col sm:flex-row justify-between gap-[15px]">
                <div className="flex flex-col gap-[6px] flex-1">
                  <label
                    className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#636363]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    Country of residence
                  </label>
                  <div className="bg-white rounded-[15px] px-[16px] py-[14px] h-[52px] lg:h-[54px] flex items-center justify-end">
                    <div className="flex items-center justify-between w-full gap-[10px]">
                      <span
                        className="text-[15px] lg:text-[16px] font-normal leading-[1.4] text-[#232527]"
                        style={{ fontFamily: "DM Sans, sans-serif" }}
                      >
                        {country}
                      </span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="lg:w-6 lg:h-6"
                      >
                        <path
                          d="M15 18L9 12L15 6"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          transform="rotate(90 12 12)"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-[6px] flex-1">
                  <label
                    className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#636363]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    State
                  </label>
                  <div className="bg-white rounded-[15px] px-[16px] py-[14px] h-[52px] lg:h-[54px] flex items-center">
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-transparent outline-none text-[15px] lg:text-[16px] font-normal leading-[1.4] text-[#232527]"
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-[6px]">
                <label
                  className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#636363]"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Password
                </label>
                <div className="bg-white rounded-[15px] px-[18px] py-[8px] h-[52px] lg:h-[54px] flex items-center justify-between gap-[10px]">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex-1 bg-transparent outline-none text-[15px] lg:text-[16px] font-normal leading-[1.4] text-[#232527]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex-shrink-0 w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] flex items-center justify-center"
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="lg:w-5 lg:h-5"
                      >
                        <path
                          d="M1.67 10S4.17 4.17 10 4.17 18.33 10 18.33 10 15.83 15.83 10 15.83 1.67 10 1.67 10Z"
                          stroke="#232527"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r="2.5"
                          stroke="#232527"
                          strokeWidth="1.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="lg:w-5 lg:h-5"
                      >
                        <path
                          d="M1.67 1.67l16.66 16.66M8.82 8.82a2.5 2.5 0 1 0 3.54 3.54"
                          stroke="#232527"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.23 4.48A8 8 0 0 1 10 4.17c5.83 0 8.33 5.83 8.33 5.83a11 11 0 0 1-1.39 2.23M5.51 5.51A11.33 11.33 0 0 0 1.67 10s2.5 5.83 8.33 5.83a8.12 8.12 0 0 0 4.49-1.34"
                          stroke="#232527"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-[6px]">
                <label
                  className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#636363]"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Confirm Password
                </label>
                <div className="bg-white rounded-[15px] px-[18px] py-[8px] h-[52px] lg:h-[54px] flex items-center justify-between gap-[10px]">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="flex-1 bg-transparent outline-none text-[15px] lg:text-[16px] font-normal leading-[1.4] text-[#232527]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="flex-shrink-0 w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] flex items-center justify-center"
                  >
                    {showConfirmPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="lg:w-5 lg:h-5"
                      >
                        <path
                          d="M1.67 10S4.17 4.17 10 4.17 18.33 10 18.33 10 15.83 15.83 10 15.83 1.67 10 1.67 10Z"
                          stroke="#232527"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r="2.5"
                          stroke="#232527"
                          strokeWidth="1.5"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="lg:w-5 lg:h-5"
                      >
                        <path
                          d="M1.67 1.67l16.66 16.66M8.82 8.82a2.5 2.5 0 1 0 3.54 3.54"
                          stroke="#232527"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.23 4.48A8 8 0 0 1 10 4.17c5.83 0 8.33 5.83 8.33 5.83a11 11 0 0 1-1.39 2.23M5.51 5.51A11.33 11.33 0 0 0 1.67 10s2.5 5.83 8.33 5.83a8.12 8.12 0 0 0 4.49-1.34"
                          stroke="#232527"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-[12px]">
              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-[#238D88] rounded-[15px] px-[20px] py-[15px] h-[52px] lg:h-[54px] flex items-center justify-center text-white text-[15px] lg:text-[16px] font-semibold leading-[1.4] hover:bg-[#1d7470] transition-colors"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                Sign up
              </button>

              {/* Already have account */}
              <div className="flex items-center justify-center gap-[4px]">
                <span
                  className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#636363]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Already have an account?
                </span>
                <Link to="/login" className="px-[8px]">
                  <span
                    className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#404040] border-b border-[#404040]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Log In
                  </span>
                </Link>
              </div>

              {message && (
                <p className="text-center text-xs sm:text-sm mt-2 text-red-600">
                  {message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
