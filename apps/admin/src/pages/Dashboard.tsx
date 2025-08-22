import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import {
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface DashboardData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    monthlyBookings: number;
    weeklyBookings: number;
    totalIncome: number;
    monthlyIncome: number;
    weeklyIncome: number;
    totalRooms: number;
    availableRooms: number;
    occupancyRate: string;
  };
  recentBookings: Array<{
    id: string;
    kind: string;
    status: string;
    starts_at: string;
    ends_at: string;
    user: { name: string; email: string };
    room?: string;
    class?: string;
    created_at: string;
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    points_balance: number;
  }>;
}

const fetchDashboardOverview = async (): Promise<DashboardData> => {
  const response = await analyticsAPI.getDashboardAnalytics();
  return response.data;
};

const StatCard = ({ title, value, icon: Icon, change, changeType, trend, subtitle }: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: 'positive' | 'negative';
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
}) => (
  <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all duration-300">
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-shrink-0">
          <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {trend === 'up' && <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />}
          {trend === 'down' && <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />}
        </div>
      </div>
      <div className="mt-4">
        <dt className="text-sm font-medium text-gray-600 truncate">{title}</dt>
        <dd className="mt-2 text-3xl font-bold text-gray-900">{value}</dd>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      {change && (
        <div className="mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {change}
          </span>
        </div>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'indigo' }: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  color?: 'indigo' | 'green' | 'blue' | 'purple';
}) => (
  <button
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-left group hover:scale-105"
  >
    <div className={`p-3 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </button>
);

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: fetchDashboardOverview,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const quickActions = [
    {
      title: 'New Booking',
      description: 'Create a new room or class booking',
      icon: CalendarIcon,
      color: 'green' as const,
      onClick: () => console.log('New booking clicked')
    },
    {
      title: 'Add User',
      description: 'Register a new user account',
      icon: UserGroupIcon,
      color: 'blue' as const,
      onClick: () => console.log('Add user clicked')
    },
    {
      title: 'View Reports',
      description: 'Generate and export reports',
      icon: EyeIcon,
      color: 'purple' as const,
      onClick: () => console.log('View reports clicked')
    },
    {
      title: 'Manage Rooms',
      description: 'Configure room settings and availability',
      icon: BuildingOfficeIcon,
      color: 'indigo' as const,
      onClick: () => console.log('Manage rooms clicked')
    }
  ];

  if (isLoading) {
    return (
      <div className="w-full px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <div className="mt-2 text-sm text-red-700">
                {error instanceof Error ? error.message : 'An error occurred'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full px-6 py-8">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={data.overview.totalUsers.toLocaleString()}
              icon={UsersIcon}
              change={`${data.overview.activeUsers} active`}
              changeType="positive"
              trend="up"
              subtitle="Registered users"
            />
            <StatCard
              title="Total Bookings"
              value={data.overview.totalBookings.toLocaleString()}
              icon={CalendarIcon}
              change={`${data.overview.confirmedBookings} confirmed`}
              changeType="positive"
              trend="up"
              subtitle="All time bookings"
            />
            <StatCard
              title="Total Revenue"
              value={`$${data.overview.totalIncome.toLocaleString()}`}
              icon={CurrencyDollarIcon}
              change={`$${data.overview.monthlyIncome.toLocaleString()} this month`}
              changeType="positive"
              trend="up"
              subtitle="Lifetime earnings"
            />
            <StatCard
              title="Room Occupancy"
              value={`${data.overview.occupancyRate}%`}
              icon={BuildingOfficeIcon}
              change={`${data.overview.availableRooms} available`}
              changeType="negative"
              trend="down"
              subtitle="Current utilization"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Bookings */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-4 divide-y divide-gray-200">
                  {data.recentBookings.slice(0, 5).map((booking) => (
                    <li key={booking.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {booking.user.name}
                            </p>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="text-sm text-gray-500">
                            {booking.kind === 'room' ? (
                              <span className="flex items-center">
                                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                {booking.room}
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                                {booking.class}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(booking.starts_at).toLocaleDateString()} at{' '}
                            {new Date(booking.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Top Users */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Top Users</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-4 divide-y divide-gray-200">
                  {data.topUsers.slice(0, 5).map((user, index) => (
                    <li key={user.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-800">
                              #{index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-semibold text-indigo-600">
                            {user.points_balance.toLocaleString()} pts
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Weekly Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.weeklyBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{data.overview.monthlyBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Weekly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${data.overview.weeklyIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
