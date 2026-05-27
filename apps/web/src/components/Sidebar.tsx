"use client";

import { BookOpen, FileText, Home, Library, Plus, Settings, Sparkles, Users } from "lucide-react";

const navItems = [
  { label: "Home", icon: Home },
  { label: "My Groups", icon: Users },
  { label: "Assignments", icon: FileText, active: true, count: 10 },
  { label: "AI Teacher's Toolkit", icon: Sparkles },
  { label: "My Library", icon: Library }
];

export function Sidebar({ onCreate }: { onCreate: () => void }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brandMark">V</div>
        <span>VedaAI</span>
      </div>

      <button className="primaryNavButton" onClick={onCreate}>
        <Sparkles size={16} />
        Create Assignment
      </button>

      <nav className="navList" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button className={`navItem ${item.active ? "active" : ""}`} key={item.label}>
            <item.icon size={16} />
            <span>{item.label}</span>
            {item.count ? <strong>{item.count}</strong> : null}
          </button>
        ))}
      </nav>

      <div className="sidebarFooter">
        <button className="navItem">
          <Settings size={16} />
          <span>Settings</span>
        </button>
        <div className="schoolCard">
          <div className="avatar">DP</div>
          <div>
            <strong>Delhi Public School</strong>
            <span>Bokaro Steel City</span>
          </div>
        </div>
      </div>

      <button className="floatingCreate" onClick={onCreate} aria-label="Create assignment">
        <Plus size={20} />
      </button>
    </aside>
  );
}
