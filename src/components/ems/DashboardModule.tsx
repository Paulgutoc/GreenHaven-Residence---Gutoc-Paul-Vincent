"use client";

import React from "react";
import { EmployeeProfile, AttendanceRecord, TaskItem, LeaveRequest } from "./types";

interface DashboardModuleProps {
  currentEmployee: EmployeeProfile;
  attendance: AttendanceRecord[];
  tasks: TaskItem[];
  leaves: LeaveRequest[];
  onNavigate: (module: string) => void;
}

export default function DashboardModule({
  currentEmployee,
  attendance,
  tasks,
  leaves,
  onNavigate,
}: DashboardModuleProps) {
  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const pendingTasks = tasks.filter((t) => t.status === "Pending Approval");
  const activeTasks = tasks.filter((t) => t.status === "Assigned");
  const todayAttendance = attendance.filter((a) => a.date === "2026-10-06");
  const presentCount = todayAttendance.filter((a) => a.status === "Present").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(2, 132, 199, 0.1) 100%)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "16px",
          padding: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span style={{ fontSize: "0.78rem", color: "#34d399", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Department Manager Overview • Screen 13
          </span>
          <h1 style={{ fontSize: "1.9rem", color: "#ffffff", fontWeight: 700, margin: "0.3rem 0" }}>
            Good day, {currentEmployee.name}
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.92rem" }}>
            {currentEmployee.department} Department • Green Haven Residence Subdivision
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => onNavigate("tasks")}
            style={{
              padding: "0.65rem 1.2rem",
              borderRadius: "8px",
              background: "#10b981",
              border: "none",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            + Assign Task
          </button>
          <button
            onClick={() => onNavigate("leave")}
            style={{
              padding: "0.65rem 1.2rem",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Review Leaves ({pendingLeaves.length})
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.2rem" }}>
        <div style={{ background: "rgba(18, 28, 22, 0.55)", border: "1px solid rgba(255, 255, 255, 0.14)", borderRadius: "14px", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Present Today</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#34d399", margin: "0.3rem 0" }}>
            {presentCount} / {todayAttendance.length || 3}
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)" }}>
            1 employee on approved leave
          </div>
        </div>

        <div style={{ background: "rgba(18, 28, 22, 0.55)", border: "1px solid rgba(255, 255, 255, 0.14)", borderRadius: "14px", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Pending Leave Requests</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: pendingLeaves.length > 0 ? "#facc15" : "#fff", margin: "0.3rem 0" }}>
            {pendingLeaves.length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)" }}>
            Requires manager approval
          </div>
        </div>

        <div style={{ background: "rgba(18, 28, 22, 0.55)", border: "1px solid rgba(255, 255, 255, 0.14)", borderRadius: "14px", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Task Approvals</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: pendingTasks.length > 0 ? "#38bdf8" : "#fff", margin: "0.3rem 0" }}>
            {pendingTasks.length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)" }}>
            Completed with proof submitted
          </div>
        </div>

        <div style={{ background: "rgba(18, 28, 22, 0.55)", border: "1px solid rgba(255, 255, 255, 0.14)", borderRadius: "14px", padding: "1.5rem" }}>
          <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Active Field Tasks</div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", margin: "0.3rem 0" }}>
            {activeTasks.length}
          </div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)" }}>
            In progress across subdivision
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
        {/* Recent Tasks in Department */}
        <div style={{ background: "rgba(18, 28, 22, 0.55)", border: "1px solid rgba(255, 255, 255, 0.14)", borderRadius: "16px", padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <h2 style={{ fontSize: "1.15rem", color: "#fff", fontWeight: 600 }}>Active Field Tasks</h2>
            <button
              onClick={() => onNavigate("tasks")}
              style={{ background: "none", border: "none", color: "#34d399", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
            >
              View All Tasks →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {tasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                style={{
                  padding: "1rem",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.92rem", marginBottom: "0.2rem" }}>{task.title}</div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.6)" }}>
                    Assigned to: <strong>{task.assignedEmployeeName}</strong> • {task.address}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "20px",
                    fontWeight: 600,
                    background:
                      task.status === "Completed"
                        ? "rgba(16, 185, 129, 0.2)"
                        : task.status === "Pending Approval"
                          ? "rgba(56, 189, 248, 0.2)"
                          : "rgba(250, 204, 21, 0.2)",
                    color:
                      task.status === "Completed"
                        ? "#34d399"
                        : task.status === "Pending Approval"
                          ? "#38bdf8"
                          : "#facc15",
                  }}
                >
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Leave Approvals */}
        <div style={{ background: "rgba(18, 28, 22, 0.55)", border: "1px solid rgba(255, 255, 255, 0.14)", borderRadius: "16px", padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <h2 style={{ fontSize: "1.15rem", color: "#fff", fontWeight: 600 }}>Leave Requests Requiring Action</h2>
            <button
              onClick={() => onNavigate("leave")}
              style={{ background: "none", border: "none", color: "#34d399", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
            >
              Manage →
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(255, 255, 255, 0.5)", fontSize: "0.88rem" }}>
              ✓ No pending leave requests to approve.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {pendingLeaves.map((l) => (
                <div
                  key={l.id}
                  style={{
                    padding: "1rem",
                    borderRadius: "10px",
                    background: "rgba(250, 204, 21, 0.08)",
                    border: "1px solid rgba(250, 204, 21, 0.25)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                    <span style={{ fontWeight: 600, color: "#fff" }}>{l.employeeName}</span>
                    <span style={{ color: "#facc15", fontSize: "0.8rem", fontWeight: 600 }}>{l.leaveType} ({l.totalDays} day{l.totalDays > 1 ? "s" : ""})</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "0.6rem" }}>
                    {l.startDate} {l.isHalfDay ? "(Half-day)" : ""} • {l.reason}
                  </div>
                  <button
                    onClick={() => onNavigate("leave")}
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      background: "#10b981",
                      border: "none",
                      color: "#fff",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Review in Leave Manager
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
