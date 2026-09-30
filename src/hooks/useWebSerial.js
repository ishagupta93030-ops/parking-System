import { useState, useRef, useCallback, useEffect } from 'react';

export function useWebSerial({ onLineReceived, onLog }) {
  const [isConnected, setIsConnected] = useState(false);
  const [portInfo, setPortInfo] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const writerRef = useRef(null);
  const keepReadingRef = useRef(false);

  useEffect(() => {
    setIsSupported('serial' in navigator);
  }, []);

  const connect = useCallback(async (baudRate = 9600) => {
    if (!('serial' in navigator)) {
      alert('Web Serial API is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Opera.');
      return false;
    }

    try {
      if (onLog) onLog(`[Serial] Requesting serial port at ${baudRate} baud...`, 'system');
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: Number(baudRate) });

      portRef.current = port;
      keepReadingRef.current = true;
      setIsConnected(true);

      const info = port.getInfo ? port.getInfo() : {};
      setPortInfo(info);

      if (onLog) onLog(`[Serial] Connected successfully at ${baudRate} baud 8-N-1.`, 'system');

      // Start asynchronous read loop
      readLoop(port);
      return true;
    } catch (err) {
      console.error('Serial connection error:', err);
      if (onLog) onLog(`[Serial Error] ${err.message}`, 'error');
      setIsConnected(false);
      return false;
    }
  }, [onLog]);

  const readLoop = async (port) => {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    readerRef.current = reader;

    let buffer = '';

    try {
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop(); // Retain incomplete line

          for (const line of lines) {
            const clean = line.trim();
            if (clean && onLineReceived) {
              onLineReceived(clean);
            }
          }
        }
      }
    } catch (err) {
      console.error('Serial stream read error:', err);
      if (onLog) onLog(`[Serial Stream Error] ${err.message}`, 'error');
    } finally {
      reader.releaseLock();
    }
  };

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;

    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        console.warn('Error cancelling reader:', e);
      }
      readerRef.current = null;
    }

    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (e) {
        console.warn('Error closing port:', e);
      }
      portRef.current = null;
    }

    setIsConnected(false);
    setPortInfo(null);
    if (onLog) onLog('[Serial] Disconnected from Arduino.', 'system');
  }, [onLog]);

  // Send single ASCII command or string to Arduino
  const sendCommand = useCallback(async (text) => {
    if (!portRef.current || !portRef.current.writable) {
      if (onLog) onLog('[Serial] Cannot send: port not writable or disconnected.', 'error');
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const writer = portRef.current.writable.getWriter();
      await writer.write(encoder.encode(text));
      writer.releaseLock();
      if (onLog) onLog(`[Serial Sent] -> "${text.trim()}"`, 'system');
      return true;
    } catch (err) {
      console.error('Serial write error:', err);
      if (onLog) onLog(`[Serial Write Error] ${err.message}`, 'error');
      return false;
    }
  }, [onLog]);

  return {
    isConnected,
    isSupported,
    portInfo,
    connect,
    disconnect,
    sendCommand
  };
}
