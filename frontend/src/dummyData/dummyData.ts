type Member = {
  memberId: string;
  memberUsername: string;
  memberAvatarId: string;
  memberEmail: string;
  memberPassword: string;
  memberSince: Date;
  memberTotalSessions: number;
  memberTotalPracticeMinutes: number;
  memberTotalGasUpsGiven: number;
  memberTotalGasUpsRecieved: number;
  memberLongestStreak: number;
  memberCurrentStreak: number;
};

const dummyMemberOne: Member = {
  memberId: 'member1',
  memberUsername: 'dummyMember1',
  memberAvatarId: '1',
  memberEmail: 'dummy@email.com',
  memberPassword: 'passw0rd',
  memberSince: new Date(),
  memberTotalSessions: 8,
  memberTotalPracticeMinutes: 100,
  memberTotalGasUpsGiven: 3,
  memberTotalGasUpsRecieved: 4,
  memberLongestStreak: 4,
  memberCurrentStreak: 2,
};

type Session = {
  sessionId: string;
  memberID: string;
  sessionTitle: string;
  sessionDuration: number;
  sessionNotes: string;
  sessionPublic: boolean;
  sessionTakeID: string;
  sessionDateTime: Date;
};

const dummySessionOne: Session = {
  sessionId: 'session1',
  memberID: '1',
  sessionTitle: 'dummySession1',
  sessionDuration: 20,
  sessionNotes: 'Notes from dummySession1',
  sessionPublic: true,
  sessionTakeID: 'takeId1',
  sessionDateTime: new Date(),
};

type Post = {
  postId: string;
  memberId: string;
  sessionId: string;
  postComments: string[];
  postGasUps: number;
  postGasUpMemberIds: string[];
};

const dummyPostOne: Post = {
  postId: 'post1',
  memberId: 'member1',
  sessionId: 'session1',
  postComments: ['comment1', 'comment2'],
  postGasUps: 2,
  postGasUpMemberIds: ['member2', 'member3'],
};

/*
Comments will need their own schema
Gas ups will too, if you want to display who liked it on hover..
  -> for this could also just save the userNames of the likers direclty to the post...?
  would need to be able to determine if the user has already liked the post..
*/

/*
Looking at my wireframes, I am create an ideal data shape for the frontend to recieve.
This would be some combination of data from the above schemas, processed on the backend
... though perhaps it would ber better to process some of this client side .. beyond my expertise atm..
*/

type feedPost = {
  username: string;
  sessionTitle: string;
  sessionDuration: number;
  sessionNotes: string;
  sessionTake: string;
  postComments: string[];
  postGasUps: number;
  postGasUpMemberIds: string[];
};

const dummyFeedPostOne: feedPost = {
  username: 'dummyMember1',
  sessionTitle: 'session1',
  sessionDuration: 20,
  sessionNotes:
    'Notes from dummySession1. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ',
  sessionTake: 'This would be some kind of media BLOB',
  postComments: ['comment1', 'comment2'],
  postGasUps: 2,
  postGasUpMemberIds: ['member2', 'member3'],
};

const dummyFeedPostTwo = {
  username: 'dummyMember2',
  sessionTitle: 'session2',
  sessionDuration: 22,
  sessionNotes:
    'Notes from dummySession2. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  sessionTake: 'This would be some kind of media BLOB',
  postComments: ['comment3', 'comment4'],
  postGasUps: 2,
  postGasUpMemberIds: ['member1', 'member3'],
};

const dummyFeed: feedPost[] = [dummyFeedPostOne, dummyFeedPostTwo];

export {
  Member,
  Session,
  Post,
  feedPost,
  dummyFeed,
  dummyMemberOne,
  dummyPostOne,
  dummySessionOne,
};
