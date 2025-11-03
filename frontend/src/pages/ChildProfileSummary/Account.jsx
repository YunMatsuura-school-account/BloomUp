import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import personIcon from "../../icons/person_icon.png";
import pencilIcon from "../../icons/pencil_icon.png";
import plusIcon from "../../icons/plus_icon.png";
import bell_icon from "../../icons/bell_icon.png";
import UpcomingEvents from "../../components/UpcomingEvents";

export default function Account() {
  const BASE = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [familyName, setFamilyName] = useState("");
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBellOverlay, setShowBellOverlay] = useState(false);

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

  // ESCキーでオーバーレイを閉じる
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowBellOverlay(false);
    };
    if (showBellOverlay) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [showBellOverlay]);

  if (loading) {
    return <p className="text-white p-6">Loading...</p>;
  }

  return (
    <div className=" page-surface p-6">
      <div className="flex justify-end items-center gap-4 mb-6">
        <button
          onClick={() => setShowBellOverlay(true)}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <img src={bell_icon} alt="Notifications" className="w-6 h-6" />
        </button>
        <button
          onClick={() => navigate("/user-dashboard")}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        >
          <img src={personIcon} alt="User" className="w-6 h-6" />
        </button>
      </div>
      <h2 className="text-[40px] font-bold text-black/100 text-center mb-8">
        Your Family
      </h2>

      <div className=" mb-2 text-black/100 font-semibold text-lg">
        {familyName}
      </div>
      {/* </div> */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {children.map((child) => {
          const age = calculateAge(child.dateOfBirth);
          const avatarSrc = child.imageUrl
            ? child.imageUrl.startsWith(`/static/`)
              ? `${BASE}${child.imageUrl}`
              : `${BASE}/static/child-images/${child.imageUrl}`
            : null;
          return (
            <button
              key={child._id}
              className="flex items-center rounded-[22px] bg-slate-700/60 min-h-[135px] p-4 text-left hover:bg-slate-600/60"
              style={{ backgroundColor: "#238D88" }}
              onClick={() => navigate(`/child-dashboard/${child._id}`)}
            >
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={`${child.name || "Child"} profile`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <img
                    src={personIcon}
                    slt="person icon"
                    className="w-12 h-12 opacity-90"
                  />
                )}
              </div>

              <div className="p-4">
                <div className="text-white font-semibold">
                  {child.name || "Your Child's name"}
                </div>
                <div className="text-white/70 text-sm">
                  {age !== null ? `Age ${age}` : "Age"}
                </div>
              </div>

              <div className="flex justify-end flex-1">
                <button
                  className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/add-child", {
                      state: {
                        mode: "edit",
                        childId: child._id,
                        child: child,
                        userId: userId,
                        returnPath: "/account"
                      },
                    });
                  }}
                >
                  <img
                    src={pencilIcon}
                    alt="edit"
                    className="w-12 h-12 invert opacity-80"
                  />
                </button>
              </div>
            </button>
          );
        })}

        <button
          className="rounded-2xl border-2 border-dashed border-gray-400/60 
             bg-gray-200/60 min-h-[135px] p-4 text-left hover:bg-gray-200/80 
             text-gray-600 flex items-center justify-between"
          onClick={() => navigate("/add-child", { state: { userId: userId } })}
          aria-label="Add your child here"
        >
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={personIcon}
              alt="person icon"
              className="w-12 h-12 opacity-90"
            />
          </div>
          <div className="text-black/30 font-semibold">Add your child here</div>
          <div className="text-black/30 text-sm">Age</div>

          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <img
              src={plusIcon}
              alt="edit"
              className="w-12 h-12 invert opacity-80"
            />
          </div>
        </button>
      </div>

      {/* Notification Overlay*/}
      {showBellOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBellOverlay(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Upcoming Events</h3>
              <button
                onClick={() => setShowBellOverlay(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <UpcomingEvents selectedChild={null} />
          </div>
        </div>
      )}
    </div>
  );
}

{
  /* 
    useEffect(               ← A. Reactフック
        () => {                ← B. 副作用の内容（関数）
            (async () => {       ← C. 即時実行の「中の関数」
            ...処理...
            })();                ← D. すぐ実行（即時実行）
        },                     ← B 関数の終わり
        [BASE, userId]         ← E. 依存配列
    );                        ← A の終わり
*/
}
