import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import personIcon from "../../icons/person_icon.png";
import pencilIcon from "../../icons/pencil_icon.png";

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
    <div className="p-6">
      <h2 className="text-[40px] font-bold text-white text-center mb-8">
        Your Family
      </h2>
      {/* <div className="rounded-[22px] bg-slate-700/60 min-h-[135px] p-4"> */}
        {/* <div className="text-white/70 text-sm"> Your Family Name</div> */}
        <div className=" mb-2 text-white font-semibold text-lg">{familyName}</div>
      {/* </div> */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {children.map((child) => {
          const age = calculateAge(child.dateOfBirth);
          return (
            <button
              key={child._id}
              className="flex items-center rounded-[22px] bg-slate-700/60 min-h-[135px] p-4 text-left hover:bg-slate-600/60"
              onClick={() => navigate(`/child-dashboard/${child._id}`)}
            >
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <img src={personIcon} alt="person icon" />
              </div>

              <div className="p-4">
                <div className="text-white font-semibold">
                  {child.name || "Your Child's name"}
                </div>
                <div className="text-white/70 text-sm">
                  {/* {age ? `Age ${age}` : "Age"} */}
                  {age !== null ? `Age ${age}` : "Age"}
                </div>
              </div>

              <div className="flex justify-end flex-1">
                <button className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <img src={pencilIcon} alt="pencil icon" />
                </button>
              </div>
            </button>
          );
        })}

        <button
          className="rounded-[22px] border border-dashed border-white/30 bg-slate-700/20 min-h-[135px] p-4 text-left hover:bg-slate-600/20 focus:outline-none focus:ring-2 focus:ring-sky-500"
          onClick={() => navigate("/add-child")}
          aria-label="Add your child here"
        >
          <div className="text-white font-semibold">Add your child here</div>
          <div className="text-white/70 text-sm">Age</div>
        </button>
      </div>
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
