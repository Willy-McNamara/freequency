export type PopularInstrument =
  | 'Guitar'
  | 'Piano'
  | 'Drums'
  | 'Violin'
  | 'Saxophone'
  | 'Trumpet'
  | 'Bass'
  | 'Flute'
  | 'Clarinet'
  | 'Harp'
  | 'Accordion'
  | 'Trombone';

type PopularColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'brown'
  | 'cyan'
  | 'magenta'
  | 'lime'
  | 'teal';

type InstrumentBadges = {
  [Instrument in PopularInstrument]: PopularColor;
};

export const instrumentBadges: InstrumentBadges = {
  Guitar: 'red',
  Piano: 'blue',
  Drums: 'green',
  Violin: 'yellow',
  Saxophone: 'purple',
  Trumpet: 'orange',
  Bass: 'pink',
  Flute: 'brown',
  Clarinet: 'cyan',
  Harp: 'magenta',
  Accordion: 'lime',
  Trombone: 'teal',
};
