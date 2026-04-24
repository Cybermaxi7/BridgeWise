import { optimizedApi } from '../../src/services/optimized-api';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Optimized API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    optimizedApi.clearCache();
  });

  describe('request caching', () => {
    it('should cache GET requests', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockedAxios.mockResolvedValueOnce({ data: mockData });

      // First request
      const result1 = await optimizedApi.get('/test');
      expect(result1).toEqual(mockData);
      expect(mockedAxios).toHaveBeenCalledTimes(1);

      // Second request should use cache
      const result2 = await optimizedApi.get('/test');
      expect(result2).toEqual(mockData);
      expect(mockedAxios).toHaveBeenCalledTimes(1); // Still called once
    });

    it('should not cache POST requests', async () => {
      const mockData = { success: true };
      mockedAxios.mockResolvedValue({ data: mockData });

      // First POST request
      await optimizedApi.post('/test', { data: 'test' });
      expect(mockedAxios).toHaveBeenCalledTimes(1);

      // Second POST request should make new call
      await optimizedApi.post('/test', { data: 'test' });
      expect(mockedAxios).toHaveBeenCalledTimes(2);
    });

    it('should handle cache expiry', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockedAxios.mockResolvedValue({ data: mockData });

      // Request with 1ms cache time
      await optimizedApi.request({ 
        method: 'GET', 
        url: '/test' 
      }, 1);

      expect(mockedAxios).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 2));

      // Next request should make new call
      await optimizedApi.request({ 
        method: 'GET', 
        url: '/test' 
      }, 1);

      expect(mockedAxios).toHaveBeenCalledTimes(2);
    });
  });

  describe('request deduplication', () => {
    it('should deduplicate identical requests', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockedAxios.mockResolvedValue({ data: mockData });

      // Make two identical requests simultaneously
      const [result1, result2] = await Promise.all([
        optimizedApi.get('/test'),
        optimizedApi.get('/test')
      ]);

      expect(result1).toEqual(mockData);
      expect(result2).toEqual(mockData);
      expect(mockedAxios).toHaveBeenCalledTimes(1); // Only one actual request
    });
  });

  describe('batch requests', () => {
    it('should handle multiple requests in batch', async () => {
      const mockData1 = { id: 1, name: 'Test 1' };
      const mockData2 = { id: 2, name: 'Test 2' };
      
      mockedAxios
        .mockResolvedValueOnce({ data: mockData1 })
        .mockResolvedValueOnce({ data: mockData2 });

      const results = await optimizedApi.batchRequest([
        { config: { method: 'GET', url: '/test1' } },
        { config: { method: 'GET', url: '/test2' } }
      ]);

      expect(results).toEqual([mockData1, mockData2]);
      expect(mockedAxios).toHaveBeenCalledTimes(2);
    });

    it('should handle batch request failures', async () => {
      const mockData = { id: 1, name: 'Test' };
      const error = new Error('Request failed');
      
      mockedAxios
        .mockResolvedValueOnce({ data: mockData })
        .mockRejectedValueOnce(error);

      await expect(
        optimizedApi.batchRequest([
          { config: { method: 'GET', url: '/test1' } },
          { config: { method: 'GET', url: '/test2' } }
        ])
      ).rejects.toThrow('Request failed');
    });
  });

  describe('cache management', () => {
    it('should clear cache correctly', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockedAxios.mockResolvedValue({ data: mockData });

      // Make request to populate cache
      await optimizedApi.get('/test');
      expect(mockedAxios).toHaveBeenCalledTimes(1);

      // Clear cache
      optimizedApi.clearCache();

      // Make same request again
      await optimizedApi.get('/test');
      expect(mockedAxios).toHaveBeenCalledTimes(2); // Should make new request
    });

    it('should clear cache by pattern', async () => {
      const mockData1 = { id: 1, name: 'Test 1' };
      const mockData2 = { id: 2, name: 'Test 2' };
      
      mockedAxios.mockResolvedValue({ data: mockData1 });

      // Make requests to populate cache
      await optimizedApi.get('/api/test1');
      await optimizedApi.get('/api/test2');

      expect(mockedAxios).toHaveBeenCalledTimes(2);

      // Clear cache with pattern
      optimizedApi.clearCache('/api/test1');

      // Reset mock
      mockedAxios.mockResolvedValue({ data: mockData2 });

      // Request test1 again (should make new call)
      await optimizedApi.get('/api/test1');
      expect(mockedAxios).toHaveBeenCalledTimes(3);

      // Request test2 (should use cache)
      await optimizedApi.get('/api/test2');
      expect(mockedAxios).toHaveBeenCalledTimes(3); // Still 3
    });
  });

  describe('cache statistics', () => {
    it('should return correct cache stats', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockedAxios.mockResolvedValue({ data: mockData });

      // Initial stats
      let stats = optimizedApi.getCacheStats();
      expect(stats.size).toBe(0);
      expect(stats.pendingRequests).toBe(0);

      // Make request
      const promise = optimizedApi.get('/test');
      
      // Stats during request
      stats = optimizedApi.getCacheStats();
      expect(stats.pendingRequests).toBe(1);

      // Wait for completion
      await promise;

      // Stats after request
      stats = optimizedApi.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.pendingRequests).toBe(0);
    });
  });

  describe('preloading', () => {
    it('should preload data successfully', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockedAxios.mockResolvedValue({ data: mockData });

      await optimizedApi.preload({ method: 'GET', url: '/test' });

      expect(mockedAxios).toHaveBeenCalledTimes(1);

      // Subsequent request should use cache
      await optimizedApi.get('/test');
      expect(mockedAxios).toHaveBeenCalledTimes(1); // Still 1
    });
  });
});
