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
  await prisma.savedTask.deleteMany();
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
      description: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Per tune you listen to, make an observation about each checklist item. <i>"Learning to improvise is learning to compose in real time. This is helped by having your own ideas about aesthetics—what you like and don't like, why."</i> <b>- Ted Case</b></span></p>`,
      checklist: [
        'the form',
        'the instrumentation',
        "what you liked/didn't like and why",
      ],
      savedCount: 8,
      usedCount: 12,
      musicianId: baeThoven.id,
      tags: {
        connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
      },
    },
  });

  const baeTask2 = await prisma.taskDefinition.create({
    data: {
      title: 'transcription (30 mins)',
      description: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Set a timer and focus on a single transcription for <b>30 minutes</b>.</span></p>`,
      checklist: [
        'Matching the pitches',
        'Replicating the feel, timing',
        'At reduced tempo',
        'At tempo',
      ],
      savedCount: 5,
      usedCount: 8,
      musicianId: baeThoven.id,
      tags: {
        connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
      },
    },
  });

  const baeTask3 = await prisma.taskDefinition.create({
    data: {
      title: 'transcription transposition (15 mins)',
      description: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Set a timer and focus on transposing a transcription for <b>15 minutes</b>. Try to <u>sing the scale degrees</u> and apply them to other keys.</span></p>`,
      checklist: [
        'Understand the song form',
        'Sing the scale degrees',
        'Apply the scale degrees to other keys',
      ],
      savedCount: 3,
      usedCount: 6,
      musicianId: baeThoven.id,
      tags: {
        connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
      },
    },
  });

  // Create Task Definitions for Moe Tissart
  const moeTask1 = await prisma.taskDefinition.create({
    data: {
      title: 'repertoire (basic)',
      description: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">For a specific song you are trying to get familiar with, go through this progression <b>2x each</b> until memorized. When this gets comfortable, take it into a new key.</span></p>`,
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
      tags: {
        connect: [{ id: pianoTag.id }, { id: repertoireTag.id }],
      },
    },
  });

  const moeTask2 = await prisma.taskDefinition.create({
    data: {
      title: 'repertoire (advanced)',
      description: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">To thoroughly memorize a specific song, go through this progression. Once these are comfortable, take into new keys. <b>Try singing the bass with scale degrees while playing melody.</b></span></p>`,
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
      tags: {
        connect: [{ id: pianoTag.id }, { id: repertoireTag.id }],
      },
    },
  });

  const moeTask3 = await prisma.taskDefinition.create({
    data: {
      title: 'jazz jam repertoire',
      description: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Prepping a specific chart for a jazz jam. Execute the following <b>2x each</b>. <u>Explore different voicings</u>.</span></p>`,
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
      tags: {
        connect: [
          { id: pianoTag.id },
          { id: repertoireTag.id },
          { id: jazzTag.id },
        ],
      },
    },
  });

  // Create Task Definitions for Kilometers Davis
  const kilometersTask1 = await prisma.taskDefinition.create({
    data: {
      title: 'Big Scale Exercise',
      description: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">For a given chart, move through the progression in the checklist. Here is one reference for chord scale options, though this is not exhaustive:</span><br><br><b><strong class="font-bold" style="white-space: pre-wrap;">Maj7</strong></b><span style="white-space: pre-wrap;">: Ionian -&gt; Lydian -&gt; Lydian #5</span><br><b><strong class="font-bold" style="white-space: pre-wrap;">min7</strong></b><span style="white-space: pre-wrap;">: Dorian -&gt; Aeolian -&gt; Phrygian</span><br><span style="white-space: pre-wrap;">   Phrygian = 1 b2 b3 4 5 b6 b7&nbsp; </span><br><b><strong class="font-bold" style="white-space: pre-wrap;">min7b5</strong></b><span style="white-space: pre-wrap;">: Locrian -&gt; Locrian natural 9</span><br><span style="white-space: pre-wrap;">   Locrian = 1 b2 b3 4 b5 b6 b7 </span><br><b><strong class="font-bold" style="white-space: pre-wrap;">dom7</strong></b><span style="white-space: pre-wrap;">: Mixo -&gt; Lyd b7 -&gt; b9 diminished scale -&gt; altered scale</span><br><span style="white-space: pre-wrap;">   Altered = 1 b2 b3 3 b5 b6 b7</span><br><b><strong class="font-bold" style="white-space: pre-wrap;">dom7#5</strong></b><span style="white-space: pre-wrap;">: Whole tone scale = 1 2 3 #4 #5 b7</span><br><b><strong class="font-bold" style="white-space: pre-wrap;">dom7b9b13</strong></b><span style="white-space: pre-wrap;">: harmonic minor scale (+ it's modes, especially 5th mode)</span><br><span style="white-space: pre-wrap;">   HM = 1 2 b3 4 5 b6 7</span><br><span style="white-space: pre-wrap;">   HM 5th Mode = 1 b2/b9 3 4 5 b6/b13 b7</span><br><b><strong class="font-bold" style="white-space: pre-wrap;">min major 7</strong></b><span style="white-space: pre-wrap;"> or </span><b><strong class="font-bold" style="white-space: pre-wrap;">maj7#5</strong></b><span style="white-space: pre-wrap;">: Augmented scale = 1 b3 3 5 #5 7</span><br><br><u><b><strong class="font-bold underline" style="white-space: pre-wrap;">Bebop alterations</strong></b></u><br><b><strong class="font-bold" style="white-space: pre-wrap;">Scales with a major 7th (major and melodic minor)</strong></b><br><span style="white-space: pre-wrap;">   Add a #5</span><br><b><strong class="font-bold" style="white-space: pre-wrap;">Scales with a flatted 7th (mixo, dorian</strong></b><span style="white-space: pre-wrap;">*</span><b><strong class="font-bold" style="white-space: pre-wrap;">, lydian b7, altered)</strong></b><br><span style="white-space: pre-wrap;">   Add a maj 7</span><br><span style="white-space: pre-wrap;">   *</span><i><em class="italic" style="white-space: pre-wrap;">sometimes the maj3 is added to dorian minor instead of the 7th</em></i></p>`,
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
      tags: {
        connect: [
          { id: pianoTag.id },
          { id: jazzTag.id },
          { id: repertoireTag.id },
          { id: musicianshipTag.id },
          { id: scalesTag.id },
        ],
      },
    },
  });

  // Create Task Definitions for Mandy Lin
  const mandyTask1 = await prisma.taskDefinition.create({
    data: {
      title: 'alternate picking (basic)',
      description: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">A progression to help get comfortable with <b>alternate picking</b>. Try with open strings, then with a chord shape underneath.</span></p>`,
      checklist: [
        'With open strings, alternate pick 1-2 1-3 1-4 etc, 2-2 2-3 etc … 6-5 6-4 etc',
        'With a chord shape underneath, alternate pick 12312313, 12412414,125 etc.',
        'With a chord shape underneath, pick down down up 12312313, 124 etc.',
      ],
      savedCount: 9,
      usedCount: 14,
      musicianId: mandyLin.id,
      tags: {
        connect: [{ id: guitarTag.id }, { id: bluegrassTag.id }],
      },
    },
  });

  const mandyTask2 = await prisma.taskDefinition.create({
    data: {
      title: 'chromatic picking (basic)',
      description: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">A progression to help get comfortable fingers while alternate picking. <b>Use a metronome</b> and work your way up the neck.</span></p>`,
      checklist: [
        'Pick 01234 from low to high strings, then back 43210',
        'Work your way up the neck',
        'Watch out for string 5',
        'Use a metronome',
      ],
      savedCount: 4,
      usedCount: 7,
      musicianId: mandyLin.id,
      tags: {
        connect: [{ id: guitarTag.id }],
      },
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
  // SHUFFLED ORDER for more randomness and less repetition
  const sessions = await Promise.all([
    // Bae Thoven session 1
    prisma.session.create({
      data: {
        title: 'Morning Listening Session',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Focused on <b>Bill Evans trio</b> recordings. The <u>form analysis</u> really helped me understand the harmonic movement better. I paid close attention to the instrumentation and how each part contributed to the overall sound. Noticed some subtle dynamic shifts that I hadn't caught before. I also reflected on what I liked and didn't like about the performance, which gave me new ideas for my own playing.</span></p>`,
        duration: 1800, // 30 minutes
        isPublic: true,
        musicianId: baeThoven.id,
        instruments: { connect: [{ id: listeningTag.id }] },
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),
    // Mandy Lin session 1 (was 11)
    prisma.session.create({
      data: {
        title: 'Alternate Picking Basics',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working on the basic patterns. The chord shapes underneath are helping with coordination. I tried alternating between open strings and chord shapes, focusing on keeping my picking hand relaxed. Noticed that my timing improves when I use a metronome. Still need to work on string crossing, but it's getting smoother.</span></p>`,
        duration: 1800, // 30 minutes
        isPublic: true,
        musicianId: mandyLin.id,
        instruments: { connect: [{ id: guitarTag.id }] },
        tags: { connect: [{ id: guitarTag.id }, { id: bluegrassTag.id }] },
      },
    }),
    // Moe Tissart session 1
    prisma.session.create({
      data: {
        title: 'Basic Repertoire - All of Me',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working through the basic progression. <b>Bass + melody</b> is getting more comfortable. I focused on memorizing the changes and tried to play the melody with different fingerings. Practiced the bass line separately before combining it with the melody. I want to try this in a new key next time.</span></p>`,
        duration: 2400, // 40 minutes
        isPublic: true,
        musicianId: moeTissart.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: { connect: [{ id: pianoTag.id }, { id: repertoireTag.id }] },
      },
    }),
    // Kilometers Davis session 1
    prisma.session.create({
      data: {
        title: 'Big Scale Exercise - Giant Steps',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working through all the chord scale options. The <b>bebop alterations</b> are adding some nice tension. I started by playing each scale out of time, then tried to connect them smoothly over the changes. Practiced switching directions randomly and using different rhythmic values. This really stretched my technique and ear.</span></p>`,
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
    // Mandy Lin session 2 (was 12)
    prisma.session.create({
      data: {
        title: 'Chromatic Picking Practice',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working up the neck with chromatic patterns. <b>Metronome at 80 BPM</b>. I focused on keeping my fingers close to the fretboard and making sure each note was clear. String 5 still trips me up sometimes, but it's improving. I alternated between ascending and descending patterns for variety.</span></p>`,
        duration: 1200, // 20 minutes
        isPublic: true,
        musicianId: mandyLin.id,
        instruments: { connect: [{ id: guitarTag.id }] },
        tags: { connect: [{ id: guitarTag.id }] },
      },
    }),
    // Bae Thoven session 2
    prisma.session.create({
      data: {
        title: 'Transcription Practice - Take Five',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working on <b>Paul Desmond's solo</b>. The timing is tricky but getting better at matching the feel. I spent time matching the pitches and replicating the phrasing. Practiced at a reduced tempo before trying it at full speed. Noticed some subtle articulation details that make a big difference.</span></p>`,
        duration: 1800, // 30 minutes
        isPublic: true,
        musicianId: baeThoven.id,
        instruments: { connect: [{ id: listeningTag.id }] },
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),
    // Moe Tissart session 2
    prisma.session.create({
      data: {
        title: 'Advanced Repertoire - Misty',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Singing bass with scale degrees while playing melody. This is challenging but really helps with memorization. I tried to sing the melody with scale degrees and then play the bass while singing. Combining both at once is tough but rewarding. I want to keep working on this approach.</span></p>`,
        duration: 2700, // 45 minutes
        isPublic: true,
        musicianId: moeTissart.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: { connect: [{ id: pianoTag.id }, { id: repertoireTag.id }] },
      },
    }),
    // Mandy Lin session 3 (was 13)
    prisma.session.create({
      data: {
        title: 'Bluegrass Tune - Cripple Creek',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Learning the basic melody and working on the picking pattern. I focused on keeping my right hand relaxed and consistent. Tried to play the tune at different tempos. The bluegrass feel is starting to come through. Still need to work on transitions between sections.</span></p>`,
        duration: 1500, // 25 minutes
        isPublic: true,
        musicianId: mandyLin.id,
        instruments: { connect: [{ id: guitarTag.id }] },
        tags: { connect: [{ id: guitarTag.id }, { id: bluegrassTag.id }] },
      },
    }),
    // Bae Thoven session 3
    prisma.session.create({
      data: {
        title: 'Transposition Work - Autumn Leaves',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Transposing the melody to different keys. <u>Singing scale degrees</u> really helps with internalizing the harmony. I started by understanding the song form, then sang the scale degrees before playing. Applying the melody to other keys was challenging but rewarding. The checklist helped me stay organized. I want to keep practicing this with other tunes. Singing the scale degrees is especially helpful.</span></p>`,
        duration: 900, // 15 minutes
        isPublic: true,
        musicianId: baeThoven.id,
        instruments: { connect: [{ id: pianoTag.id }] },
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),
    // Moe Tissart session 3
    prisma.session.create({
      data: {
        title: 'Jazz Jam Prep - Blue Bossa',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Prepping for the jazz jam tonight. <b>Rootless voicings</b> are sounding good. I explored different voicings and tried to connect them smoothly. Practiced the progression 2x each as suggested. Looking forward to trying this at the jam. The checklist gave me a clear structure. Rootless drop 2 voicings are sounding better.</span></p>`,
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
    // Kilometers Davis session 2
    prisma.session.create({
      data: {
        title: 'Scale Practice - Modal Jazz',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Focusing on <b>Dorian</b> and <b>Mixolydian</b> modes. The rhythmic variations are helping with time feel. I tried different rhythmic values and started at random places in the scale. Practiced switching directions and keeping the groove steady. The checklist helped me stay organized. This session really helped my modal playing. I want to keep exploring these modes.</span></p>`,
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
    // Moe Tissart session 4
    prisma.session.create({
      data: {
        title: 'Guitar Repertoire - Yesterday',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working on the Beatles tune on guitar. The chord changes are beautiful. I practiced the melody and tried to memorize the progression. Playing the bass and melody together is still a challenge. The checklist steps helped me break down the process. I want to try this with a metronome next time. The chord changes are beautiful. I'm making progress.</span></p>`,
        duration: 1500, // 25 minutes
        isPublic: true,
        musicianId: moeTissart.id,
        instruments: { connect: [{ id: guitarTag.id }] },
        tags: { connect: [{ id: guitarTag.id }, { id: repertoireTag.id }] },
      },
    }),
    // Bae Thoven session 4
    prisma.session.create({
      data: {
        title: 'Evening Listening - Classical Focus',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Analyzed <b>Beethoven's Moonlight Sonata</b>. The form is so clear and the emotional arc is incredible.</span></p>`, // keep this one short for variety
        duration: 1200, // 20 minutes
        isPublic: true,
        musicianId: baeThoven.id,
        instruments: { connect: [{ id: listeningTag.id }] },
        tags: {
          connect: [{ id: listeningTag.id }, { id: musicianshipTag.id }],
        },
      },
    }),
    // Kilometers Davis session 3
    prisma.session.create({
      data: {
        title: 'Jazz Standards - So What',
        notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working on the Miles Davis classic. The modal approach is really freeing.</span></p>`, // keep this one short for variety
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
  ]);

  // Update sessionTaskMap to match new session order
  const sessionTaskMap = [
    // Bae Thoven session 1 (index 0)
    {
      sessionIdx: 0,
      task: baeTask1,
      duration: 1500,
      notes:
        "Today I focused on analyzing the form and instrumentation of the Bill Evans trio recordings. I paid special attention to how the instruments interact and support each other. I also reflected on what I liked and didn't like about the performance, which gave me new ideas for my own playing. The checklist helped me stay organized and thorough. I want to keep developing my ear for these details. Overall, a very productive listening session.",
      tags: [listeningTag.id, musicianshipTag.id],
    },
    // Mandy Lin session 1 (index 1)
    {
      sessionIdx: 1,
      task: mandyTask1,
      duration: 1500,
      notes:
        "I worked on alternate picking with both open strings and chord shapes underneath. The checklist was helpful for keeping my practice structured. I noticed my picking hand is getting more relaxed, but string crossing still needs work. Using a metronome made a big difference in my timing. I'm starting to feel more comfortable with the patterns. Next time, I'll try to increase the tempo.",
      tags: [guitarTag.id, bluegrassTag.id],
    },
    // Moe Tissart session 1 (index 2)
    {
      sessionIdx: 2,
      task: moeTask1,
      duration: 2000,
      notes:
        "I went through the basic progression for All of Me, focusing on bass and melody separately before combining them. The checklist steps helped me memorize the changes. Playing bass + melody together is getting easier. I want to try this in a new key next time. Practicing the root position with melody was especially useful. I'm making steady progress.",
      tags: [pianoTag.id, repertoireTag.id],
    },
    // Kilometers Davis session 1 (index 3)
    {
      sessionIdx: 3,
      task: kilometersTask1,
      duration: 3000,
      notes:
        'I started by playing all the chord scale options out of time for each change. Then I played each scale from the root in time, focusing on smooth transitions. I experimented with starting at random places in the scale and switching directions. Using different rhythmic values helped me explore faster tempos. The bebop alterations added some nice tension. This exercise really stretched my technique and ear.',
      tags: [pianoTag.id, jazzTag.id, scalesTag.id],
    },
    // Mandy Lin session 2 (index 4)
    {
      sessionIdx: 4,
      task: mandyTask2,
      duration: 1000,
      notes:
        "I practiced chromatic picking up and down the neck, focusing on keeping my fingers close to the fretboard. The checklist reminded me to watch out for string 5, which still trips me up sometimes. Using a metronome at 80 BPM helped keep my timing steady. I alternated between ascending and descending patterns. My picking is getting cleaner, but there's still room for improvement. I'll keep working on this.",
      tags: [guitarTag.id],
    },
    // Bae Thoven session 2 (index 5)
    {
      sessionIdx: 5,
      task: baeTask2,
      duration: 1500,
      notes:
        "I focused on transcribing Paul Desmond's solo, matching the pitches and replicating the feel. Practiced at a reduced tempo before trying it at full speed. The checklist helped me break down the process into manageable steps. I noticed some subtle articulation details that make a big difference. Timing is still tricky, but I'm getting better. I want to keep refining this transcription.",
      tags: [listeningTag.id, musicianshipTag.id],
    },
    // Moe Tissart session 2 (index 6)
    {
      sessionIdx: 6,
      task: moeTask2,
      duration: 2200,
      notes:
        'I worked on advanced repertoire, singing the bass with scale degrees while playing the melody. Combining both at once is tough but rewarding. The checklist gave me a clear progression to follow. I want to keep working on this approach and try it in new keys. Memorization is improving. This method is challenging but effective.',
      tags: [pianoTag.id, repertoireTag.id],
    },
    // Mandy Lin session 3 (index 7)
    {
      sessionIdx: 7,
      task: mandyTask1,
      duration: 900,
      notes:
        "I practiced the bluegrass tune Cripple Creek, focusing on the picking pattern and keeping my right hand relaxed. Tried to play the tune at different tempos. The checklist steps helped me break down the melody and transitions. The bluegrass feel is starting to come through. Still need to work on transitions between sections. I'm enjoying the process.",
      tags: [guitarTag.id, bluegrassTag.id],
    },
    // Bae Thoven session 3 (index 8)
    {
      sessionIdx: 8,
      task: baeTask3,
      duration: 900,
      notes:
        'I worked on transposing a transcription for 15 minutes, starting by understanding the song form. Sang the scale degrees before playing, which helped internalize the harmony. Applying the melody to other keys was challenging but rewarding. The checklist kept me focused on the process. I want to keep practicing this with other tunes. Singing the scale degrees is especially helpful.',
      tags: [listeningTag.id, musicianshipTag.id],
    },
    // Moe Tissart session 3 (index 9)
    {
      sessionIdx: 9,
      task: moeTask3,
      duration: 1500,
      notes:
        'I prepped for the jazz jam by working through the checklist progression 2x each. Explored different rootless voicings and tried to connect them smoothly. Practiced the progression as suggested. Looking forward to trying this at the jam. The checklist gave me a clear structure. Rootless drop 2 voicings are sounding better.',
      tags: [pianoTag.id, repertoireTag.id, jazzTag.id],
    },
    // Kilometers Davis session 2 (index 10)
    {
      sessionIdx: 10,
      task: kilometersTask1,
      duration: 2000,
      notes:
        'I focused on modal jazz, practicing Dorian and Mixolydian modes. Tried different rhythmic values and started at random places in the scale. Practiced switching directions and keeping the groove steady. The checklist helped me stay organized. This session really helped my modal playing. I want to keep exploring these modes.',
      tags: [pianoTag.id, jazzTag.id, scalesTag.id],
    },
    // Moe Tissart session 4 (index 11)
    {
      sessionIdx: 11,
      task: moeTask1,
      duration: 1200,
      notes:
        "I worked on the Beatles tune Yesterday, practicing the melody and trying to memorize the progression. Playing the bass and melody together is still a challenge. The checklist steps helped me break down the process. I want to try this with a metronome next time. The chord changes are beautiful. I'm making progress.",
      tags: [guitarTag.id, repertoireTag.id],
    },
    // Bae Thoven session 4 (index 12)
    {
      sessionIdx: 12,
      task: baeTask1,
      duration: 1000,
      notes:
        "I listened to Beethoven's Moonlight Sonata and focused on the form and emotional arc. The checklist helped me analyze the structure. I reflected on what I liked about the performance. The clarity of the form stood out to me. I want to apply this kind of analysis to other pieces. Short but insightful session.",
      tags: [listeningTag.id, musicianshipTag.id],
    },
    // Kilometers Davis session 3 (index 13)
    {
      sessionIdx: 13,
      task: moeTask2,
      duration: 1200,
      notes:
        'I worked on jazz standards, focusing on singing the melody with scale degrees and playing bass. The checklist progression was helpful. Practiced maintaining the form while switching between roles. The modal approach is really freeing. I want to keep developing this skill. Enjoyed the process.',
      tags: [pianoTag.id, jazzTag.id, repertoireTag.id],
    },
  ];

  // For each session, create a TaskInUse for the mapped task (isSessionTask: false)
  for (const entry of sessionTaskMap) {
    await prisma.taskInUse.create({
      data: {
        duration: entry.duration,
        notes: entry.notes,
        isSessionTask: false,
        checklistCompletions: [],
        taskDefinitionId: entry.task.id,
        musicianId: entry.task.musicianId,
        sessionId: sessions[entry.sessionIdx].id,
        tags: { connect: entry.tags.map((id) => ({ id })) },
      },
    });
  }

  // For a few sessions, create only a free practice TaskInUse (isSessionTask: true, no taskDefinitionId)
  // Let's say sessions[6] and sessions[4] are free practice (updated indices)
  await prisma.taskInUse.create({
    data: {
      duration: 500,
      notes: 'Free practice time',
      isSessionTask: true,
      checklistCompletions: [],
      musicianId: moeTissart.id,
      sessionId: sessions[6].id,
      tags: { connect: [{ id: pianoTag.id }, { id: repertoireTag.id }] },
    },
  });
  await prisma.taskInUse.create({
    data: {
      duration: 200,
      notes: 'Free practice time',
      isSessionTask: true,
      checklistCompletions: [],
      musicianId: mandyLin.id,
      sessionId: sessions[4].id,
      tags: { connect: [{ id: guitarTag.id }] },
    },
  });

  // Create Comments
  await Promise.all([
    prisma.comment.create({
      data: {
        text: 'Love the focus on fundamentals! The form analysis is such a great approach.',
        musicianId: moeTissart.id,
        sessionId: sessions[0].id, // Bae Thoven session 1
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Great work on the alternate picking! The coordination will come with practice.',
        musicianId: baeThoven.id,
        sessionId: sessions[1].id, // Mandy Lin session 1
      },
    }),
    prisma.comment.create({
      data: {
        text: 'All of Me is a classic! The bass + melody approach is really solid.',
        musicianId: baeThoven.id,
        sessionId: sessions[2].id, // Moe Tissart session 1
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Giant Steps! Those chord scale options are intense but so rewarding.',
        musicianId: moeTissart.id,
        sessionId: sessions[3].id, // Kilometers Davis session 1
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Working up the neck with chromatic patterns is a great way to build finger strength!',
        musicianId: kilometersDavis.id,
        sessionId: sessions[4].id, // Mandy Lin session 2
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Take Five is such a great tune for transcription. The 5/4 time signature makes it really interesting!',
        musicianId: kilometersDavis.id,
        sessionId: sessions[5].id, // Bae Thoven session 2
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Misty is beautiful. The scale degree singing is such a powerful tool.',
        musicianId: kilometersDavis.id,
        sessionId: sessions[6].id, // Moe Tissart session 2
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Bluegrass tunes are so much fun! Keep working on those transitions.',
        musicianId: baeThoven.id,
        sessionId: sessions[7].id, // Mandy Lin session 3
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Transposing melodies is a great way to internalize harmony.',
        musicianId: mandyLin.id,
        sessionId: sessions[8].id, // Bae Thoven session 3
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Blue Bossa is perfect for jazz jams! Rootless voicings sound great.',
        musicianId: baeThoven.id,
        sessionId: sessions[9].id, // Moe Tissart session 3
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Modal jazz practice really opens up new possibilities.',
        musicianId: mandyLin.id,
        sessionId: sessions[10].id, // Kilometers Davis session 2
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Yesterday is such a beautiful tune. Great job working on the melody and bass together!',
        musicianId: kilometersDavis.id,
        sessionId: sessions[11].id, // Moe Tissart session 4
      },
    }),
    prisma.comment.create({
      data: {
        text: 'Love the focus on form and emotional arc in classical pieces.',
        musicianId: moeTissart.id,
        sessionId: sessions[12].id, // Bae Thoven session 4
      },
    }),
    prisma.comment.create({
      data: {
        text: 'So What is a classic! The modal approach is really freeing.',
        musicianId: baeThoven.id,
        sessionId: sessions[13].id, // Kilometers Davis session 3
      },
    }),
  ]);

  // Create Gas Ups (Likes): Ensure every session has at least 1 like, and typically more
  const allMusicians = [
    baeThoven,
    moeTissart,
    kilometersDavis,
    mandyLin,
    devUser,
  ];
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    // Don't allow the session owner to like their own post
    const possibleLikers = allMusicians.filter(
      (m) => m.id !== session.musicianId,
    );
    // Randomly select 1-4 likers
    const numLikes = Math.floor(Math.random() * 4) + 1; // 1 to 4 likes
    // Shuffle possibleLikers
    const shuffled = possibleLikers.sort(() => 0.5 - Math.random());
    const likers = shuffled.slice(0, numLikes);
    for (const liker of likers) {
      await prisma.gasUp.create({
        data: { musicianId: liker.id, sessionId: session.id },
      });
    }
  }

  // Create some Media
  await Promise.all([
    prisma.media.create({
      data: {
        musicianId: baeThoven.id,
        url: 'https://via.placeholder.com/600/4A90E2/FFFFFF?text=Listening+Session',
        type: 'image',
        sessionId: sessions[0].id, // Bae Thoven session 1
      },
    }),
    prisma.media.create({
      data: {
        musicianId: mandyLin.id,
        url: 'https://via.placeholder.com/600/E74C3C/FFFFFF?text=Guitar+Practice',
        type: 'image',
        sessionId: sessions[1].id, // Mandy Lin session 1
      },
    }),
    prisma.media.create({
      data: {
        musicianId: moeTissart.id,
        url: 'https://via.placeholder.com/600/7ED321/000000?text=Repertoire+Practice',
        type: 'image',
        sessionId: sessions[2].id, // Moe Tissart session 1
      },
    }),
    prisma.media.create({
      data: {
        musicianId: kilometersDavis.id,
        url: 'https://via.placeholder.com/600/9B59B6/FFFFFF?text=Jazz+Scales',
        type: 'image',
        sessionId: sessions[3].id, // Kilometers Davis session 1
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
