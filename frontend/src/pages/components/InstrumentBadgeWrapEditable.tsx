import React, { useEffect, useState } from 'react';
import { Badge, Stack, Wrap, WrapItem } from '@chakra-ui/react';
import {
  instrumentBadges,
  PopularInstrument,
  instrumentsMasterList,
} from '../../types/instruments.types';

interface Props {
  initialInstruments: PopularInstrument[];
  toggleInstrument: (instrument: PopularInstrument) => void;
  instrumentList?: PopularInstrument[];
}

const InstrumentBadgeWrapEditable = ({
  initialInstruments,
  toggleInstrument,
  instrumentList,
}: Props) => {
  const instruments = instrumentList || instrumentsMasterList;
  return (
    <Wrap>
      {instruments.map((instrument) => {
        const variant = initialInstruments.includes(instrument)
          ? 'solid'
          : 'outline';
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
