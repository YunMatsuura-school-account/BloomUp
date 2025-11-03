import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NewLogoBloomUpWhite } from "../icons";
// import "../assets/css/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Prevent accessing login page if already authenticated
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // User is already logged in, redirect to dashboard
      navigate("/dashboard", { replace: true });
    }

    // Prevent back navigation to protected routes after logout
    const handlePopState = (event) => {
      const currentToken = localStorage.getItem("accessToken");
      if (!currentToken) {
        const protectedRoutes = [
          "/dashboard",
          "/user-dashboard",
          "/account",
          "/settings",
          "/calendar",
          "/articles",
          "/family",
          "/child-dashboard",
        ];

        const currentPath = window.location.pathname;
        const isProtectedRoute = protectedRoutes.some((route) =>
          currentPath.startsWith(route)
        );

        if (isProtectedRoute) {
          window.history.replaceState(null, "", "/login");
          navigate("/login", { replace: true });
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        //localStorage.setItem("accessToken", data.token);

        setMessage("Login successful!");
        // Let AuthGuard handle the routing based on user state
        navigate("/family-setup");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
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
          <NewLogoBloomUpWhite width={220} height={88} />
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
            onSubmit={handleLogin}
            className="flex flex-col items-center gap-[38px] lg:gap-[42px]"
          >
            {/* Title */}
            <h2
              className="text-[22px] lg:text-[23px] xl:text-[24px] font-semibold leading-[1.3] text-center text-[#161616]"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Login
            </h2>

            {/* Form Fields */}
            <div className="w-full flex flex-col gap-[15px]">
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
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-[12px]">
              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-[#238D88] rounded-[15px] px-[20px] py-[15px] h-[52px] lg:h-[54px] flex items-center justify-center text-white text-[15px] lg:text-[16px] font-semibold leading-[1.4] hover:bg-[#1d7470] transition-colors"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                Log In
              </button>

              {/* Already have account */}
              <div className="flex items-center justify-center gap-[4px]">
                <span
                  className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#636363]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Create an account?
                </span>
                <Link to="/signup" className="px-[8px]">
                  <span
                    className="text-[13px] lg:text-[14px] font-medium leading-[1.4] text-[#404040] border-b border-[#404040]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Sign Up
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
