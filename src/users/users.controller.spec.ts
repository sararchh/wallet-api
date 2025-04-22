import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        balance: new Decimal(100.0),
      };

      const createdUser = {
        id: 1,
        email: 'test@example.com',
        balance: new Decimal(100.0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });

    it('should throw an error when user creation fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        balance: new Decimal(100.0),
      };

      jest.spyOn(usersService, 'create').mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createUserDto)).rejects.toThrow(
        new HttpException(
          'Failed to create user: Database error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return all users successfully', async () => {
      const users = [
        {
          id: 1,
          email: 'test1@example.com',
          balance: new Decimal(100.0),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: 'test2@example.com',
          balance: new Decimal(200.0),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(usersService, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();
      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should throw an error when finding all users fails', async () => {
      jest.spyOn(usersService, 'findAll').mockRejectedValue(new Error('Database error'));

      await expect(controller.findAll()).rejects.toThrow(
        new HttpException(
          'Failed to find users: Database error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by ID successfully', async () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        balance: new Decimal(100.0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await controller.findOne('1');
      expect(usersService.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(user);
    });

    it('should throw not found when user does not exist', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne('1')).rejects.toThrow(
        new HttpException('Failed to find user: User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw an error when finding user fails', async () => {
      jest.spyOn(usersService, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(controller.findOne('1')).rejects.toThrow(
        new HttpException(
          'Failed to find user: Database error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'updated@example.com',
        balance: new Decimal(150.0),
      };
      const updatedUser = {
        id: 1,
        email: 'updated@example.com',
        balance: new Decimal(150.0),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);
      expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should throw an error when update fails', async () => {
      const updateUserDto: UpdateUserDto = { email: 'updated@example.com' };
      jest.spyOn(usersService, 'update').mockRejectedValue(new Error('Database error'));

      await expect(controller.update('1', updateUserDto)).rejects.toThrow(
        new HttpException(
          'Failed to update user: Database error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const deletedUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedpassword',
        balance: new Decimal(100.0),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(usersService, 'remove').mockResolvedValue(deletedUser);

      const result = await controller.remove('1');
      expect(usersService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'User with id 1 deleted successfully' });
    });

    it('should throw an error when deletion fails', async () => {
      jest.spyOn(usersService, 'remove').mockRejectedValue(new Error('Database error'));

      await expect(controller.remove('1')).rejects.toThrow(
        new HttpException(
          'Failed to delete user: Database error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });
});
