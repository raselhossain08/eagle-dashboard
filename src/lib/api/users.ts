// lib/api/users.ts
import { User, UsersResponse, UsersParams } from '@/types/users';

// Mock data for demonstration
const mockUsers: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: `user-${i + 1}`,
  email: `user${i + 1}@example.com`,
  firstName: `FirstName${i + 1}`,
  lastName: `LastName${i + 1}`,
  status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'suspended',
  emailVerified: i % 4 !== 0,
  phone: i % 2 === 0 ? `+1-555-${String(i + 1).padStart(4, '0')}` : undefined,
  company: i % 3 === 0 ? `Company ${Math.floor(i / 3) + 1}` : undefined,
  preferences: {
    notifications: {
      email: true,
      sms: i % 2 === 0,
      push: i % 3 === 0,
    },
    language: 'en',
    timezone: 'UTC',
  },
  kycStatus: i % 3 === 0 ? 'verified' : i % 3 === 1 ? 'pending' : 'rejected',
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
  lastLogin: i % 5 !== 0 ? new Date(Date.now() - i * 3600000).toISOString() : undefined,
}));

export class UsersService {
  static async getUsers(params: UsersParams = {}): Promise<UsersResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const {
      page = 1,
      pageSize = 10,
      search = '',
      status = '',
      kycStatus = '',
      sort = 'createdAt_desc',
    } = params;

    let filteredUsers = [...mockUsers];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.company?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }

    // Apply KYC status filter
    if (kycStatus) {
      filteredUsers = filteredUsers.filter(user => user.kycStatus === kycStatus);
    }

    // Apply sorting
    const [sortField, sortOrder] = sort.split('_');
    filteredUsers.sort((a, b) => {
      let aValue: any = a[sortField as keyof User];
      let bValue: any = b[sortField as keyof User];

      if (sortField === 'name') {
        aValue = `${a.firstName} ${a.lastName}`;
        bValue = `${b.firstName} ${b.lastName}`;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      totalCount: filteredUsers.length,
      page,
      pageSize,
      totalPages: Math.ceil(filteredUsers.length / pageSize),
    };
  }

  static async getUser(id: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.id === id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async createUser(data: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: `user-${mockUsers.length + 1}`,
      email: data.email || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      status: 'active',
      emailVerified: false,
      preferences: {
        notifications: { email: true, sms: false, push: false },
        language: 'en',
        timezone: 'UTC',
      },
      kycStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    
    mockUsers.unshift(newUser);
    return newUser;
  }

  static async updateUser(id: string, data: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    return mockUsers[userIndex];
  }
}