"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const MAX_LENGTH = 30;
const sanitizeTagLabel = (label) => label
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
        if (!sanitized)
            continue;
        instrumentTags[sanitized] = await prisma.tag.upsert({
            where: { label: sanitized },
            update: {},
            create: { label: sanitized },
        });
    }
    const additionalTags = [
        'musicianship',
        'repertoire',
        'jazz',
        'scales',
        'bluegrass',
    ];
    for (const label of additionalTags) {
        const sanitized = sanitizeTagLabel(label);
        if (!sanitized)
            continue;
        instrumentTags[sanitized] = await prisma.tag.upsert({
            where: { label: sanitized },
            update: {},
            create: { label: sanitized },
        });
    }
    const pianoTag = instrumentTags['piano'];
    const guitarTag = instrumentTags['guitar'];
    const listeningTag = instrumentTags['listening'];
    const musicianshipTag = instrumentTags['musicianship'];
    const repertoireTag = instrumentTags['repertoire'];
    const jazzTag = instrumentTags['jazz'];
    const scalesTag = instrumentTags['scales'];
    const bluegrassTag = instrumentTags['bluegrass'];
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
            totalPracticeSeconds: 64800,
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
            totalPracticeSeconds: 79200,
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
            totalPracticeSeconds: 90000,
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
            totalPracticeSeconds: 57600,
            totalGasUpsGiven: 14,
            totalGasUpsReceived: 16,
            instruments: {
                connect: [{ id: guitarTag.id }],
            },
        },
    });
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
            totalPracticeSeconds: 18000,
            totalGasUpsGiven: 3,
            totalGasUpsReceived: 4,
            instruments: {
                connect: [{ id: pianoTag.id }, { id: listeningTag.id }],
            },
        },
    });
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
    await Promise.all([
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
    const sessions = await Promise.all([
        prisma.session.create({
            data: {
                title: 'Morning Listening Session',
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Focused on <b>Bill Evans trio</b> recordings. The <u>form analysis</u> really helped me understand the harmonic movement better.</span></p>`,
                duration: 1800,
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
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working on <b>Paul Desmond's solo</b>. The timing is tricky but getting better at matching the feel.</span></p>`,
                duration: 1800,
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
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Transposing the melody to different keys. <u>Singing scale degrees</u> really helps with internalizing the harmony.</span></p>`,
                duration: 900,
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
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Analyzed <b>Beethoven's Moonlight Sonata</b>. The form is so clear and the emotional arc is incredible.</span></p>`,
                duration: 1200,
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
                title: 'Basic Repertoire - All of Me',
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working through the basic progression. <b>Bass + melody</b> is getting more comfortable.</span></p>`,
                duration: 2400,
                isPublic: true,
                musicianId: moeTissart.id,
                instruments: { connect: [{ id: pianoTag.id }] },
                tags: { connect: [{ id: pianoTag.id }, { id: repertoireTag.id }] },
            },
        }),
        prisma.session.create({
            data: {
                title: 'Advanced Repertoire - Misty',
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Singing bass with scale degrees while playing melody. This is challenging but really helps with memorization.</span></p>`,
                duration: 2700,
                isPublic: true,
                musicianId: moeTissart.id,
                instruments: { connect: [{ id: pianoTag.id }] },
                tags: { connect: [{ id: pianoTag.id }, { id: repertoireTag.id }] },
            },
        }),
        prisma.session.create({
            data: {
                title: 'Jazz Jam Prep - Blue Bossa',
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Prepping for the jazz jam tonight. <b>Rootless voicings</b> are sounding good.</span></p>`,
                duration: 1800,
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
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working on the Beatles tune on guitar. The chord changes are beautiful.</span></p>`,
                duration: 1500,
                isPublic: true,
                musicianId: moeTissart.id,
                instruments: { connect: [{ id: guitarTag.id }] },
                tags: { connect: [{ id: guitarTag.id }, { id: repertoireTag.id }] },
            },
        }),
        prisma.session.create({
            data: {
                title: 'Big Scale Exercise - Giant Steps',
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working through all the chord scale options. The <b>bebop alterations</b> are adding some nice tension.</span></p>`,
                duration: 3600,
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
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Focusing on <b>Dorian</b> and <b>Mixolydian</b> modes. The rhythmic variations are helping with time feel.</span></p>`,
                duration: 2700,
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
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working on the Miles Davis classic. The modal approach is really freeing.</span></p>`,
                duration: 2400,
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
        prisma.session.create({
            data: {
                title: 'Alternate Picking Basics',
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working on the basic patterns. The chord shapes underneath are helping with coordination.</span></p>`,
                duration: 1800,
                isPublic: true,
                musicianId: mandyLin.id,
                instruments: { connect: [{ id: guitarTag.id }] },
                tags: { connect: [{ id: guitarTag.id }, { id: bluegrassTag.id }] },
            },
        }),
        prisma.session.create({
            data: {
                title: 'Chromatic Picking Practice',
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Working up the neck with chromatic patterns. <b>Metronome at 80 BPM</b>.</span></p>`,
                duration: 1200,
                isPublic: true,
                musicianId: mandyLin.id,
                instruments: { connect: [{ id: guitarTag.id }] },
                tags: { connect: [{ id: guitarTag.id }] },
            },
        }),
        prisma.session.create({
            data: {
                title: 'Bluegrass Tune - Cripple Creek',
                notes: `<p class="leading-7 [&:not(:first-child)]:mt-6" dir="ltr"><span style="white-space: pre-wrap;">Learning the basic melody and working on the picking pattern.</span></p>`,
                duration: 1500,
                isPublic: true,
                musicianId: mandyLin.id,
                instruments: { connect: [{ id: guitarTag.id }] },
                tags: { connect: [{ id: guitarTag.id }, { id: bluegrassTag.id }] },
            },
        }),
    ]);
    const sessionTaskMap = [
        {
            sessionIdx: 0,
            task: baeTask1,
            duration: 1500,
            notes: 'Form analysis',
            tags: [listeningTag.id, musicianshipTag.id],
        },
        {
            sessionIdx: 1,
            task: baeTask2,
            duration: 1500,
            notes: 'Transcription focus',
            tags: [listeningTag.id, musicianshipTag.id],
        },
        {
            sessionIdx: 2,
            task: baeTask3,
            duration: 900,
            notes: 'Transposing melody',
            tags: [listeningTag.id, musicianshipTag.id],
        },
        {
            sessionIdx: 3,
            task: baeTask1,
            duration: 1000,
            notes: 'Classical listening',
            tags: [listeningTag.id, musicianshipTag.id],
        },
        {
            sessionIdx: 4,
            task: moeTask1,
            duration: 2000,
            notes: 'Basic progression',
            tags: [pianoTag.id, repertoireTag.id],
        },
        {
            sessionIdx: 5,
            task: moeTask2,
            duration: 2200,
            notes: 'Advanced memorization',
            tags: [pianoTag.id, repertoireTag.id],
        },
        {
            sessionIdx: 6,
            task: moeTask3,
            duration: 1500,
            notes: 'Jazz jam prep',
            tags: [pianoTag.id, repertoireTag.id, jazzTag.id],
        },
        {
            sessionIdx: 7,
            task: moeTask1,
            duration: 1200,
            notes: 'Guitar melody',
            tags: [guitarTag.id, repertoireTag.id],
        },
        {
            sessionIdx: 8,
            task: kilometersTask1,
            duration: 3000,
            notes: 'Big scale exercise',
            tags: [pianoTag.id, jazzTag.id, scalesTag.id],
        },
        {
            sessionIdx: 9,
            task: kilometersTask1,
            duration: 2000,
            notes: 'Modal practice',
            tags: [pianoTag.id, jazzTag.id, scalesTag.id],
        },
        {
            sessionIdx: 10,
            task: moeTask2,
            duration: 1200,
            notes: 'Jazz standards',
            tags: [pianoTag.id, jazzTag.id, repertoireTag.id],
        },
        {
            sessionIdx: 11,
            task: mandyTask1,
            duration: 1500,
            notes: 'Alternate picking',
            tags: [guitarTag.id, bluegrassTag.id],
        },
        {
            sessionIdx: 12,
            task: mandyTask2,
            duration: 1000,
            notes: 'Chromatic picking',
            tags: [guitarTag.id],
        },
        {
            sessionIdx: 13,
            task: mandyTask1,
            duration: 900,
            notes: 'Bluegrass tune',
            tags: [guitarTag.id, bluegrassTag.id],
        },
    ];
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
    await prisma.taskInUse.create({
        data: {
            duration: 500,
            notes: 'Free practice time',
            isSessionTask: true,
            checklistCompletions: [],
            musicianId: moeTissart.id,
            sessionId: sessions[5].id,
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
            sessionId: sessions[12].id,
            tags: { connect: [{ id: guitarTag.id }] },
        },
    });
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
//# sourceMappingURL=seed.js.map