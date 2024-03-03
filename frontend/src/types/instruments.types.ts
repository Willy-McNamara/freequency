export type PopularInstrument =
  | 'Guitar'
  | 'Piano'
  | 'Drums'
  | 'Violin'
  | `Singin'`
  | 'Trumpet'
  | 'Bass'
  | 'Flute'
  | 'Clarinet'
  | 'Harp'
  | 'Saxophone'
  | 'Trombone';
/*
I am limited to the main chakra schemes
I can extend them to include more colors- save that for polish!
*/
type PopularColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'gray'
  | 'cyan'
  | 'blackAlpha';

type InstrumentBadges = {
  [Instrument in PopularInstrument]: PopularColor;
};

export const instrumentBadges: InstrumentBadges = {
  Guitar: 'red',
  Piano: 'blue',
  Drums: 'green',
  Violin: 'yellow',
  "Singin'": 'purple',
  Trumpet: 'orange',
  Bass: 'pink',
  Flute: 'gray',
  Clarinet: 'cyan',
  Harp: 'blue',
  Saxophone: 'red',
  Trombone: 'blackAlpha',
};

export const instrumentsMasterList: PopularInstrument[] = [
  'Guitar',
  'Piano',
  'Drums',
  'Violin',
  `Singin'`,
  'Trumpet',
  'Bass',
  'Flute',
  'Clarinet',
  'Harp',
  'Saxophone',
  'Trombone',
];
