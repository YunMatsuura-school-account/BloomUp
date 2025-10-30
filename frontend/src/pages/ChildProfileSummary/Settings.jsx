import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom"; // useLocation: receive state info from navigate()
import AvatarDropUpload from "../../components/AvatarDropUpload";

// Hoisted helper components to avoid remounting inputs on each render
function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-black/70">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-red-500">{hint}</div> : null}
    </label>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-300/70 px-4 py-3">
      <div>
        <div className="text-sm text-black/90">{title}</div>
        <div className="text-xs text-black/60">{description}</div>
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />

        <span
          className={`h-6 w-10 rounded-full transition-colors ${
            checked ? "bg-teal-600" : "bg-gray-400"
          }`}
        >
          <span
            className={`block h-5 w-5 bg-white rounded-full transition-transform translate-y-[2px] ${
              checked ? "translate-x-[22px]" : "translate-x-[2px]"
            }`}
          />
        </span>
      </label>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.77 21.77 0 0 1 5.06-5.94"/>
      <path d="M1 1l22 22"/>
      <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 3-3 3 3 0 0 0-2.12-2.12"/>
    </svg>
  );
}

export default function Settings() {
  const BASE = import.meta.env.VITE_BACKEND_URL;
  const { state } = useLocation();
  const navigate = useNavigate();
  const [me, setMe] = useState(state?.user ?? null);
  const userId = useMemo(
    () => state?.userId ?? state?.user?.id ?? me?.id ?? null,
    [state, me]
  );
  const [name, setName] = useState(state?.user?.name ?? "");
  const [email, setEmail] = useState(state?.user?.email ?? "");
  const [currentPw, setCurrentPw] = useState("");
  const [emailNotification, setEmailNotification] = useState(false); // Probably omit
  const [reminder, setReminder] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // password visibility toggles
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(!state?.user);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  //fallback for no state
  useEffect(() => {
    if (state?.user) {
      return;
    }
    let aborted = false;
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          return navigate("/login");
        }
        const response = await fetch(`${BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("accessToken");
          return navigate("/login");
        }
        if (!response.ok) {
          throw new Error("failed");
        }
        const myData = await response.json();
        if (!aborted) {
          setMe(myData);
          setName(myData?.name ?? "");
          setEmail(myData?.email ?? "");
        }
      } catch (e) {
        if (!aborted) {
          setErr("Failed to load user");
        }
        console.error(e);
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      aborted = true;
    };
  }, [BASE, state, navigate]);

  const pwError =
    (newPw || confirmPw) &&
    (newPw.length < 6
      ? "New password must be at least 6 letters long."
      : newPw !== confirmPw
      ? "Password does not match"
      : "");

  const profileChanged =
    name.trim() !== (me?.name ?? "") || email.trim() !== (me?.email ?? "");
  const pwAllFilled = !!currentPw && !!newPw && !!confirmPw;

  const canSave =
    !saving && !loading && (profileChanged || (pwAllFilled && !pwError));

  const handleSave = async () => {
    try {
      setSaving(true);
      setErr("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        return navigate("/login");
      }

      //   update profile
      const needProfileUpdate =
        name.trim() !== (me?.name ?? "") || email.trim() !== (me?.email ?? "");
      if (needProfileUpdate && userId) {
        const res1 = await fetch(`${BASE}/api/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          }),
        });
        if (!res1.ok) {
          const msg = await res1.json().catch(() => null);
          throw new Error(msg?.message || "Failed to update profile");
        }

        const updated = await res1.json().catch(() => null);
        setMe((m) => ({
          ...(m || {}),
          ...(updated || {}),
          name: name.trim(),
          email: email.trim(),
        }));
      }

      //   change password

      if (pwAllFilled) {
        if (pwError) {
          throw new Error(pwError);
        }
        const res2 = await fetch(`${BASE}/api/auth/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: currentPw,
            newPassword: newPw,
          }),
        });
        if (!res2.ok) {
          const msg = await res2.json().catch(() => null);
          throw new Error(msg?.message || "Failed to change password");
        }
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    } catch (e) {
      console.error(e);
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] px-6 lg:px-12 py-8">
      <h1 className="text-center text-[22px] font-semibold text-black/90 mb-6">
        Edit user
      </h1>

      {/* Personal information */}
      <section className="rounded-2xl bg-gray-200/80 p-6 md:p-8 max-w-3xl mx-auto space-y-4">
        <h2 className="text-center text-sm text-black/70">
          Personal information
        </h2>

        {/* Avatar */}
        <div className="flex justify-center">
          <AvatarDropUpload
            mode="user"
            userId={userId}
            currentUrl={me?.imageUrl ?? ""}
            onUploaded={(url) =>
              setMe((m) => ({ ...(m || {}), imageUrl: url }))
            }
          />
        </div>

        <Field label="User name">
          <input
            className="w-full rounded-lg bg-gray-300/70 px-4 py-2 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className="w-full rounded-lg bg-gray-300/70 px-4 py-2 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Current password">
          <div className="relative">
            <input
              type={showCurrentPw ? "text" : "password"}
              className="w-full rounded-lg bg-gray-300/70 px-4 py-2 pr-10 outline-none"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder=""
            />
            <button
              type="button"
              aria-label={showCurrentPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black/70"
              onClick={() => setShowCurrentPw((v) => !v)}
            >
              {showCurrentPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        <Field label="New password">
          <div className="relative">
            <input
              type={showNewPw ? "text" : "password"}
              className="w-full rounded-lg bg-gray-300/70 px-4 py-2 pr-10 outline-none"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder=""
            />
            <button
              type="button"
              aria-label={showNewPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black/70"
              onClick={() => setShowNewPw((v) => !v)}
            >
              {showNewPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>

        <Field label="Confirm password" hint={pwError}>
          <div className="relative">
            <input
              type={showConfirmPw ? "text" : "password"}
              className="w-full rounded-lg bg-gray-300/70 px-4 py-2 pr-10 outline-none"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder=""
            />
            <button
              type="button"
              aria-label={showConfirmPw ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black/70"
              onClick={() => setShowConfirmPw((v) => !v)}
            >
              {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </Field>
      </section>

      {/* Notification */}
      <section className="rounded-2xl bg-gray-200/80 p-6 md:p-8 max-w-3xl mx-auto space-y-5 mt-6">
        <h2 className="text-center text-sm text-black/70">Notification</h2>

        <ToggleRow
          title="Email Notifications"
          description="Receive important updates"
          checked={emailNotification}
          onChange={setEmailNotification}
        />
        <ToggleRow
          title="Reminders"
          description="Get reminders for events"
          checked={reminder}
          onChange={setReminder}
        />
      </section>

      {/* Delete account */}
      <section className="rounded-2xl bg-gray-200/80 p-6 md:p-8 max-w-3xl mx-auto space-y-4 mt-6">
        <h2 className="text-center text-sm text-black/70">
          Delete your account
        </h2>
        <p className="text-xs text-black/60 text-center">
          When you delete your account, you lose access to BloomUp services, and
          we permanently delete your personal data. You can cancel the deletion
          for 14 days.
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            className="px-5 py-2 rounded bg-gray-400/70 text-black/80"
            onClick={() => alert("TODO: implement delete")}
          >
            Delete
          </button>
        </div>
      </section>

      {/* Save button */}
      <div className="max-w-3xl mx-auto mt-8">
        <button
          disabled={!canSave}
          onClick={handleSave}
          className={`w-full rounded-xl py-3 ${
            canSave
              ? "bg-teal-700 text-white"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Back link */}
      <div className="max-w-3xl mx-auto mt-4 text-center">
        <Link to="/dashboard" className="text-sm text-gray-600 underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

}
