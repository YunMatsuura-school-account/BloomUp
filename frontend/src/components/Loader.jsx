// frontend/src/components/Loader.jsx
import React from "react";

/**
 * Reusable Loader component with BloomUP logo and animated ripple rings
 *
 * @param {boolean} fullPage - If true, takes full page height with header offset (default: true)
 * @param {string} size - Size of the logo: 'sm' (50px), 'md' (70px), 'lg' (90px) (default: 'md')
 * @param {string} className - Additional CSS classes for the container
 */
const Loader = ({ fullPage = true, size = "md", className = "" }) => {
  const sizeMap = {
    sm: 50,
    md: 70,
    lg: 90,
  };

  const logoSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`bg-[#EFEFEF] flex items-center justify-center ${
        fullPage ? "min-h-screen" : "min-h-[400px]"
      } ${className}`}
      style={fullPage ? { marginTop: "-95px" } : {}}
    >
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        .ripple-ring {
          animation: ripple 2s ease-out infinite;
        }
      `}</style>
      <div className="relative flex items-center justify-center">
        {/* Animated expanding rings - ripple effect going outward */}
        <div
          className="absolute rounded-full border-[3px] border-[#238D88] ripple-ring"
          style={{ width: logoSize, height: logoSize, animationDelay: "0s" }}
        ></div>
        <div
          className="absolute rounded-full border-[3px] border-[#238D88] ripple-ring"
          style={{ width: logoSize, height: logoSize, animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute rounded-full border-[3px] border-[#238D88] ripple-ring"
          style={{ width: logoSize, height: logoSize, animationDelay: "1s" }}
        ></div>
        <div
          className="absolute rounded-full border-[3px] border-[#238D88] ripple-ring"
          style={{ width: logoSize, height: logoSize, animationDelay: "1.5s" }}
        ></div>

        {/* Center logo */}
        <svg
          width={logoSize}
          height={logoSize}
          viewBox="0 0 70 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <rect width="70" height="70" rx="35" fill="#238D88" />
          <path
            d="M30.809 37.4475C30.809 37.4475 37.1272 39.687 37.0319 45.605"
            stroke="white"
            strokeWidth="2.38243"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
          <path
            d="M29.8129 43.6697C25.92 43.6697 22.7561 40.5058 22.7561 36.6128V29.5608H29.8129C33.7059 29.5608 36.8698 32.7247 36.8698 36.6176C36.8698 40.5058 33.7059 43.6697 29.8129 43.6697ZM25.129 36.6128C25.129 39.1954 27.2303 41.2968 29.8129 41.2968C32.3955 41.2968 34.4968 39.1954 34.4968 36.6128C34.4968 34.0303 32.3955 31.9289 29.8129 31.9289H25.129V36.6128Z"
            fill="white"
          />
          <path
            d="M29.8132 29.6804C33.6441 29.6804 36.7509 32.7871 36.7509 36.6181C36.7509 40.4491 33.6441 43.5558 29.8132 43.5558C25.9822 43.551 22.8755 40.4443 22.8755 36.6133V29.6804H29.8132ZM29.8132 41.4163C32.4672 41.4163 34.6162 39.2674 34.6162 36.6133C34.6162 33.9593 32.4672 31.8103 29.8132 31.8103H25.0101V36.6133C25.0101 39.2674 27.1591 41.4163 29.8132 41.4163ZM29.8132 29.4421H22.8755H22.6372V29.6804V36.6181C22.6372 40.573 25.8583 43.794 29.8132 43.794C33.768 43.794 36.9891 40.573 36.9891 36.6181C36.9891 32.6584 33.768 29.4421 29.8132 29.4421ZM25.2484 32.0533H29.8132C32.329 32.0533 34.3779 34.1022 34.3779 36.6181C34.3779 39.134 32.329 41.1829 29.8132 41.1829C27.2973 41.1829 25.2484 39.134 25.2484 36.6181V32.0533Z"
            fill="white"
          />
          <path
            d="M44.3842 43.6698C40.4913 43.6698 37.3274 40.5059 37.3274 36.613C37.3274 32.72 40.4913 29.5562 44.3842 29.5562H51.441V36.613C51.441 40.5059 48.2771 43.6698 44.3842 43.6698ZM44.3842 31.9338C41.8016 31.9338 39.7003 34.0352 39.7003 36.6177C39.7003 39.2003 41.8016 41.3016 44.3842 41.3016C46.9668 41.3016 49.0681 39.2003 49.0681 36.6177V31.9338H44.3842Z"
            fill="white"
          />
          <path
            d="M51.3215 29.6804V36.6181C51.3215 40.4491 48.2148 43.5558 44.3838 43.5558C40.5528 43.5558 37.4461 40.4491 37.4461 36.6181C37.4461 32.7871 40.5528 29.6804 44.3838 29.6804H51.3215ZM44.3838 41.4163C47.0379 41.4163 49.1869 39.2674 49.1869 36.6133V31.8151H44.3838C41.7298 31.8151 39.5808 33.964 39.5808 36.6181C39.5808 39.2674 41.7345 41.4163 44.3838 41.4163ZM51.5598 29.4421H51.3215H44.3838C40.429 29.4421 37.2079 32.6632 37.2079 36.6181C37.2079 40.573 40.429 43.794 44.3838 43.794C48.3387 43.794 51.5598 40.573 51.5598 36.6181V29.6804V29.4421ZM44.3838 41.1781C41.868 41.1781 39.8191 39.1292 39.8191 36.6133C39.8191 34.0974 41.868 32.0485 44.3838 32.0485H48.9486V36.6133C48.9486 39.1292 46.8997 41.1781 44.3838 41.1781Z"
            fill="white"
          />
          <path
            d="M43.521 37.4475C43.521 37.4475 36.9359 39.687 37.0359 45.605"
            stroke="white"
            strokeWidth="2.38243"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default Loader;
