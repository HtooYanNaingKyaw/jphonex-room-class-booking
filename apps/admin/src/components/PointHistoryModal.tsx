import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  PlusIcon,
  MinusIcon,
  CalendarIcon,
  UserCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import FormModal from './FormModal';
import { userAPI } from '../services/api';

export interface PointTransaction {
  id: string;
  delta: number;
  reason: string;
  created_at: string;
  booking_id?: string;
}

export interface PointHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  currentPoints: number;
  userId: string;
}

const PointHistoryModal: React.FC<PointHistoryModalProps> = ({
  isOpen,
  onClose,
  userName,
  currentPoints,
  userId
}) => {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filtering state
  const [dateRange, setDateRange] = useState('30'); // 7, 30, 90, 365, all
  const [transactionType, setTransactionType] = useState<'all' | 'earned' | 'spent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setCurrentPage(1); // Reset to first page when opening
      fetchPointHistory();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (isOpen && userId) {
      fetchPointHistory();
    }
  }, [currentPage, pageSize, dateRange, transactionType, searchQuery]);

  const fetchPointHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(dateRange !== 'all' && { days: dateRange }),
        ...(transactionType !== 'all' && { type: transactionType }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await userAPI.getPointHistory(userId, params);
      const data = response.data;
      
      // Map backend data to frontend format
      const transactions = data.points?.map((point: any) => ({
        id: point.id,
        delta: point.delta,
        reason: point.reason,
        created_at: point.created_at,
        booking_id: point.booking?.id
      })) || [];
      
      setTransactions(transactions);
      setTotalTransactions(data.pagination?.total || 0);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: any) {
      console.error('Failed to fetch point history:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch point history');
      setTransactions([]);
      setTotalPages(1);
      setTotalTransactions(0);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (delta: number) => {
    if (delta > 0) {
      return <PlusIcon className="h-5 w-5 text-green-500" />;
    } else {
      return <MinusIcon className="h-5 w-5 text-red-500" />;
    }
  };

  const getTransactionColor = (delta: number) => {
    if (delta > 0) {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  const getTransactionBg = (delta: number) => {
    if (delta > 0) {
      return 'bg-green-50 border-green-200';
    } else {
      return 'bg-red-50 border-red-200';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page
  };

  const clearFilters = () => {
    setDateRange('30');
    setTransactionType('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = dateRange !== '30' || transactionType !== 'all' || searchQuery;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Point History - ${userName}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Current Balance Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserCircleIcon className="h-8 w-8 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{userName}</h3>
                <p className="text-sm text-gray-600">Current Balance</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">{currentPoints}</div>
              <div className="text-sm text-gray-500">points</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4">
          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Transaction History</h4>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                    <option value="all">All time</option>
                  </select>
                </div>

                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All transactions</option>
                    <option value="earned">Earned only</option>
                    <option value="spent">Spent only</option>
                  </select>
                </div>

                {/* Page Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Per Page
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Reason
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-blue-800">
                  <span className="font-medium">Active Filters:</span>
                  {dateRange !== '30' && (
                    <span className="bg-blue-100 px-2 py-1 rounded">Date: {dateRange === 'all' ? 'All time' : `Last ${dateRange} days`}</span>
                  )}
                  {transactionType !== 'all' && (
                    <span className="bg-blue-100 px-2 py-1 rounded">Type: {transactionType === 'earned' ? 'Earned only' : 'Spent only'}</span>
                  )}
                  {searchQuery && (
                    <span className="bg-blue-100 px-2 py-1 rounded">Search: "{searchQuery}"</span>
                  )}
                </div>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <XCircleIcon className="h-8 w-8 text-red-500 mx-auto" />
              <p className="mt-2 text-red-600">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="h-8 w-8 text-gray-400 mx-auto" />
              <p className="mt-2 text-gray-600">No transactions found</p>
              {hasActiveFilters && (
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <>
              {/* Transactions List */}
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`border rounded-lg p-4 ${getTransactionBg(transaction.delta)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getTransactionIcon(transaction.delta)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{transaction.reason}</p>
                            {transaction.booking_id && (
                              <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                                <EyeIcon className="h-4 w-4 inline mr-1" />
                                View Booking
                              </button>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{formatDate(transaction.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getTransactionColor(transaction.delta)}`}>
                          {transaction.delta > 0 ? '+' : ''}{transaction.delta}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalTransactions)} of {totalTransactions} transactions
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm rounded-md ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary Stats */}
        {transactions.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Earned:</span>
                <span className="ml-2 font-medium text-green-600">
                  +{transactions.filter(t => t.delta > 0).reduce((sum, t) => sum + t.delta, 0)} points
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Spent:</span>
                <span className="ml-2 font-medium text-red-600">
                  {transactions.filter(t => t.delta < 0).reduce((sum, t) => sum + Math.abs(t.delta), 0)} points
                </span>
              </div>
            </div>
            {totalTransactions > transactions.length && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                Showing {transactions.length} of {totalTransactions} total transactions
              </div>
            )}
          </div>
        )}
      </div>
    </FormModal>
  );
};

export default PointHistoryModal;
