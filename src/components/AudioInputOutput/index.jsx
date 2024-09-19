import React, { useState, useEffect } from 'react';

const AudioInputOutput = ({ audioElement }) => {
  const [audioOutputs, setAudioOutputs] = useState([]);
  const [selectedOutput, setSelectedOutput] = useState('');

  useEffect(() => {
    // Fetch the audio output devices
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const outputDevices = devices.filter((device) => device.kind === 'audiooutput');
      setAudioOutputs(outputDevices);
    });
  }, []);

  const handleAudioOutputChange = async (e) => {
    const outputDeviceId = e.target.value;
    setSelectedOutput(outputDeviceId);

    if (audioElement.current && typeof audioElement.current.setSinkId === 'function') {
      try {
        await audioElement.current.setSinkId(outputDeviceId);
        console.log(`Audio output set to device: ${outputDeviceId}`);
      } catch (error) {
        console.error('Error setting output device:', error);
      }
    } else {
      console.warn('setSinkId is not supported by your browser.');
    }
  };

  return (
    <div>
      <h2>Select Audio Output</h2>
      <select onChange={handleAudioOutputChange} value={selectedOutput}>
        <option value="" disabled>Select Audio Output</option>
        {audioOutputs.map((output) => (
          <option key={output.deviceId} value={output.deviceId}>
            {output.label || `Output Device ${output.deviceId}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AudioInputOutput;