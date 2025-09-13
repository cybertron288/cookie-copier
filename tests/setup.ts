/**
 * Jest test setup file
 */

// Mock Chrome APIs globally
const mockChrome = {
  runtime: {
    lastError: null,
    getManifest: jest.fn(() => ({ version: '2.0.0' })),
    onInstalled: {
      addListener: jest.fn(),
    },
    onStartup: {
      addListener: jest.fn(),
    },
    onMessage: {
      addListener: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      callback([
        {
          id: 1,
          url: 'https://example.com/test',
          title: 'Test Page',
          active: true,
          windowId: 1,
        },
      ]);
    }),
  },
  cookies: {
    getAll: jest.fn((details, callback) => {
      callback([
        {
          name: 'test-cookie',
          value: 'test-value',
          domain: 'example.com',
          path: '/',
          secure: false,
          httpOnly: false,
          expirationDate: Date.now() / 1000 + 3600,
        },
      ]);
    }),
    set: jest.fn((details, callback) => {
      callback({
        name: details.name,
        value: details.value,
        domain: details.url ? new URL(details.url).hostname : details.domain,
        path: details.path || '/',
        secure: details.secure || false,
        httpOnly: details.httpOnly || false,
      });
    }),
  },
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        const mockData = {
          cookieHistory: [
            {
              domain: 'example.com',
              cookies: [
                {
                  name: 'session',
                  value: 'abc123',
                  domain: 'example.com',
                  path: '/',
                  secure: true,
                  httpOnly: true,
                },
              ],
              timestamp: Date.now() - 3600000,
            },
          ],
          settings: {
            theme: 'auto',
            maxHistoryEntries: 10,
            enableEncryption: false,
            showCookieDetails: true,
            autoCleanup: true,
            cleanupDays: 30,
          },
        };
        
        const result = typeof keys === 'string' 
          ? { [keys]: mockData[keys] }
          : keys.reduce((acc, key) => ({ ...acc, [key]: mockData[key] }), {});
        
        callback(result);
      }),
      set: jest.fn((data, callback) => {
        if (callback) callback();
      }),
      clear: jest.fn((callback) => {
        if (callback) callback();
      }),
    },
  },
};

// Assign mock to global
(global as any).chrome = mockChrome;

// Mock DOM methods that might not be available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock URL.createObjectURL for file downloads
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'blob:mock-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('mock text')),
  },
});

// Add custom matchers if needed
expect.extend({
  toBeValidCookieData(received) {
    const requiredFields = ['name', 'value'];
    const optionalFields = ['domain', 'path', 'secure', 'httpOnly', 'expirationDate'];
    
    const hasRequiredFields = requiredFields.every(field => 
      received.hasOwnProperty(field) && received[field] !== undefined
    );
    
    if (hasRequiredFields) {
      return {
        message: () => `expected ${received} not to be valid cookie data`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be valid cookie data with required fields: ${requiredFields.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Declare the custom matcher for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidCookieData(): R;
    }
  }
}