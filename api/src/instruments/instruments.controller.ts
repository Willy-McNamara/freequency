import { Controller, Get } from '@nestjs/common';

@Controller('instruments')
export class InstrumentsController {
  @Get('all-labels')
  getAllLabels(): string[] {
    return [
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
  }
}
