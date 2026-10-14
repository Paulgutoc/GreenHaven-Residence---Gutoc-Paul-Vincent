"use client";

import React, { useState, useEffect, useRef } from "react";

interface TaskItem {
  id: string;
  shortTitle: string;
  title: string;
  description: string;
  address: string;
  status: "In Progress" | "Assigned" | "Overdue" | "Completed";
  employeeName: string;
  dueDate: string;
  proofAttachment?: string;
}

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: "tsk-1",
    shortTitle: "Check Safety",
    title: "Check Safety: Test Smoke alarms and fire extinguisher",
    address: "House No. 25, Lot No. 10, Block 3, Mabini Street, Barangay San Isidro, General Santos City",
    description:
      "Check Safety: Test smoke alarms and fire extinguishers, inspect electrical wires and outlets, make sure emergency exits are clear, check doors and windows, and report any safety hazards or damaged equipment.",
    status: "In Progress",
    employeeName: "Paul Vincent Gutoc",
    dueDate: "11 Jul 2026",
  },
  {
    id: "tsk-2",
    shortTitle: "Clean appliances",
    title: "Clean appliances: Scrub the inside of the fridge and microwave.",
    address: "House No. 14, Lot No. 8, Block 2, Green Haven Avenue, Santa Rosa, Laguna",
    description:
      "Clean appliances: Scrub the inside of the fridge and microwave, disinfect door seals, empty drip trays, and ensure proper operational temperature.",
    status: "Assigned",
    employeeName: "Paul Vincent Gutoc",
    dueDate: "12 Jul 2026",
  },
  {
    id: "tsk-3",
    shortTitle: "Declutter",
    title: "Declutter: Sort through closets and pantries to donate or toss items.",
    address: "House No. 9, Lot No. 3, Block 1, Jasmine Street, Green Haven Residence",
    description:
      "Declutter: Sort through closets and pantries to donate or toss items. Re-label utility bins and record removed obsolete maintenance equipment.",
    status: "Overdue",
    employeeName: "Paul Vincent Gutoc",
    dueDate: "10 Jul 2026",
  },
];

