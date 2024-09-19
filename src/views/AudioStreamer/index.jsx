import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';

const AudioStreamer = () => {
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [devices, setDevices] = useState({ audioInputs: [], audioOutputs: [] });
  const userAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    // Get available media devices (audio inputs and outputs)
    navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
      const audioInputs = deviceInfos.filter((device) => device.kind === 'audioinput');
      const audioOutputs = deviceInfos.filter((device) => device.kind === 'audiooutput');
      setDevices({ audioInputs, audioOutputs });
    });

    // Request access to the user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true }).then((audioStream) => {
      setStream(audioStream);
      userAudioRef.current.srcObject = audioStream; // Play local audio
    });
  }, []);

  const startCall = (initiator) => {
    const p = new Peer({
      initiator,
      trickle: false,
      stream,
    });

    p.on('signal', (data) => {
      // Share this signal with the other peer via a signaling server or manually
      console.log('SIGNAL:', JSON.stringify(data));
    });

    p.on('stream', (remoteStream) => {
      setRemoteStream(remoteStream);
      remoteAudioRef.current.srcObject = remoteStream; // Play remote audio
    });

    setPeer(p);
  };

  const connectPeer = (signal) => {
    if (peer) {
      peer.signal(signal);
    }
  };

  const setAudioInput = (deviceId) => {
    navigator.mediaDevices
      .getUserMedia({ audio: { deviceId } })
      .then((audioStream) => {
        setStream(audioStream);
        userAudioRef.current.srcObject = audioStream;
      });
  };

  const setAudioOutput = (deviceId) => {
    if (remoteAudioRef.current.setSinkId) {
      remoteAudioRef.current.setSinkId(deviceId); // Play remote audio through selected output (requires browser support)
    } else {
      console.warn('Browser does not support setting audio output device');
    }
  };

  return (
    <div>
      <h1>Audio Streaming with WebRTC</h1>

      {/* Local Audio */}
      <h3>Local Audio</h3>
      <audio ref={userAudioRef} autoPlay muted />

      {/* Remote Audio */}
      <h3>Remote Audio</h3>
      <audio ref={remoteAudioRef} autoPlay />

      {/* Buttons to Start and Join Call */}
      <div>
        <button onClick={() => startCall(true)}>Start Call</button>
        <button onClick={() => startCall(false)}>Join Call</button>
      </div>

      {/* Manual Signal Input (For Testing) */}
      <textarea
        onChange={(e) => connectPeer(JSON.parse(e.target.value))}
        placeholder="Paste Signal Data Here"
      ></textarea>

      {/* Audio Input Device Selection */}
      <div>
        <h3>Select Audio Input Device</h3>
        <select onChange={(e) => setAudioInput(e.target.value)}>
          <option value="">Select Input Device</option>
          {devices.audioInputs.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Input Device ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      {/* Audio Output Device Selection */}
      <div>
        <h3>Select Audio Output Device</h3>
        <select onChange={(e) => setAudioOutput(e.target.value)}>
          <option value="">Select Output Device</option>
          {devices.audioOutputs.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Output Device ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AudioStreamer;