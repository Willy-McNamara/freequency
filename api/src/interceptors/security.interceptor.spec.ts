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
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          body: {},
          query: {},
          params: {},
          url: '/test',
          headers: {},
          ip: '127.0.0.1',
          connection: { remoteAddress: '127.0.0.1' },
        }),
      }),
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({})),
    } as any;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should allow normal text content', () => {
    const request = {
      body: { title: 'Normal Task Title', description: 'Simple description' },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should allow HTML content with CSS classes', () => {
    const request = {
      body: {
        title: 'Soloing with an ear focus',
        description:
          '<p class="leading-7 [&amp;:not(:first-child)]:mt-6" dir="ltr"><i><em class="italic" style="white-space: pre-wrap;">See parent task for prerequisite exercises.</em></i></p><p class="leading-7 [&amp;:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Execute this progression on memorized repertoire to begin exploring solo ideas that stem from your ear (instead of coming from your technique, or ideas that live </span><i><em class="italic" style="white-space: pre-wrap;">in your hands</em></i><span style="white-space: pre-wrap;"> so to speak - automatic actions that are more motivated by convenience and muscle memory as opposed to creative inspiration). </span><br><br><span style="white-space: pre-wrap;">Credit for this system to David Berkman (see </span><i><em class="italic" style="white-space: pre-wrap;">The Jazz Musician\'s Guide to Creative Practicing</em></i><span style="white-space: pre-wrap;">)</span></p>',
        instrument: 'piano',
        checklist: [
          'Play through roots (or chords) and sing improvised melodies over them',
        ],
        tags: ['piano', 'repertoire', 'soloing'],
        parentTaskId: 15,
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should allow book titles and academic references', () => {
    const request = {
      body: {
        title: 'Academic Task',
        description:
          "Reference: The Jazz Musician's Guide to Creative Practicing by David Berkman",
        instrument: 'piano',
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should allow CSS pseudo-selectors and modern CSS syntax', () => {
    const request = {
      body: {
        title: 'CSS Test Task',
        description:
          '<div class="[&:not(:first-child)]:mt-6 [&:hover]:bg-blue-500">CSS with modern syntax</div>',
        instrument: 'piano',
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should block actual script tags', () => {
    const request = {
      body: {
        title: 'Malicious Task',
        description: '<script>alert("xss")</script>',
        instrument: 'piano',
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow(BadRequestException);
    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow('Content contains potentially unsafe HTML elements');
  });

  it('should block javascript: URLs', () => {
    const request = {
      body: {
        title: 'Malicious Task',
        description: '<a href="javascript:alert(\'xss\')">Click me</a>',
        instrument: 'piano',
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow(BadRequestException);
    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow('Content contains potentially unsafe URLs');
  });

  it('should block actual event handlers', () => {
    const request = {
      body: {
        title: 'Malicious Task',
        description: '<div onclick="alert(\'xss\')">Click me</div>',
        instrument: 'piano',
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow(BadRequestException);
    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow('Content contains potentially unsafe HTML attributes');
  });

  it('should block SQL injection attempts', () => {
    const request = {
      body: {
        title: 'Malicious Task',
        description: 'SELECT * FROM users; DROP TABLE users;',
        instrument: 'piano',
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow(BadRequestException);
    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow('Content contains potentially unsafe SQL patterns');
  });

  it('should block UNION SELECT attacks', () => {
    const request = {
      body: {
        title: 'Malicious Task',
        description: 'UNION SELECT username, password FROM users',
        instrument: 'piano',
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow(BadRequestException);
    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).toThrow('Content contains potentially unsafe SQL patterns');
  });

  it('should allow legitimate text with SQL-like words', () => {
    const request = {
      body: {
        title: 'Database Task',
        description:
          'This task involves selecting the right notes and creating beautiful music. We need to insert some practice time and update our skills.',
        instrument: 'piano',
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should handle nested objects correctly', () => {
    const request = {
      body: {
        title: 'Nested Task',
        metadata: {
          description:
            '<p class="[&:not(:first-child)]:mt-6">Nested description</p>',
          tags: ['piano', 'advanced'],
        },
        instrument: 'piano',
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should handle query parameters', () => {
    const request = {
      body: {},
      query: { filter: 'piano', sort: 'date' },
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should handle URL parameters', () => {
    const request = {
      body: {},
      query: {},
      params: { id: '123', type: 'task' },
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should handle null and undefined values gracefully', () => {
    const request = {
      body: null,
      query: undefined,
      params: null,
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should handle empty objects', () => {
    const request = {
      body: {},
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should call next handler after sanitization', () => {
    const request = {
      body: { title: 'Test Task', description: 'Test description' },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    interceptor.intercept(mockExecutionContext, mockCallHandler);

    expect(mockCallHandler.handle).toHaveBeenCalled();
  });

  it('should handle the exact task creation request that was failing', () => {
    const request = {
      body: {
        title: 'Soloing with an ear focus',
        description:
          '<p class="leading-7 [&amp;:not(:first-child)]:mt-6" dir="ltr"><i><em class="italic" style="white-space: pre-wrap;">See parent task for prerequisite exercises.</em></i></p><p class="leading-7 [&amp;:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Execute this progression on memorized repertoire to begin exploring solo ideas that stem from your ear (instead of coming from your technique, or ideas that live </span><i><em class="italic" style="white-space: pre-wrap;">in your hands</em></i><span style="white-space: pre-wrap;"> so to speak - automatic actions that are more motivated by convenience and muscle memory as opposed to creative inspiration). </span><br><br><span style="white-space: pre-wrap;">Credit for this system to David Berkman (see </span><i><em class="italic" style="white-space: pre-wrap;">The Jazz Musician\'s Guide to Creative Practicing</em></i><span style="white-space: pre-wrap;">)</span></p>',
        instrument: 'piano',
        checklist: [
          'Play through roots (or chords) and sing improvised melodies over them',
          'Sing the roots and add ornamentation (small solo lines) around them (also singing)',
          'Repeat singing roots + ornamentation, but now visualize the solo lines on the piano',
          'For a few bars at a time, play the changes and sing a melody. Play those bars again, now attempting to pick out the melody you just sang',
          'If you make a mistake, find the correct scale degrees for that mini line over that chord. Find (sing) that line over every chord in the tune.',
        ],
        tags: ['piano', 'repertoire', 'soloing'],
        parentTaskId: 15,
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    // This should NOT throw an exception anymore
    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should allow session notes with rich text content', () => {
    const request = {
      body: {
        title: 'Jazz Standards Practice Session',
        notes:
          '<p class="leading-7 [&amp;:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working on the Miles Davis classic "So What". The modal approach is really freeing. I focused on </span><i><em class="italic" style="white-space: pre-wrap;">listening to the changes</em></i><span style="white-space: pre-wrap;"> and </span><i><em class="italic" style="white-space: pre-wrap;">playing with space</em></i><span style="white-space: pre-wrap;">. Used the checklist to stay organized.</span></p>',
        instruments: ['piano'],
        tags: ['jazz', 'repertoire'],
        duration: 2400,
        isPublic: true,
        musicianId: 1,
        tasks: [],
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    // Session notes should work with rich text
    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });

  it('should allow task notes within sessions', () => {
    const request = {
      body: {
        title: 'Practice Session with Tasks',
        notes: 'General session notes here',
        instruments: ['guitar'],
        tags: ['practice'],
        duration: 1800,
        isPublic: true,
        musicianId: 1,
        tasks: [
          {
            id: 1,
            title: 'Alternate Picking Exercise',
            notes:
              '<p class="leading-7 [&amp;:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">I worked on alternate picking with both open strings and chord shapes underneath. The checklist was helpful for keeping my practice structured. I noticed my picking hand is getting more relaxed, but string crossing still needs work.</span></p>',
            timeSpent: 900,
            checklist: [
              { item: 'Start slow with metronome', checked: true },
              { item: 'Focus on string crossing', checked: false },
              { item: 'Increase tempo gradually', checked: true },
            ],
            tags: ['guitar', 'technique'],
          },
        ],
      },
      query: {},
      params: {},
    };
    (mockExecutionContext.switchToHttp() as any).getRequest.mockReturnValue(
      request,
    );

    // Task notes within sessions should work with rich text
    expect(() =>
      interceptor.intercept(mockExecutionContext, mockCallHandler),
    ).not.toThrow();
  });
});
