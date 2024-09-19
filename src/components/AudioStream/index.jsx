// components/AudioStream.js
import React, { useState, useRef } from 'react';
import SimplePeer from 'simple-peer';
import AudioInputOutput from '../AudioInputOutput';

const AudioStream = () => {
  const [peer, setPeer] = useState(null);
  const localAudioRef = useRef(null);  // Reference for local audio playback
  const remoteAudioRef = useRef(null); // Reference for remote audio playback

  // Start streaming local audio
  const startStream = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      localAudioRef.current.srcObject = stream;
      const newPeer = new SimplePeer({ initiator: true, trickle: false, stream });
      setPeer(newPeer);

      newPeer.on('signal', (data) => {
        // Send the signal to the other user
        console.log('Signal data:', data);
      });

      newPeer.on('stream', (remoteStream) => {
        remoteAudioRef.current.srcObject = remoteStream;
      });
    });
  };

  return (
    <div>
      <h1>Audio Stream</h1>
      <button onClick={startStream}>Start Streaming</button>
      {/* Local audio stream */}
      <audio ref={localAudioRef} controls autoPlay />
      
      {/* Remote audio stream */}
      <audio ref={remoteAudioRef} controls autoPlay />
      
      {/* Pass the remote audio reference to allow output selection */}
      <AudioInputOutput audioElement={remoteAudioRef} />
    </div>
  );
};

export default AudioStream;
