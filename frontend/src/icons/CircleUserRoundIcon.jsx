import React from "react";

/**
 * Circle User Round Icon - matches Figma lucide/circle-user-round
 * 28x28 pixels with white fill and #232527 stroke (2px)
 */
export default function CircleUserRoundIcon({
  className = "w-7 h-7",
  fill = "#FFFFFF",
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
    >
      <path
        d="M20.9997 23.3335C20.9997 21.477 20.2622 19.6965 18.9494 18.3837C17.6367 17.071 15.8562 16.3335 13.9997 16.3335M13.9997 16.3335C12.1432 16.3335 10.3627 17.071 9.04993 18.3837C7.73717 19.6965 6.99967 21.477 6.99967 23.3335M13.9997 16.3335C16.577 16.3335 18.6663 14.2442 18.6663 11.6668C18.6663 9.0895 16.577 7.00016 13.9997 7.00016C11.4223 7.00016 9.33301 9.0895 9.33301 11.6668C9.33301 14.2442 11.4223 16.3335 13.9997 16.3335ZM25.6663 14.0002C25.6663 20.4435 20.443 25.6668 13.9997 25.6668C7.55635 25.6668 2.33301 20.4435 2.33301 14.0002C2.33301 7.55684 7.55635 2.3335 13.9997 2.3335C20.443 2.3335 25.6663 7.55684 25.6663 14.0002Z"
        stroke="#232527"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
