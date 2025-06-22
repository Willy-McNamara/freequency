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
  await prisma.musician.deleteMany();
  await prisma.tag.deleteMany();

  // Create all instrument tags (finite list)
  const instrumentLabels = [
    'Piano',
    'Guitar',
    'Listening',
    'Violin',
    'Drums',
    'Flute',
    'Clarinet',
    'Saxophone',
    'Trumpet',
    'Trombone',
    'Voice',
    'Cello',
    'Ukulele',
    'Percussion',
    'Double Bass',
    'Bass Guitar',
    'Oboe',
    'Harp',
    'Accordion',
    'Banjo',
    'DJing',
    'Production',
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

  // After upserting instrument tags, check that all required tags exist
  const requiredInstruments = [
    'Piano',
    'Guitar',
    'Drums',
    'Bass Guitar',
    'Violin',
    'Saxophone',
  ];
  const missing = requiredInstruments.filter(
    (name) => !instrumentTags[sanitizeTagLabel(name)],
  );
  if (missing.length > 0) {
    console.error('Missing instrument tags after upsert:', missing);
    console.error(
      'Available instrumentTags keys:',
      Object.keys(instrumentTags),
    );
    throw new Error(
      'One or more required instrument tags are missing after upsert.',
    );
  }

  // Create Tags first (so we can assign them later)
  const pianoTag = instrumentTags[sanitizeTagLabel('Piano')];
  const guitarTag = instrumentTags[sanitizeTagLabel('Guitar')];
  const drumsTag = instrumentTags[sanitizeTagLabel('Drums')];
  const bassTag = instrumentTags[sanitizeTagLabel('Bass Guitar')];
  const violinTag = instrumentTags[sanitizeTagLabel('Violin')];
  const saxophoneTag = instrumentTags[sanitizeTagLabel('Saxophone')];

  // Create Musicians
  const musician1 = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-1',
      displayName: 'John Doe',
      givenName: 'John',
      familyName: 'Doe',
      email: 'john.doe@example.com',
      bio: 'Passionate jazz pianist exploring bebop and modal jazz.',
      avatarUrl: 'https://via.placeholder.com/150/FFD700/000000?text=JD',
      totalSessions: 12,
      totalPracticeMinutes: 720,
      totalGasUpsGiven: 8,
      totalGasUpsReceived: 10,
      instruments: {
        connect: [{ id: pianoTag.id }],
      },
    },
  });

  const musician2 = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-2',
      displayName: 'Sarah Chen',
      givenName: 'Sarah',
      familyName: 'Chen',
      email: 'sarah.chen@example.com',
      bio: 'Classical violinist with a love for contemporary music.',
      avatarUrl: 'https://via.placeholder.com/150/8A2BE2/FFFFFF?text=SC',
      totalSessions: 8,
      totalPracticeMinutes: 480,
      totalGasUpsGiven: 5,
      totalGasUpsReceived: 7,
      instruments: {
        connect: [{ id: violinTag.id }],
      },
    },
  });

  const musician3 = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-3',
      displayName: 'Mike Rodriguez',
      givenName: 'Mike',
      familyName: 'Rodriguez',
      email: 'mike.rodriguez@example.com',
      bio: 'Rock guitarist and session musician.',
      avatarUrl: 'https://via.placeholder.com/150/ADFF2F/000000?text=MR',
      totalSessions: 15,
      totalPracticeMinutes: 900,
      totalGasUpsGiven: 12,
      totalGasUpsReceived: 15,
      instruments: {
        connect: [{ id: guitarTag.id }],
      },
    },
  });

  const musician4 = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-4',
      displayName: 'Emma Wilson',
      givenName: 'Emma',
      familyName: 'Wilson',
      email: 'emma.wilson@example.com',
      bio: 'Jazz saxophonist and composer.',
      avatarUrl: 'https://via.placeholder.com/150/FF6347/FFFFFF?text=EW',
      totalSessions: 10,
      totalPracticeMinutes: 600,
      totalGasUpsGiven: 7,
      totalGasUpsReceived: 9,
      instruments: {
        connect: [{ id: saxophoneTag.id }],
      },
    },
  });

  const musician5 = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-5',
      displayName: 'Alex Thompson',
      givenName: 'Alex',
      familyName: 'Thompson',
      email: 'alex.thompson@example.com',
      bio: 'Funk and jazz bassist, loves groove and walking bass lines.',
      avatarUrl: 'https://via.placeholder.com/150/4169E1/FFFFFF?text=AT',
      totalSessions: 14,
      totalPracticeMinutes: 840,
      totalGasUpsGiven: 9,
      totalGasUpsReceived: 11,
      instruments: {
        connect: [{ id: bassTag.id }],
      },
    },
  });

  const musician6 = await prisma.musician.create({
    data: {
      googleId: 'fake-google-id-6',
      displayName: 'Lisa Park',
      givenName: 'Lisa',
      familyName: 'Park',
      email: 'lisa.park@example.com',
      bio: 'Drummer specializing in jazz and fusion.',
      avatarUrl: 'https://via.placeholder.com/150/FF4500/FFFFFF?text=LP',
      totalSessions: 11,
      totalPracticeMinutes: 660,
      totalGasUpsGiven: 6,
      totalGasUpsReceived: 8,
      instruments: {
        connect: [{ id: drumsTag.id }],
      },
    },
  });

  // Create TaskDefinitions
  const taskDefs = await Promise.all([
    // Piano Tasks
    prisma.taskDefinition.create({
      data: {
        title: 'Jazz Piano Warmup',
        musicianId: musician1.id,
        description:
          'Comprehensive warmup routine for jazz piano including scales, arpeggios, and chord voicings.',
        checklist: [
          'C major scale - 2 octaves',
          'G major scale - 2 octaves',
          'A minor scale - 2 octaves',
          'C major arpeggio - 2 octaves',
          'G major arpeggio - 2 octaves',
        ],
        savedCount: 5,
        usedCount: 3,
      },
    }),
    prisma.taskDefinition.create({
      data: {
        title: 'Learn "Autumn Leaves"',
        musicianId: musician1.id,
        description:
          'Practice the jazz standard with different chord voicings and improvisation.',
        checklist: [
          'Learn melody by ear',
          'Practice chord voicings',
          'Work on left hand comping',
          'Improvise over changes',
          'Record and review performance',
        ],
        savedCount: 8,
        usedCount: 4,
      },
    }),
    prisma.taskDefinition.create({
      data: {
        title: 'Bebop Scale Practice',
        musicianId: musician1.id,
        description:
          'Master bebop scales and their application in jazz improvisation.',
        checklist: [
          'C bebop dominant scale',
          'F bebop dominant scale',
          'Practice in all keys',
          'Apply to ii-V-I progressions',
          'Record improvisations',
        ],
        savedCount: 3,
        usedCount: 2,
      },
    }),

    // Violin Tasks
    prisma.taskDefinition.create({
      data: {
        title: 'Violin Technique Fundamentals',
        musicianId: musician2.id,
        description:
          'Focus on bowing technique, intonation, and vibrato development.',
        checklist: [
          'Open string bowing exercises',
          'Scale practice with metronome',
          'Vibrato exercises',
          'Intonation practice',
          'Review recordings',
        ],
        savedCount: 6,
        usedCount: 4,
      },
    }),
    prisma.taskDefinition.create({
      data: {
        title: 'Bach Partita No. 2',
        musicianId: musician2.id,
        description:
          'Work on the Allemande from Bach Partita No. 2 in D minor.',
        checklist: [
          'Learn notes and fingerings',
          'Practice bowing patterns',
          'Work on phrasing',
          'Focus on ornamentation',
          'Performance practice',
        ],
        savedCount: 4,
        usedCount: 2,
      },
    }),

    // Guitar Tasks
    prisma.taskDefinition.create({
      data: {
        title: 'Rock Guitar Riffs',
        musicianId: musician3.id,
        description:
          'Practice classic rock guitar riffs and develop picking technique.',
        checklist: [
          'Smoke on the Water riff',
          'Sunshine of Your Love riff',
          'Back in Black riff',
          'Practice palm muting',
          'Work on timing',
        ],
        savedCount: 12,
        usedCount: 7,
      },
    }),
    prisma.taskDefinition.create({
      data: {
        title: 'Blues Guitar Improvisation',
        musicianId: musician3.id,
        description:
          'Develop blues guitar soloing skills and pentatonic scale mastery.',
        checklist: [
          'A minor pentatonic scale',
          'Blues scale practice',
          'Bend exercises',
          'Vibrato technique',
          'Jam with backing track',
        ],
        savedCount: 9,
        usedCount: 5,
      },
    }),
    prisma.taskDefinition.create({
      data: {
        title: 'Fingerstyle Guitar',
        musicianId: musician3.id,
        description: 'Learn fingerstyle guitar techniques and arrangements.',
        checklist: [
          'Travis picking pattern',
          'Thumb independence',
          'Learn a fingerstyle song',
          'Practice arpeggios',
          'Work on dynamics',
        ],
        savedCount: 7,
        usedCount: 3,
      },
    }),

    // Saxophone Tasks
    prisma.taskDefinition.create({
      data: {
        title: 'Saxophone Tone Development',
        musicianId: musician4.id,
        description: 'Focus on developing a rich, full saxophone tone.',
        checklist: [
          'Long tone exercises',
          'Overtones practice',
          'Breathing exercises',
          'Mouthpiece exercises',
          'Record and analyze tone',
        ],
        savedCount: 5,
        usedCount: 3,
      },
    }),
    prisma.taskDefinition.create({
      data: {
        title: 'Jazz Saxophone Standards',
        musicianId: musician4.id,
        description:
          'Practice jazz standards and develop improvisation skills.',
        checklist: [
          'Learn "Take Five" melody',
          'Practice "Blue Bossa"',
          'Work on "All the Things You Are"',
          'Improvise over changes',
          'Record solos',
        ],
        savedCount: 6,
        usedCount: 4,
      },
    }),

    // Bass Tasks
    prisma.taskDefinition.create({
      data: {
        title: 'Walking Bass Lines',
        musicianId: musician5.id,
        description:
          'Master walking bass line construction and harmonic movement.',
        checklist: [
          'Study chord progressions',
          'Practice root-fifth patterns',
          'Add passing tones',
          'Work on chromatic approaches',
          'Play with jazz backing track',
        ],
        savedCount: 8,
        usedCount: 5,
      },
    }),
    prisma.taskDefinition.create({
      data: {
        title: 'Funk Bass Grooves',
        musicianId: musician5.id,
        description: 'Develop funk bass playing and groove techniques.',
        checklist: [
          'Learn "Superstition" bass line',
          'Practice slap technique',
          'Work on ghost notes',
          'Develop pocket feel',
          'Jam with drum machine',
        ],
        savedCount: 10,
        usedCount: 6,
      },
    }),

    // Drums Tasks
    prisma.taskDefinition.create({
      data: {
        title: 'Jazz Drumming Fundamentals',
        musicianId: musician6.id,
        description: 'Develop jazz drumming skills and coordination.',
        checklist: [
          'Basic jazz ride pattern',
          'Comping on snare',
          'Brush technique',
          'Trading fours',
          'Play with jazz backing track',
        ],
        savedCount: 7,
        usedCount: 4,
      },
    }),
    prisma.taskDefinition.create({
      data: {
        title: 'Drum Groove Practice',
        musicianId: musician6.id,
        description:
          'Practice essential drum grooves and fills for rock and pop music.',
        checklist: [
          'Basic rock beat - 4/4 time',
          'Add hi-hat variations',
          'Practice crash cymbal placement',
          'Work on tom-tom fills',
          'Play along with backing track',
        ],
        savedCount: 11,
        usedCount: 7,
      },
    }),
  ]);

  // Create Sessions with Tasks
  const sessions = await Promise.all([
    // John Doe's Sessions (Piano)
    prisma.session.create({
      data: {
        title: 'Morning Jazz Practice',
        notes:
          'Focused on bebop scales and Autumn Leaves. Made good progress on the bridge section.',
        duration: 75,
        isPublic: true,
        musicianId: musician1.id,
        tags: { connect: [{ id: pianoTag.id }] },
        instruments: { connect: [{ id: pianoTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Evening Standards Practice',
        notes:
          'Worked on chord voicings and comping patterns. Need to practice more with metronome.',
        duration: 60,
        isPublic: true,
        musicianId: musician1.id,
        tags: { connect: [{ id: pianoTag.id }] },
        instruments: { connect: [{ id: pianoTag.id }] },
      },
    }),

    // Sarah Chen's Sessions (Violin)
    prisma.session.create({
      data: {
        title: 'Bach Practice Session',
        notes:
          'Focused on the Allemande from Partita No. 2. Working on bowing technique and phrasing.',
        duration: 90,
        isPublic: true,
        musicianId: musician2.id,
        tags: { connect: [{ id: violinTag.id }] },
        instruments: { connect: [{ id: violinTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Technique Development',
        notes:
          'Long tones and scale practice. Need to work more on intonation.',
        duration: 45,
        isPublic: false,
        musicianId: musician2.id,
        tags: { connect: [{ id: violinTag.id }] },
        instruments: { connect: [{ id: violinTag.id }] },
      },
    }),

    // Mike Rodriguez's Sessions (Guitar)
    prisma.session.create({
      data: {
        title: 'Rock Riffs Practice',
        notes:
          'Nailed the Smoke on the Water riff! Working on timing and palm muting.',
        duration: 80,
        isPublic: true,
        musicianId: musician3.id,
        tags: { connect: [{ id: guitarTag.id }] },
        instruments: { connect: [{ id: guitarTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Blues Jam Session',
        notes:
          'Great blues improvisation today. Really feeling the pentatonic scales.',
        duration: 65,
        isPublic: true,
        musicianId: musician3.id,
        tags: { connect: [{ id: guitarTag.id }] },
        instruments: { connect: [{ id: guitarTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Fingerstyle Practice',
        notes:
          'Learning a new fingerstyle arrangement. Travis picking is challenging but rewarding.',
        duration: 55,
        isPublic: false,
        musicianId: musician3.id,
        tags: { connect: [{ id: guitarTag.id }] },
        instruments: { connect: [{ id: guitarTag.id }] },
      },
    }),

    // Emma Wilson's Sessions (Saxophone)
    prisma.session.create({
      data: {
        title: 'Jazz Standards Practice',
        notes:
          'Worked on Take Five and Blue Bossa. Tone is improving with daily practice.',
        duration: 70,
        isPublic: true,
        musicianId: musician4.id,
        tags: { connect: [{ id: saxophoneTag.id }] },
        instruments: { connect: [{ id: saxophoneTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Tone Development',
        notes:
          'Long tones and overtones practice. Recording myself to track progress.',
        duration: 40,
        isPublic: false,
        musicianId: musician4.id,
        tags: { connect: [{ id: saxophoneTag.id }] },
        instruments: { connect: [{ id: saxophoneTag.id }] },
      },
    }),

    // Alex Thompson's Sessions (Bass)
    prisma.session.create({
      data: {
        title: 'Walking Bass Practice',
        notes:
          'Working on ii-V-I progressions. Adding chromatic approaches to walking lines.',
        duration: 85,
        isPublic: true,
        musicianId: musician5.id,
        tags: { connect: [{ id: bassTag.id }] },
        instruments: { connect: [{ id: bassTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Funk Groove Session',
        notes:
          'Practiced Superstition bass line and slap technique. Getting better at ghost notes.',
        duration: 60,
        isPublic: true,
        musicianId: musician5.id,
        tags: { connect: [{ id: bassTag.id }] },
        instruments: { connect: [{ id: bassTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Jazz Bass Practice',
        notes:
          'Working on root-fifth patterns and developing better time feel.',
        duration: 50,
        isPublic: false,
        musicianId: musician5.id,
        tags: { connect: [{ id: bassTag.id }] },
        instruments: { connect: [{ id: bassTag.id }] },
      },
    }),

    // Lisa Park's Sessions (Drums)
    prisma.session.create({
      data: {
        title: 'Jazz Drumming Practice',
        notes:
          'Working on ride cymbal pattern and comping on snare. Trading fours is challenging.',
        duration: 75,
        isPublic: true,
        musicianId: musician6.id,
        tags: { connect: [{ id: drumsTag.id }] },
        instruments: { connect: [{ id: drumsTag.id }] },
      },
    }),
    prisma.session.create({
      data: {
        title: 'Rock Grooves Practice',
        notes:
          'Practiced basic rock beats and fills. Working on crash cymbal placement.',
        duration: 55,
        isPublic: true,
        musicianId: musician6.id,
        tags: { connect: [{ id: drumsTag.id }] },
        instruments: { connect: [{ id: drumsTag.id }] },
      },
    }),
  ]);

  // Create TaskInUse entries (connecting tasks to sessions)
  await Promise.all([
    // John Doe's task usage
    prisma.taskInUse.create({
      data: {
        duration: 45,
        notes: 'Great progress on bebop scales today.',
        isSessionTask: true,
        checklistCompletions: [
          'C bebop dominant scale',
          'F bebop dominant scale',
        ],
        taskDefinitionId: taskDefs[2].id, // Bebop Scale Practice
        musicianId: musician1.id,
        sessionId: sessions[0].id,
        tags: { connect: [{ id: pianoTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 30,
        notes: 'Worked on Autumn Leaves chord voicings.',
        isSessionTask: true,
        checklistCompletions: [
          'Learn melody by ear',
          'Practice chord voicings',
        ],
        taskDefinitionId: taskDefs[1].id, // Learn "Autumn Leaves"
        musicianId: musician1.id,
        sessionId: sessions[1].id,
        tags: { connect: [{ id: pianoTag.id }] },
      },
    }),

    // Sarah Chen's task usage
    prisma.taskInUse.create({
      data: {
        duration: 60,
        notes: 'Focused on Bach Partita bowing technique.',
        isSessionTask: true,
        checklistCompletions: [
          'Learn notes and fingerings',
          'Practice bowing patterns',
        ],
        taskDefinitionId: taskDefs[4].id, // Bach Partita No. 2
        musicianId: musician2.id,
        sessionId: sessions[2].id,
        tags: { connect: [{ id: violinTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 30,
        notes: 'Scale practice with metronome.',
        isSessionTask: true,
        checklistCompletions: [
          'Scale practice with metronome',
          'Intonation practice',
        ],
        taskDefinitionId: taskDefs[3].id, // Violin Technique Fundamentals
        musicianId: musician2.id,
        sessionId: sessions[3].id,
        tags: { connect: [{ id: violinTag.id }] },
      },
    }),

    // Mike Rodriguez's task usage
    prisma.taskInUse.create({
      data: {
        duration: 50,
        notes: 'Nailed the Smoke on the Water riff!',
        isSessionTask: true,
        checklistCompletions: [
          'Smoke on the Water riff',
          'Practice palm muting',
        ],
        taskDefinitionId: taskDefs[5].id, // Rock Guitar Riffs
        musicianId: musician3.id,
        sessionId: sessions[4].id,
        tags: { connect: [{ id: guitarTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 40,
        notes: 'Great blues improvisation today.',
        isSessionTask: true,
        checklistCompletions: [
          'A minor pentatonic scale',
          'Jam with backing track',
        ],
        taskDefinitionId: taskDefs[6].id, // Blues Guitar Improvisation
        musicianId: musician3.id,
        sessionId: sessions[5].id,
        tags: { connect: [{ id: guitarTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 35,
        notes: 'Travis picking is challenging but rewarding.',
        isSessionTask: true,
        checklistCompletions: ['Travis picking pattern', 'Thumb independence'],
        taskDefinitionId: taskDefs[7].id, // Fingerstyle Guitar
        musicianId: musician3.id,
        sessionId: sessions[6].id,
        tags: { connect: [{ id: guitarTag.id }] },
      },
    }),

    // Emma Wilson's task usage
    prisma.taskInUse.create({
      data: {
        duration: 45,
        notes: 'Worked on Take Five and Blue Bossa.',
        isSessionTask: true,
        checklistCompletions: [
          'Learn "Take Five" melody',
          'Practice "Blue Bossa"',
        ],
        taskDefinitionId: taskDefs[9].id, // Jazz Saxophone Standards
        musicianId: musician4.id,
        sessionId: sessions[7].id,
        tags: { connect: [{ id: saxophoneTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 25,
        notes: 'Long tones and overtones practice.',
        isSessionTask: true,
        checklistCompletions: ['Long tone exercises', 'Overtones practice'],
        taskDefinitionId: taskDefs[8].id, // Saxophone Tone Development
        musicianId: musician4.id,
        sessionId: sessions[8].id,
        tags: { connect: [{ id: saxophoneTag.id }] },
      },
    }),

    // Alex Thompson's task usage
    prisma.taskInUse.create({
      data: {
        duration: 55,
        notes: 'Working on ii-V-I progressions.',
        isSessionTask: true,
        checklistCompletions: ['Study chord progressions', 'Add passing tones'],
        taskDefinitionId: taskDefs[10].id, // Walking Bass Lines
        musicianId: musician5.id,
        sessionId: sessions[9].id,
        tags: { connect: [{ id: bassTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 40,
        notes: 'Practiced Superstition bass line and slap technique.',
        isSessionTask: true,
        checklistCompletions: [
          'Learn "Superstition" bass line',
          'Practice slap technique',
        ],
        taskDefinitionId: taskDefs[11].id, // Funk Bass Grooves
        musicianId: musician5.id,
        sessionId: sessions[10].id,
        tags: { connect: [{ id: bassTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 30,
        notes: 'Working on root-fifth patterns.',
        isSessionTask: true,
        checklistCompletions: ['Practice root-fifth patterns'],
        taskDefinitionId: taskDefs[10].id, // Walking Bass Lines (reused)
        musicianId: musician5.id,
        sessionId: sessions[11].id,
        tags: { connect: [{ id: bassTag.id }] },
      },
    }),

    // Lisa Park's task usage
    prisma.taskInUse.create({
      data: {
        duration: 50,
        notes: 'Working on ride cymbal pattern and comping.',
        isSessionTask: true,
        checklistCompletions: ['Basic jazz ride pattern', 'Comping on snare'],
        taskDefinitionId: taskDefs[12].id, // Jazz Drumming Fundamentals
        musicianId: musician6.id,
        sessionId: sessions[12].id,
        tags: { connect: [{ id: drumsTag.id }] },
      },
    }),
    prisma.taskInUse.create({
      data: {
        duration: 35,
        notes: 'Practiced basic rock beats and fills.',
        isSessionTask: true,
        checklistCompletions: [
          'Basic rock beat - 4/4 time',
          'Add hi-hat variations',
        ],
        taskDefinitionId: taskDefs[13].id, // Drum Groove Practice
        musicianId: musician6.id,
        sessionId: sessions[13].id,
        tags: { connect: [{ id: drumsTag.id }] },
      },
    }),
  ]);

  // Create some Media, Comments, and GasUps for variety
  await Promise.all([
    // Media
    prisma.media.create({
      data: {
        musicianId: musician1.id,
        url: 'https://via.placeholder.com/600/FFD700/000000?text=Jazz+Piano',
        type: 'image',
        sessionId: sessions[0].id,
      },
    }),
    prisma.media.create({
      data: {
        musicianId: musician3.id,
        url: 'https://via.placeholder.com/600/ADFF2F/000000?text=Rock+Guitar',
        type: 'image',
        sessionId: sessions[4].id,
      },
    }),
    prisma.media.create({
      data: {
        musicianId: musician5.id,
        url: 'https://via.placeholder.com/600/4169E1/FFFFFF?text=Funk+Bass',
        type: 'image',
        sessionId: sessions[10].id,
      },
    }),

    // Comments
    prisma.comment.create({
      data: {
        text: 'Amazing bebop playing! Love the Autumn Leaves interpretation.',
        musicianId: musician4.id,
        sessionId: sessions[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Great rock riffs! The timing is spot on.',
        musicianId: musician6.id,
        sessionId: sessions[4].id,
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Solid walking bass lines. The chromatic approaches sound great!',
        musicianId: musician1.id,
        sessionId: sessions[9].id,
      },
    }),

    // GasUps
    prisma.gasUp.create({
      data: {
        musicianId: musician4.id,
        sessionId: sessions[0].id,
      },
    }),
    prisma.gasUp.create({
      data: {
        musicianId: musician6.id,
        sessionId: sessions[4].id,
      },
    }),
    prisma.gasUp.create({
      data: {
        musicianId: musician1.id,
        sessionId: sessions[9].id,
      },
    }),
    prisma.gasUp.create({
      data: {
        musicianId: musician3.id,
        sessionId: sessions[7].id,
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
