export type FrontendSessionDto = {
  id: number;
  title: string;
  notes: string;
  duration: number;
  isPublic: boolean;
  takeId: string;
  createdAt: Date;
  musicianId: number;
  musicianDisplayname: string;
  gasUps: GasUpDto[];
  comments: CommentDto[];
};

export type GasUpDto = {
  id: number;
  musicianId: number;
  sessionId: number;
};

export type CommentDto = {
  id: number;
  text: string;
  createdAt: Date;
  musicianId: number;
  sessionId: number;
};

export type xCommentDto = {
  id: number;
  text: string;
  createdAt: Date;
  musicianId: number;
  sessionId: number;
  musicianProfilePhotoUrl: string; // New field
  musicianDisplayName: string; // New field
};

// Mock comments
export const mockComments: xCommentDto[] = [
  {
    id: 1,
    text: 'Great performance!',
    createdAt: new Date(),
    musicianId: 101,
    sessionId: 201,
    musicianProfilePhotoUrl: 'https://example.com/musician1.jpg',
    musicianDisplayName: 'Musician1',
  },
  {
    id: 2,
    text: 'Awesome music!',
    createdAt: new Date(),
    musicianId: 102,
    sessionId: 201,
    musicianProfilePhotoUrl: 'https://example.com/musician2.jpg',
    musicianDisplayName: 'Musician2',
  },
  {
    id: 3,
    text: 'Really enjoyed the show!',
    createdAt: new Date(),
    musicianId: 103,
    sessionId: 201,
    musicianProfilePhotoUrl: 'https://example.com/musician3.jpg',
    musicianDisplayName: 'Musician3',
  },
  {
    id: 4,
    text: 'Fantastic performance!',
    createdAt: new Date(),
    musicianId: 104,
    sessionId: 201,
    musicianProfilePhotoUrl: 'https://example.com/musician4.jpg',
    musicianDisplayName: 'Musician4',
  },
  {
    id: 5,
    text: 'You guys rock!',
    createdAt: new Date(),
    musicianId: 105,
    sessionId: 201,
    musicianProfilePhotoUrl: 'https://example.com/musician5.jpg',
    musicianDisplayName: 'Musician5',
  },
];

export const mockComment = {
  id: 6,
  text: 'I am the new comment',
  createdAt: new Date(),
  musicianId: 105,
  sessionId: 201,
  musicianProfilePhotoUrl: 'https://example.com/musician5.jpg',
  musicianDisplayName: 'Musician6',
};
