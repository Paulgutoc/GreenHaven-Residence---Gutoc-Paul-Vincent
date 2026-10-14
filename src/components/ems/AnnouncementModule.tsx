"use client";

import React, { useState, useEffect } from "react";

interface Announcement {
  id: string;
  title: string;
  description: string;
  audience: string;
  date: string;
  status: string;
  author: string;
  time?: string;
  isNew?: boolean;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-001",
    title: "20th Anniversary",
    description:
      "You are invited to help us celebrate 20 years of automotive service to the residents of Monroe County. We are proud to be the number one dealer in sales and service for the state of Kansas. We have worked hard to achieve this. Visit us at 1600 Main Street in June for a summer refreshment and to see the latest models. While you are there, don't forget to sign up for our big July promotion.",
    audience: "All Employees",
    date: "Today",
    time: "6:00 PM",
    status: "Published",
    author: "Management Office",
    isNew: true,
  },
  {
    id: "ann-002",
    title: "Estate Cleanliness & Solar Panel Maintenance Drive",
    description:
      "Routine quarterly maintenance and optical sensor checks will be conducted across the West Ridge solar installation starting this Thursday. Operations teams please coordinate access with security.",
    audience: "Operations",
    date: "Yesterday",
    time: "10:30 AM",
    status: "Published",
    author: "Engineering Dept",
    isNew: false,
  },
];

