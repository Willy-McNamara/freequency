import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { SecurityMiddleware } from './security.middleware';

describe('SecurityMiddleware', () => {
  let middleware: SecurityMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityMiddleware],
    }).compile();

    middleware = module.get<SecurityMiddleware>(SecurityMiddleware);

    mockRequest = {};
    mockResponse = {
      setHeader: jest.fn(),
      removeHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set security headers', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Frame-Options',
      'DENY',
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff',
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'X-XSS-Protection',
      '1; mode=block',
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.any(String),
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  });

  it('should remove dangerous headers', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.removeHeader).toHaveBeenCalledWith('X-Powered-By');
    expect(mockResponse.removeHeader).toHaveBeenCalledWith('Server');
  });

  it('should call next()', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
