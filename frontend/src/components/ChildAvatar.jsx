import React from "react";
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

// Avatar components array - must match the order in AvatarSelectionModal
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

// Color palette for initials when no avatar is selected
const COLOR_PALETTE = ["#006F69", "#6CC31F", "#F3BE08"];

/**
 * Get a consistent color for a child based on their name
 */
const getColorForChild = (name) => {
  if (!name || typeof name !== "string") {
    return COLOR_PALETTE[0];
  }
  // Use the first character of the name to determine color
  const firstChar = name.trim().charAt(0).toUpperCase();
  const charCode = firstChar.charCodeAt(0);
  // Map character to color index
  const colorIndex = charCode % COLOR_PALETTE.length;
  return COLOR_PALETTE[colorIndex];
};

/**
 * Get child's initials from their name
 */
const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";
  const trimmed = name.trim();
  if (trimmed.length === 0) return "?";

  // Get first letter, and second letter if available
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return trimmed[0].toUpperCase();
};

/**
  ChildAvatar Component
  Displays a child's avatar based on their avatarIndex and backgroundColor
  Falls back to initials if no avatar is selected
 
  @param {Object} child - Child object with avatarIndex, backgroundColor
  @param {number} width - Width of the avatar (default: 40)
  @param {number} height - Height of the avatar (default: 40)
  @param {string} className - Additional CSS classes
 */
const ChildAvatar = ({ child, width = 40, height = 40, className = "" }) => {
  // Check if avatar is selected (avatarIndex is a valid number 0-7)
  const avatarIndex = child?.avatarIndex;
  const hasAvatar =
    avatarIndex !== null &&
    avatarIndex !== undefined &&
    typeof avatarIndex === "number" &&
    avatarIndex >= 0 &&
    avatarIndex <= 7;

  // If no avatar selected, show initials
  if (!hasAvatar) {
    const initials = getInitials(child?.name);
    // Use color palette based on child's name (consistent color per child)
    const backgroundColor = getColorForChild(child?.name);
    const fontSize = Math.max(12, Math.min(width * 0.4, 24)); // Responsive font size

    return (
      <div
        className={`rounded-full flex items-center justify-center text-white font-semibold ${className}`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: backgroundColor,
          fontSize: `${fontSize}px`,
        }}
      >
        {initials}
      </div>
    );
  }

  // Show selected avatar (use backgroundColor from child data or default)
  const backgroundColor = child?.backgroundColor || "#238D88"; // Default color for avatars
  const validAvatarIndex = Math.max(0, Math.min(7, avatarIndex));
  const AvatarComponent = AVATARS[validAvatarIndex]?.component || FoxAvatar;

  return (
    <div
      className={`rounded-full overflow-hidden ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <AvatarComponent
        width={width}
        height={height}
        backgroundColor={backgroundColor}
      />
    </div>
  );
};

export default ChildAvatar;
