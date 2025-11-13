import { useRef, useState, useCallback, useEffect } from "react";
import pencilIcon from "../icons/pencil_icon.png";
import personIcon from "../icons/personIcon.svg";

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];
const MAX_SIZE = 5 * 1024 * 1024;

export default function AvatarDropUpload({
  mode = "child", // child or user
  userId,
  childId,
  currentUrl, // existing image /static/child-images/abc.jpx
  onUploaded, //(url)
  onEdit,
  showEditButton = true, // show edit button (pencil icon)
}) {
  const BASE = import.meta.env.VITE_BACKEND_URL;
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const endpoint =
    mode === "child"
      ? `${BASE}/api/users/${userId}/children/${childId}/photo`
      : `${BASE}/api/users/${userId}/photo`;

  const validate = (file) => {
    if (!file) {
      return "No file.";
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Only images";
    }
    if (file.size > MAX_SIZE) {
      return "File too large";
    }
    return null;
  };

  const upload = async (file) => {
    if (!userId || (mode === "child" && !childId)) {
      console.log("User or Child ID missing");
      return;
    }
    const err = validate(file);
    if (err) {
      return alert(err);
    }
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      const { url } = await response.json();
      onUploaded?.(url);
      // Clear preview after successful upload so currentUrl can be displayed
      // The preview will be cleared by useEffect when currentUrl updates
    } catch (e) {
      console.error(e);
      alert("Failed to upload image");
      // Clear preview on error
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    } finally {
      setBusy(false);
    }
  };

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const file = e.dataTransfer?.files[0];
      if (!file) {
        return;
      }
      setPreview(URL.createObjectURL(file));
      upload(file);
    },
    [upload]
  );

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setPreview(URL.createObjectURL(file));
    upload(file);
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  // Clear preview when currentUrl is updated (after successful upload)
  useEffect(() => {
    if (currentUrl && preview) {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }, [currentUrl]);

  // Cleanup: revoke object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div
      className="relative"
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
      }}
      onDrop={onDrop}
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-500 text-3xl overflow-hidden"
        disabled={busy}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="h-full w-full object-cover"
          />
        ) : currentUrl ? (
          <img
            src={
              currentUrl.startsWith("/static/")
                ? `${BASE}${currentUrl}`
                : mode === "child"
                ? `${BASE}/static/child-images/${currentUrl}`
                : `${BASE}/static/user-images/${currentUrl}`
            }
            alt="avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <img src={personIcon} alt="Person icon" className="w-full h-full object-contain" />
        )}
      </button>

      {/* Edit button */}
      {showEditButton && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white shadow text-xl disabled:opacity-60"
          disabled={busy}
        >
          <img src={pencilIcon} alt="edit button" className="w-8 h-8" />
        </button>
      )}

      {/* highlight during dragging */}
      {dragOver && (
        <div className="absolute inset-0 rounded-full ring-4 ring-teal-400/80 pointer-events-none"></div>
      )}

      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        capture="environment" // use camera if smartphone
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
