import { Test, TestingModule } from '@nestjs/testing';
import { ShortcodeService } from './shortcode.service';
import { MongodbService } from './mongodb.service';
import * as crypto from 'crypto';
import { Redis } from 'ioredis';


jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
    })),
  };
});

describe('ShortcodeService', () => {
  let service: ShortcodeService;
  let redisMock: jest.Mocked<Redis>;
  let mongoDBMock: jest.Mocked<MongodbService>;

  beforeEach(async () => {
    redisMock = new Redis() as jest.Mocked<Redis>;
    mongoDBMock = {
      storeMapping: jest.fn() as jest.MockedFunction<typeof mongoDBMock.storeMapping>,
      getMapping: jest.fn() as jest.MockedFunction<typeof mongoDBMock.getMapping>,
      updateStats: jest.fn() as jest.MockedFunction<typeof mongoDBMock.updateStats>,
      getStats: jest.fn() as jest.MockedFunction<typeof mongoDBMock.getStats>,
    } as unknown as jest.Mocked<MongodbService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortcodeService,
        {
          provide: Redis,
          useValue: redisMock,
        },
        {
          provide: MongodbService,
          useValue: mongoDBMock,
        },
      ],
    }).compile();

    service = module.get<ShortcodeService>(ShortcodeService);
  });

  describe('random', () => {
    it('should return a number less than the max value', () => {
      const max = 10;
      const result = service.random(max);
      expect(result).toBeLessThan(max);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateShortCode', () => {
    it('should handle errors during code generation', async () => {
      // Замокируем метод random, чтобы он выбрасывал ошибку
      jest.spyOn(service, 'random').mockImplementation(() => {
        throw new Error('Random error');
      });
  
      await expect(service.generateShortCode(6)).rejects.toThrow('Error on generateShortCode: Error: Random error');
    });
  });

  describe('createUniqueCode', () => {
    it('should create a unique code', async () => {
      jest.spyOn(service, 'generateShortCode').mockResolvedValue('uniqueCode');
      redisMock.get.mockResolvedValue(null);
      const result = await service.createUniqueCode();
      expect(result).toBe('uniqueCode');
    });

    it('should retry generating a code if the generated code already exists in Redis', async () => {
      jest.spyOn(service, 'generateShortCode').mockResolvedValueOnce('existingCode').mockResolvedValueOnce('uniqueCode');
      redisMock.get.mockResolvedValueOnce('exists').mockResolvedValueOnce(null);
      const result = await service.createUniqueCode();
      expect(result).toBe('uniqueCode');
    });

    it('should handle errors during code creation', async () => {
      jest.spyOn(service, 'generateShortCode').mockImplementation(() => {
        throw new Error('Generation error');
      });
      await expect(service.createUniqueCode()).rejects.toThrow('Error on createUniqueCode: Error: Generation error');
    });
  });

  describe('createMapping', () => {
    it('should create a new mapping if shortcode does not exist in Redis', async () => {
      redisMock.get.mockResolvedValue(null);
      mongoDBMock.storeMapping.mockResolvedValue(true);
      const result = await service.createMapping('shortcode', 'longUrl');
      expect(result).toBe(true);
    });

    it('should not create a new mapping if shortcode already exists in Redis', async () => {
      redisMock.get.mockResolvedValue('someUrl');
      const result = await service.createMapping('shortcode', 'longUrl');
      expect(result).toBe(false);
    });

    it('should handle errors during mapping creation', async () => {
      redisMock.get.mockResolvedValue(null);
      mongoDBMock.storeMapping.mockImplementation(() => {
        throw new Error('Store Mapping error');
      });
      await expect(service.createMapping('shortcode', 'longUrl')).rejects.toThrow('Error on createMapping: Error: Store Mapping error');
    });
  });

  describe('getMappedUrl', () => {
    it('should return the URL from Redis if available', async () => {
      redisMock.get.mockResolvedValue('longUrl');
      const result = await service.getMappedUrl('shortcode');
      expect(result).toBe('longUrl');
    });

    it('should return the URL from MongoDB if not found in Redis', async () => {
      redisMock.get.mockResolvedValue(null);
      mongoDBMock.getMapping.mockResolvedValue('longUrl');
      const result = await service.getMappedUrl('shortcode');
      expect(result).toBe('longUrl');
    });

    it('should return null if URL not found in Redis or MongoDB', async () => {
      redisMock.get.mockResolvedValue(null);
      mongoDBMock.getMapping.mockResolvedValue(null);
      const result = await service.getMappedUrl('shortcode');
      expect(result).toBeNull();
    });

    it('should handle errors during URL retrieval', async () => {
      redisMock.get.mockImplementation(() => {
        throw new Error('Redis error');
      });
      await expect(service.getMappedUrl('shortcode')).rejects.toThrow('Error on getMappedUrl: Error: Redis error');
    });
  });

  describe('updateStats', () => {
    it('should call mongoDB to update stats', async () => {
      mongoDBMock.updateStats.mockResolvedValue();
      await service.updateStats('shortcode');
      expect(mongoDBMock.updateStats).toHaveBeenCalledWith('shortcode');
    });

    it('should handle errors during stats update', async () => {
      mongoDBMock.updateStats.mockImplementation(() => {
        throw new Error('Update Stats error');
      });
      await expect(service.updateStats('shortcode')).rejects.toThrow('Error on updateStats: Error: Update Stats error');
    });
  });

  describe('getStats', () => {
    it('should return stats from mongoDB', async () => {
      mongoDBMock.getStats.mockResolvedValue('stats');
      const result = await service.getStats('shortcode');
      expect(result).toBe('stats');
    });

    it('should handle errors during stats retrieval', async () => {
      mongoDBMock.getStats.mockImplementation(() => {
        throw new Error('Get Stats error');
      });
      await expect(service.getStats('shortcode')).rejects.toThrow('Error on getStats: Error: Get Stats error');
    });
  });
});
