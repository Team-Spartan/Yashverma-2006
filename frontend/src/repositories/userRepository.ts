import { PrismaClient, User } from '@prisma/client';
import { Role } from '../types';
import { prisma } from '../config/database';
import {
  PaginatedResult,
  parsePagination,
  buildSortObject,
  buildSearchFilter,
  buildPaginationMeta,
} from '../utils/pagination';
import { PaginationInput } from '../validators/user';

export class UserRepository {
  private db: PrismaClient;

  constructor() {
    this.db = prisma;
  }

  async findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  async findByVerifyToken(token: string): Promise<User | null> {
    return this.db.user.findFirst({ where: { verifyToken: token } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.db.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gt: new Date() } },
    });
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    verifyToken?: string;
  }): Promise<User> {
    return this.db.user.create({ data });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.db.user.update({ where: { id }, data });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return this.db.user.update({ where: { id }, data: { refreshToken } });
  }

  async delete(id: string): Promise<void> {
    await this.db.user.delete({ where: { id } });
  }

  async findAll(
    pagination: PaginationInput,
    filters: { role?: Role } = {},
  ): Promise<PaginatedResult<User>> {
    const { page, limit, skip } = parsePagination(pagination);
    const orderBy = buildSortObject(pagination.sortBy, pagination.sortOrder, [
      'email',
      'firstName',
      'lastName',
      'createdAt',
      'role',
    ]);

    const where = {
      ...filters,
      ...buildSearchFilter(pagination.search, ['email', 'firstName', 'lastName']),
    };

    const [data, total] = await Promise.all([
      this.db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.db.user.count({ where }),
    ]);

    return {
      data: data as User[],
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async count(): Promise<number> {
    return this.db.user.count();
  }
}

export const userRepository = new UserRepository();
