import React from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';

interface props {
  addAudioUrl: (blob: Blob) => void;
}

const RecordAudio = ({ addAudioUrl }: props) => {
  return (
    <AudioRecorder
      onRecordingComplete={addAudioUrl}
      audioTrackConstraints={{
        noiseSuppression: true,
        echoCancellation: true,
      }}
      // recorderControls= there is a custom hook, but I couldn't quickly get it working
      // would be helpful for stopping at 10seconds!
      onNotAllowedOrFound={(err) => console.table(err)}
      mediaRecorderOptions={{
        audioBitsPerSecond: 128000,
      }}
      showVisualizer={true}
    />
  );
};

export default RecordAudio;
