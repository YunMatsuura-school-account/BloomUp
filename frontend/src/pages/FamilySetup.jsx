import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FamilySetup() {
  const [familyName, setFamilyName] = useState("");
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [userId, setUserId] = useState(null);

  //   const [loading, setLoading] = useState(true);
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
    const diff = new Date(Date.now() - dob.getTime());
    const years = Math.abs(diff.getUTCFullYear() - 1970);
    return `${years} yr${years === 1 ? "" : "s"}`;
  };

  return (
    <>
      <div className="min-h-screen w-full bg-gray-100 p-4">
        <div className="max-w-[720px] mx-auto">
          <h1 className="text-center text-3xl font-semibold mt-6 mb-6">
            We’re almost there!
          </h1>

          <form
            onSubmit={handleSaveFamily}
            className="bg-white rounded-xl shadow p-8"
          >
            <h2 className="text-center font-semibold mb-6">Your family</h2>

            <label className="block text-gray-700 text-sm font-medium mb-1">
              Family Name
            </label>
            <p className="text-gray-500 text-xs mb-2">
              The way you would like to call it in BloomUp
            </p>
            <input
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full rounded border px-3 py-2 mb-6"
              placeholder="Enter your family name"
            />

            <label className="block text-gray-700 text-sm font-medium mb-2">
              Children
            </label>

            {children.length > 0 ? (
              <div className="space-y-3 mb-4">
                {children.map((c) => (
                  <div
                    key={c._id}
                    className="bg-gray-100 rounded-lg px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300" />
                      <div>
                        <div className="font-medium">
                          {c.name || "Your child's name"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Age {calcAge(c.dateOfBirth)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-gray-600 hover:text-gray-800"
                      aria-label="edit child"
                    >
                      ✎
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-sm mb-4">
                No children added yet
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/add-child", { state: { userId } })}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded mb-6"
            >
              + Add child
            </button>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded"
            >
              Save family
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
