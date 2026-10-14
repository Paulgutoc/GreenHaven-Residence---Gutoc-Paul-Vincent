"use client";

import React, { useState, useEffect } from "react";

interface LeaveItem {
  id: string;
  leaveType: string;
  status: "Approve" | "Approved" | "Pending" | "Rejected";
  employeeName: string;
  duration: string;
  dateRange: string;
  reason?: string;
}

const DEFAULT_LEAVES: LeaveItem[] = [
  {
    id: "lv-1",
    leaveType: "Sick Leave",
    status: "Approve",
    employeeName: "Paul Vincent Gutoc",
    duration: "2.5 Days",
    dateRange: "07/17/2026 - 07/20/2026",
    reason: "Doctor consultation and rest",
  },
  {
    id: "lv-2",
    leaveType: "Sick Leave",
    status: "Pending",
    employeeName: "Paul Vincent Gutoc",
    duration: "2.5 Days",
    dateRange: "07/17/2026 - 07/20/2026",
    reason: "Follow-up therapy session",
  },
];

interface DayOption {
  dateLabel: string;
  type: "All Day" | "Half Day";
}

export default function LeaveRequestModule({ userName = "Paul Vincent Gutoc" }: { userName?: string }) {
  // State: whether the request form (Screenshot 4) is visible or collapsed (Screenshot 5)
  const [showApplyForm, setShowApplyForm] = useState(true);

  // Leave records list
  const [leaveRecords, setLeaveRecords] = useState<LeaveItem[]>(DEFAULT_LEAVES);

  // Form inputs matching Screenshot 4
  const [leaveType, setLeaveType] = useState("Sick Leave");
  const [aboutComment, setAboutComment] = useState("");
  const [dateRangeStr, setDateRangeStr] = useState("07/17/2026 - 07/20/2026");

  // Day breakdown in "Your request includes" (Screenshot 4)
  const [dayOptions, setDayOptions] = useState<DayOption[]>([
    { dateLabel: "July 18", type: "All Day" },
    { dateLabel: "July 19", type: "All Day" },
    { dateLabel: "July 20", type: "Half Day" },
  ]);

  // Balance remaining
  const [remainingBalance, setRemainingBalance] = useState(3.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load from Supabase API
  useEffect(() => {
    async function loadLeaveData() {
      try {
        const res = await fetch("/api/leave");
        const data = await res.json();
        if (data.success && data.requests?.length > 0) {
          const mapped: LeaveItem[] = data.requests.map((r: any) => ({
            id: r.id,
            leaveType: r.leave_type,
            status: r.status === "Approved" ? "Approve" : r.status,
            employeeName: userName,
            duration: `${r.days_count} Days`,
            dateRange: `${formatDateDisplay(r.start_date)} - ${formatDateDisplay(r.end_date)}`,
            reason: r.reason,
          }));
          setLeaveRecords(mapped);
        }

        if (data.balances?.length > 0) {
          const currentTypeBal = data.balances.find((b: any) => b.leave_type === leaveType);
          if (currentTypeBal) {
            const rem = Number(currentTypeBal.days_allowed) - Number(currentTypeBal.days_used);
            setRemainingBalance(Math.max(0, rem));
          }
        }
      } catch (err) {
        console.warn("Using default leave records fallback", err);
      }
    }
    loadLeaveData();
  }, [leaveType, userName]);

  function formatDateDisplay(dStr: string) {
    if (!dStr) return "07/17/2026";
    const parts = dStr.split("-");
    if (parts.length === 3) return `${parts[1]}/${parts[2]}/${parts[0]}`;
    return dStr;
  }

  // Calculate dynamic duration from day options
  const totalDaysCalculated = dayOptions.reduce((acc, curr) => {
    return acc + (curr.type === "All Day" ? 1.0 : 0.5);
  }, 0);

  const handleDayTypeChange = (idx: number, newType: "All Day" | "Half Day") => {
    setDayOptions((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, type: newType } : item))
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: "EM-2026-001",
          leaveType,
          startDate: "2026-07-17",
          endDate: "2026-07-20",
          daysCount: totalDaysCalculated,
          reason: aboutComment || "Medical rest",
        }),
      });

      const data = await res.json();
      const newLeaveItem: LeaveItem = {
        id: data.leave?.id || `lv-${Date.now()}`,
        leaveType,
        status: "Pending",
        employeeName: userName,
        duration: `${totalDaysCalculated} Days`,
        dateRange: dateRangeStr,
        reason: aboutComment,
      };

      setLeaveRecords([newLeaveItem, ...leaveRecords]);
      setRemainingBalance((prev) => Math.max(0, prev - totalDaysCalculated));
      showToast("Leave application submitted successfully!");
      setAboutComment("");
      // Optionally collapse form or keep open
    } catch {
      showToast("Failed to submit leave. Please try again.");
    } finally {
      setIsSubmitting(false);
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

      {/* Header and Top Right "Request Leave" Button (Screenshot 5 & 4) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
          Leave Request
        </h1>

        <button
          onClick={() => setShowApplyForm(!showApplyForm)}
          style={{
            padding: "0.65rem 1.6rem",
            borderRadius: "9999px",
            background: "#000000",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            color: "#ffffff",
            fontSize: "0.92rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
          }}
        >
          {showApplyForm ? "Close Form" : "Request Leave"}
        </button>
      </div>

      {/* Leave Application Glass Form (Screenshot 4) */}
      {showApplyForm && (
        <div
          style={{
            background: "rgba(18, 22, 19, 0.42)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: "16px",
            padding: "2rem 2.2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
            position: "relative",
          }}
        >
          <form onSubmit={handleApplyLeave}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2.5rem",
              }}
            >
              {/* Left Column: Leave Type & About */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                {/* Field 1: Leave Type */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: "0.45rem",
                    }}
                  >
                    Leave Type
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.85rem 1.1rem",
                      borderRadius: "10px",
                      background: "rgba(0, 0, 0, 0.35)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="Sick Leave" style={{ background: "#1c241e", color: "#fff" }}>
                      Sick Leave
                    </option>
                    <option value="Vacation Leave" style={{ background: "#1c241e", color: "#fff" }}>
                      Vacation Leave
                    </option>
                    <option value="Emergency Leave" style={{ background: "#1c241e", color: "#fff" }}>
                      Emergency Leave
                    </option>
                    <option value="Bereavement Leave" style={{ background: "#1c241e", color: "#fff" }}>
                      Bereavement Leave
                    </option>
                  </select>
                </div>

                {/* Field 2: About */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: "0.45rem",
                    }}
                  >
                    About
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Include comment for your approver"
                    value={aboutComment}
                    onChange={(e) => setAboutComment(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.85rem 1.1rem",
                      borderRadius: "10px",
                      background: "rgba(0, 0, 0, 0.35)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              {/* Right Column: Date & "Your request includes" */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
                {/* Field 3: Date */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.92rem",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: "0.45rem",
                    }}
                  >
                    Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      value={dateRangeStr}
                      onChange={(e) => setDateRangeStr(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.85rem 1.1rem 0.85rem 1.1rem",
                        borderRadius: "10px",
                        background: "rgba(0, 0, 0, 0.35)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                        color: "#ffffff",
                        fontSize: "0.95rem",
                        outline: "none",
                      }}
                    />
                    {/* Calendar Icon in Screenshot 4 */}
                    <div
                      style={{
                        position: "absolute",
                        right: "1.1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Field 4: "Your request includes" Box (Screenshot 4) */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "12px",
                    padding: "1.2rem 1.4rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.9rem",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                    Your request includes
                  </span>

                  {/* Day breakdown rows with dropdowns */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {dayOptions.map((day, idx) => (
                      <div
                        key={day.dateLabel}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "0.95rem", color: "#ffffff", fontWeight: 500 }}>
                          {day.dateLabel}
                        </span>
                        <select
                          value={day.type}
                          onChange={(e) => handleDayTypeChange(idx, e.target.value as "All Day" | "Half Day")}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "rgba(255, 255, 255, 0.85)",
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            outline: "none",
                            padding: "0.2rem 0.4rem",
                          }}
                        >
                          <option value="All Day" style={{ background: "#1c241e", color: "#fff" }}>
                            All Day ⌵
                          </option>
                          <option value="Half Day" style={{ background: "#1c241e", color: "#fff" }}>
                            Half Day ⌵
                          </option>
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Summary calculation line matching Screenshot 4: "2.5 Days of Sick Leave" and "3 Days Remaining" */}
                  <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.12)", paddingTop: "0.8rem", marginTop: "0.3rem" }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ffffff" }}>
                      {totalDaysCalculated} Days of {leaveType}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.65)", marginTop: "0.15rem" }}>
                      {remainingBalance} Days Remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Right: Apply Leave Button matching Screenshot 4 */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: "0.75rem 2rem",
                  borderRadius: "9999px",
                  background: "#000000",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  opacity: isSubmitting ? 0.7 : 1,
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                {isSubmitting ? "Applying..." : "Apply Leave"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave Request List Table (Matches Screenshot 5 & 4) */}
      <div
        style={{
          background: "rgba(18, 22, 19, 0.42)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.16)",
          borderRadius: "16px",
          padding: "1.8rem 2.2rem",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            minWidth: "750px",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                color: "rgba(255, 255, 255, 0.65)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600 }}>Leave Type</th>
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600 }}>Status</th>
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600 }}>Employee</th>
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600 }}>Duration</th>
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {leaveRecords.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                }}
              >
                {/* Leave Type (e.g. Sick Leave) */}
                <td style={{ padding: "1.35rem 0", fontWeight: 500 }}>
                  {item.leaveType}
                </td>

                {/* Status (Approve in Green, Pending in Gold/Orange from Screenshots 4 & 5) */}
                <td style={{ padding: "1.35rem 0" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      color:
                        item.status === "Approve" || item.status === "Approved"
                          ? "#00e676" // Vivid green matching Screenshot 4/5
                          : item.status === "Pending"
                          ? "#eab308" // Amber/gold matching Screenshot 4/5
                          : "#ef4444",
                    }}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Employee (e.g. Paul Vincent Gutoc) */}
                <td style={{ padding: "1.35rem 0", color: "rgba(255, 255, 255, 0.9)" }}>
                  {item.employeeName}
                </td>

                {/* Duration (e.g. 2.5 Days) */}
                <td style={{ padding: "1.35rem 0", color: "rgba(255, 255, 255, 0.9)" }}>
                  {item.duration}
                </td>

                {/* Date (e.g. 07/17/2026 - 07/20/2026) */}
                <td style={{ padding: "1.35rem 0", color: "rgba(255, 255, 255, 0.9)" }}>
                  {item.dateRange}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
