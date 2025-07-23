import {
  Guitar,
  Piano,
  Drum,
  Music,
  Mic,
  Headphones,
  Speaker,
  Disc3,
} from "lucide-react";

// Comprehensive mapping of instruments to their appropriate icons
export const INSTRUMENT_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  // String instruments
  guitar: Guitar,
  "bass guitar": Guitar,
  violin: Music, // Using Music icon for violin
  cello: Music, // Using Music icon for cello
  ukulele: Music, // Using guitar icon for ukulele
  harp: Music, // Using Music icon for harp
  banjo: Guitar, // Using guitar icon for banjo
  "double bass": Guitar, // Using guitar icon for double bass

  // Keyboard instruments
  piano: Piano,
  keyboard: Piano,
  accordion: Piano, // Using piano icon for accordion

  // Wind instruments
  saxophone: Music, // Using Music icon for saxophone
  flute: Music, // Using Music icon for flute
  clarinet: Music, // Using Music icon for clarinet
  trumpet: Music, // Using Music icon for trumpet
  trombone: Music, // Using Music icon for trombone
  oboe: Music, // Using Music icon for oboe

  // Percussion
  drums: Drum,
  percussion: Drum,

  // Voice
  voice: Mic,

  // Electronic/DJ
  djing: Disc3,
  production: Speaker,

  // Listening
  listening: Headphones,
};

/**
 * Get the appropriate icon component for a given instrument
 * @param instrument - The instrument name (case-insensitive)
 * @returns The icon component to use
 */
export const getInstrumentIcon = (
  instrument: string
): React.ComponentType<{ className?: string }> => {
  const lowerInstrument = instrument.toLowerCase();

  // Direct match first
  if (INSTRUMENT_ICONS[lowerInstrument]) {
    return INSTRUMENT_ICONS[lowerInstrument];
  }

  // Partial matches for variations
  if (
    lowerInstrument.includes("guitar") ||
    lowerInstrument.includes("banjo") ||
    lowerInstrument.includes("bass")
  )
    return Guitar;
  if (
    lowerInstrument.includes("piano") ||
    lowerInstrument.includes("keyboard") ||
    lowerInstrument.includes("accordion")
  )
    return Piano;
  if (
    lowerInstrument.includes("drum") ||
    lowerInstrument.includes("percussion")
  )
    return Drum;
  if (
    lowerInstrument.includes("saxophone") ||
    lowerInstrument.includes("sax") ||
    lowerInstrument.includes("flute") ||
    lowerInstrument.includes("clarinet") ||
    lowerInstrument.includes("oboe") ||
    lowerInstrument.includes("trumpet") ||
    lowerInstrument.includes("trombone") ||
    lowerInstrument.includes("violin") ||
    lowerInstrument.includes("cello") ||
    lowerInstrument.includes("ukulele") ||
    lowerInstrument.includes("harp")
  )
    return Music;
  if (lowerInstrument.includes("voice") || lowerInstrument.includes("vocal"))
    return Mic;
  if (lowerInstrument.includes("dj") || lowerInstrument.includes("djing"))
    return Disc3;
  if (lowerInstrument.includes("production")) return Speaker;
  if (lowerInstrument.includes("listening")) return Headphones;

  // Default fallback
  return Music;
};
