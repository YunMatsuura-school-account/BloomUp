import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom"; // useLocation: receive state info from navigate()
import AvatarDropUpload from "../../components/AvatarDropUpload";
import cameraIcon from "../../icons/cameraIcon.svg";

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
    <div className="flex items-center justify-between rounded-lg px-4 py-3" style={{ backgroundColor: "#FFFFFF" }}>
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
  const [pendingImageUrl, setPendingImageUrl] = useState(null); // Temporary image URL before saving
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
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");
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
  const imageChanged = pendingImageUrl !== null && pendingImageUrl !== (me?.imageUrl ?? "");
  const pwAllFilled = !!currentPw && !!newPw && !!confirmPw;

  const canSave =
    !saving && !loading && (profileChanged || imageChanged || (pwAllFilled && !pwError));

  const handleDelete = async () => {

    const confirmed = window.confirm("Are you sure you want to delete your account?");
    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteErr("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        return navigate("/login");
      }

      if (!userId) {
        throw new Error("User ID not found");
      }

      const res = await fetch(`${BASE}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to delete account");
      }
      localStorage.removeItem("accessToken");
      navigate("/login");
    } catch (e) {
      console.error(e);
      setDeleteErr(e.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErr("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        return navigate("/login");
      }

      //   update profile (including image if changed)
      const needProfileUpdate =
        name.trim() !== (me?.name ?? "") || 
        email.trim() !== (me?.email ?? "") || 
        (pendingImageUrl !== null && pendingImageUrl !== (me?.imageUrl ?? ""));
      if (needProfileUpdate && userId) {
        const updateData = {
          name: name.trim(),
          email: email.trim(),
        };
        // Include imageUrl if there's a pending change
        if (pendingImageUrl !== null) {
          updateData.imageUrl = pendingImageUrl;
        }
        
        const res1 = await fetch(`${BASE}/api/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        });
        if (!res1.ok) {
          const msg = await res1.json().catch(() => null);
          throw new Error(msg?.message || "Failed to update profile");
        }

        const updated = await res1.json().catch(() => null);
        setMe((m) => ({
          ...(m || {}),
          ...(updated?.user || updated || {}),
          name: name.trim(),
          email: email.trim(),
        }));
        // Clear pending image URL after successful save
        setPendingImageUrl(null);
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
    <div className="min-h-screen px-6 lg:px-12 py-8" style={{ backgroundColor: "#FFFFFF" }}>
      <h1 className="text-center text-[22px] font-semibold text-black/90 mb-6">
        Edit user
      </h1>

      {/* Personal information */}
      <section className="rounded-2xl p-6 md:p-8 md:px-16 md:py-12 max-w-3xl md:max-w-4xl mx-auto space-y-4" style={{ backgroundColor: "rgba(0, 143, 136, 0.15)" }}>
        <div className="md:max-w-md md:mx-auto space-y-4">
        <h2 className="text-center text-sm text-black/70">
          Personal information
        </h2>

        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <div
              onClick={() => {
                const input = document.querySelector('input[type="file"][accept="image/*"]');
                input?.click();
              }}
              className="flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <AvatarDropUpload
                mode="user"
                userId={userId}
                currentUrl={pendingImageUrl ?? me?.imageUrl ?? ""}
                onUploaded={(url) => {
                  // Store the uploaded URL temporarily, don't update me.imageUrl yet
                  // It will be saved when user clicks "Save Changes"
                  setPendingImageUrl(url);
                }}
                showEditButton={false}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector('input[type="file"][accept="image/*"]');
                input?.click();
              }}
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              aria-label="Change avatar"
            >
              <img src={cameraIcon} alt="Camera icon" className="w-10 h-10" />
            </button>
          </div>
        </div>

        <Field label="User name">
          <input
            className="w-full rounded-lg px-4 py-2 outline-none"
            style={{ backgroundColor: "#FFFFFF" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className="w-full rounded-lg px-4 py-2 outline-none"
            style={{ backgroundColor: "#FFFFFF" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Current password">
          <div className="relative">
            <input
              type={showCurrentPw ? "text" : "password"}
              className="w-full rounded-lg px-4 py-2 pr-10 outline-none"
              style={{ backgroundColor: "#FFFFFF" }}
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
              className="w-full rounded-lg px-4 py-2 pr-10 outline-none"
              style={{ backgroundColor: "#FFFFFF" }}
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
              className="w-full rounded-lg px-4 py-2 pr-10 outline-none"
              style={{ backgroundColor: "#FFFFFF" }}
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
        </div>
      </section>

      {/* Notification */}
      <section className="rounded-2xl p-6 md:p-8 md:px-16 md:py-12 max-w-3xl md:max-w-4xl mx-auto space-y-5 mt-6" style={{ backgroundColor: "rgba(0, 143, 136, 0.15)" }}>
        <div className="md:max-w-md md:mx-auto space-y-5">
        <h2 className="text-center text-sm text-black/70">Notification</h2>

        {/* <ToggleRow
          title="Email Notifications"
          description="Receive important updates"
          checked={emailNotification}
          onChange={setEmailNotification}
        /> */}
        <ToggleRow
          title="Reminders"
          description="Get reminders for events"
          checked={reminder}
          onChange={setReminder}
        />
        </div>
      </section>

      {/* Delete account */}
      <section className="rounded-2xl p-6 md:p-8 md:px-16 md:py-12 max-w-3xl md:max-w-4xl mx-auto space-y-4 mt-6" style={{ backgroundColor: "rgba(0, 143, 136, 0.15)" }}>
        <div className="md:max-w-md md:mx-auto space-y-4">
        <h2 className="text-center text-sm text-black/70">
          Delete your account
        </h2>
        <p className="text-xs text-black/60 text-center">
          When you delete your account, you lose access to BloomUp services, and
          we permanently delete your personal data.
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            className="px-5 py-2 rounded-lg text-black/80 hover:bg-gray-50"
            style={{ backgroundColor: "#FFFFFF" }}
            onClick={() => handleDelete()}
            disabled={deleting} // disable button during the button cannot be clicked. This avoid trying to delete multiple times.
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
        </div>
      </section>

      {/* Save button */}
      <div className="max-w-3xl md:max-w-4xl mx-auto mt-8">
        <div className="md:max-w-md md:mx-auto">
        <button
          disabled={!canSave}
          onClick={handleSave}
          className={`w-full rounded-lg py-3 ${
            canSave
              ? "text-white"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
          style={canSave ? { backgroundColor: "#238D88" } : {}}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        </div>
      </div>

      {/* Back link */}
      <div className="max-w-3xl md:max-w-4xl mx-auto mt-4 text-center">
        <div className="md:max-w-md md:mx-auto">
        <Link to="/dashboard" className="text-sm text-gray-600 underline">
          Back to Dashboard
        </Link>
        </div>
      </div>
    </div>
  );

}
