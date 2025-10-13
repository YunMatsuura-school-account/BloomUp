import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  // const [username, setUsername] = useState("");

  const [name, setName] = useState("");
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
      const res = await fetch("http://localhost:8888/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Signup successful!");
        setTimeout(() => navigate("/login"), 1500); // ✅ redirect after success
      } else {
        setMessage(data?.message || "Signup failed");
      }
    } catch (err) {
      setMessage("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen w-full max-w-[1728px] mx-auto bg-white">
      {/* Header / Logo */}
      <header className=" px-6 md:px-[10px] flex justify-center md:justify-start">
        <div className="text-2xl sm:text-3xl md:text-[36px] font-semibold leading-[1.5] pt-[50px] leading-[1.5]">
          LOGO
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-col items-center px-4 md:px-6 pt-1 md:pt-[90px] pb-50 pb-[100px]">
        <div className="pb-30 text-3xl sm:text-4xl md:text-5xl font-bold pb-[100px]">
          Welcome to BloomUp!
        </div>
        {/* Card container */}
        <div className="w-full max-w-[1024px] bg-[rgba(166,166,166,0.2)] rounded-[24px] backdrop-blur-sm shadow-sm">
          <div className="flex justify-center pt-[55px] pb-[55px] px-4">
            {/* Form column */}
            <form
              onSubmit={handleSignup}
              className="w-full max-w-[461px] flex flex-col gap-[42px]"
            >
              {/* Title */}
              <h1 className="text-[34px] font-semibold leading-[1.21] text-center text-[#161616]">
                Sign Up
              </h1>

              {/* Fields */}
              <div className="flex flex-col gap-[15px]">
                {/* Email */}
                <div className="flex items-center gap-2.5 bg-[#B8B8B8] rounded-[10px] py-4.5 px-6">
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-transparent outline-none text-sm font-medium leading-[3.4] text-black placeholder:text-black"
                  />
                </div>

                {/* Username */}
                <div className="flex items-center gap-2.5 bg-[#B8B8B8] rounded-[10px] py-4.5 px-6">
                  <input
                    type="text"
                    placeholder="User name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-transparent outline-none text-sm font-medium leading-[3.4] text-black placeholder:text-black"
                  />
                </div>

                {/* Password */}
                <div className="flex items-center justify-between gap-2.5 bg-[#B8B8B8] rounded-[10px] py-4.5 px-[18px]">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent outline-none text-sm font-medium leading-[3.4] text-black placeholder:text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="w-5 h-5 text-black"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
                        <path d="M9.88 5.38A9.6 9.6 0 0 1 12 5c7 0 10 7 10 7a13.19 13.19 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.62 13.62 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="flex items-center justify-between gap-2.5 bg-[#B8B8B8] rounded-[10px] py-4.5 px-[18px]">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-transparent outline-none text-sm font-medium leading-[3.4] text-black placeholder:text-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="w-5 h-5 text-black"
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 3l18 18" />
                        <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
                        <path d="M9.88 5.38A9.6 9.6 0 0 1 12 5c7 0 10 7 10 7a13.19 13.19 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.62 13.62 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5 mt-[15px]">
                <button
                  type="submit"
                  className="w-full bg-[#B8B8B8] rounded-[15px] py-[15px] px-[136px] text-sm font-medium leading-[2.0] text-black hover:brightness-95 active:translate-y-px transition-all "
                >
                  Sign up
                </button>

                <div className="flex items-center justify-center gap-1 text-sm font-medium leading-[1.4]">
                  <span className="text-[#838383]">
                    Already have an account?
                  </span>
                  <Link
                    to="/login"
                    className="text-[#404040] border-b border-[#404040] px-1.5 hover:opacity-80"
                  >
                    Log In
                  </Link>
                </div>

                {message && (
                  <p className="text-center text-sm mt-2 text-red-600">
                    {message}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
