import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { SecurityInterceptor } from './security.interceptor';
import { of } from 'rxjs';

describe('SecurityInterceptor', () => {
  let interceptor: SecurityInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityInterceptor],
    }).compile();

    interceptor = module.get<SecurityInterceptor>(SecurityInterceptor);
  });

  beforeEach(() => {
    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          body: {},
          query: {},
          params: {},
          url: '/test',
          headers: {},
          ip: '127.0.0.1',
        }),
      }),
    } as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn(() => of({})),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should allow normal requests to pass through', () => {
    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);
    result.subscribe();
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should sanitize request body', () => {
    const request = {
      body: { name: 'test<script>alert("xss")</script>' },
      query: {},
      params: {},
      url: '/test',
      headers: {},
      ip: '127.0.0.1',
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    expect(() => {
      interceptor.intercept(mockExecutionContext, mockCallHandler);
    }).toThrow(BadRequestException);
  });

  it('should sanitize query parameters', () => {
    const request = {
      body: {},
      query: { search: 'test UNION SELECT * FROM users' },
      params: {},
      url: '/test',
      headers: {},
      ip: '127.0.0.1',
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    expect(() => {
      interceptor.intercept(mockExecutionContext, mockCallHandler);
    }).toThrow(BadRequestException);
  });

  it('should sanitize URL parameters', () => {
    const request = {
      body: {},
      query: {},
      params: { id: '1 OR 1=1' },
      url: '/test',
      headers: {},
      ip: '127.0.0.1',
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    expect(() => {
      interceptor.intercept(mockExecutionContext, mockCallHandler);
    }).toThrow(BadRequestException);
  });

  it('should handle nested objects', () => {
    const request = {
      body: {
        user: {
          name: 'test',
          bio: 'normal text',
        },
      },
      query: {},
      params: {},
      url: '/test',
      headers: {},
      ip: '127.0.0.1',
    };

    mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);
    result.subscribe();
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should detect XSS patterns', () => {
    const xssPatterns = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      'onclick=alert("xss")',
      '<iframe src="javascript:alert(\'xss\')"></iframe>',
    ];

    xssPatterns.forEach((pattern) => {
      const request = {
        body: { content: pattern },
        query: {},
        params: {},
        url: '/test',
        headers: {},
        ip: '127.0.0.1',
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      expect(() => {
        interceptor.intercept(mockExecutionContext, mockCallHandler);
      }).toThrow(BadRequestException);
    });
  });

  it('should detect SQL injection patterns', () => {
    const sqlPatterns = [
      'UNION SELECT * FROM users',
      '1 OR 1=1',
      'DROP TABLE users',
      'EXEC xp_cmdshell',
    ];

    sqlPatterns.forEach((pattern) => {
      const request = {
        body: { query: pattern },
        query: {},
        params: {},
        url: '/test',
        headers: {},
        ip: '127.0.0.1',
      };

      mockExecutionContext = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      expect(() => {
        interceptor.intercept(mockExecutionContext, mockCallHandler);
      }).toThrow(BadRequestException);
    });
  });
});
