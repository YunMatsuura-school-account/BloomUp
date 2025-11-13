import React, { useState } from "react";
import {
  FoxAvatar,
  CapybaraAvatar,
  MooseAvatar,
  SealAvatar,
  WhiteBearAvatar,
  RabbitAvatar,
  BrownBearAvatar,
  RaccoonAvatar,
} from "./avatars";

// 8 background colors for avatars (from Figma)
const BACKGROUND_COLORS = [
  "#0073E7", // Blue
  "#8CC7D8", // Light Blue
  "#0CC68E", // Green
  "#B76EF6", // Purple
  "#6400C7", // Dark Purple
  "#FF95B8", // Pink
  "#F3BE08", // Yellow
  "#E95900", // Orange
];

// Avatar components mapped to their names
const AVATARS = [
  { name: "Fox", component: FoxAvatar },
  { name: "Capybara", component: CapybaraAvatar },
  { name: "Moose", component: MooseAvatar },
  { name: "Seal", component: SealAvatar },
  { name: "White Bear", component: WhiteBearAvatar },
  { name: "Rabbit", component: RabbitAvatar },
  { name: "Brown Bear", component: BrownBearAvatar },
  { name: "Raccoon", component: RaccoonAvatar },
];

const AvatarSelectionModal = ({
  isOpen,
  onClose,
  onSave,
  initialAvatar,
  initialColor,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar || 0);
  const [selectedColor, setSelectedColor] = useState(
    initialColor || BACKGROUND_COLORS[0]
  );

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSave) {
      onSave({
        avatarIndex: selectedAvatar,
        avatarName: AVATARS[selectedAvatar].name,
        backgroundColor: selectedColor,
      });
    }
    onClose();
  };

  const SelectedAvatarComponent = AVATARS[selectedAvatar].component;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] shadow-lg max-w-[520px] w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "DM Sans, sans-serif" }}
      >
        {/* Modal Content */}
        <div className="px-6 pt-6 pb-6 flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <h2
              className="text-[22px] font-semibold leading-[1.3] text-[#161616]"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Set your child's colour and avatar.
            </h2>
            <p
              className="text-[14px] font-normal leading-[1.4] text-[#000000]"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Their colour will be used to identify them in schedules and
              reminders.
            </p>
          </div>

          {/* Colour Section */}
          <div className="flex flex-col gap-4 pl-8">
            <h3
              className="text-[20px] font-bold text-black"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Colour
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {BACKGROUND_COLORS.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-full h-[56px] w-[56px] transition-all duration-200 hover:scale-105 ${
                    selectedColor === color
                      ? "border-2 border-black"
                      : "border border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col gap-4 pl-8">
            <h3
              className="text-[20px] font-bold text-black"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              Avatar
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {AVATARS.map((avatar, index) => {
                const AvatarComponent = avatar.component;
                const isSelected = selectedAvatar === index;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedAvatar(index)}
                    className={`rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? "border-2 border-black"
                        : "border border-gray-200"
                    }`}
                    style={{
                      width: "56px",
                      height: "56px",
                    }}
                    aria-label={`Select ${avatar.name} avatar`}
                  >
                    <AvatarComponent
                      width={56}
                      height={56}
                      backgroundColor={selectedColor}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex gap-24 px-20 pb-6 pt-6 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 flex items-center justify-center font-semibold hover:opacity-80 transition-opacity rounded-[12px] h-[48px] border border-gray-300"
            style={{
              backgroundColor: "transparent",
              color: "#000000",
              fontSize: "15px",
              fontWeight: 600,
              lineHeight: "1.4",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 flex items-center justify-center font-semibold text-white hover:opacity-90 transition-opacity rounded-[12px] h-[48px]"
            style={{
              backgroundColor: "#238D88",
              fontSize: "15px",
              fontWeight: 600,
              lineHeight: "1.4",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelectionModal;
