import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import greyPersonIcon from "../../icons/greyPersonIcon.svg";
import orangePencilIcon from "../../icons/orangePencilIcon.svg";
import trashBinIcon from "../../icons/trashBinIcon.svg";
import plusIcon from "../../icons/plusIcon.svg";
import plusSvg from "../../icons/plus.svg";
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
    <div className="page-surface md:bg-[#EFEFEF]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="p-6 md:max-w-[1234px] md:mx-auto md:pr-[59px]">
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
        <h2 className="text-[40px] font-bold text-black/100 text-center mb-20">
          Your Family
        </h2>

        <div className="mb-8 flex items-center justify-center relative">
          <div className="text-black/100 font-semibold text-lg text-center">
            {familyName}
          </div>
          {/* Mobile plus icon - commented out for now, may be restored in the future */}
          {/* <button
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
            className="md:hidden absolute right-0"
            aria-label="Add your child here"
          >
            <img
              src={plusIcon}
              alt="Add child"
              className="w-8 h-8"
            />
          </button> */}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {children.map((child) => {
            const age = calculateAge(child.dateOfBirth);
            return (
              <button
                key={child._id}
                className="flex items-center rounded-[22px] p-4 text-left hover:bg-gray-50 h-[78px] md:h-[135.14px]"
                style={{ backgroundColor: "#FFFFFF" }}
                onClick={() => navigate(`/child-dashboard/${child._id}`)}
              >
                <div className="flex items-center justify-center overflow-hidden rounded-full md:w-[75.14px] md:h-[75.14px]" style={{ width: "62px", height: "62px" }}>
                  <ChildAvatar child={child} width={62} height={62} />
                </div>

                <div className="p-4 flex-1 min-w-0">
                  <div className="text-black font-semibold md:leading-[24px] break-words" style={{ fontSize: "14px", lineHeight: "24px" }}>
                    {child.name || "Your Child's name"}
                  </div>
                  <div className="text-black/70 md:text-sm" style={{ fontSize: "12px" }}>
                    {age !== null ? `Age ${age}` : "Age"}
                  </div>
                </div>

                <div className="flex justify-end flex-shrink-0 gap-4 items-center">
                  <button
                    className="flex items-center justify-center"
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
                      style={{ width: "34px", height: "34px" }}
                    />
                  </button>
                  {/* Mobile trash icon - commented out for now, may be restored in the future */}
                  {/* <button
                    className="md:flex hidden items-center justify-center"
                    onClick={(e) => handleDeleteChild(child._id, e)}
                  >
                    <img
                      src={trashBinIcon}
                      alt="delete"
                      className={isFirstChild ? "w-[30px] h-[30px]" : "w-10 h-10"}
                    />
                  </button> */}
                  <button
                    className="hidden md:flex items-center justify-center"
                    onClick={(e) => handleDeleteChild(child._id, e)}
                  >
                    <img
                      src={trashBinIcon}
                      alt="delete"
                      style={{ width: "34px", height: "34px" }}
                    />
                  </button>
                </div>
              </button>
            );
          })}

          <button
            className="rounded-2xl p-4 text-left hover:opacity-90 transition-opacity flex items-center border-2 border-dashed h-[78px] md:h-[135.14px]"
            style={{
              backgroundColor: "transparent",
              borderColor: "#F3BE08",
            }}
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
            <div
              className="flex items-center justify-center overflow-hidden rounded-full md:w-[75.14px] md:h-[75.14px]"
              style={{
                width: "62px",
                height: "62px",
                backgroundColor: "#F3BE08",
              }}
            >
              <svg 
                width="72" 
                height="72" 
                viewBox="0 0 76 76" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M47.0723 49.5713V46.9046C47.0723 45.4901 46.5003 44.1336 45.4823 43.1334C44.4642 42.1332 43.0834 41.5713 41.6437 41.5713H33.5008C32.0611 41.5713 30.6803 42.1332 29.6623 43.1334C28.6442 44.1336 28.0723 45.4901 28.0723 46.9046V49.5713M43.0008 30.9046C43.0008 33.8501 40.5704 36.238 37.5723 36.238C34.5741 36.238 32.1437 33.8501 32.1437 30.9046C32.1437 27.9591 34.5741 25.5713 37.5723 25.5713C40.5704 25.5713 43.0008 27.9591 43.0008 30.9046Z" 
                  stroke="#000000" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="p-4">
              <div className="font-semibold md:leading-[24px]" style={{ fontSize: "14px", lineHeight: "24px", color: "#000000" }}>
                Add your child here
              </div>
              <div className="md:text-sm" style={{ fontSize: "12px", color: "#000000" }}>Age</div>
            </div>

            <div className="flex justify-end flex-1 items-center">
              {/* Mobile: Pencil icon with #4F4F4F background */}
              <button
                className="md:hidden flex items-center justify-center rounded-full"
                style={{ width: "34px", height: "34px", backgroundColor: "#F3BE08" }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (userId) {
                    navigate("/add-child", {
                      state: {
                        userId: userId,
                        returnPath: "/account",
                      },
                    });
                  }
                }}
              >
                <svg 
                  width="34" 
                  height="34" 
                  viewBox="0 0 44 44" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M24.9999 15.0004L28.9999 19.0004M31.1739 16.8124C31.7026 16.2838 31.9997 15.5668 31.9998 14.8192C31.9999 14.0716 31.703 13.3546 31.1744 12.8259C30.6459 12.2972 29.9289 12.0001 29.1813 12C28.4337 11.9999 27.7166 12.2968 27.1879 12.8254L13.8419 26.1744C13.6098 26.4059 13.438 26.6909 13.3419 27.0044L12.0209 31.3564C11.9951 31.4429 11.9931 31.5347 12.0153 31.6222C12.0374 31.7097 12.0829 31.7896 12.1467 31.8534C12.2106 31.9172 12.2906 31.9624 12.3781 31.9845C12.4656 32.0065 12.5575 32.0044 12.6439 31.9784L16.9969 30.6584C17.3101 30.5631 17.5951 30.3925 17.8269 30.1614L31.1739 16.8124Z" 
                    stroke="#000000" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* Desktop: Plus icon */}
              <div
                className="hidden md:flex items-center justify-center rounded-full"
                style={{
                  width: "48.09px",
                  height: "48.09px",
                  backgroundColor: "#F3BE08",
                }}
              >
                <svg 
                  width="48.09" 
                  height="48.09" 
                  viewBox="0 0 48.09 48.09" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Horizontal line */}
                  <line 
                    x1={(48.09 - 18.03) / 2} 
                    y1={48.09 / 2} 
                    x2={(48.09 + 18.03) / 2} 
                    y2={48.09 / 2} 
                    stroke="#000000" 
                    strokeWidth="3.00572" 
                    strokeLinecap="round"
                  />
                  {/* Vertical line */}
                  <line 
                    x1={48.09 / 2} 
                    y1={(48.09 - 18.03) / 2} 
                    x2={48.09 / 2} 
                    y2={(48.09 + 18.03) / 2} 
                    stroke="#000000" 
                    strokeWidth="3.00572" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
