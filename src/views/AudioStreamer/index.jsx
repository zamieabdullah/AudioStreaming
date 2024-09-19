import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';

const AudioStreamer = () => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [remoteSignal, setRemoteSignal] = useState('');
  const [localSignal, setLocalSignal] = useState('');
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState('');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState('');
  
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const filterNodeRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        setLocalSignal(JSON.stringify(pc.localDescription));
      }
    };

    pc.ontrack = (event) => {
      const remoteAudio = remoteAudioRef.current;
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        remoteAudio.srcObject = event.streams[0];
        setupAudioContext(event.streams[0]); // Set up the filter context for remote audio
        console.log("ontrach")
      }
    };

    setPeerConnection(pc);
    getAudioDevices(); // Load the input/output device list on load
  }, []);

  const getAudioDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const inputDevices = devices.filter((device) => device.kind === 'audioinput');
    const outputDevices = devices.filter((device) => device.kind === 'audiooutput');

    setAudioInputDevices(inputDevices);
    setAudioOutputDevices(outputDevices);
  };

  const setupAudioContext = (stream) => {
    if (!audioContextRef.current) {
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // Create Gain Node and set it to 0.75
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.75;
      gainNodeRef.current = gainNode;

      // Create BiquadFilter Node for frequency range of 0-200Hz
      const filterNode = audioContext.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 200;
      filterNodeRef.current = filterNode;

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(filterNode);
      filterNode.connect(audioContext.destination);
    }
  };

  const handleToggleFilter = () => {
    if (!audioContextRef.current || !gainNodeRef.current || !filterNodeRef.current) {
      return;
    }
  
    if (!filterEnabled) {
      // Disable filter (bypass filter node)
      try {
        // Check if the gainNode is connected to filterNode before disconnecting
        gainNodeRef.current.disconnect(filterNodeRef.current);
        gainNodeRef.current.connect(audioContextRef.current.destination);
        console.log(gainNodeRef)
      } catch (err) {
        console.error('Failed to disable filter:', err);
      }
    } else {
      // Enable filter (connect filter node)
      try {
        // Check if the gainNode is connected directly to destination before disconnecting
        gainNodeRef.current.disconnect(audioContextRef.current.destination);
        gainNodeRef.current.connect(filterNodeRef.current);
        filterNodeRef.current.connect(audioContextRef.current.destination);
        console.log(filterNodeRef)
        console.log(gainNodeRef)
      } catch (err) {
        console.error('Failed to enable filter:', err);
      }
    }
  
    setFilterEnabled(!filterEnabled);
  };

  useEffect(() => {
    console.log(filterEnabled)
  }, [filterEnabled])

  const startCall = async () => {
    try {
      const constraints = {
        audio: {
          deviceId: selectedInputDevice ? { exact: selectedInputDevice } : undefined
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      const localAudio = localAudioRef.current;
      localAudio.srcObject = stream;

      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      setLocalSignal(JSON.stringify(offer)); // Save the offer
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
  };

  const handleRemoteSignal = async () => {
    const remoteDesc = new RTCSessionDescription(JSON.parse(remoteSignal));
    await peerConnection.setRemoteDescription(remoteDesc);

    if (remoteDesc.type === 'offer') {
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      setLocalSignal(JSON.stringify(answer));
    }
  };

  const handleOutputDeviceChange = async (deviceId) => {
    const audio = remoteAudioRef.current;
    if (audio.setSinkId) {
      await audio.setSinkId(deviceId);
      setSelectedOutputDevice(deviceId);
    } else {
      console.warn('Browser does not support audio output device selection.');
    }
  };

  return (
    <div>
      <h2>Audio Stream with Frequency and Gain Filter</h2>

      <audio id="localAudio" ref={localAudioRef} autoPlay muted />
      <audio id="remoteAudio" ref={remoteAudioRef} autoPlay />

      {/* Input and Output device selection */}
      <div>
        <label>Select Input Device:</label>
        <select onChange={(e) => setSelectedInputDevice(e.target.value)} value={selectedInputDevice}>
          {audioInputDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Microphone ${device.deviceId}`}
            </option>
          ))}
        </select>

        <label>Select Output Device:</label>
        <select onChange={(e) => handleOutputDeviceChange(e.target.value)} value={selectedOutputDevice}>
          {audioOutputDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Speaker ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <textarea
          value={localSignal}
          readOnly
          placeholder="Your signal will appear here"
          rows="8"
          cols="50"
        />
        <br />
        <textarea
          value={remoteSignal}
          onChange={(e) => setRemoteSignal(e.target.value)}
          placeholder="Paste remote signal here"
          rows="8"
          cols="50"
        />
        <br />
        <button onClick={handleRemoteSignal}>Process Remote Signal</button>
        <button onClick={startCall}>Start Call</button>
        <button onClick={handleToggleFilter}>
          {!filterEnabled ? 'Disable Filter' : 'Enable Filter'}
        </button>
      </div>
    </div>
  );
};

export default AudioStreamer;