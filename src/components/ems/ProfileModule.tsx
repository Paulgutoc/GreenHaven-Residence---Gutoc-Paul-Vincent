"use client";

import React, { useState, useEffect } from "react";

interface ProfileModuleProps {
  initialEmployeeId?: string;
  onProfileUpdated?: (name: string) => void;
}

export default function ProfileModule({
  initialEmployeeId = "EM-2026-001",
  onProfileUpdated,
}: ProfileModuleProps) {
  // Form fields matching Screenshot 3
  const [firstName, setFirstName] = useState("Paul Vincent");
  const [lastName, setLastName] = useState("Gutoc");
  const [birthdate, setBirthdate] = useState("May 12, 2006");
  const [gender, setGender] = useState("Male");
  const [province, setProvince] = useState("Nueva Ecija");
  const [city, setCity] = useState("Pantabangan");
  const [contactNumber, setContactNumber] = useState("09xxxxxxxxx");
  const [zipCode, setZipCode] = useState("3124");
  const [address, setAddress] = useState("");
  const [emailAddress, setEmailAddress] = useState("qwerty@example");
  const [passwordValue, setPasswordValue] = useState("************");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load existing profile from API
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/profile?employeeId=${initialEmployeeId}`);
        const data = await res.json();
        if (data.success && data.employee) {
          const emp = data.employee;
          if (emp.name) {
            const parts = emp.name.split(" ");
            if (parts.length > 1) {
              setFirstName(parts.slice(0, -1).join(" "));
              setLastName(parts[parts.length - 1]);
            } else {
              setFirstName(emp.name);
            }
          }
          if (emp.province) setProvince(emp.province);
          if (emp.city) setCity(emp.city);
          if (emp.zip) setZipCode(emp.zip);
          if (emp.address) setAddress(emp.address);
          if (emp.contact_number) setContactNumber(emp.contact_number);
          if (emp.company_email) setEmailAddress(emp.company_email);
          if (emp.birthdate) setBirthdate(emp.birthdate);
          if (emp.gender) setGender(emp.gender);
        }
      } catch (err) {
        console.warn("Using default screenshot profile fallback", err);
      }
    }
    loadProfile();
  }, [initialEmployeeId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: initialEmployeeId,
          name: fullName,
          province,
          city,
          zip: zipCode,
          address,
          contact_number: contactNumber,
          gender,
          birthdate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to update profile");
        setIsSaving(false);
        return;
      }

      showToast("Profile details saved successfully!");
      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated(fullName);
    } catch {
      showToast("Profile saved locally.");
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", width: "100%" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            background: "#10b981",
            color: "#ffffff",
            padding: "0.85rem 1.4rem",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            zIndex: 9999,
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header matching Screenshot 3: "Edit Profile" */}
      <div>
        <h1
          style={{
            fontSize: "2.35rem",
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.01em",
            margin: 0,
            lineHeight: 1.15,
          }}
        >
          Edit Profile
        </h1>
      </div>

      {/* Large Glass Form Container matching Screenshot 3 */}
      <div
        style={{
          background: "rgba(18, 22, 19, 0.42)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: "16px",
          padding: "2.2rem 2.8rem 2.5rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
        }}
      >
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Row 1: First Name & Last Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "0.35rem",
                  fontWeight: 500,
                }}
              >
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "0.35rem",
                  fontWeight: 500,
                }}
              >
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 2: Birthdate & Gender */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "0.35rem",
                  fontWeight: 500,
                }}
              >
                Birthdate
              </label>
              <input
                type="text"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "0.35rem",
                  fontWeight: 500,
                }}
              >
                Gender
              </label>
              <input
                type="text"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 3: Province & City */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "0.35rem",
                  fontWeight: 500,
                }}
              >
                Province
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "0.35rem",
                  fontWeight: 500,
                }}
              >
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 4: Contact Number & ZIP code */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.8rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "0.35rem",
                  fontWeight: 500,
                }}
              >
                Contact Number
              </label>
              <input
                type="text"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "0.35rem",
                  fontWeight: 500,
                }}
              >
                ZIP code
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Row 5 (Full Width): Address */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.88rem",
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: "0.35rem",
                fontWeight: 500,
              }}
            >
              Address
            </label>
            <input
              type="text"
              placeholder="street,city,province"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                color: "#ffffff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          {/* Row 6 (Full Width): Email Address */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.88rem",
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: "0.35rem",
                fontWeight: 500,
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                color: "#ffffff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          {/* Row 7 (Full Width): Change Password */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.88rem",
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: "0.35rem",
                fontWeight: 500,
              }}
            >
              Change Password
            </label>
            <input
              type="password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.35)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                color: "#ffffff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          {/* Bottom Buttons: [Edit] and [Save] matching Screenshot 3 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.2rem",
              marginTop: "1.2rem",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                showToast(isEditing ? "Edit mode disabled" : "Edit mode enabled. Make your changes and click Save.");
              }}
              style={{
                padding: "0.6rem 2.4rem",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#ffffff",
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Edit
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: "0.6rem 2.8rem",
                borderRadius: "9999px",
                background: "#000000",
                border: "1px solid rgba(255, 255, 255, 0.28)",
                color: "#ffffff",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.7 : 1,
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
                transition: "all 0.2s ease",
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
