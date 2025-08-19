import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  DocumentTextIcon,
  UserCircleIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import LogoDark from '../assets/Logo_dark.png';
import LogoWhite from '../assets/Logo_white.png';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Rooms', href: '/rooms', icon: BuildingOfficeIcon },
  { name: 'Bookings', href: '/bookings', icon: CalendarDaysIcon },
  { name: 'Classes', href: '/classes', icon: BookOpenIcon },
  { name: 'Policies', href: '/policies', icon: DocumentTextIcon },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex h-full flex-col">
          {/* Logo and brand */}
          <div className={`flex h-16 items-center border-b border-gray-200 flex-shrink-0 ${
            sidebarCollapsed ? 'justify-center px-4' : 'justify-between px-6'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg">
                <img src={LogoDark} alt="jPhone Logo" className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-6 h-6'}`} />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900">JPhoniex</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="lg:block p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  title="Collapse sidebar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="absolute right-2">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="lg:block p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  title="Expand sidebar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                        : 'bg-white hover:bg-gray-50 hover:text-gray-900'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                      } ${!sidebarCollapsed ? 'mr-3' : ''}`}
                    />
                    {!sidebarCollapsed && item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User section with logout */}
          <div className="border-t border-gray-200 flex-shrink-0">
            {/* User info and logout button side by side */}
            <div className="p-4">
              {sidebarCollapsed ? (
                /* Mini sidebar layout - vertical stack */
                <div className="flex flex-col items-center space-y-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                    title="Sign out"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                /* Full sidebar layout - horizontal */
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserCircleIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@jphone.com'}</p>
                    </div>
                  </div>
                  
                  {/* Logout button */}
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                    title="Sign out"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
                <BellIcon className="h-5 w-5" />
              </button>
              
              {/* User menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserCircleIcon className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
