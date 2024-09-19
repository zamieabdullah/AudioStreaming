import React, { useState, useEffect, useRef } from 'react';

const AudioFilters = ({ stream }) => {
  const audioContext = useRef(null);
  const [filterOn, setFilterOn] = useState(false);

  useEffect(() => {
    if (stream) {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const gainNode = audioCtx.createGain();
      const biquadFilter = audioCtx.createBiquadFilter();

      gainNode.gain.value = 0.75;
      biquadFilter.type = 'lowpass';
      biquadFilter.frequency.value = 200;

      if (filterOn) {
        source.connect(biquadFilter).connect(gainNode).connect(audioCtx.destination);
      } else {
        source.connect(audioCtx.destination);
      }

      audioContext.current = audioCtx;
    }
  }, [stream, filterOn]);

  return (
    <div>
      <button onClick={() => setFilterOn((prev) => !prev)}>
        {filterOn ? 'Disable Filter' : 'Enable Filter'}
      </button>
    </div>
  );
};

export default AudioFilters;