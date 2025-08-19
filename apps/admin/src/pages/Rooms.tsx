import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface RoomType {
  id: number;
  name: string;
  code?: string;
  created_at: string;
  updated_at: string;
}

interface Room {
  id: number;
  name: string;
  room_type_id: number;
  capacity: number;
  status: 'available' | 'maintenance' | 'occupied';
  floor?: number;
  price_per_hour?: number | { s: number; e: number; d: number[] };
  features?: any;
  created_at: string;
  updated_at: string;
  room_type: {
    id: number;
    name: string;
    code?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface RoomFormData {
  name: string;
  room_type_id: string;
  capacity: string;
  status: 'available' | 'maintenance' | 'occupied';
  floor: string;
  price_per_hour: string;
  features: any;
}

export default function Rooms() {
  const [activeTab, setActiveTab] = useState<'rooms' | 'types'>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'room' | 'roomType'>('room');
  const [editingItem, setEditingItem] = useState<Room | RoomType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    room_type_id: '',
    capacity: '',
    status: 'available',
    floor: '',
    price_per_hour: '',
    features: {},
  });

  const [typeFormData, setTypeFormData] = useState({
    name: '',
    code: '',
  });

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, [pagination.page, searchTerm, statusFilter, typeFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { room_type_id: typeFilter }),
      });

      const response = await fetch(`http://localhost:3000/v1/rooms?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setRooms(data.rooms);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const response = await fetch('http://localhost:3000/v1/rooms/types');
      const data = await response.json();
      
      if (response.ok) {
        setRoomTypes(data);
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `http://localhost:3000/v1/rooms/${editingItem.id}`
        : 'http://localhost:3000/v1/rooms';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          room_type_id: parseInt(formData.room_type_id),
          capacity: parseInt(formData.capacity),
          floor: formData.floor ? parseInt(formData.floor) : undefined,
          price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : undefined,
        }),
      });
      
      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchRooms();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save room');
      }
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Failed to save room');
    }
  };

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `http://localhost:3000/v1/rooms/types/${editingItem.id}`
        : 'http://localhost:3000/v1/rooms/types';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeFormData),
      });
      
      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchRoomTypes();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save room type');
      }
    } catch (error) {
      console.error('Error saving room type:', error);
      alert('Failed to save room type');
    }
  };

  const handleDelete = async (id: number, type: 'room' | 'roomType') => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const url = type === 'room' 
        ? `http://localhost:3000/v1/rooms/${id}`
        : `http://localhost:3000/v1/rooms/types/${id}`;
      
      const response = await fetch(url, { method: 'DELETE' });
      
      if (response.ok) {
        if (type === 'room') {
          fetchRooms();
        } else {
          fetchRoomTypes();
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      room_type_id: '',
      capacity: '',
      status: 'available',
      floor: '',
      price_per_hour: '',
      features: {},
    });
    setTypeFormData({
      name: '',
      code: '',
    });
    setEditingItem(null);
  };

  // Helper function to convert Decimal to number
  const formatPrice = (price: any): string => {
    if (!price) return '-';
    if (typeof price === 'number') return price.toString();
    if (typeof price === 'object' && price.s !== undefined && price.e !== undefined && price.d) {
      // Convert Decimal object to number
      const num = parseFloat(price.d.join('')) * Math.pow(10, price.e);
      return (price.s === -1 ? -num : num).toFixed(2);
    }
    return '-';
  };

  const openModal = (type: 'room' | 'roomType', item?: Room | RoomType) => {
    setModalType(type);
    setEditingItem(item || null);
    
    if (type === 'room') {
      if (item) {
        const room = item as Room;
        setFormData({
          name: room.name,
          room_type_id: room.room_type_id.toString(),
          capacity: room.capacity.toString(),
          status: room.status,
          floor: room.floor?.toString() || '',
          price_per_hour: formatPrice(room.price_per_hour),
          features: room.features || {},
        });
      } else {
        setFormData({
          name: '',
          room_type_id: '',
          capacity: '',
          status: 'available',
          floor: '',
          price_per_hour: '',
          features: {},
        });
      }
    } else {
      if (item) {
        const roomType = item as RoomType;
        setTypeFormData({
          name: roomType.name,
          code: roomType.code || '',
        });
      } else {
        setTypeFormData({
          name: '',
          code: '',
        });
      }
    }
    
    setShowModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'maintenance':
        return <WrenchScrewdriverIcon className="h-5 w-5 text-yellow-500" />;
      case 'occupied':
        return <UsersIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full px-6 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600">Manage rooms and room types for your facility</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => openModal('roomType')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Room Type
            </button>
            <button
              onClick={() => openModal('room')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Room
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rooms'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rooms ({pagination.total})
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'types'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Room Types ({roomTypes.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        {activeTab === 'rooms' && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="occupied">Occupied</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Types</option>
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {activeTab === 'rooms' ? (
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading rooms...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Room
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Floor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price/Hour
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-8 w-8 text-indigo-600 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{room.name}</div>
                                <div className="text-sm text-gray-500">ID: {room.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {room.room_type.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-900">{room.capacity}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                              {getStatusIcon(room.status)}
                              <span className="ml-1">{room.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {room.floor || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {room.price_per_hour ? (
                              <div className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-900">{formatPrice(room.price_per_hour)}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal('room', room)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(room.id, 'room')}
                                className="text-red-600 hover:text-red-900"
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
                
                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                          {' '}to{' '}
                          <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                          </span>
                          {' '}of{' '}
                          <span className="font-medium">{pagination.total}</span>
                          {' '}results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setPagination(prev => ({ ...prev, page }))}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                page === pagination.page
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              } border`}
                            >
                              {page}
                            </button>
                          ))}
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roomTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{type.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {type.code ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {type.code}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(type.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal('roomType', type)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(type.id, 'roomType')}
                            className="text-red-600 hover:text-red-900"
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
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit' : 'Add'} {modalType === 'room' ? 'Room' : 'Room Type'}
              </h3>
              
              <form onSubmit={modalType === 'room' ? handleSubmit : handleTypeSubmit}>
                {modalType === 'room' ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Type *
                      </label>
                      <select
                        required
                        value={formData.room_type_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, room_type_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Room Type</option>
                        {roomTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'available' | 'maintenance' | 'occupied' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="available">Available</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="occupied">Occupied</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Floor
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.floor}
                          onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price/Hour
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price_per_hour}
                          onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={typeFormData.name}
                        onChange={(e) => setTypeFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={typeFormData.code}
                        onChange={(e) => setTypeFormData(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
