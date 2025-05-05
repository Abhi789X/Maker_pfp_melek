import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 5L10 10L20 15L30 10L20 5Z" fill="#FF8AE2" />
      <path d="M10 10L10 20L20 25L20 15L10 10Z" fill="#FF36C7" />
      <path d="M20 15L20 25L30 20L30 10L20 15Z" fill="#FF60D6" />
      <path d="M10 20L10 30L20 35L20 25L10 20Z" fill="#FF60D6" />
      <path d="M20 25L20 35L30 30L30 20L20 25Z" fill="#FF36C7" />
    </svg>
  );
};

export default Logo;
