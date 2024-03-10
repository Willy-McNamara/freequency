import React from 'react';
import { Badge, Stack, Wrap, WrapItem } from '@chakra-ui/react';
import {
  instrumentBadges,
  PopularInstrument,
  instrumentsMasterList,
} from '../../types/instruments.types';

interface Props {
  instruments: PopularInstrument[];
}

const InstrumentBadgeWrap = ({ instruments }: Props) => {
  // place this into a flexbox of desired width for wrapping. May need to make Wrap width=100%..
  return (
    <Wrap>
      {instruments.map((instrument) => {
        return (
          <WrapItem>
            <Badge variant="subtle" colorScheme={instrumentBadges[instrument]}>
              {instrument}
            </Badge>
          </WrapItem>
        );
      })}
    </Wrap>
  );
};

export default InstrumentBadgeWrap;
