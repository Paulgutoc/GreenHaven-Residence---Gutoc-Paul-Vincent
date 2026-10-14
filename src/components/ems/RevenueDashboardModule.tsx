"use client";

import React, { useState } from "react";

interface RevenueDashboardProps {
  onNavigate?: (tab: string) => void;
}

export default function RevenueDashboardModule({ onNavigate }: RevenueDashboardProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: number; val: string } | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  // Key coordinate points along the Bezier curve matching Screenshot 3
  const curvePoints = [
    { x: 30, y: 75, day: 1, val: "$74,200" },
    { x: 160, y: 55, day: 7, val: "$62,800" },
    { x: 320, y: 155, day: 14, val: "$34,500" },
    { x: 480, y: 85, day: 20, val: "$68,900" },
    { x: 620, y: 35, day: 25, val: "$92,400" },
    { x: 740, y: 80, day: 30, val: "$76,100" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", width: "100%" }}>
      {/* 1. Top Card: Revenue Trend Wave Chart matching Screenshot 3 */}
      <div
        style={{
          background: "rgba(18, 22, 19, 0.42)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: "16px",
          padding: "1.8rem 2.2rem 1.4rem",
          position: "relative",
          minHeight: "310px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Revenue Trend
            </h2>
            <div
              style={{
                fontSize: "0.82rem",
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: "0.2rem",
              }}
            >
              Revenue ($)
            </div>
          </div>

          {/* Time range selector pills */}
          <div style={{ display: "flex", gap: "0.4rem", background: "rgba(0,0,0,0.3)", padding: "0.2rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
            {["7d", "30d", "90d"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                style={{
                  background: selectedPeriod === period ? "rgba(255,255,255,0.15)" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  color: selectedPeriod === period ? "#ffffff" : "rgba(255,255,255,0.55)",
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.65rem",
                  cursor: "pointer",
                  fontWeight: selectedPeriod === period ? 700 : 500,
                }}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Wave Line graph representing the exact curve in Screenshot 3 */}
        <div style={{ position: "relative", width: "100%", height: "190px", margin: "1rem 0 0.5rem" }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            {/* Horizontal Grid guidelines (Screenshot 3) */}
            <line x1="0" y1="45" x2="800" y2="45" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
            <line x1="0" y1="95" x2="800" y2="95" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
            <line x1="0" y1="145" x2="800" y2="145" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />

            {/* Smooth Wave Curve matching Screenshot 3 exact curve:
                Starts high (~60px), dips into trough (~160px), crests up to peak (~35px), gentle dip to (~80px) */}
            <path
              d="M 0 65 C 160 50, 240 165, 360 155 C 480 145, 540 25, 640 40 C 710 50, 750 85, 800 80"
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 0 65 C 160 50, 240 165, 360 155 C 480 145, 540 25, 640 40 C 710 50, 750 85, 800 80"
              fill="none"
              stroke="rgba(255, 255, 255, 0.75)"
              strokeWidth="2.0"
              strokeLinecap="round"
            />

            {/* Interactive data points */}
            {curvePoints.map((pt) => (
              <circle
                key={pt.day}
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="#ffffff"
                stroke="#0a0a0a"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "r 0.2s ease" }}
                onMouseEnter={() => setHoveredPoint({ day: pt.day, val: pt.val })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "40px",
                background: "rgba(0, 0, 0, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: "8px",
                padding: "0.4rem 0.8rem",
                color: "#ffffff",
                fontSize: "0.82rem",
                fontWeight: 600,
                pointerEvents: "none",
              }}
            >
              Day {hoveredPoint.day}: <span style={{ color: "#34d399" }}>{hoveredPoint.val}</span>
            </div>
          )}
        </div>

        {/* X-axis Label: "Days" (Screenshot 3) */}
        <div
          style={{
            textAlign: "right",
            fontSize: "0.78rem",
            color: "rgba(255, 255, 255, 0.55)",
            fontWeight: 500,
          }}
        >
          Days
        </div>
      </div>

      {/* 2. Bottom 2x2 Metric Cards Grid (Matching Screenshot 3) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Card 1: Occupancy Rate */}
        <div
          style={{
            background: "rgba(18, 22, 19, 0.42)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: "16px",
            padding: "1.6rem 2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.65)", fontWeight: 500, marginBottom: "0.35rem" }}>
            Occupancy Rate
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", marginBottom: "0.25rem" }}>
            92.4%
          </div>
          <div style={{ fontSize: "0.82rem", color: "#34d399", fontWeight: 600 }}>
            +1.3%
          </div>
        </div>

        {/* Card 2: Avg. Stay Length */}
        <div
          style={{
            background: "rgba(18, 22, 19, 0.42)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: "16px",
            padding: "1.6rem 2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.65)", fontWeight: 500, marginBottom: "0.35rem" }}>
            Avg. Stay Length
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", marginBottom: "0.25rem" }}>
            30 days
          </div>
          <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.55)", fontWeight: 600 }}>
            -0.6%
          </div>
        </div>

        {/* Card 3: Maintenance Tickets */}
        <div
          style={{
            background: "rgba(18, 22, 19, 0.42)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: "16px",
            padding: "1.6rem 2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.65)", fontWeight: 500, marginBottom: "0.35rem" }}>
            Maintenance Tickets
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", marginBottom: "0.25rem" }}>
            184
          </div>
          <div style={{ fontSize: "0.82rem", color: "#f87171", fontWeight: 600 }}>
            -12.7%
          </div>
        </div>

        {/* Card 4: On-time Service */}
        <div
          style={{
            background: "rgba(18, 22, 19, 0.42)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: "16px",
            padding: "1.6rem 2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.65)", fontWeight: 500, marginBottom: "0.35rem" }}>
            On-time Service
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", marginBottom: "0.25rem" }}>
            96.8%
          </div>
          <div style={{ fontSize: "0.82rem", color: "#34d399", fontWeight: 600 }}>
            +2.2%
          </div>
        </div>
      </div>
    </div>
  );
}
