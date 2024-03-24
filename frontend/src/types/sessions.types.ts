export type FrontendSessionDto = {
  id: number;
  title: string;
  notes: string;
  instruments: string[];
  duration: number;
  isPublic: boolean;
  takeId: string;
  createdAt: Date;
  musicianId: number;
  musicianDisplayname: string;
  musicianProfilePictureUrl: string;
  gasUps: GasUpDto[];
  comments: CommentDto[];
  media: FrontendMedia;
};

export type FrontendMedia = {
  url: string;
  type: string;
};

export type GasUpDto = {
  id: number;
  musicianId: number;
  sessionId: number;
  musician: SubMusicianDto;
};

export type NewGasUpDto = {
  musicianId: number;
  sessionId: number;
};

export type CommentDto = {
  id: number;
  text: string;
  createdAt: Date;
  musicianId: number;
  sessionId: number;
  musician: SubMusicianDto;
};

export type SubMusicianDto = {
  profilePictureUrl: string;
  displayName: string;
};

export type AddCommentDto = {
  text: string;
  sessionId: number;
};

// Mock comments
export const mockComments: CommentDto[] = [
  {
    id: 1,
    text: 'Great performance!',
    createdAt: new Date(),
    musicianId: 101,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician1',
    },
  },
  {
    id: 2,
    text: 'Awesome music!',
    createdAt: new Date(),
    musicianId: 102,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician2',
    },
  },
  {
    id: 3,
    text: 'Really enjoyed the show!',
    createdAt: new Date(),
    musicianId: 103,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician3',
    },
  },
  {
    id: 4,
    text: 'Fantastic performance!',
    createdAt: new Date(),
    musicianId: 104,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician4',
    },
  },
  {
    id: 5,
    text: 'You guys rock!',
    createdAt: new Date(),
    musicianId: 105,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician4',
    },
  },
];

export const mockComment = {
  id: 6,
  text: 'I am the new comment',
  createdAt: new Date(),
  musicianId: 105,
  sessionId: 201,
  musician: {
    profilePictureUrl: 'https://example.com/musician1.jpg',
    displayName: 'Musician6',
  },
};

export const dummyGasUps: GasUpDto[] = [
  {
    id: 1,
    musicianId: 101,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician1',
    },
  },
  {
    id: 2,
    musicianId: 102,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician2',
    },
  },
  {
    id: 3,
    musicianId: 103,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician3',
    },
  },
  {
    id: 4,
    musicianId: 104,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician4',
    },
  },
  {
    id: 5,
    musicianId: 105,
    sessionId: 201,
    musician: {
      profilePictureUrl: 'https://example.com/musician1.jpg',
      displayName: 'Musician5',
    },
  },
];

export const dummyGasUp = {
  id: 6,
  musicianId: 105,
  sessionId: 201,
  musician: {
    profilePictureUrl: 'https://example.com/musician1.jpg',
    displayName: 'Musician6',
  },
};

export const dummySession: FrontendSessionDto = {
  id: 1,
  title: 'Session 1',
  notes: 'This is a session',
  instruments: [],
  duration: 60,
  isPublic: true,
  takeId: 'take1',
  createdAt: new Date(),
  musicianId: 101,
  musicianDisplayname: 'Musician1',
  musicianProfilePictureUrl: 'https://example.com/musician1.jpg',
  gasUps: dummyGasUps,
  comments: mockComments,
};