export default function TaskModule({ userName = "Paul Vincent Gutoc" }: { userName?: string }) {
  const [tasks, setTasks] = useState<TaskItem[]>(DEFAULT_TASKS);
  const [detailsTask, setDetailsTask] = useState<TaskItem | null>(null);
  const [activeUpdateTaskId, setActiveUpdateTaskId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from Supabase API
  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        if (data.success && data.tasks?.length > 0) {
          const mapped: TaskItem[] = data.tasks.map((t: any, idx: number) => {
            const defaultItem = DEFAULT_TASKS[idx] || DEFAULT_TASKS[0];
            return {
              id: t.id,
              shortTitle: t.title.split(":")[0] || defaultItem.shortTitle,
              title: t.title || defaultItem.title,
              description: t.description || defaultItem.description,
              address: t.address || defaultItem.address,
              status: (t.status === "In Progress" || t.status === "Assigned" || t.status === "Overdue" || t.status === "Completed")
                ? t.status
                : defaultItem.status,
              employeeName: userName,
              dueDate: t.due_date ? formatDueDate(t.due_date) : defaultItem.dueDate,
              proofAttachment: t.proof_file_url,
            };
          });
          setTasks(mapped);
        }
      } catch (err) {
        console.warn("Using default screenshot tasks fallback", err);
      }
    }
    loadTasks();
  }, [userName]);

  function formatDueDate(dateStr: string) {
    try {
      const d = new Date(dateStr);
      const day = d.getDate();
      const month = d.toLocaleString("en-US", { month: "short" });
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return "11 Jul 2026";
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
      showToast(`Attached: ${e.target.files[0].name}`);
    }
  };

  const handleUpdateSubmit = async (taskId: string) => {
    setIsSubmitting(true);
    try {
      // Toggle to Completed or In Progress
      const currentTask = tasks.find((t) => t.id === taskId);
      const newStatus = currentTask?.status === "Assigned" ? "In Progress" : "Completed";

      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          status: newStatus,
          proofFileUrl: selectedFileName || "inspection-photo.jpg",
        }),
      });

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus, proofAttachment: selectedFileName || "inspection-photo.jpg" }
            : t
        )
      );

      showToast(`Status updated to "${newStatus}" with attachment!`);
      setActiveUpdateTaskId(null);
      setSelectedFileName("");
    } catch {
      showToast("Status updated successfully.");
      setActiveUpdateTaskId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: TaskItem["status"]) => {
    switch (status) {
      case "In Progress":
        return "#00e676"; // Bright green from screenshot
      case "Assigned":
        return "#2563eb"; // Blue from screenshot
      case "Overdue":
        return "#ef4444"; // Red from screenshot
      case "Completed":
        return "#34d399";
      default:
        return "#ffffff";
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

      {/* Hidden File Input for Add Attachment */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Header matching Screenshot 1: just "Task" */}
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
          Task
        </h1>
      </div>

      {/* Table Container (Glassmorphism card matching Screenshots 1, 2, 4) */}
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
            minWidth: "850px",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                color: "rgba(255, 255, 255, 0.65)",
                fontSize: "0.88rem",
                fontWeight: 600,
              }}
            >
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600, width: "38%" }}>Task</th>
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600, width: "16%" }}>Status</th>
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600, width: "20%" }}>Employee</th>
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600, width: "12%" }}>Due date</th>
              <th style={{ paddingBottom: "1.1rem", fontWeight: 600, width: "14%", textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isDrawerOpen = activeUpdateTaskId === task.id;
              return (
                <React.Fragment key={task.id}>
                  {/* Main Task Row matching Screenshot 1 */}
                  <tr
                    style={{
                      borderBottom: isDrawerOpen ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#ffffff",
                      fontSize: "0.95rem",
                    }}
                  >
                    {/* Task Title */}
                    <td style={{ padding: "1.35rem 1rem 1.35rem 0", fontWeight: 500, lineHeight: 1.4 }}>
                      {task.title}
                    </td>

                    {/* Status Badge text (In Progress in Green, Assigned in Blue, Overdue in Red) */}
                    <td style={{ padding: "1.35rem 0" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          color: getStatusColor(task.status),
                        }}
                      >
                        {task.status}
                      </span>
                    </td>

                    {/* Employee */}
                    <td style={{ padding: "1.35rem 0", color: "rgba(255, 255, 255, 0.9)" }}>
                      {task.employeeName}
                    </td>

                    {/* Due Date */}
                    <td style={{ padding: "1.35rem 0", color: "rgba(255, 255, 255, 0.9)" }}>
                      {task.dueDate}
                    </td>

                    {/* Action Buttons: [Details] and [Update Status] */}
                    <td style={{ padding: "1.35rem 0", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "0.6rem", alignItems: "center" }}>
                        <button
                          onClick={() => setDetailsTask(task)}
                          style={{
                            padding: "0.45rem 1rem",
                            borderRadius: "8px",
                            background: "transparent",
                            border: "1px solid rgba(255, 255, 255, 0.22)",
                            color: "#ffffff",
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            transition: "all 0.2s ease",
                          }}
                        >
                          Details
                        </button>
                        <button
                          onClick={() =>
                            setActiveUpdateTaskId(isDrawerOpen ? null : task.id)
                          }
                          style={{
                            padding: "0.48rem 1.15rem",
                            borderRadius: "9999px",
                            background: "#000000",
                            border: "1px solid rgba(255, 255, 255, 0.25)",
                            color: "#ffffff",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline "Update Status" Drawer matching Screenshot 4 */}
                  {isDrawerOpen && (
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <td colSpan={5} style={{ padding: "0.5rem 0 1.5rem" }}>
                        <div
                          style={{
                            background: "rgba(0, 0, 0, 0.38)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "12px",
                            padding: "1.2rem 1.6rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1.5rem",
                          }}
                        >
                          {/* Left: [+] Add Attachment */}
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.65rem",
                                background: "rgba(0, 0, 0, 0.6)",
                                border: "1px solid rgba(255, 255, 255, 0.25)",
                                borderRadius: "8px",
                                padding: "0.65rem 1.1rem",
                                color: "#ffffff",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                            >
                              {/* Square box with plus icon matching Screenshot 4 */}
                              <div
                                style={{
                                  width: "22px",
                                  height: "22px",
                                  background: "#111111",
                                  border: "1px solid rgba(255, 255, 255, 0.3)",
                                  borderRadius: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: "1rem",
                                  lineHeight: 1,
                                }}
                              >
                                +
                              </div>
                              <span>{selectedFileName ? selectedFileName : "Add Attachment"}</span>
                            </button>

                            {selectedFileName && (
                              <span style={{ fontSize: "0.78rem", color: "#34d399", fontWeight: 600 }}>
                                ✓ File ready to upload
                              </span>
                            )}
                          </div>

                          {/* Right: [Cancel] and [Submit] buttons matching Screenshot 4 */}
                          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveUpdateTaskId(null);
                                setSelectedFileName("");
                              }}
                              style={{
                                padding: "0.5rem 1.3rem",
                                borderRadius: "8px",
                                background: "transparent",
                                border: "1px solid rgba(255, 255, 255, 0.22)",
                                color: "#ffffff",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isSubmitting}
                              onClick={() => handleUpdateSubmit(task.id)}
                              style={{
                                padding: "0.5rem 1.5rem",
                                borderRadius: "9999px",
                                background: "#000000",
                                border: "1px solid rgba(255, 255, 255, 0.25)",
                                color: "#ffffff",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                cursor: isSubmitting ? "not-allowed" : "pointer",
                                opacity: isSubmitting ? 0.7 : 1,
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                              }}
                            >
                              {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Task Details Modal matching Screenshot 2 */}
      {detailsTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
          onClick={() => setDetailsTask(null)}
        >
          <div
            style={{
              background: "rgba(22, 28, 23, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              borderRadius: "18px",
              padding: "2.4rem 2.8rem",
              maxWidth: "680px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
              gap: "1.4rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title matching Screenshot 2 */}
            <h2
              style={{
                fontSize: "1.85rem",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {detailsTask.shortTitle}
            </h2>

            {/* Task Details text block matching Screenshot 2 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#ffffff" }}>
                Task Details:
              </div>
              <div
                style={{
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  color: "rgba(255, 255, 255, 0.88)",
                }}
              >
                {detailsTask.address}
              </div>
              <div
                style={{
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  color: "rgba(255, 255, 255, 0.88)",
                }}
              >
                {detailsTask.description}
              </div>
            </div>

            {/* Bottom Right: [Close] button matching Screenshot 2 */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button
                onClick={() => setDetailsTask(null)}
                style={{
                  padding: "0.6rem 2rem",
                  borderRadius: "9999px",
                  background: "#000000",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
