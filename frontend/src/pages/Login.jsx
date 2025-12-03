import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { NewLogoBloomUpWhite } from "../icons";
// import "../assets/css/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from a logout or explicit navigation
  useEffect(() => {
    // Check if user explicitly wants to logout (clear any existing token)
    const urlParams = new URLSearchParams(location.search);
    const forceLogout = urlParams.get("logout") === "true";

    if (forceLogout) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("authToken");
      sessionStorage.clear();
      return;
    }

    const validateAndRedirect = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        // Verify token is still valid by calling /api/auth/me
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          // Token is valid, but only auto-redirect if user didn't come from signup
          // This allows users to login with a different account
          const fromSignup = location.state?.fromSignup;
          if (!fromSignup) {
            navigate("/dashboard", { replace: true });
          }
        } else {
          // Token is invalid/expired, clear it
          localStorage.removeItem("accessToken");
        }
      } catch (error) {
        // On error, clear the token
        console.error("Token validation error:", error);
        localStorage.removeItem("accessToken");
      }
    };

    validateAndRedirect();
  }, [navigate, location]);

  // Prevent back navigation to protected routes after logout
  useEffect(() => {
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
  }, []);

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
        navigate("/dashboard");
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong!");
    }
  };

  const handleClearSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    sessionStorage.clear();
    setMessage("Session cleared. You can now login with a different account.");
    window.location.reload(); // Reload to show login form
  };

  return (
    <div
      className="fixed inset-0 w-full bg-white flex flex-col lg:flex-row overflow-hidden"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
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
        <div className="absolute left-[50px] right-[50px] top-[30%] flex flex-col gap-6 z-10">
          <h2
            className="text-white text-[40px] lg:text-[48px] xl:text-[54px] font-extrabold leading-[1.15]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Welcome back to
            <br />
            your family hub!
          </h2>
          <p
            className="text-white text-[16px] lg:text-[18px] xl:text-[20px] font-medium leading-[1.5]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Continue managing your schedules, budgets, and moments.
            <br />
            All in one calm and organized space.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 lg:w-[60%] flex flex-col items-center lg:justify-center px-4 lg:px-12 xl:px-16 py-10 overflow-y-auto">
        <div className="w-full flex justify-center mb-8">
          <h1
            className="text-[34px] lg:text-[40px] font-semibold text-center leading-[1.4] text-[#232527]"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Welcome back!
          </h1>
        </div>

        {/* Login Card */}
        <div
          className="w-full max-w-[620px] rounded-[24px] px-[48px] lg:px-[60px] py-[36px] lg:py-[44px]"
          style={{ background: "#008F8826" }}
        >
          <h2
            className="text-[20px] lg:text-[24px] font-semibold text-center text-[#161616] mb-8"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Log In
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-[24px]">
            {/* Title */}
            <div className="flex flex-col gap-4 items-center w-full">
              {/* Email */}
              <div className="flex flex-col gap-2 w-full max-w-[460px]">
                <label
                  className="text-sm font-medium text-[#2F3E46]"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Enter email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white rounded-[18px] h-[54px] px-5 text-[15px] outline-none focus:ring-2 focus:ring-[#238D88]"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2 w-full max-w-[460px]">
                <label
                  className="text-sm font-medium text-[#2F3E46]"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Password
                </label>
                <div className="bg-white rounded-[18px] h-[54px] flex items-center px-4 shadow-inner">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex-1 bg-transparent outline-none text-[15px] text-[#232527]"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#7A7A7A]  transition"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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

                {/* <div className="w-full flex justify-start">
                  <button
                    type="button"
                    className="text-xs font-medium text-[#636363] underline"
                  >
                    Forgot password?
                  </button>
                </div> */}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex flex-col gap-5 items-center">
              <button
                type="submit"
                className="w-full max-w-[460px] bg-[#238D88] rounded-[20px] h-[52px] text-white text-[16px] font-semibold hover:bg-[#1d7470] transition"
              >
                Log In
              </button>

              {/* Already have account */}
              <div className="flex items-center justify-center gap-[4px]">
                <span
                  className="text-sm font-medium text-[#636363]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Don’t have an account?
                </span>
                <Link to="/signup" className="px-[8px]">
                  <span
                    className="text-sm font-medium text-[#636363] underline"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Sign up
                  </span>
                </Link>
              </div>

              {/* Switch Account Link */}
              {localStorage.getItem("accessToken") && (
                <div className="flex items-center justify-center mt-2">
                  <button
                    type="button"
                    onClick={handleClearSession}
                    className="text-[12px] lg:text-[13px] font-medium leading-[1.4] text-[#238D88] hover:underline transition-all"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Switch to a different account?
                  </button>
                </div>
              )}

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
