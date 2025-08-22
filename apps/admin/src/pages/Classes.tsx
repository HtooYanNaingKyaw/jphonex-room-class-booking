import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  MapPinIcon,
  UserCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import FormModal from '../components/FormModal';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Room {
  id: number;
  name: string;
  room_type: {
    name: string;
  };
}

interface ClassSchedule {
  id: number;
  class_id: number;
  room_id?: number;
  starts_at: string;
  ends_at: string;
  capacity_override?: number;
  room?: Room;
  bookings: any[];
  attendance: any[];
}

interface Class {
  id: number;
  title: string;
  description?: string;
  instructor_id: number;
  max_seats: number;
  created_at: string;
  updated_at: string;
  instructor: User;
  schedules: ClassSchedule[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function Classes() {
  const [activeTab, setActiveTab] = useState<'classes' | 'schedules'>('classes');
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'class' | 'schedule'>('class');
  const [editingItem, setEditingItem] = useState<Class | ClassSchedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [instructorFilter, setInstructorFilter] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_id: '',
    max_seats: '',
  });

  const [scheduleFormData, setScheduleFormData] = useState({
    room_id: '',
    starts_at: '',
    ends_at: '',
    capacity_override: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchUsers();
    fetchRooms();
  }, [pagination.page, searchTerm, instructorFilter]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(instructorFilter !== 'all' && { instructor_id: instructorFilter }),
      });

      const response = await fetch(`http://localhost:3000/v1/classes?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setClasses(data.classes);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3000/v1/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3000/v1/rooms');
      const data = await response.json();
      
      if (response.ok) {
        setRooms(data.rooms || data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingItem 
        ? `http://localhost:3000/v1/classes/${editingItem.id}`
        : 'http://localhost:3000/v1/classes';
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          instructor_id: parseInt(formData.instructor_id),
          max_seats: parseInt(formData.max_seats),
        }),
      });
      
      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchClasses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save class');
      }
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass) return;
    
    try {
      // Validate dates
      const startDate = new Date(scheduleFormData.starts_at);
      const endDate = new Date(scheduleFormData.ends_at);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert('Please enter valid start and end dates');
        return;
      }
      
      if (startDate >= endDate) {
        alert('End date must be after start date');
        return;
      }
      
      const url = editingItem 
        ? `http://localhost:3000/v1/classes/schedules/${editingItem.id}`
        : `http://localhost:3000/v1/classes/${selectedClass.id}/schedules`;
      
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scheduleFormData,
          class_id: selectedClass.id,
          room_id: scheduleFormData.room_id ? parseInt(scheduleFormData.room_id) : undefined,
          capacity_override: scheduleFormData.capacity_override ? parseInt(scheduleFormData.capacity_override) : undefined,
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString(),
        }),
      });
      
      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchClasses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save schedule');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule');
    }
  };

  const handleDelete = async (id: number, type: 'class' | 'schedule') => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const url = type === 'class' 
        ? `http://localhost:3000/v1/classes/${id}`
        : `http://localhost:3000/v1/classes/schedules/${id}`;
      
      const response = await fetch(url, { method: 'DELETE' });
      
      if (response.ok) {
        fetchClasses();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      // Convert to local timezone and format for datetime-local input
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      return localDate.toISOString().slice(0, 16);
    } catch (error) {
      return '';
    }
  };

  const openModal = (type: 'class' | 'schedule', item?: Class | ClassSchedule) => {
    setModalType(type);
    setEditingItem(item || null);
    
    if (type === 'class') {
      if (item) {
        const classData = item as Class;
        setFormData({
          title: classData.title,
          description: classData.description || '',
          instructor_id: classData.instructor_id.toString(),
          max_seats: classData.max_seats.toString(),
        });
      } else {
        setFormData({
          title: '',
          description: '',
          instructor_id: '',
          max_seats: '',
        });
      }
    } else {
      if (item) {
        const schedule = item as ClassSchedule;
        setScheduleFormData({
          room_id: schedule.room_id?.toString() || '',
          starts_at: formatDateForInput(schedule.starts_at),
          ends_at: formatDateForInput(schedule.ends_at),
          capacity_override: schedule.capacity_override?.toString() || '',
        });
      } else {
        // Set default times for new schedule (next hour)
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        
        setScheduleFormData({
          room_id: '',
          starts_at: formatDateForInput(nextHour.toISOString()),
          ends_at: formatDateForInput(twoHoursLater.toISOString()),
          capacity_override: '',
        });
      }
    }
    
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor_id: '',
      max_seats: '',
    });
    setScheduleFormData({
      room_id: '',
      starts_at: '',
      ends_at: '',
      capacity_override: '',
    });
    setEditingItem(null);
  };

  const getInstructorName = (instructorId: number) => {
    const instructor = users.find(u => u.id === instructorId);
    return instructor ? instructor.name : 'Unknown';
  };

  const getRoomName = (roomId?: number) => {
    if (!roomId) return 'No room assigned';
    const room = rooms.find(r => r.id === roomId);
    return room ? `${room.name} (${room.room_type.name})` : 'Unknown room';
  };

  return (
    <div className="w-full px-6 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600">Manage classes, instructors, and schedules</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => openModal('class')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Class
            </button>
            {activeTab === 'schedules' && selectedClass && (
              <button
                onClick={() => openModal('schedule')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Schedule
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('classes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'classes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Classes ({pagination.total})
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedules'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Schedules
            </button>
          </nav>
        </div>

        {/* Filters */}
        {activeTab === 'classes' && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor
                </label>
                <select
                  value={instructorFilter}
                  onChange={(e) => setInstructorFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Instructors</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setInstructorFilter('all');
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
        {activeTab === 'classes' ? (
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading classes...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instructor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Capacity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Schedules
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {classes && classes.length > 0 ? (
                        classes.map((classItem) => (
                          <tr key={classItem.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <BookOpenIcon className="h-8 w-8 text-indigo-600 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{classItem.title}</div>
                                  <div className="text-sm text-gray-500">
                                    {classItem.description || 'No description'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <UserCircleIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">{classItem.instructor.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-900">{classItem.max_seats}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-900">{classItem.schedules?.length || 0}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedClass(classItem);
                                    setActiveTab('schedules');
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View schedules"
                                >
                                  <CalendarIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openModal('class', classItem)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(classItem.id, 'class')}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              {loading ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
                                  Loading classes...
                                </div>
                              ) : (
                                <div>
                                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                  <p className="text-lg font-medium text-gray-900 mb-2">No classes found</p>
                                  <p className="text-gray-500">Get started by creating your first class.</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
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
          <div className="space-y-4">
            {selectedClass ? (
              <>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedClass.title}</h3>
                      <p className="text-sm text-gray-500">
                        Instructor: {selectedClass.instructor.name} | 
                        Max Seats: {selectedClass.max_seats}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('classes')}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      ← Back to Classes
                    </button>
                  </div>
                </div>
                
                <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900">Class Schedules</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Capacity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedClass && selectedClass.schedules && selectedClass.schedules.length > 0 ? (
                          selectedClass.schedules.map((schedule) => (
                            <tr key={schedule.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {formatDateTime(schedule.starts_at)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      to {formatDateTime(schedule.ends_at)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-900">
                                    {getRoomName(schedule.room_id)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                                  <span className="text-sm text-gray-900">
                                    {schedule.capacity_override || selectedClass.max_seats}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-1" />
                                  <span className="text-sm text-gray-900">
                                    {schedule.bookings?.length || 0}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openModal('schedule', schedule)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(schedule.id, 'schedule')}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center">
                              <div className="text-gray-500">
                                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">No schedules found</p>
                                <p className="text-gray-500">This class doesn't have any scheduled sessions yet.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
                <div className="text-center">
                  <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
                  <p className="text-gray-500">Choose a class from the Classes tab to view and manage its schedules.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalType === 'class' ? (
        <FormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={`${editingItem ? 'Edit' : 'Add'} Class`}
          onSubmit={handleSubmit}
          submitText={editingItem ? 'Update' : 'Create'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor *
                </label>
                <select
                  required
                  value={formData.instructor_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructor_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Instructor</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Seats *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.max_seats}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_seats: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </FormModal>
      ) : (
        <FormModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            resetForm();
          }}
          title={`${editingItem ? 'Edit' : 'Add'} Schedule`}
          onSubmit={handleScheduleSubmit}
          submitText={editingItem ? 'Update' : 'Create'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                value={scheduleFormData.room_id}
                onChange={(e) => setScheduleFormData(prev => ({ ...prev, room_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No room assigned</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.room_type.name})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleFormData.starts_at}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be in the future
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleFormData.ends_at}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, ends_at: e.target.value }))}
                  min={scheduleFormData.starts_at || new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be after start time
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity Override
              </label>
              <input
                type="number"
                min="1"
                value={scheduleFormData.capacity_override}
                onChange={(e) => setScheduleFormData(prev => ({ ...prev, capacity_override: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Leave empty to use class default"
              />
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
