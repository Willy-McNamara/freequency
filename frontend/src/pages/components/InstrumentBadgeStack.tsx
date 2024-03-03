import React from 'react';
import { Badge, Stack } from '@chakra-ui/react';
import {
  instrumentBadges,
  PopularInstrument,
} from '../../types/instruments.types';

interface Props {
  instruments: PopularInstrument[];
}

const InstrumentBadgeStack = ({ instruments }: Props) => {
  // take in instruments
  // render badge for each
  //const instruments: PopularInstrument[] = ['Guitar', 'Piano', 'Drums'];
  return (
    <Stack direction="row">
      {instruments.map((instrument) => {
        // return a badge for associated instrument in instrumentBadgesList
        // maybe add little icons for each instrument in the future!
        return (
          <Badge variant="subtle" colorScheme={instrumentBadges[instrument]}>
            {instrument}
          </Badge>
        );
      })}
    </Stack>
  );
};

export default InstrumentBadgeStack;
