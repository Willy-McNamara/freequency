import React, { useEffect, useState } from 'react';
import { Badge, Stack, Wrap, WrapItem } from '@chakra-ui/react';
import {
  instrumentBadges,
  PopularInstrument,
  instrumentsMasterList,
} from '../../types/instruments.types';

interface Props {
  initialInstruments: PopularInstrument[];
  toggleInstrument: (instrument: string) => void;
}

const InstrumentBadgeWrapEditable = ({
  initialInstruments,
  toggleInstrument,
}: Props) => {
  // const [instruments, setInstruments] = useState<string[]>(initialInstruments);

  // const toggleInstrument = (instrument: string) => {
  //   if (instruments.includes(instrument)) {
  //     // Remove instrument if it's already in the list
  //     setInstruments(instruments.filter((item) => item !== instrument));
  //   } else {
  //     // Add instrument if it's not in the list
  //     setInstruments([...instruments, instrument]);
  //   }
  // };

  const instruments = initialInstruments;

  return (
    <Wrap>
      {instrumentsMasterList.map((instrument) => {
        const variant = instruments.includes(instrument) ? 'solid' : 'outline';
        return (
          <WrapItem key={instrument}>
            <Badge
              variant={variant}
              colorScheme={instrumentBadges[instrument]}
              onClick={() => toggleInstrument(instrument)}
              cursor="pointer"
            >
              {instrument}
            </Badge>
          </WrapItem>
        );
      })}
    </Wrap>
  );
};

export default InstrumentBadgeWrapEditable;
