/*
This implimentation was inspired by
https://github.com/devitcf/react-countup-timer
*/

import moment from 'moment';
import React, { useState, useEffect, useRef } from 'react';

interface CountUpTimerProps {
  startTime?: number;
  isRunning: boolean;
  durationRef?: React.MutableRefObject<null>;
}
/*
I incorporated this pauseDiff state and logic to keep track of the time that has passed while the timer is paused.
it does not work perfectly, and I have no clue about performance, but it feels good enough for now!
*/

const DurationTimer = ({
  startTime,
  isRunning,
  durationRef,
}: CountUpTimerProps): JSX.Element => {
  const [diff, setDiff] = useState(0);
  const [pauseDiff, setPauseDiff] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let pauseIntervalId: NodeJS.Timeout;

    const tick = (diffFunc: {
      (value: React.SetStateAction<number>): void;
      (value: React.SetStateAction<number>): void;
      (arg0: number): void;
    }) => {
      console.log('tick ran');
      let timeDiff = 0;
      if (startTime) {
        timeDiff = moment().unix() - startTime - pauseDiff;
      }
      diffFunc(timeDiff);
    };

    if (isRunning) {
      intervalId = setInterval(() => tick(setDiff), 1000);
    } else if (startTime != 0) {
      pauseIntervalId = setInterval(() => tick(setPauseDiff), 1000);
    }

    return () => {
      clearInterval(intervalId);
      clearInterval(pauseIntervalId);
    };
  }, [isRunning, startTime]);

  const getCurrentTime = () => {
    return moment
      .utc(moment.duration(startTime ? diff : 0, 's').as('ms'))
      .format('H:mm:ss');
  };

  return <div ref={durationRef}>{getCurrentTime()}</div>;
};

export default DurationTimer;
