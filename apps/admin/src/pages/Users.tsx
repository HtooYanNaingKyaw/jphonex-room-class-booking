import { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  FunnelIcon,
  TrashIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';
import PointsAdjustmentModal from '../components/PointsAdjustmentModal';
import PointHistoryModal from '../components/PointHistoryModal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { userAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  gender: string | null;
  dob: string | null;
  status: string;
  points_balance: number;
  role: string;
  created_at: string;
  updated_at: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UserFormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  gender: string;
  dob: string;
  role_id: string;
  status: string;
}

const fetchUsers = async (params: URLSearchParams): Promise<UsersResponse> => {
  const response = await userAPI.getUsers(params);
  return response.data;
};

const fetchRoles = async () => {
  const response = await userAPI.getRoles();
  return response.data;
};

// Memoized Users Table Component
const UsersTable = memo(({ 
  users, 
  onDelete, 
  onPointsAdjustment,
  onPointHistory,
  onStatusChange
}: {
  users: User[];
  onDelete: (user: User) => void;
  onPointsAdjustment: (user: User) => void;
  onPointHistory: (user: User) => void;
  onStatusChange: (id: string, status: string) => void;
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Points
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{user.email}</div>
                <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.points_balance}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPointHistory(user)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Point History"
                  >
                    <ClockIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onPointsAdjustment(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Adjust Points"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <select
                    value={user.status}
                    onChange={(e) => onStatusChange(user.id, e.target.value)}
                    className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="locked">Locked</option>
                  </select>
                  <button
                    onClick={() => onDelete(user)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete User"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

UsersTable.displayName = 'UsersTable';

// Memoized Search Component
const SearchFilters = memo(({
  search,
  onSearchChange,
  searchInputRef,
  onSearchFocus,
  onSearchBlur,
  onSearchKeyPress,
  onSearchClick,
  onClearSearch,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
  roles,
  showFilters,
  onToggleFilters,
  onClearAll,
  hasActiveFilters
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onSearchKeyPress: (e: React.KeyboardEvent) => void;
  onSearchClick: () => void;
  onClearSearch: () => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  roles: any[];
  showFilters: boolean;
  onToggleFilters: () => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}) => {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, email, or phone..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={onSearchFocus}
                onBlur={onSearchBlur}
                onKeyPress={onSearchKeyPress}
              />
              {search && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onSearchClick}
            disabled={!search.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
            Search
          </button>
          <button
            onClick={onToggleFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => onRoleChange(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Roles</option>
                  {roles?.map((role: any) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={onClearAll}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

SearchFilters.displayName = 'SearchFilters';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'locked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircleIcon className="h-4 w-4 text-gray-500" />;
      case 'locked':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <XCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span className="ml-1">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  );
};

export default function Users() {
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // Debounced search value
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showPointHistoryModal, setShowPointHistoryModal] = useState(false);
  const [selectedUserForPoints, setSelectedUserForPoints] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: ''
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPage(1); // Reset to first page when searching
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [search]);

  // Restore focus after search query changes
  useEffect(() => {
    // Only restore focus if the search was focused and we have a search query
    if (isSearchFocused && searchQuery && searchInputRef.current) {
      // Use a small delay to ensure the component has fully re-rendered
      const focusTimer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          // Also ensure the cursor is at the end of the input
          const length = searchInputRef.current.value.length;
          searchInputRef.current.setSelectionRange(length, length);
        }
      }, 50); // Increased delay for better reliability
      
      return () => clearTimeout(focusTimer);
    }
  }, [searchQuery, isSearchFocused]);

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    name: '',
    phone: '',
    gender: '',
    dob: '',
    role_id: '',
    status: 'active',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Fetch users function
  const fetchUsersData = useCallback(async (currentPage = page, currentSearch = searchQuery, currentStatus = statusFilter, currentRole = roleFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(currentSearch && { search: currentSearch }),
        ...(currentStatus && { status: currentStatus }),
        ...(currentRole && { role: currentRole }),
      });
      
      const response = await fetchUsers(params);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch roles function
  const fetchRolesData = useCallback(async () => {
    try {
      const rolesData = await fetchRoles();
      setRoles(rolesData);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchRolesData();
  }, []);

  // Fetch users when search parameters change
  useEffect(() => {
    fetchUsersData(page, searchQuery, statusFilter, roleFilter);
  }, [page, searchQuery, statusFilter, roleFilter, fetchUsersData]);

  const createUser = async (userData: UserFormData) => {
    try {
      // Convert date string to ISO datetime string for backend validation
      const submitData = {
        ...userData,
        role_id: parseInt(userData.role_id),
        phone: userData.phone || undefined,
        gender: userData.gender || undefined,
        dob: userData.dob ? new Date(userData.dob + 'T00:00:00.000Z').toISOString() : undefined,
      };
      
      await userAPI.createUser(submitData);
      
      toast.success('User created successfully');
      setShowModal(false);
      resetForm();
      // Refresh users data
      fetchUsersData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to create user');
    }
  };

  const updateUser = async ({ id, data }: { id: string; data: Partial<User> }) => {
    try {
      // Convert date string to ISO datetime string if dob is being updated
      const updateData = {
        ...data,
        dob: data.dob ? new Date(data.dob + 'T00:00:00.000Z').toISOString() : undefined,
      };
      
      await userAPI.updateUser(id, updateData);
      
      toast.success('User updated successfully');
      // Refresh users data
      fetchUsersData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update user');
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await userAPI.deleteUser(id);
      
      toast.success('User deleted successfully');
      // Refresh users data
      fetchUsersData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete user');
    }
  };

  const adjustPoints = async ({ id, delta, reason }: { id: string; delta: number; reason: string }) => {
    try {
      await userAPI.adjustPoints(id, { delta, reason });
      
      toast.success('Points adjusted successfully');
      // Refresh users data
      fetchUsersData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Failed to adjust points');
    }
  };



  const openModal = (user?: User) => {
    if (user) {
      // For editing, we'll need to implement edit functionality
      toast.error('Edit functionality not implemented yet');
      return;
    }
    
    // For creating new user
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      gender: '',
      dob: '',
      role_id: '',
      status: 'active',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      gender: '',
      dob: '',
      role_id: '',
      status: 'active',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.role_id) {
      errors.role_id = 'Role is required';
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Phone number is invalid';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    createUser(formData);
  };

  const openDeleteConfirm = useCallback((id: string, name: string) => {
    setConfirmDelete({
      isOpen: true,
      id,
      name
    });
  }, []);

  const handleDelete = useCallback((user: User) => {
    openDeleteConfirm(user.id, user.name);
  }, [openDeleteConfirm]);

  const handlePointsAdjustment = useCallback((user: User) => {
    setSelectedUserForPoints(user);
    setShowPointsModal(true);
  }, []);

  const handlePointHistory = useCallback((user: User) => {
    setSelectedUserForPoints(user);
    setShowPointHistoryModal(true);
  }, []);

  const handlePointsSubmit = useCallback(async (delta: number, reason: string) => {
    if (!selectedUserForPoints) return;
    
    try {
      await adjustPoints({ id: selectedUserForPoints.id, delta, reason });
      setShowPointsModal(false);
      setSelectedUserForPoints(null);
    } catch (error) {
      console.error('Failed to adjust points:', error);
    }
  }, [selectedUserForPoints, adjustPoints]);

  const handleStatusChange = useCallback((id: string, status: string) => {
    updateUser({ id, data: { status } });
  }, [updateUser]);

  // Search-related callbacks
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInputRef.current?.value || '');
      setPage(1);
    }
  }, []);

  const handleSearchClick = useCallback(() => {
    setSearchQuery(searchInputRef.current?.value || '');
    setPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch('');
    setSearchQuery('');
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleRoleFilterChange = useCallback((value: string) => {
    setRoleFilter(value);
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearch('');
    setSearchQuery('');
    setStatusFilter('');
    setRoleFilter('');
    setPage(1);
  }, []);

  const hasActiveFilters = !!(searchQuery || statusFilter || roleFilter);

  const renderTableContent = useCallback(() => {
    if (isLoading) {
      return <TableSkeleton rows={10} columns={6} />;
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
              <div className="mt-2 text-sm text-red-700">
                {error || 'An error occurred'}
              </div>
            </div>
          </div>
        </div>
      );
    }

            if (users && users.length > 0) {
          return (
            <UsersTable
              users={users}
              onDelete={handleDelete}
              onPointsAdjustment={handlePointsAdjustment}
              onPointHistory={handlePointHistory}
              onStatusChange={handleStatusChange}
            />
          );
        }

    return (
      <div className="text-center py-12">
        <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {search || statusFilter || roleFilter 
            ? 'Try adjusting your search or filters.'
            : 'Get started by creating a new user.'
          }
        </p>
        {!search && !statusFilter && !roleFilter && (
          <div className="mt-6">
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add User
            </button>
          </div>
        )}
      </div>
    );
  }, [isLoading, error, users, search, statusFilter, roleFilter, handleDelete, handlePointsAdjustment, handleStatusChange]);

  return (
    <div className="w-full px-6 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage users and their accounts</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>

        {/* Search and Filters */}
        <SearchFilters
          search={search}
          onSearchChange={handleSearchChange}
          searchInputRef={searchInputRef}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
          onSearchKeyPress={handleSearchKeyPress}
          onSearchClick={handleSearchClick}
          onClearSearch={handleClearSearch}
          statusFilter={statusFilter}
          onStatusChange={handleStatusFilterChange}
          roleFilter={roleFilter}
          onRoleChange={handleRoleFilterChange}
          roles={roles}
          showFilters={showFilters}
          onToggleFilters={handleToggleFilters}
          onClearAll={handleClearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Search Status */}
        {/* {(searchQuery || statusFilter || roleFilter) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-900">
                  Active Filters:
                </span>
                <div className="flex items-center space-x-2">
                  {searchQuery && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{searchQuery}"
                    </span>
                  )}
                  {statusFilter && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Status: {statusFilter}
                    </span>
                  )}
                  {roleFilter && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Role: {roleFilter}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm text-blue-600">
                {pagination.total || 0} results found
              </span>
            </div>
          </div>
        )} */}

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {renderTableContent()}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(page - 1) * pagination.limit + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(page * pagination.limit, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{pagination.total}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <FormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Add New User"
        onSubmit={handleSubmit}
        submitText="Create User"
        isSubmitting={false} // No mutation isPending here
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                formErrors.password ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                required
                value={formData.role_id}
                onChange={(e) => setFormData(prev => ({ ...prev, role_id: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  formErrors.role_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Role</option>
                {roles?.map((role: any) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {formErrors.role_id && (
                <p className="mt-1 text-sm text-red-600">{formErrors.role_id}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </FormModal>

      {/* Points Adjustment Modal */}
      <PointsAdjustmentModal
        isOpen={showPointsModal}
        onClose={() => {
          setShowPointsModal(false);
          setSelectedUserForPoints(null);
        }}
        onSubmit={handlePointsSubmit}
        userName={selectedUserForPoints?.name || ''}
        currentPoints={selectedUserForPoints?.points_balance || 0}
        isSubmitting={false} // No mutation isPending here
      />

      {/* Point History Modal */}
      <PointHistoryModal
        isOpen={showPointHistoryModal}
        onClose={() => {
          setShowPointHistoryModal(false);
          setSelectedUserForPoints(null);
        }}
        userName={selectedUserForPoints?.name || ''}
        currentPoints={selectedUserForPoints?.points_balance || 0}
        userId={selectedUserForPoints?.id || ''}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          deleteUser(confirmDelete.id);
          setConfirmDelete(prev => ({ ...prev, isOpen: false }));
        }}
        title="Delete User"
        message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
