import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Globe, Server, HardDrive, Menu, X, PanelLeftClose, PanelLeftOpen, LogOut, Network } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';

interface LayoutProps {
}

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${active
      ? 'bg-blue-600 text-white shadow-md'
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
  >
    <Icon size={20} className="shrink-0" />
    <span className="font-medium whitespace-nowrap">{label}</span>
  </Link>
);

export const Layout: React.FC<LayoutProps> = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/infrastructure', label: 'Sơ đồ Hạ tầng', icon: Network },
    { path: '/customers', label: 'Khách hàng', icon: Users },
    { path: '/domains', label: 'Tên miền', icon: Globe },
    { path: '/hosting', label: 'Hosting', icon: HardDrive },
    { path: '/vps', label: 'Máy chủ VPS', icon: Server },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full bg-slate-900 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isDesktopOpen ? 'md:translate-x-0 md:w-64' : 'md:translate-x-0 md:w-0 md:overflow-hidden'}
          w-64
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <div className={`flex items-center space-x-2 ${!isDesktopOpen && 'md:hidden'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Server className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight whitespace-nowrap overflow-hidden">HostMaster</span>
          </div>
          {/* Close button for Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center space-x-3 text-slate-400 text-sm overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <span className="font-bold text-xs text-white">AD</span>
            </div>
            <div className="whitespace-nowrap">
              <p className="text-white font-medium">Admin User</p>
              <p className="text-xs">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Header (Unified for Mobile and Desktop) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100"
            >
              <Menu size={24} />
            </button>

            {/* Desktop Toggle */}
            <button
              onClick={() => setIsDesktopOpen(!isDesktopOpen)}
              className="hidden md:flex text-slate-500 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100 transition-colors"
              title={isDesktopOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isDesktopOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>

            <span className="font-semibold text-slate-700 md:hidden">HostMaster CRM</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-sm text-slate-500">
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">System Online</span>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );

};