import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewLogoBloomUpWhite } from "../icons";
import ChildAvatar from "../components/ChildAvatar";

export default function FamilySetup() {
  const [familyName, setFamilyName] = useState("");
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          navigate("/login");
          return;
        }

        const meRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!meRes.ok) {
          if (meRes.status === 401 || meRes.status === 403) {
            console.log("Token expired or invalid, redirecting to login");
            localStorage.removeItem("accessToken");
            navigate("/login");
            return;
          }
          throw new Error("Auth failed");
        }

        const me = await meRes.json();
        setUserId(me.id);
        setFamilyName(me.familyName || "");

        // fetch children profiles
        const chRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${me.id}/children`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const ch = chRes.ok ? await chRes.json() : [];
        setChildren(Array.isArray(ch) ? ch : []);
      } catch (e) {
        console.error(e);
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    })();
  }, [navigate]);

  //   const fetchUserData = async () => {
  //     try {
  //       const token = localStorage.getItem("accessToken");
  //       const response = await fetch(
  //         `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );
  //       if (response.ok) {
  //         const userData = await response.json();
  //         setUser(userData);
  //         setFamilyName(userData.familyName || "");
  //         setChildren(userData.children || []);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //     }
  //   };

  const handleSaveFamily = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/family-name`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ familyName }),
        }
      );

      if (res.ok) {
        // Clear onboarding mode - user has completed setup
        sessionStorage.removeItem("onboardingMode");
        navigate("/dashboard");
      } else if (res.status === 401 || res.status === 403) {
        console.log("Token expired during save, redirecting to login");
        localStorage.removeItem("accessToken");
        navigate("/login");
      }
    } catch (e) {
      console.error(e);
      localStorage.removeItem("accessToken");
      navigate("/login");
    }
  };

  const calcAge = (dobIso) => {
    if (!dobIso) return "N/A";

    const dob = new Date(dobIso);
    const now = new Date();

    let months =
      (now.getFullYear() - dob.getFullYear()) * 12 +
      (now.getMonth() - dob.getMonth());

    // If current day is before birth day in the month, subtract one month
    if (now.getDate() < dob.getDate()) {
      months -= 1;
    }

    if (months < 0) return "N/A"; // future DOB guard

    const years = Math.floor(months / 12);
    const remMonths = months % 12;

    if (years <= 0) {
      return `${remMonths} mo${remMonths === 1 ? "" : "s"}`;
    }

    if (remMonths === 0) {
      return `${years} yr${years === 1 ? "" : "s"}`;
    }

    return `${years} yr${years === 1 ? "" : "s"} ${remMonths} mo${
      remMonths === 1 ? "" : "s"
    }`;
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
            onSubmit={handleSaveFamily}
            className="w-full flex flex-col"
            style={{
              backgroundColor: "rgba(0, 143, 136, 0.15)",
              borderRadius: "24px",
              padding: "40px 95px 70px",
              gap: "30px",
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
                Your family
              </h3>

              {/* Form Fields */}
              <div
                className="flex flex-col"
                style={{ width: "461px", gap: "81px" }}
              >
                <div className="flex flex-col" style={{ gap: "15px" }}>
                  {/* Family Name Section */}
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
                      Family Name
                    </label>
                    <input
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="Family love"
                      className="w-full bg-white font-medium text-center outline-none"
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

                  {/* Children Section */}
                  <div
                    className="flex flex-col"
                    style={{ width: "466px", gap: "15px" }}
                  >
                    <label
                      className="font-medium"
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        lineHeight: "1.4",
                        color: "#636363",
                        fontFamily: "Inter",
                      }}
                    >
                      Children
                    </label>

                    {/* Children List */}
                    {children.length > 0 && (
                      <div className="flex flex-col gap-3">
                        {children.map((c) => (
                          <div
                            key={c._id}
                            className="rounded-[15px] px-5 py-3.5 flex items-center justify-between"
                            style={{ backgroundColor: "#238D88" }}
                          >
                            <div className="flex items-center gap-3">
                              <ChildAvatar child={c} width={40} height={40} />
                              <div>
                                <div className="font-medium text-sm text-white">
                                  {c.name || "Your child's name"}
                                </div>
                                <div className="text-xs text-white opacity-90">
                                  Age {calcAge(c.dateOfBirth)}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="hover:opacity-80 transition-opacity flex items-center justify-center"
                              style={{
                                backgroundColor: "#F3BE08",
                                borderRadius: "16px",
                                width: "40px",
                                height: "40px",
                                padding: "10px",
                              }}
                              aria-label="edit child"
                              onClick={() =>
                                navigate("/add-child", {
                                  state: { userId, childId: c._id, child: c },
                                })
                              }
                            >
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
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Child Button */}
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/family-add-child", { state: { userId } })
                      }
                      className="flex items-center gap-[10px] cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      {/* Plus Icon */}
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <line
                          x1="0"
                          y1="6"
                          x2="12"
                          y2="6"
                          stroke="#444444"
                          strokeWidth="2"
                        />
                        <line
                          x1="6"
                          y1="0"
                          x2="6"
                          y2="12"
                          stroke="#444444"
                          strokeWidth="2"
                        />
                      </svg>
                      <span
                        className="font-medium"
                        style={{
                          fontSize: "16px",
                          fontWeight: 500,
                          lineHeight: "1.21",
                          color: "#444444",
                          fontFamily: "Inter",
                        }}
                      >
                        Add child
                      </span>
                    </button>

                    {/* Separator Line */}
                    <div
                      style={{
                        width: "453px",
                        height: "1px",
                        backgroundColor: "#444444",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div
              className="flex flex-col"
              style={{ height: "54px", gap: "10px" }}
            >
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
                Save family
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
