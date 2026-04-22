import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, Users, CreditCard, Bell, UserCircle } from "lucide-react";

const tabs = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/admins", icon: Store, label: "Admins" },
  { path: "/users", icon: Users, label: "Users" },
  { path: "/subscriptions", icon: CreditCard, label: "Plans" },
  { path: "/notifications", icon: Bell, label: "Notify" },
  { path: "/profile", icon: UserCircle, label: "Profile" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto bg-white border-t border-[#ffe4e4] shadow-[0_-4px_20px_rgba(128,0,0,0.08)]">
        <div className="flex items-center px-2 py-1">
          {tabs.map(({ path, icon: Icon, label }) => {
            const active = pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-all active:scale-95"
              >
                <div className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all ${active ? "bg-[#800000]" : "bg-transparent"}`}>
                  <Icon size={18} className={active ? "text-white" : "text-gray-400"} />
                </div>
                <span className={`text-[9px] font-bold ${active ? "text-[#800000]" : "text-gray-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
