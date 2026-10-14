"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import RevenueDashboardModule from "@/components/ems/RevenueDashboardModule";
import AnnouncementModule from "@/components/ems/AnnouncementModule";
import AttendanceModule from "@/components/ems/AttendanceModule";
import LeaveRequestModule from "@/components/ems/LeaveRequestModule";
import TaskModule from "@/components/ems/TaskModule";
import ProfileModule from "@/components/ems/ProfileModule";

type ScreenView = "login" | "activate" | "emailsent" | "changepassword" | "dashboard";
type DashboardTab = "Dashboard" | "Announcement" | "Task" | "Leave Request" | "Attendance" | "Update Profile";

export default function Home() {
  const [screen, setScreen] = useState<ScreenView>("dashboard");
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Error simulation states to match screenshots
  const [showLoginErrors, setShowLoginErrors] = useState(false);
  const [showUsernameTakenError, setShowUsernameTakenError] = useState(false);

  // Form states
  const [loginUsername, setLoginUsername] = useState("qwerty@example");
  const [loginPassword, setLoginPassword] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activateError, setActivateError] = useState("");
  const [activateSuccessEmail, setActivateSuccessEmail] = useState("");

  const [newUsername, setNewUsername] = useState("Paul Vincent");
  const [changeEmployeeId, setChangeEmployeeId] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSaveError, setPasswordSaveError] = useState("");
  const [isFromEmailVerification, setIsFromEmailVerification] = useState(false);
  const [activationSuccessNotice, setActivationSuccessNotice] = useState("");

  // Listen for verification link from Brevo emails: ?screen=changepassword&employeeId=...&token=...
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const targetScreen = params.get("screen") as ScreenView | null;
      const paramEmpId = params.get("employeeId");
      const paramToken = params.get("token");

      if (paramEmpId) setChangeEmployeeId(paramEmpId);
      if (paramToken) setVerificationToken(paramToken);

      if (targetScreen === "changepassword" || paramToken) {
        setScreen("changepassword");
        setIsFromEmailVerification(true);
      }
    }
  }, []);

  // Current logged in employee profile from Supabase
  const [currentUser, setCurrentUser] = useState<{
    employeeId: string;
    username: string;
    name: string;
    department: string;
    role: string;
    companyEmail: string;
  } | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [activeDashTab, setActiveDashTab] = useState<DashboardTab>("Dashboard");

  // Actions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowLoginErrors(false);
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setShowLoginErrors(true);
        setIsLoggingIn(false);
        return;
      }

      setCurrentUser(data.user);
      setIsLoggingIn(false);
      setScreen("dashboard");
    } catch {
      setShowLoginErrors(true);
      setIsLoggingIn(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivateError("");

    if (!acceptedTerms) {
      setActivateError("Please accept the Terms and Conditions to proceed.");
      return;
    }

    setIsActivating(true);
    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          email,
          termsAccepted: acceptedTerms,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActivateError(data.error || "Account activation failed. Please try again.");
        setIsActivating(false);
        return;
      }

      setActivateSuccessEmail(email);
      setChangeEmployeeId(employeeId);
      if (data.verificationToken) {
        setVerificationToken(data.verificationToken);
      } else if (data.devVerificationToken) {
        setVerificationToken(data.devVerificationToken);
      }
      setIsActivating(false);
      setScreen("emailsent");
    } catch {
      setActivateError("Network connection error. Please try again.");
      setIsActivating(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaveError("");
    setShowUsernameTakenError(false);

    if (newPassword !== confirmPassword) {
      setPasswordSaveError("New password and confirmation password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordSaveError("Password must be at least 6 characters long.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/auth/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: changeEmployeeId,
          verificationToken,
          newUsername,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.field === "username" || (data.error && data.error.includes("already taken"))) {
          setShowUsernameTakenError(true);
        } else {
          setPasswordSaveError(data.error || "Failed to update credentials. Please check your details.");
        }
        setIsSavingPassword(false);
        return;
      }

      setLoginUsername(newUsername);
      setLoginPassword("");
      setActivationSuccessNotice("Account credentials updated successfully! You can now log in.");
      setIsSavingPassword(false);
      setScreen("login");
    } catch {
      setPasswordSaveError("Network error connecting to authentication service. Please try again.");
      setIsSavingPassword(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: screen === "dashboard" ? "stretch" : "center",
        justifyContent: "center",
        overflowX: "hidden",
        backgroundColor: "#141d17",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* FULL VIEWPORT BACKGROUND IMAGE */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Image
          src="/images/subdivision-bg.jpg"
          alt="Green Haven Residence Community Background"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(0.85) contrast(1.05)",
            transform: "scale(1.03)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(14, 22, 17, 0.15) 0%, rgba(10, 16, 12, 0.38) 100%)",
          }}
        />
      </div>

      {/* TOP FLOATING NAVIGATION BAR */}
      {isNavCollapsed ? (
        <button
          onClick={() => setIsNavCollapsed(false)}
          style={{
            position: "fixed",
            top: "0.8rem",
            right: "1.2rem",
            zIndex: 999,
            background: "rgba(18, 28, 22, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            borderRadius: "9999px",
            padding: "0.35rem 0.85rem",
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          ✦ Switch Screen View ▾
        </button>
      ) : (
        <div
          style={{
            position: "fixed",
            top: "1.2rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 999,
            background: "rgba(18, 28, 22, 0.88)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            borderRadius: "9999px",
            padding: "0.35rem 0.6rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
            maxWidth: "95vw",
            overflowX: "auto",
          }}
        >
          <button
            onClick={() => setScreen("login")}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "9999px",
              border: "none",
              background: screen === "login" ? "#10b981" : "transparent",
              color: screen === "login" ? "#070c09" : "rgba(255, 255, 255, 0.8)",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            1. Login Screen
          </button>

          <button
            onClick={() => setScreen("activate")}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "9999px",
              border: "none",
              background: screen === "activate" ? "#10b981" : "transparent",
              color: screen === "activate" ? "#070c09" : "rgba(255, 255, 255, 0.8)",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            2. Activate Account
          </button>

          <button
            onClick={() => setScreen("emailsent")}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "9999px",
              border: "none",
              background: screen === "emailsent" ? "#10b981" : "transparent",
              color: screen === "emailsent" ? "#070c09" : "rgba(255, 255, 255, 0.8)",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            3. Email Sent
          </button>

          <button
            onClick={() => setScreen("changepassword")}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "9999px",
              border: "none",
              background: screen === "changepassword" ? "#10b981" : "transparent",
              color: screen === "changepassword" ? "#070c09" : "rgba(255, 255, 255, 0.8)",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            4. Change Password
          </button>

          <button
            onClick={() => setScreen("dashboard")}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "9999px",
              border: "none",
              background: screen === "dashboard" ? "#d4af37" : "transparent",
              color: screen === "dashboard" ? "#070c09" : "rgba(255, 255, 255, 0.8)",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            5. EMS Dashboard (Screens 1-5)
          </button>

          <button
            onClick={toggleBrowserFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Browser Fullscreen"}
            style={{
              padding: "0.45rem 0.9rem",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              background: isFullscreen ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.08)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <span>{isFullscreen ? "🗗" : "⛶"}</span>
            <span>{isFullscreen ? "Exit" : "Fullscreen"}</span>
          </button>

          <button
            onClick={() => setIsNavCollapsed(true)}
            title="Minimize Bar"
            style={{
              padding: "0.4rem 0.65rem",
              borderRadius: "9999px",
              border: "none",
              background: "rgba(255, 255, 255, 0.1)",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LOGIN SCREEN (Matches Image 2 & earlier Image 1) */}
      {/* ========================================================= */}
      {screen === "login" && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "1060px",
            margin: "4.5rem 1.5rem 2rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              background: "rgba(20, 32, 25, 0.62)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              borderRadius: "36px",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
              minHeight: "580px",
            }}
          >
            {/* Left Form */}
            <div
              style={{
                padding: "3.5rem 3rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.2rem" }}>
                <BrandLogo size={90} />
              </div>

              <div style={{ textAlign: "center", marginBottom: "1.8rem" }}>
                <h1
                  style={{
                    fontSize: "1.85rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.01em",
                    marginBottom: "0.3rem",
                  }}
                >
                  Good day, Welcome back!
                </h1>

                {/* Optional Error banner matching Image 2 */}
                {showLoginErrors ? (
                  <div style={{ color: "#dc2626", fontSize: "0.85rem", fontWeight: 700, marginTop: "0.2rem" }}>
                    Invalid username or password!
                  </div>
                ) : activationSuccessNotice ? (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#34d399",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      marginTop: "0.4rem",
                      textAlign: "center",
                    }}
                  >
                    ✓ {activationSuccessNotice}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.65)" }}>
                    Continue activate your account please enter your details
                  </p>
                )}
              </div>

              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="qwerty@example"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.95rem 1.15rem",
                      borderRadius: "10px",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: showLoginErrors
                        ? "1.5px solid #dc2626"
                        : "1px solid rgba(255, 255, 255, 0.16)",
                      color: showLoginErrors ? "#f87171" : "#ffffff",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                  />
                  {showLoginErrors && (
                    <div style={{ color: "#dc2626", fontSize: "0.78rem", marginTop: "0.3rem", fontWeight: 600 }}>
                      Please enter a valid username
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.95rem 1.15rem",
                      borderRadius: "10px",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.16)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Sub-row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.8rem",
                    marginTop: "-0.2rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setScreen("activate")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.85)",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "0.8rem",
                    }}
                  >
                    Don&apos;t have an account?{" "}
                    <span style={{ color: "#34d399", textDecoration: "underline" }}>
                      Activate account
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreen("emailsent")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.65)",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "0.8rem",
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "14px",
                    background: isLoggingIn ? "rgba(0,0,0,0.6)" : "#000000",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    color: "#ffffff",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: isLoggingIn ? "not-allowed" : "pointer",
                    marginTop: "0.6rem",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.6)",
                    opacity: isLoggingIn ? 0.7 : 1,
                  }}
                >
                  {isLoggingIn ? "Logging in..." : "Log in"}
                </button>

                {/* Demo Helper Button to toggle the exact error view in Image 2 */}
                <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setShowLoginErrors(!showLoginErrors)}
                    style={{
                      background: "none",
                      border: "none",
                      color: showLoginErrors ? "#34d399" : "rgba(255,255,255,0.45)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    {showLoginErrors ? "Hide validation error state" : "Show Screenshot #2 error state"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Card Picture */}
            <div
              style={{
                position: "relative",
                padding: "1.2rem",
                display: "none",
              }}
              className="desktop-only-card"
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  minHeight: "500px",
                  borderRadius: "28px",
                  overflow: "hidden",
                  boxShadow: "0 10px 35px rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                }}
              >
                <Image
                  src="/images/subdivision-bg.jpg"
                  alt="Green Haven Residence Community Sunlight Preview"
                  fill
                  priority
                  sizes="(max-width: 1024px) 50vw, 480px"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ACTIVATE ACCOUNT SCREEN */}
      {/* ========================================================= */}
      {screen === "activate" && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "1060px",
            margin: "4.5rem 1.5rem 2rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              background: "rgba(20, 32, 25, 0.62)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              borderRadius: "36px",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
              minHeight: "580px",
            }}
          >
            <div
              style={{
                padding: "3.5rem 3rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.4rem" }}>
                <BrandLogo size={90} />
              </div>

              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1
                  style={{
                    fontSize: "1.85rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.01em",
                    marginBottom: "0.3rem",
                  }}
                >
                  Activate Account
                </h1>
                <p style={{ fontSize: "0.88rem", color: "rgba(255, 255, 255, 0.65)" }}>
                  Continue activate your account please enter your details
                </p>
              </div>

              <form onSubmit={handleActivate} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                {activateError && (
                  <div
                    style={{
                      background: "rgba(220, 38, 38, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fca5a5",
                      fontSize: "0.85rem",
                      lineHeight: 1.4,
                    }}
                  >
                    <strong>Notice:</strong> {activateError}
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "0.4rem" }}>
                    Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter any ID number (e.g. 101, 8820, or EM-2026-001)"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.95rem 1.15rem",
                      borderRadius: "10px",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.16)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "0.4rem" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Email (e.g. paul.vincent@greenhavenresidence.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.95rem 1.15rem",
                      borderRadius: "10px",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.16)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    style={{ accentColor: "#10b981", width: "17px", height: "17px", cursor: "pointer" }}
                  />
                  <label htmlFor="terms" style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.8)", cursor: "pointer" }}>
                    I accept the Terms and Conditions
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isActivating}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "14px",
                    background: isActivating ? "rgba(0,0,0,0.6)" : "#000000",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    color: "#ffffff",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: isActivating ? "not-allowed" : "pointer",
                    marginTop: "0.6rem",
                    opacity: isActivating ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isActivating ? (
                    <>
                      <span>Verifying & Sending Email...</span>
                    </>
                  ) : (
                    "Activate"
                  )}
                </button>

                <div style={{ textAlign: "center", marginTop: "0.3rem" }}>
                  <button
                    type="button"
                    onClick={() => setScreen("login")}
                    style={{ background: "none", border: "none", color: "rgba(255, 255, 255, 0.7)", fontSize: "0.82rem", cursor: "pointer" }}
                  >
                    Already activated? <span style={{ color: "#34d399", textDecoration: "underline" }}>Log in</span>
                  </button>
                </div>
              </form>
            </div>

            <div
              style={{
                position: "relative",
                padding: "1.2rem",
                display: "none",
              }}
              className="desktop-only-card"
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  minHeight: "500px",
                  borderRadius: "28px",
                  overflow: "hidden",
                  boxShadow: "0 10px 35px rgba(0, 0, 0, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                }}
              >
                <Image
                  src="/images/subdivision-bg.jpg"
                  alt="Green Haven Residence Community Preview"
                  fill
                  priority
                  sizes="(max-width: 1024px) 50vw, 480px"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. EMAIL SENT! SCREEN */}
      {/* ========================================================= */}
      {screen === "emailsent" && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "560px",
            margin: "4.5rem 1.5rem 2rem",
          }}
        >
          <div
            style={{
              background: "rgba(20, 32, 25, 0.68)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: "36px",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
              padding: "4rem 3.2rem",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: "1.6rem" }}>
              <BrandLogo size={98} />
            </div>

            <h1
              style={{
                fontSize: "2.1rem",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.01em",
                marginBottom: "0.8rem",
              }}
            >
              Email Sent!
            </h1>

            <p
              style={{
                fontSize: "0.95rem",
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: 1.6,
                maxWidth: "380px",
                margin: "0 auto 2.8rem",
              }}
            >
              We&apos;ve sent a verification email {activateSuccessEmail ? (
                <>
                  to <strong style={{ color: "#34d399" }}>{activateSuccessEmail}</strong>
                </>
              ) : null}
              . Please check your inbox and click the verification link to set up your account.
            </p>

            {/* Spam / Junk Notice Box */}
            <div
              style={{
                background: "rgba(212, 175, 55, 0.08)",
                border: "1px solid rgba(212, 175, 55, 0.28)",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                margin: "0 auto 2rem",
                maxWidth: "420px",
                textAlign: "left",
                fontSize: "0.82rem",
                color: "#e2e8f0",
                lineHeight: 1.5,
              }}
            >
              <div style={{ color: "#facc15", fontWeight: 700, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>📬</span> Email Location Notice
              </div>
              <div>
                Because this email was dispatched from Brevo&apos;s relay (<code>@12460370.brevosend.com</code>), Gmail may place it in your <strong>Spam</strong> or <strong>Promotions</strong> folder. Search for <strong>&quot;Green Haven Residence&quot;</strong> in Gmail.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setScreen("changepassword")}
              style={{
                width: "100%",
                maxWidth: "360px",
                padding: "1rem",
                borderRadius: "14px",
                background: "#000000",
                border: "1px solid rgba(255, 255, 255, 0.22)",
                color: "#ffffff",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                margin: "0 auto",
                display: "block",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.6)",
              }}
            >
              Update Details &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CHANGE USERNAME AND PASSWORD (Matches Image 1) */}
      {/* ========================================================= */}
      {screen === "changepassword" && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: "560px",
            margin: "4.5rem 1.5rem 2rem",
          }}
        >
          <div
            style={{
              background: "rgba(20, 32, 25, 0.68)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderRadius: "36px",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
              padding: "3.5rem 3rem",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.3rem" }}>
              <BrandLogo size={90} />
            </div>

            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h1
                style={{
                  fontSize: "1.85rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  marginBottom: "0.45rem",
                }}
              >
                Change Username and Password
              </h1>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "rgba(255, 255, 255, 0.65)",
                  lineHeight: 1.45,
                }}
              >
                A strong password helps prevent unauthorized access to your account
              </p>
            </div>

            <form onSubmit={handlePasswordSave} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {isFromEmailVerification && (
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "#34d399",
                    fontSize: "0.85rem",
                    lineHeight: 1.4,
                  }}
                >
                  ✓ <strong>Email Verified:</strong> Please complete your account setup by creating your permanent username and secure password below.
                </div>
              )}

              {passwordSaveError && (
                <div
                  style={{
                    background: "rgba(220, 38, 38, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "#fca5a5",
                    fontSize: "0.85rem",
                    lineHeight: 1.4,
                  }}
                >
                  <strong>Notice:</strong> {passwordSaveError}
                </div>
              )}

              {/* Field 1: New Username (Matches Screenshot 1 order) */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "0.35rem" }}>
                  New Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value);
                    if (showUsernameTakenError) setShowUsernameTakenError(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1.1rem",
                    borderRadius: "10px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: showUsernameTakenError
                      ? "1.5px solid #dc2626"
                      : "1px solid rgba(255, 255, 255, 0.16)",
                    color: "#ffffff",
                    fontSize: "0.92rem",
                    outline: "none",
                  }}
                />
                {showUsernameTakenError && (
                  <div style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "0.3rem", fontWeight: 700 }}>
                    Username is already taken!
                  </div>
                )}
              </div>

              {/* Field 2: Employee ID */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "0.35rem" }}>
                  Employee ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your ID number"
                  value={changeEmployeeId}
                  onChange={(e) => setChangeEmployeeId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1.1rem",
                    borderRadius: "10px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    color: "#ffffff",
                    fontSize: "0.92rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Field 3: New Password */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "0.35rem" }}>
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter your password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1.1rem",
                    borderRadius: "10px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    color: "#ffffff",
                    fontSize: "0.92rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Field 5: Confirm Password */}
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.8)", marginBottom: "0.35rem" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.9rem 1.1rem",
                    borderRadius: "10px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    color: "#ffffff",
                    fontSize: "0.92rem",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSavingPassword}
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "14px",
                  background: isSavingPassword ? "rgba(0,0,0,0.6)" : "#000000",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  color: "#ffffff",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: isSavingPassword ? "not-allowed" : "pointer",
                  marginTop: "0.7rem",
                  opacity: isSavingPassword ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {isSavingPassword ? "Updating Credentials..." : "Save"}
              </button>

              {/* Demo Helper Button to toggle the exact error view in Image 1 */}
              <div style={{ textAlign: "center", marginTop: "0.3rem" }}>
                <button
                  type="button"
                  onClick={() => setShowUsernameTakenError(!showUsernameTakenError)}
                  style={{
                    background: "none",
                    border: "none",
                    color: showUsernameTakenError ? "#34d399" : "rgba(255,255,255,0.45)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  {showUsernameTakenError ? "Hide taken username error" : "Show Screenshot #1 error state ('Username is already taken!')"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. EMS DASHBOARD SCREENS (Matches All 5 Figma Screenshots) */}
      {/* ========================================================= */}
      {screen === "dashboard" && (
        <div
          className="dashboard-fullscreen-container"
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            margin: 0,
            borderRadius: 0,
            boxShadow: "none",
            border: "none",
          }}
        >
          {/* Left Warm Sand/Beige Sidebar (exact match to Screenshots 1, 2, 3, 4, 5) */}
          <aside
            className="dashboard-sidebar"
            style={{
              width: "290px",
              minWidth: "290px",
              background: "#d2ba9e", // Exact warm tan from all 5 screenshots
              padding: "4.5rem 2.4rem 2.5rem",
              display: "flex",
              flexDirection: "column",
              color: "#111111",
              minHeight: "100vh",
              boxShadow: "4px 0 24px rgba(0, 0, 0, 0.12)",
              zIndex: 2,
            }}
          >
            {/* Top Brand Logo */}
            <div style={{ marginBottom: "1.8rem" }}>
              <BrandLogo size={88} />
            </div>

            {/* User Avatar Outline Icon + Paul Vincent (Matches All 5 Screenshots) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "2.6rem",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111111"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h2
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 700,
                  color: "#111111",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {currentUser?.name || "Paul Vincent"}
              </h2>
            </div>

            {/* Menu List (Exact typography & active taupe color from Screenshots) */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "1.35rem", flex: 1 }}>
              {(
                [
                  "Dashboard",
                  "Announcement",
                  "Task",
                  "Leave Request",
                  "Attendance",
                  "Update Profile",
                ] as DashboardTab[]
              ).map((tab) => {
                const isActive = activeDashTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveDashTab(tab)}
                    style={{
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      fontSize: "1.32rem",
                      fontWeight: 700,
                      color: isActive ? "#948b77" : "#111111", // Active muted taupe vs bold black
                      cursor: "pointer",
                      padding: 0,
                      transition: "color 0.2s ease",
                      lineHeight: "1.2",
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Bottom Action Buttons */}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <button
                onClick={toggleBrowserFullscreen}
                style={{
                  background: "rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(0, 0, 0, 0.12)",
                  borderRadius: "8px",
                  padding: "0.6rem 1rem",
                  color: "#111111",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}</span>
                <span>{isFullscreen ? "🗗" : "⛶"}</span>
              </button>

              <button
                onClick={() => setScreen("login")}
                style={{
                  background: "rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(0, 0, 0, 0.15)",
                  borderRadius: "8px",
                  padding: "0.6rem 1rem",
                  color: "#111111",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                ← Sign Out
              </button>
            </div>
          </aside>

          {/* Right Content Area (Renders exact active screen from Screenshots) */}
          <main
            className="dashboard-content-main"
            style={{
              flex: 1,
              position: "relative",
              padding: "4.5rem 3.5rem 3rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.75rem",
              background: "rgba(10, 16, 12, 0.35)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              minHeight: "100vh",
              overflowY: "auto",
            }}
          >
            {/* Screen 1: Dashboard / Revenue Trend (Screenshot 3) */}
            {activeDashTab === "Dashboard" && (
              <RevenueDashboardModule onNavigate={(tab) => setActiveDashTab(tab as DashboardTab)} />
            )}

            {/* Screen 2: Announcement (Screenshot 1) */}
            {activeDashTab === "Announcement" && (
              <AnnouncementModule />
            )}

            {/* Screen 3: Attendance Record (Screenshot 2) */}
            {activeDashTab === "Attendance" && (
              <AttendanceModule userName={currentUser?.name || "Paul Vincent Gutoc"} />
            )}

            {/* Screen 4 & 5: Leave Request Form & List (Screenshots 4 & 5) */}
            {activeDashTab === "Leave Request" && (
              <LeaveRequestModule userName={currentUser?.name || "Paul Vincent Gutoc"} />
            )}

            {/* Screen 6: Task */}
            {activeDashTab === "Task" && (
              <TaskModule userName={currentUser?.name || "Paul Vincent Gutoc"} />
            )}

            {/* Screen 7: Update Profile */}
            {activeDashTab === "Update Profile" && (
              <ProfileModule
                initialEmployeeId={currentUser?.employeeId || "EM-2026-001"}
                onProfileUpdated={(updatedName) =>
                  setCurrentUser((prev) => (prev ? { ...prev, name: updatedName } : null))
                }
              />
            )}
          </main>
        </div>
      )}

      <style jsx global>{`
        @media (min-width: 768px) {
          .desktop-only-card {
            display: block !important;
          }
        }
        @media (max-width: 900px) {
          .dashboard-fullscreen-container {
            flex-direction: column !important;
          }
          .dashboard-sidebar {
            width: 100% !important;
            min-width: 100% !important;
            min-height: auto !important;
            padding-top: 5rem !important;
          }
          .dashboard-content-main {
            padding: 2rem 1.5rem 3rem !important;
          }
        }
      `}</style>
    </div>
  );
}
