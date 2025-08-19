import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, ChartBarIcon, EyeIcon, ArrowTrendingUpIcon, UsersIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const fetchAnalytics = async (type: string, params: URLSearchParams) => {
  const response = await fetch(`/v1/analytics/${type}?${params.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} analytics`);
  }
  return response.json();
};

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'indigo' | 'green' | 'blue' | 'purple' | 'red';
}) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-gradient-to-br from-${color}-500 to-${color}-600`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children, action }: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="bg-white shadow-lg rounded-xl border border-gray-100">
    <div className="px-6 py-5 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [dateRange, setDateRange] = useState('30');
  const [exportFormat, setExportFormat] = useState('csv');

  const tabs = [
    { id: 'bookings', name: 'Bookings', icon: CalendarIcon, color: 'blue' },
    { id: 'revenue', name: 'Revenue', icon: ChartBarIcon, color: 'green' },
    { id: 'users', name: 'Users', icon: UsersIcon, color: 'purple' },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics', activeTab, dateRange],
    queryFn: () => {
      const params = new URLSearchParams({
        start: new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      });
      return fetchAnalytics(activeTab, params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="w-full px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                {error instanceof Error ? error.message : 'An error occurred'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8">
      <div className="space-y-6">
        {/* Date Range Selector */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Date Range:</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              Showing data from {new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toLocaleDateString()} to {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 inline mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Booking Analytics</h3>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <MetricCard
                    title="Total Bookings"
                    value={data?.dailyBookings?.reduce((sum: number, day: any) => sum + day.count, 0) || 0}
                    subtitle="In selected period"
                    icon={CalendarIcon}
                    color="blue"
                  />
                  <MetricCard
                    title="By Type"
                    value={data?.bookingByType?.length || 0}
                    subtitle="Different booking types"
                    icon={BuildingOfficeIcon}
                    color="green"
                  />
                  <MetricCard
                    title="By Source"
                    value={data?.bookingBySource?.length || 0}
                    subtitle="Different sources"
                    icon={EyeIcon}
                    color="purple"
                  />
                </div>

                {/* Detailed Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Bookings by Type" action={
                    <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                      View details
                    </button>
                  }>
                    <div className="space-y-3">
                      {data?.bookingByType?.map((type: any) => (
                        <div key={type.kind} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 capitalize">{type.kind}</span>
                          <span className="text-lg font-bold text-indigo-600">{type._count}</span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>

                  <ChartCard title="Bookings by Source" action={
                    <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                      View details
                    </button>
                  }>
                    <div className="space-y-3">
                      {data?.bookingBySource?.map((source: any) => (
                        <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 capitalize">{source.source}</span>
                          <span className="text-lg font-bold text-green-600">{source._count}</span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Revenue Analytics</h3>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <MetricCard
                    title="Total Revenue"
                    value={`$${data?.dailyRevenue?.reduce((sum: number, day: any) => sum + parseFloat(day.total), 0).toLocaleString() || 0}`}
                    subtitle="In selected period"
                    icon={ArrowTrendingUpIcon}
                    color="green"
                  />
                  <MetricCard
                    title="Transactions"
                    value={data?.dailyRevenue?.reduce((sum: number, day: any) => sum + day.transactions, 0) || 0}
                    subtitle="Total transactions"
                    icon={ChartBarIcon}
                    color="blue"
                  />
                </div>

                {/* Revenue Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Revenue by Payment Type">
                    <div className="space-y-3">
                      {data?.revenueByType?.map((type: any) => (
                        <div key={type.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 capitalize">{type.type}</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">${parseFloat(type._sum.amount).toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{type._count} transactions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>

                  <ChartCard title="Revenue by Provider">
                    <div className="space-y-3">
                      {data?.revenueByProvider?.map((provider: any) => (
                        <div key={provider.provider} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 capitalize">{provider.provider}</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">${parseFloat(provider._sum.amount).toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{provider._count} transactions</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">User Analytics</h3>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <MetricCard
                    title="New Registrations"
                    value={data?.userRegistrations?.reduce((sum: number, day: any) => sum + day.count, 0) || 0}
                    subtitle="In selected period"
                    icon={UsersIcon}
                    color="purple"
                  />
                  <MetricCard
                    title="By Status"
                    value={data?.usersByStatus?.length || 0}
                    subtitle="Different user statuses"
                    icon={EyeIcon}
                    color="blue"
                  />
                  <MetricCard
                    title="By Role"
                    value={data?.usersByRole?.length || 0}
                    subtitle="Different user roles"
                    icon={BuildingOfficeIcon}
                    color="green"
                  />
                </div>

                {/* User Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartCard title="Users by Status">
                    <div className="space-y-3">
                      {data?.usersByStatus?.map((status: any) => (
                        <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 capitalize">{status.status}</span>
                          <span className="text-lg font-bold text-indigo-600">{status._count}</span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>

                  <ChartCard title="Users by Role">
                    <div className="space-y-3">
                      {data?.usersByRole?.map((role: any) => (
                        <div key={role.role_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">{role.role_name}</span>
                          <span className="text-lg font-bold text-green-600">{role.count}</span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
