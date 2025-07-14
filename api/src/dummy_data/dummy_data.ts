export const mockTags = [
  { id: 1, label: 'Piano', color: '#FF5733', createdAt: new Date() },
  { id: 2, label: 'Sight Reading', color: '#33FF57', createdAt: new Date() },
  { id: 3, label: 'Scales', color: '#3357FF', createdAt: new Date() },
  { id: 4, label: 'Guitar', color: '#FF33A8', createdAt: new Date() },
];

export const mockMusicians = [
  {
    id: 1,
    googleId: null,
    displayName: 'John Doe',
    givenName: 'John',
    familyName: 'Doe',
    email: 'john@example.com',
    bio: 'Pianist and teacher.',
    avatarUrl: null,
    totalSessions: 5,
    totalPracticeSeconds: 450,
    totalGasUpsGiven: 3,
    totalGasUpsReceived: 5,
    createdAt: new Date(),
  },
  {
    id: 2,
    googleId: null,
    displayName: 'Jane Smith',
    givenName: 'Jane',
    familyName: 'Smith',
    email: 'jane@example.com',
    bio: 'Jazz enthusiast.',
    avatarUrl: null,
    totalSessions: 4,
    totalPracticeSeconds: 300,
    totalGasUpsGiven: 2,
    totalGasUpsReceived: 4,
    createdAt: new Date(),
  },
];

export const mockSessions = [
  {
    id: 1,
    title: 'Morning Practice',
    notes: 'Worked on arpeggios.',
    instruments: ['Piano'],
    duration: 60,
    isPublic: true,
    createdAt: new Date(),
    musicianId: 1,
  },
  {
    id: 2,
    title: 'Evening Jam',
    notes: 'Improvisation and theory.',
    instruments: ['Guitar'],
    duration: 75,
    isPublic: false,
    createdAt: new Date(),
    musicianId: 2,
  },
];

export const mockTaskDefinitions = [
  {
    id: 1,
    title: 'Warmup Routine',
    musicianId: 1,
    description: 'Major/minor scales and arpeggios',
    checklist: ['C major', 'G major', 'A minor'],
    savedCount: 12,
    usedCount: 5,
    createdAt: new Date(),
  },
];

export const mockTasksInUse = [
  {
    id: 1,
    createdAt: new Date(),
    duration: 45,
    notes: 'Focused on technique.',
    isSessionTask: true,
    checklistCompletions: ['C major', 'G major'],
    taskDefinitionId: 1,
    musicianId: 1,
    sessionId: 1,
  },
];

export const mockMedia = [
  {
    id: 1,
    musicianId: 1,
    url: 'https://example.com/video.mp4',
    type: 'video',
    sessionId: null,
  },
];

export const mockGasUps = [
  {
    id: 1,
    musicianId: 2,
    sessionId: 1,
  },
];

export const mockComments = [
  {
    id: 1,
    text: 'Great improvement!',
    createdAt: new Date(),
    musicianId: 2,
    sessionId: 1,
  },
];
