import {
  Boxes,
  ChartColumn,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HelpCircle,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/", label: "Dashboard", icon: ChartColumn },
  { path: "/products", label: "Products", icon: Boxes },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/orders", label: "Orders", icon: ClipboardList },
];

function SidebarNavItem({ item, collapsed, onClick }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      title={collapsed ? item.label : undefined}
      onClick={onClick}
      className={({ isActive }) =>
        collapsed
          ? `flex items-center justify-center rounded-xl p-2.5 transition-colors ${
              isActive
                ? "bg-accent-500/20 text-accent-300"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            }`
          : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-accent-500/20 text-accent-300"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`
      }
    >
      {collapsed ? (
        <div className="flex flex-col items-center gap-0.5">
          <Icon className="h-5 w-5" />
          <span className="max-w-[52px] truncate text-center text-[9px] leading-none opacity-60">
            {item.label}
          </span>
        </div>
      ) : (
        <>
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/10"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-400/50 bg-accent-500/30 text-sm font-bold text-accent-300">
          {user?.initials || "U"}
        </div>
        <div className="hidden flex-col items-start leading-none sm:flex">
          <span className="text-sm font-medium text-ink/90">{user?.name}</span>
          <span className="text-xs text-ink/55">{user?.role}</span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-ink/45 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-2xl">
          <div className="border-b border-ink/10 px-4 py-3">
            <p className="text-sm font-medium text-ink">{user?.name}</p>
            <p className="text-xs text-ink/55">{user?.username}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-berry-700 transition-colors hover:bg-berry-50"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("inv_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("inv_sidebar_collapsed", String(sidebarCollapsed));
    } catch {
      // Ignore storage failures and keep the UI responsive.
    }
  }, [sidebarCollapsed]);

  const desktopOffsetClass = sidebarCollapsed ? "md:pl-[64px]" : "md:pl-[220px]";

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden h-full flex-col border-r border-white/10 bg-ink text-white transition-all duration-300 md:flex ${
          sidebarCollapsed ? "w-[64px]" : "w-[220px]"
        }`}
      >
        <div className="px-3 pb-2 pt-3" />

        <nav className="space-y-2 px-3">
          {navItems.map((item) => (
            <SidebarNavItem key={item.path} item={item} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        <div className="mt-auto px-3 pb-1 pt-3">
          <div className="mb-2 h-px bg-white/10" />
          <NavLink
            to="/help"
            title={sidebarCollapsed ? "Help" : undefined}
            className={({ isActive }) =>
              `flex rounded-xl px-3 py-2 text-sm transition-colors ${
                sidebarCollapsed ? "justify-center" : "items-center gap-3"
              } ${
                isActive
                  ? "bg-accent-500/20 text-accent-300"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {sidebarCollapsed ? (
              <div className="flex flex-col items-center gap-0.5">
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                <span className="mt-0.5 text-[9px] leading-none opacity-60">Help</span>
              </div>
            ) : (
              <>
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Help</span>
              </>
            )}
          </NavLink>
        </div>

        <div className="px-3 pb-4 pt-2">
          <button
            type="button"
            onClick={() => setSidebarCollapsed((current) => !current)}
            className="flex w-full items-center justify-center rounded-xl p-2.5 text-white/65 transition-colors hover:bg-white/10 hover:text-white"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </aside>

      <div className={`flex min-h-screen flex-col ${desktopOffsetClass}`}>
        <header className="sticky top-0 z-30 border-b border-ink/10 bg-white/70 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                className="btn-secondary !rounded-full !p-2.5 md:hidden"
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="flex items-center gap-3">
                <img
                  src="https://growth.ethara.ai/web/image/res.company/1/logo"
                  alt="Ethara AI"
                  className="h-7 w-auto object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-lg font-thin text-ink/20">|</span>
                <span className="text-sm font-semibold tracking-wide text-ink">Inventory Manager</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/help")}
                className="flex items-center gap-1.5 rounded-xl border border-ink/10 px-3 py-2 text-sm text-ink/60 transition-colors hover:bg-white/80 hover:text-ink"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </button>
              <UserMenu />
            </div>
          </div>

          {menuOpen ? (
            <nav className="space-y-2 border-t border-ink/10 px-4 py-4 md:hidden">
              {navItems.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  item={item}
                  collapsed={false}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
              <NavLink
                to="/help"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent-500/20 text-accent-700"
                      : "text-ink/70 hover:bg-brand-50 hover:text-ink"
                  }`
                }
              >
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                <span>Help</span>
              </NavLink>
            </nav>
          ) : null}
        </header>

        <main className="flex-1 min-w-0 overflow-auto px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-4 bottom-4 z-40 rounded-3xl border border-white/50 bg-white/85 p-2 shadow-panel backdrop-blur-md md:hidden">
        <div className="grid grid-cols-4 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition ${
                    isActive ? "bg-ink text-white" : "text-ink/60 hover:bg-brand-50"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
