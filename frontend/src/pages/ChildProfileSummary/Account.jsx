import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import greyPersonIcon from "../../icons/greyPersonIcon.svg";
import orangePencilIcon from "../../icons/orangePencilIcon.svg";
import trashBinIcon from "../../icons/trashBinIcon.svg";
import plusIcon from "../../icons/plusIcon.svg";
import ChildAvatar from "../../components/ChildAvatar";

export default function Account() {
  const BASE = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [familyName, setFamilyName] = useState("");
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) {
      return null;
    }
    const birth = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleDeleteChild = async (childId, e) => {
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this child?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }
      if (!userId || !childId) {
        alert("User ID or Child ID is missing. Please try again.");
        return;
      }
      
      const res = await fetch(
        `${BASE}/api/users/${userId}/children/${childId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        // Reload children list
        const chRes = await fetch(`${BASE}/api/users/${userId}/children`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ch = chRes.ok ? await chRes.json() : [];
        setChildren(Array.isArray(ch) ? ch : []);
      } else {
        throw new Error("Failed to delete child");
      }
    } catch (e) {
      console.error(e);
      alert(`Error: ${e.message || "Unknown error occurred"}`);
    }
  };

  useEffect(() => {
    // Immediately Invoked Function Expression
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }
        // userId
        const meRes = await fetch(`${BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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

        setFamilyName(me.familyName ? me.familyName : "Your Family");

        //fetch children profiles
        const chRes = await fetch(`${BASE}/api/users/${me.id}/children`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ch = chRes.ok ? await chRes.json() : [];
        setChildren(Array.isArray(ch) ? ch : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })(); // invoked immediately
  }, [BASE, navigate]);

  if (loading) {
    return <p className="text-white p-6">Loading...</p>;
  }

  return (
    <div className=" page-surface">
      <div className="p-6">
        {/**
         * Legacy top bar (bell + user buttons) kept commented for reference.
         * Replaced by shared <Header /> to unify design across app.
         * If you need the old behavior, restore this block.
         */}
        {false &&
          // <div className="flex justify-end items-center gap-4 mb-6">
          //   <button
          //     onClick={() => setShowBellOverlay(true)}
          //     className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          //   >
          //     <img src={bell_icon} alt="Notifications" className="w-6 h-6" />
          //   </button>
          //   <button
          //     onClick={() => navigate("/user-dashboard")}
          //     className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          //   >
          //     <img src={personIcon} alt="User" className="w-6 h-6" />
          //   </button>
          // </div>
          null}
        <h2 className="text-[40px] font-bold text-black/100 text-center mb-8">
          Your Family
        </h2>

        <div className="mb-2 flex items-center justify-between md:justify-center">
          <div className="text-black/100 font-semibold text-lg">
            {familyName}
          </div>
          <button
            onClick={() => {
              if (userId) {
                navigate("/add-child", {
                  state: {
                    userId: userId,
                    returnPath: "/account",
                  },
                });
              } else {
                console.error(
                  "User ID not available. Please wait for page to load."
                );
              }
            }}
            className="md:hidden"
            aria-label="Add your child here"
          >
            <img
              src={plusIcon}
              alt="Add child"
              className="w-8 h-8"
            />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {children.map((child) => {
            const age = calculateAge(child.dateOfBirth);
            return (
              <button
                key={child._id}
                className="flex items-center rounded-[22px] min-h-[135px] p-4 text-left hover:bg-gray-50"
                style={{ backgroundColor: "#FFFFFF" }}
                onClick={() => navigate(`/child-dashboard/${child._id}`)}
              >
                <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                  <ChildAvatar child={child} width={48} height={48} />
                </div>

                <div className="p-4">
                  <div className="text-black font-semibold">
                    {child.name || "Your Child's name"}
                  </div>
                  <div className="text-black/70 text-sm">
                    {age !== null ? `Age ${age}` : "Age"}
                  </div>
                </div>

                <div className="flex justify-end flex-1 gap-2">
                  <button
                    className="w-12 h-12 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/add-child", {
                        state: {
                          mode: "edit",
                          childId: child._id,
                          child: child,
                          userId: userId,
                          returnPath: "/account",
                        },
                      });
                    }}
                  >
                    <img
                      src={orangePencilIcon}
                      alt="edit"
                      className="w-12 h-12"
                    />
                  </button>
                  <button
                    className="w-12 h-12 flex items-center justify-center"
                    onClick={(e) => handleDeleteChild(child._id, e)}
                  >
                    <img
                      src={trashBinIcon}
                      alt="delete"
                      className="w-10 h-10"
                    />
                  </button>
                </div>
              </button>
            );
          })}

          <button
            className="rounded-2xl border-2 border-dashed border-gray-400/60 
             min-h-[135px] p-4 text-left hover:bg-gray-50 
             text-gray-600 flex items-center justify-between"
            style={{ backgroundColor: "#FFFFFF" }}
            onClick={() => {
              if (userId) {
                navigate("/add-child", {
                  state: {
                    userId: userId,
                    returnPath: "/account",
                  },
                });
              } else {
                console.error(
                  "User ID not available. Please wait for page to load."
                );
              }
            }}
            aria-label="Add your child here"
          >
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
              <img
                src={greyPersonIcon}
                alt="person icon"
                className="w-12 h-12"
              />
            </div>
            <div className="text-black/30 font-semibold">
              Add your child here
            </div>
            <div className="text-black/30 text-sm">Age</div>

            <div className="flex gap-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={orangePencilIcon}
                  alt="edit"
                  className="w-12 h-12"
                />
              </div>
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={trashBinIcon}
                  alt="delete"
                  className="w-10 h-10"
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
