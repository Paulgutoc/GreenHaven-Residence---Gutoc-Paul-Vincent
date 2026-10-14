"use client";

import React from "react";

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export default function BrandLogo({ size = 84, className = "" }: BrandLogoProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top Red Arc */}
        <path
          d="M 22 40 A 34 34 0 0 1 78 40"
          stroke="#DC2626"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Bottom Blue Arc */}
        <path
          d="M 78 60 A 34 34 0 0 1 22 60"
          stroke="#0284C7"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Center Emerald Grid Globe */}
        <g id="globe">
          {/* Globe Base Fill */}
          <circle cx="50" cy="50" r="23" fill="#15803D" />

          {/* Globe Outline */}
          <circle
            cx="50"
            cy="50"
            r="23"
            stroke="#0A0F0D"
            strokeWidth="2.2"
          />

          {/* Latitude Lines */}
          <line
            x1="27"
            y1="50"
            x2="73"
            y2="50"
            stroke="#0A0F0D"
            strokeWidth="1.8"
          />
          <path
            d="M 31 39 Q 50 44 69 39"
            stroke="#0A0F0D"
            strokeWidth="1.6"
            fill="none"
          />
          <path
            d="M 31 61 Q 50 56 69 61"
            stroke="#0A0F0D"
            strokeWidth="1.6"
            fill="none"
          />

          {/* Longitude Lines */}
          <line
            x1="50"
            y1="27"
            x2="50"
            y2="73"
            stroke="#0A0F0D"
            strokeWidth="1.8"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="12.5"
            ry="23"
            stroke="#0A0F0D"
            strokeWidth="1.6"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
