import React from 'react';

interface CountUpTimerProps {
  time: number;
  durationRef: React.MutableRefObject<null>;
}

const DurationTimer = ({
  time,
  durationRef,
}: CountUpTimerProps): JSX.Element => {
  return (
    <div ref={durationRef}>
      {('0' + Math.floor((time / 3600000) % 24)).slice(-2)}:
      {('0' + Math.floor((time / 60000) % 60)).slice(-2)}:
      {('0' + Math.floor((time / 1000) % 60)).slice(-2)}
    </div>
  );
};

export default DurationTimer;
