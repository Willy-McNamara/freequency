import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MAX_LENGTH = 30;
const sanitizeTagLabel = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9 _\-.,!?()'":;]/g, '')
    .slice(0, MAX_LENGTH);

async function main() {
  await prisma.gasUp.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.media.deleteMany();
  await prisma.taskInUse.deleteMany();
  await prisma.taskDefinition.deleteMany();
  await prisma.session.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.musician.deleteMany();
  await prisma.tag.deleteMany();

  // Create all instrument tags (finite list)
  const instrumentLabels = [
    'piano',
    'guitar',
    'listening',
    'violin',
    'drums',
    'flute',
    'clarinet',
    'saxophone',
    'trumpet',
    'trombone',
    'voice',
    'cello',
    'ukulele',
    'percussion',
    'double bass',
    'bass guitar',
    'oboe',
    'harp',
    'accordion',
    'banjo',
    'djing',
    'production',
  ];
  const instrumentTags = {};
  for (const label of instrumentLabels) {
    const sanitized = sanitizeTagLabel(label);
    if (!sanitized) continue;
    instrumentTags[sanitized] = await prisma.tag.upsert({
      where: { label: sanitized },
      update: {},
      create: { label: sanitized },
    });
  }

  // Create additional tags for the task definitions
  const additionalTags = [
    'musicianship',
    'repertoire',
    'jazz',
    'scales',
    'bluegrass',
  ];
  for (const label of additionalTags) {
    const sanitized = sanitizeTagLabel(label);
    if (!sanitized) continue;
    instrumentTags[sanitized] = await prisma.tag.upsert({
      where: { label: sanitized },
      update: {},
      create: { label: sanitized },
    });
  }

  // Get tag references
  const pianoTag = instrumentTags['piano'];
  const guitarTag = instrumentTags['guitar'];
  const listeningTag = instrumentTags['listening'];
  const musicianshipTag = instrumentTags['musicianship'];
  const repertoireTag = instrumentTags['repertoire'];
  const jazzTag = instrumentTags['jazz'];
  const scalesTag = instrumentTags['scales'];
  const bluegrassTag = instrumentTags['bluegrass'];

  // Create Musicians
  const baeThoven = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-bae',
      displayName: 'Bae Thoven',
      givenName: 'Bae',
      familyName: 'Thoven',
      email: 'fiveone@example.com',
      bio: 'Focused on the fundamentals, and technical mastery!',
      avatarUrl: 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=BT',
      totalSessions: 18,
      totalPracticeSeconds: 64800, // 18 hours
      totalGasUpsGiven: 12,
      totalGasUpsReceived: 15,
      instruments: {
        connect: [{ id: pianoTag.id }, { id: listeningTag.id }],
      },
    },
  });

  const moeTissart = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-moe',
      displayName: 'Moe Tissart',
      givenName: 'Moe',
      familyName: 'Tissart',
      email: 'einekleine@example.com',
      bio: "Let's expand our repertoire!",
      avatarUrl: 'https://via.placeholder.com/150/7ED321/000000?text=MT',
      totalSessions: 22,
      totalPracticeSeconds: 79200, // 22 hours
      totalGasUpsGiven: 18,
      totalGasUpsReceived: 20,
      instruments: {
        connect: [{ id: pianoTag.id }, { id: guitarTag.id }],
      },
    },
  });

  const kilometersDavis = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-kilometers',
      displayName: 'Kilometers Davis',
      givenName: 'Kilometers',
      familyName: 'Davis',
      email: 'jazzy@example.com',
      bio: 'Jazz cat with all the hip tricks',
      avatarUrl: 'https://via.placeholder.com/150/9B59B6/FFFFFF?text=KD',
      totalSessions: 25,
      totalPracticeSeconds: 90000, // 25 hours
      totalGasUpsGiven: 22,
      totalGasUpsReceived: 28,
      instruments: {
        connect: [{ id: pianoTag.id }],
      },
    },
  });

  const mandyLin = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-mandy',
      displayName: 'Mandy Lin',
      givenName: 'Mandy',
      familyName: 'Lin',
      email: 'bluegrass@example.com',
      bio: 'Learning to flat pick some bluegrass tunes!',
      avatarUrl: 'https://via.placeholder.com/150/E74C3C/FFFFFF?text=ML',
      totalSessions: 16,
      totalPracticeSeconds: 57600, // 16 hours
      totalGasUpsGiven: 14,
      totalGasUpsReceived: 16,
      instruments: {
        connect: [{ id: guitarTag.id }],
      },
    },
  });

  // Create Dev User for development
  const devUser = await prisma.musician.create({
    data: {
      googleId: 'dev-google-id',
      displayName: 'Dev User',
      givenName: 'Dev',
      familyName: 'User',
      email: 'dev@example.com',
      bio: 'Development user for testing.',
      avatarUrl: 'https://via.placeholder.com/150/808080/FFFFFF?text=DEV',
      totalSessions: 5,
      totalPracticeSeconds: 18000, // 5 hours
      totalGasUpsGiven: 3,
      totalGasUpsReceived: 4,
      instruments: {
        connect: [{ id: pianoTag.id }, { id: listeningTag.id }],
      },
    },
  });

  // Create Task Definitions for Bae Thoven
  const baeTask1 = await prisma.taskDefinition.create({
    data: {
      title: 'Listening Practice',
      description:
        'per tune you listen to, make an observation about each checklist item. "learning to improvise is learning to compose in real time. this is helped by having your own ideas about aesthetics- what you like and don\'t like, why" - ted case',
      checklist: [
        'the form',
        'the instrumentation',
        "what you liked/didn't like and why",
      ],
      savedCount: 8,
      usedCount: 12,
      musicianId: baeThoven.id,
    },
  });

  const baeTask2 = await prisma.taskDefinition.create({
    data: {
      title: 'transcription (30 mins)',
      description:
        'Set a timer and focus on a single transcription for 30 minutes',
      checklist: [
        'Matching the pitches',
        'Replicating the feel, timing',
        'At reduced tempo',
        'At tempo',
      ],
      savedCount: 5,
      usedCount: 8,
      musicianId: baeThoven.id,
    },
  });

  const baeTask3 = await prisma.taskDefinition.create({
    data: {
      title: 'transcription transposition (15 mins)',
      description:
        'Set a timer and focus on a single transcribing a transcription for 15 minutes',
      checklist: [
        'Understand the song form',
        'Sing the scale degrees',
        'Apply the scale degrees to other keys',
      ],
      savedCount: 3,
      usedCount: 6,
      musicianId: baeThoven.id,
    },
  });

  // Create Task Definitions for Moe Tissart
  const moeTask1 = await prisma.taskDefinition.create({
    data: {
      title: 'repertoire (basic)',
      description:
        'For a specific song you are trying to get familiar with, go through this progression 2x each until memorized. When this gets comfortable, take it into a new key.',
      checklist: [
        'Bass',
        'Melody',
        'Bass + Melody',
        'Bass + Root Position',
        'Root Position + Melody',
      ],
      savedCount: 10,
      usedCount: 15,
      musicianId: moeTissart.id,
    },
  });

  const moeTask2 = await prisma.taskDefinition.create({
    data: {
      title: 'repertoire (advanced)',
      description:
        'To thoroughly memorize a specific song, go through this progression. Once these are comfortable, take into new keys.',
      checklist: [
        'Play bass while singing melody',
        'Sing melody with scale degrees',
        'Play bass while singing melody with scale degrees',
        'Sing bass with scale degrees',
        'Sing bass with scale degrees while playing melody',
        'Play bass and sing specific scale degree (3/5/7/9, etc.) for each change',
        'Play bass and sing solo',
        'Sing bass and sing solo, maintain the form',
      ],
      savedCount: 6,
      usedCount: 9,
      musicianId: moeTissart.id,
    },
  });

  const moeTask3 = await prisma.taskDefinition.create({
    data: {
      title: 'jazz jam repertoire',
      description:
        'Prepping a specific chart for a jazz jam. Execute the following 2x each. Explore different voicings.',
      checklist: [
        'RH Rootless',
        'Bass + Rootless',
        'LH Rootless',
        'Rootless + Melody',
        'Rootless drop 2',
      ],
      savedCount: 7,
      usedCount: 11,
      musicianId: moeTissart.id,
    },
  });

  // Create Task Definitions for Kilometers Davis
  const kilometersTask1 = await prisma.taskDefinition.create({
    data: {
      title: 'Big Scale Exercise',
      description:
        "For a given chart, move through the following progression. Use this reference for chord scale options... Maj7: Ionian -> Lydian -> Lydian #5, min7: Dorian -> Aeolian -> Phrygian, min7b5: Locrian -> Locrian natural 9, dom7: Mixo -> Lyd b7 -> b9 diminished scale -> altered scale, dom7#5: Whole tone scale, dom7b9b13: harmonic minor scale (+ it's modes, especially 5th mode), min major 7 or maj7#5: Augmented scale",
      checklist: [
        '(prereq) Play all chord scale options out of time for each change',
        '(prereq) Play each chord scale from the root in time',
        'Starting at a random place in the scale and switching directions randomly, play through selected chord scale combinations over the song form in time. Swing even 8ths.',
        'Use different rhythmic values (triplets, half notes, etc.). This should allow you to explore faster tempos',
        '(+ Bebop) Use the bebop alterations for these scales when practicing the big scale exercise',
      ],
      savedCount: 12,
      usedCount: 18,
      musicianId: kilometersDavis.id,
    },
  });

  // Create Task Definitions for Mandy Lin
  const mandyTask1 = await prisma.taskDefinition.create({
    data: {
      title: 'alternate picking (basic)',
      description:
        'A progression to help get comfortable with alternate picking',
      checklist: [
        'With open strings, alternate pick 1-2 1-3 1-4 etc, 2-2 2-3 etc … 6-5 6-4 etc',
        'With a chord shape underneath, alternate pick 12312313, 12412414,125 etc.',
        'With a chord shape underneath, pick down down up 12312313, 124 etc.',
      ],
      savedCount: 9,
      usedCount: 14,
      musicianId: mandyLin.id,
    },
  });

  const mandyTask2 = await prisma.taskDefinition.create({
    data: {
      title: 'chromatic picking (basic)',
      description:
        'A progression to help get comfortable fingers while alternate picking',
      checklist: [
        'Pick 01234 from low to high strings, then back 43210',
        'Work your way up the neck',
        'Watch out for string 5',
        'Use a metronome',
      ],
      savedCount: 4,
      usedCount: 7,
      musicianId: mandyLin.id,
    },
  });

  // Create Follow relationships
  await Promise.all([
    prisma.follow.create({
      data: { followerId: baeThoven.id, followingId: moeTissart.id },
    }),
    prisma.follow.create({
      data: { followerId: baeThoven.id, followingId: kilometersDavis.id },
    }),
    prisma.follow.create({
      data: { followerId: moeTissart.id, followingId: baeThoven.id },
    }),
    prisma.follow.create({
      data: { followerId: moeTissart.id, followingId: kilometersDavis.id },
    }),
    prisma.follow.create({
      data: { followerId: kilometersDavis.id, followingId: baeThoven.id },
    }),
    prisma.follow.create({
      data: { followerId: kilometersDavis.id, followingId: moeTissart.id },
    }),
    prisma.follow.create({
      data: { followerId: mandyLin.id, followingId: baeThoven.id },
    }),
    prisma.follow.create({
      data: { followerId: mandyLin.id, followingId: moeTissart.id },
    }),
    prisma.follow.create({
      data: { followerId: devUser.id, followingId: baeThoven.id },
    }),
    prisma.follow.create({
      data: { followerId: devUser.id, followingId: moeTissart.id },
    }),
  ]);

  // Create Goals
  await Promise.all([
    // Bae Thoven goals
    prisma.goal.create({
      data: {
        musicianId: baeThoven.id,
        tag: 'listening',
        type: 'duration',
        target: 30,
        timeFrame: 'daily',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    }),
    prisma.goal.create({
      data: {
        musicianId: baeThoven.id,
        tag: 'musicianship',
        type: 'frequency',
        target: 5,
        timeFrame: 'weekly',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    }),
    // Moe Tissart goals
    prisma.goal.create({
      data: {
        musicianId: moeTissart.id,
        tag: 'repertoire',
        type: 'duration',
        target: 45,
        timeFrame: 'daily',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    }),
    prisma.goal.create({
      data: {
        musicianId: moeTissart.id,
        tag: 'jazz',
        type: 'frequency',
        target: 3,
        timeFrame: 'weekly',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    }),
    // Kilometers Davis goals
    prisma.goal.create({
      data: {
        musicianId: kilometersDavis.id,
        tag: 'jazz',
        type: 'duration',
        target: 60,
        timeFrame: 'daily',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    }),
    prisma.goal.create({
      data: {
        musicianId: kilometersDavis.id,
        tag: 'scales',
        type: 'frequency',
        target: 4,
        timeFrame: 'weekly',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    }),
    // Mandy Lin goals
    prisma.goal.create({
      data: {
        musicianId: mandyLin.id,
        tag: 'guitar',
        type: 'duration',
        target: 40,
        timeFrame: 'daily',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    }),
    prisma.goal.create({
      data: {
        musicianId: mandyLin.id,
        tag: 'bluegrass',
        type: 'frequency',
        target: 3,
        timeFrame: 'weekly',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    }),
  ]);

  // Create Sessions with realistic data
  const sessions = await Promise.all([
    // Bae Thoven sessions
    prisma.session.create({
      data: {
        title: 'Morning Listening Session',
        notes:
          'Focused on Bill Evans trio recordings. The form analysis really helped me understand the harmonic movement better.',
        duration: 1800, // 30 minutes
        isPublic: true,
        musicianId: baeThoven.id,
        instruments: { connect: [{ id: listeningTag.id }] },
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Transcription Practice - Take Five',
        notes:
          "Working on Paul Desmond's solo. The timing is tricky but getting better at matching the feel.",
        duration: 1800, // 30 minutes
        isPublic: true,
        musicianId: baeThoven.id,
        instruments: { connect: [{ id: listeningTag.id }] },
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Transposition Work - Autumn Leaves',
        notes:
          'Transposing the melody to different keys. Singing scale degrees really helps with internalizing the harmony.',
        duration: 900, // 15 minutes
        isPublic: true,
        musicianId: baeThoven.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Evening Listening - Classical Focus',
        notes:
          "Analyzed Beethoven's Moonlight Sonata. The form is so clear and the emotional arc is incredible.",
        duration: 1200, // 20 minutes
        isPublic: true,
        musicianId: baeThoven.id,
        instruments: { connect: [{ id: listeningTag.id }] },
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),

    // Moe Tissart sessions
    prisma.session.create({
      data: {
        title: 'Basic Repertoire - All of Me',
        notes:
          'Working through the basic progression. Bass + melody is getting more comfortable.',
        duration: 2400, // 40 minutes
        isPublic: true,
        musicianId: moeTissart.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: { connect: [{ id: pianoTag.id }, { id: repertoireTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Advanced Repertoire - Misty',
        notes:
          'Singing bass with scale degrees while playing melody. This is challenging but really helps with memorization.',
        duration: 2700, // 45 minutes
        isPublic: true,
        musicianId: moeTissart.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: { connect: [{ id: pianoTag.id }, { id: repertoireTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Jazz Jam Prep - Blue Bossa',
        notes:
          'Prepping for the jazz jam tonight. Rootless voicings are sounding good.',
        duration: 1800, // 30 minutes
        isPublic: true,
        musicianId: moeTissart.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: {
          connect: [
            { id: pianoTag.id },
            { id: repertoireTag.id },
            { id: jazzTag.id },
          ],
        },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Guitar Repertoire - Yesterday',
        notes:
          'Working on the Beatles tune on guitar. The chord changes are beautiful.',
        duration: 1500, // 25 minutes
        isPublic: true,
        musicianId: moeTissart.id,
        instruments: { connect: [{ id: guitarTag.id }] },
        tags: { connect: [{ id: guitarTag.id }, { id: repertoireTag.id }] },
      },
    }),

    // Kilometers Davis sessions
    prisma.session.create({
      data: {
        title: 'Big Scale Exercise - Giant Steps',
        notes:
          'Working through all the chord scale options. The bebop alterations are adding some nice tension.',
        duration: 3600, // 60 minutes
        isPublic: true,
        musicianId: kilometersDavis.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: {
          connect: [
            { id: pianoTag.id },
            { id: jazzTag.id },
            { id: scalesTag.id },
          ],
        },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Scale Practice - Modal Jazz',
        notes:
          'Focusing on Dorian and Mixolydian modes. The rhythmic variations are helping with time feel.',
        duration: 2700, // 45 minutes
        isPublic: true,
        musicianId: kilometersDavis.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: {
          connect: [
            { id: pianoTag.id },
            { id: jazzTag.id },
            { id: scalesTag.id },
          ],
        },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Jazz Standards - So What',
        notes:
          'Working on the Miles Davis classic. The modal approach is really freeing.',
        duration: 2400, // 40 minutes
        isPublic: true,
        musicianId: kilometersDavis.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: {
          connect: [
            { id: pianoTag.id },
            { id: jazzTag.id },
            { id: repertoireTag.id },
          ],
        },
      },
    }),

    // Mandy Lin sessions
    prisma.session.create({
      data: {
        title: 'Alternate Picking Basics',
        notes:
          'Working on the basic patterns. The chord shapes underneath are helping with coordination.',
        duration: 1800, // 30 minutes
        isPublic: true,
        musicianId: mandyLin.id,
        instruments: { connect: [{ id: guitarTag.id }] },
        tags: { connect: [{ id: guitarTag.id }, { id: bluegrassTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Chromatic Picking Practice',
        notes:
          'Working up the neck with chromatic patterns. Metronome at 80 BPM.',
        duration: 1200, // 20 minutes
        isPublic: true,
        musicianId: mandyLin.id,
        instruments: { connect: [{ id: guitarTag.id }] },
        tags: { connect: [{ id: guitarTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Bluegrass Tune - Cripple Creek',
        notes: 'Learning the basic melody and working on the picking pattern.',
        duration: 1500, // 25 minutes
        isPublic: true,
        musicianId: mandyLin.id,
        instruments: { connect: [{ id: guitarTag.id }] },
        tags: { connect: [{ id: guitarTag.id }, { id: bluegrassTag.id }] },
      },
    }),
  ]);

  // Create Task Usage in Sessions
  await Promise.all([
    // Bae Thoven task usage
    prisma.taskInUse.create({
      data: {
        duration: 1800,
        notes: 'Focused on form analysis and instrumentation',
        isSessionTask: true,
        checklistCompletions: [
          'the form',
          'the instrumentation',
          "what you liked/didn't like and why",
        ],
        taskDefinitionId: baeTask1.id,
        musicianId: baeThoven.id,
        sessionId: sessions[0].id,
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 1800,
        notes: 'Working on matching pitches and timing',
        isSessionTask: true,
        checklistCompletions: [
          'Matching the pitches',
          'Replicating the feel, timing',
          'At reduced tempo',
        ],
        taskDefinitionId: baeTask2.id,
        musicianId: baeThoven.id,
        sessionId: sessions[1].id,
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 900,
        notes: 'Transposing melody to different keys',
        isSessionTask: true,
        checklistCompletions: [
          'Understand the song form',
          'Sing the scale degrees',
          'Apply the scale degrees to other keys',
        ],
        taskDefinitionId: baeTask3.id,
        musicianId: baeThoven.id,
        sessionId: sessions[2].id,
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),

    // Moe Tissart task usage
    prisma.taskInUse.create({
      data: {
        duration: 2400,
        notes: 'Working through basic progression',
        isSessionTask: true,
        checklistCompletions: [
          'Bass',
          'Melody',
          'Bass + Melody',
          'Bass + Root Position',
        ],
        taskDefinitionId: moeTask1.id,
        musicianId: moeTissart.id,
        sessionId: sessions[4].id,
        tags: { connect: [{ id: pianoTag.id }, { id: repertoireTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 2700,
        notes: 'Advanced memorization techniques',
        isSessionTask: true,
        checklistCompletions: [
          'Play bass while singing melody',
          'Sing melody with scale degrees',
          'Play bass while singing melody with scale degrees',
        ],
        taskDefinitionId: moeTask2.id,
        musicianId: moeTissart.id,
        sessionId: sessions[5].id,
        tags: { connect: [{ id: pianoTag.id }, { id: repertoireTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 1800,
        notes: 'Jazz jam preparation',
        isSessionTask: true,
        checklistCompletions: [
          'RH Rootless',
          'Bass + Rootless',
          'LH Rootless',
          'Rootless + Melody',
        ],
        taskDefinitionId: moeTask3.id,
        musicianId: moeTissart.id,
        sessionId: sessions[6].id,
        tags: {
          connect: [
            { id: pianoTag.id },
            { id: repertoireTag.id },
            { id: jazzTag.id },
          ],
        },
      },
    }),

    // Kilometers Davis task usage
    prisma.taskInUse.create({
      data: {
        duration: 3600,
        notes: 'Big scale exercise with bebop alterations',
        isSessionTask: true,
        checklistCompletions: [
          '(prereq) Play all chord scale options out of time for each change',
          '(prereq) Play each chord scale from the root in time',
          'Starting at a random place in the scale and switching directions randomly, play through selected chord scale combinations over the song form in time. Swing even 8ths.',
        ],
        taskDefinitionId: kilometersTask1.id,
        musicianId: kilometersDavis.id,
        sessionId: sessions[8].id,
        tags: {
          connect: [
            { id: pianoTag.id },
            { id: jazzTag.id },
            { id: scalesTag.id },
          ],
        },
      },
    }),

    // Mandy Lin task usage
    prisma.taskInUse.create({
      data: {
        duration: 1800,
        notes: 'Basic alternate picking patterns',
        isSessionTask: true,
        checklistCompletions: [
          'With open strings, alternate pick 1-2 1-3 1-4 etc, 2-2 2-3 etc … 6-5 6-4 etc',
          'With a chord shape underneath, alternate pick 12312313, 12412414,125 etc.',
        ],
        taskDefinitionId: mandyTask1.id,
        musicianId: mandyLin.id,
        sessionId: sessions[11].id,
        tags: { connect: [{ id: guitarTag.id }, { id: bluegrassTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 1200,
        notes: 'Chromatic picking with metronome',
        isSessionTask: true,
        checklistCompletions: [
          'Pick 01234 from low to high strings, then back 43210',
          'Work your way up the neck',
          'Use a metronome',
        ],
        taskDefinitionId: mandyTask2.id,
        musicianId: mandyLin.id,
        sessionId: sessions[12].id,
        tags: { connect: [{ id: guitarTag.id }] },
      },
    }),
  ]);

  // Create Comments
  await Promise.all([
    prisma.comment.create({
      data: {
        text: 'Love the focus on fundamentals! The form analysis is such a great approach.',
        musicianId: moeTissart.id,
        sessionId: sessions[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Take Five is such a great tune for transcription. The 5/4 time signature makes it really interesting!',
        musicianId: kilometersDavis.id,
        sessionId: sessions[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: 'All of Me is a classic! The bass + melody approach is really solid.',
        musicianId: baeThoven.id,
        sessionId: sessions[4].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Misty is beautiful. The scale degree singing is such a powerful tool.',
        musicianId: kilometersDavis.id,
        sessionId: sessions[5].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Blue Bossa is perfect for jazz jams! Rootless voicings sound great.',
        musicianId: baeThoven.id,
        sessionId: sessions[6].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Giant Steps! Those chord scale options are intense but so rewarding.',
        musicianId: moeTissart.id,
        sessionId: sessions[8].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Great work on the alternate picking! The coordination will come with practice.',
        musicianId: baeThoven.id,
        sessionId: sessions[11].id,
      },
    }),
  ]);

  // Create Gas Ups
  await Promise.all([
    prisma.gasUp.create({
      data: { musicianId: moeTissart.id, sessionId: sessions[0].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: kilometersDavis.id, sessionId: sessions[0].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: mandyLin.id, sessionId: sessions[0].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: baeThoven.id, sessionId: sessions[1].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: kilometersDavis.id, sessionId: sessions[1].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: baeThoven.id, sessionId: sessions[4].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: kilometersDavis.id, sessionId: sessions[4].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: baeThoven.id, sessionId: sessions[5].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: moeTissart.id, sessionId: sessions[5].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: baeThoven.id, sessionId: sessions[6].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: kilometersDavis.id, sessionId: sessions[6].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: moeTissart.id, sessionId: sessions[8].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: baeThoven.id, sessionId: sessions[8].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: moeTissart.id, sessionId: sessions[11].id },
    }),
    prisma.gasUp.create({
      data: { musicianId: kilometersDavis.id, sessionId: sessions[11].id },
    }),
  ]);

  // Create some Media
  await Promise.all([
    prisma.media.create({
      data: {
        musicianId: baeThoven.id,
        url: 'https://via.placeholder.com/600/4A90E2/FFFFFF?text=Listening+Session',
        type: 'image',
        sessionId: sessions[0].id,
      },
    }),
    prisma.media.create({
      data: {
        musicianId: moeTissart.id,
        url: 'https://via.placeholder.com/600/7ED321/000000?text=Repertoire+Practice',
        type: 'image',
        sessionId: sessions[4].id,
      },
    }),
    prisma.media.create({
      data: {
        musicianId: kilometersDavis.id,
        url: 'https://via.placeholder.com/600/9B59B6/FFFFFF?text=Jazz+Scales',
        type: 'image',
        sessionId: sessions[8].id,
      },
    }),
    prisma.media.create({
      data: {
        musicianId: mandyLin.id,
        url: 'https://via.placeholder.com/600/E74C3C/FFFFFF?text=Guitar+Practice',
        type: 'image',
        sessionId: sessions[11].id,
      },
    }),
  ]);
}

main()
  .then(async () => {
    console.log('Database seeded 🌱');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