export default function AnnouncementModule() {
  const [filter, setFilter] = useState<"All" | "New">("All");
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAudience, setNewAudience] = useState("All Employees");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load from Supabase API
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        const data = await res.json();
        if (data.success && data.announcements?.length > 0) {
          const mapped: Announcement[] = data.announcements.map((item: any, idx: number) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            audience: item.audience || "All Employees",
            date: idx === 0 ? "Today" : item.date || "Recent",
            time: item.time || (idx === 0 ? "6:00 PM" : "9:00 AM"),
            status: item.status || "Published",
            author: item.author || "Management Office",
            isNew: idx === 0,
          }));
          setAnnouncements(mapped);
        }
      } catch (err) {
        console.warn("Using default announcements fallback", err);
      }
    }
    fetchAnnouncements();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const filteredAnnouncements =
    filter === "All" ? announcements : announcements.filter((a) => a.isNew);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          audience: newAudience,
          author: "Paul Vincent (Manager)",
          date: new Date().toISOString().split("T")[0],
          status: "Published",
        }),
      });

      const data = await res.json();
      const newAnn: Announcement = {
        id: data.announcement?.id || `ann-${Date.now()}`,
        title: newTitle,
        description: newDescription,
        audience: newAudience,
        date: "Today",
        time: "Just now",
        status: "Published",
        author: "Paul Vincent (Manager)",
        isNew: true,
      };

      setAnnouncements([newAnn, ...announcements]);
      setNewTitle("");
      setNewDescription("");
      setShowCreateModal(false);
      showToast("Announcement published successfully!");
    } catch {
      showToast("Failed to post announcement. Try again.");
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

      {/* Header & Sub-Navigation matching Screenshot 1 */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
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
              Announcement
            </h1>

            {/* Filter Tabs matching Screenshot 1: "All" and "New" */}
            <div style={{ display: "flex", gap: "1.8rem", marginTop: "1.2rem", alignItems: "center" }}>
              <button
                onClick={() => setFilter("All")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.2rem 0",
                  fontSize: "1rem",
                  fontWeight: filter === "All" ? 700 : 500,
                  color: filter === "All" ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                  cursor: "pointer",
                  borderBottom: filter === "All" ? "2px solid #ffffff" : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}
              >
                All
              </button>
              <button
                onClick={() => setFilter("New")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.2rem 0",
                  fontSize: "1rem",
                  fontWeight: filter === "New" ? 700 : 500,
                  color: filter === "New" ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                  cursor: "pointer",
                  borderBottom: filter === "New" ? "2px solid #ffffff" : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}
              >
                New
              </button>
            </div>
          </div>

          {/* Quick Create Action */}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "9999px",
              background: "#000000",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
            }}
          >
            + Post Announcement
          </button>
        </div>
      </div>

      {/* Announcement Cards List (Matching exact layout of Screenshot 1) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginTop: "0.8rem" }}>
        {filteredAnnouncements.map((ann) => (
          <div
            key={ann.id}
            style={{
              background: "rgba(18, 22, 19, 0.42)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.16)",
              borderRadius: "16px",
              padding: "1.6rem 2.2rem",
              display: "flex",
              alignItems: "center",
              gap: "2.5rem",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            {/* Left Column: Date & Time (Screenshot 1: "Today 6:00 PM") */}
            <div
              style={{
                minWidth: "90px",
                display: "flex",
                flexDirection: "column",
                gap: "0.2rem",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff" }}>
                {ann.date}
              </span>
              <span style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.65)" }}>
                {ann.time || "6:00 PM"}
              </span>
            </div>

            {/* Middle Column: Title & Full Description */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <h3
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {ann.title}
                </h3>
                {ann.isNew && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "#34d399",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "9999px",
                      textTransform: "uppercase",
                    }}
                  >
                    New
                  </span>
                )}
              </div>

              <p
                style={{
                  fontSize: "0.92rem",
                  lineHeight: "1.5",
                  color: "rgba(255, 255, 255, 0.8)",
                  margin: 0,
                  maxWidth: "920px",
                }}
              >
                {ann.description}
              </p>
            </div>

            {/* Right Column: "Details" Button (Screenshot 1) */}
            <div>
              <button
                onClick={() => setSelectedAnnouncement(ann)}
                style={{
                  padding: "0.55rem 1.5rem",
                  borderRadius: "10px",
                  background: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  color: "#ffffff",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.35)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.22)";
                }}
              >
                Details
              </button>
            </div>
          </div>
        ))}

        {filteredAnnouncements.length === 0 && (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              background: "rgba(18, 22, 19, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            No announcements found in this filter category.
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAnnouncement && (
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
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            style={{
              background: "rgba(24, 32, 26, 0.96)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              borderRadius: "20px",
              padding: "2.5rem",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: 700, textTransform: "uppercase" }}>
                  Announcement Details
                </span>
                <h2 style={{ fontSize: "1.6rem", color: "#ffffff", fontWeight: 700, margin: "0.3rem 0" }}>
                  {selectedAnnouncement.title}
                </h2>
                <div style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)" }}>
                  Posted by {selectedAnnouncement.author} • {selectedAnnouncement.date} at {selectedAnnouncement.time}
                </div>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.2rem",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                padding: "1.2rem",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                fontSize: "0.95rem",
                lineHeight: "1.6",
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {selectedAnnouncement.description}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.6)" }}>
                Audience: <strong>{selectedAnnouncement.audience}</strong>
              </span>
              <button
                onClick={() => {
                  setSelectedAnnouncement(null);
                  showToast("Marked as read");
                }}
                style={{
                  padding: "0.6rem 1.4rem",
                  borderRadius: "9999px",
                  background: "#000000",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showCreateModal && (
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
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: "rgba(24, 32, 26, 0.96)",
              border: "1px solid rgba(255, 255, 255, 0.22)",
              borderRadius: "20px",
              padding: "2.5rem",
              maxWidth: "580px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.45rem", color: "#ffffff", fontWeight: 700, margin: 0 }}>
                Post New Announcement
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "none", border: "none", color: "#ffffff", fontSize: "1.5rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.8)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20th Anniversary Celebration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.8)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  Audience
                </label>
                <select
                  value={newAudience}
                  onChange={(e) => setNewAudience(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                >
                  <option value="All Employees">All Employees</option>
                  <option value="Operations">Operations</option>
                  <option value="Security & Facilities">Security & Facilities</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.8)", marginBottom: "0.4rem", fontWeight: 600 }}>
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write announcement body..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.85rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "0.75rem 1.4rem",
                    borderRadius: "9999px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "rgba(255, 255, 255, 0.75)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.75rem 1.6rem",
                    borderRadius: "9999px",
                    background: "#000000",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "#ffffff",
                    fontWeight: 700,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Publishing..." : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
