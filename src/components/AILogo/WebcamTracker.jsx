import React, { useEffect, useRef } from 'react';
import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-converter';
import '@tensorflow/tfjs-backend-webgl';
import useAiStore from '../../store/aiStore';

const WebcamTracker = () => {
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const animationRef = useRef(null);
  
  const { isAiModeEnabled, setCameraPermission, setFacePosition } = useAiStore();

  useEffect(() => {
    let active = true;

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 },
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (active) videoRef.current.play();
          };
        }
        setCameraPermission(true);
        return true;
      } catch (err) {
        console.error("Webcam error:", err);
        setCameraPermission(false);
        return false;
      }
    };

    const loadModel = async () => {
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig = {
        runtime: 'tfjs', // use tfjs instead of mediapipe to avoid external CDN dependencies if possible, or tfjs is default
      };
      detectorRef.current = await faceDetection.createDetector(model, detectorConfig);
    };

    const detectFace = async () => {
      if (!detectorRef.current || !videoRef.current || videoRef.current.readyState !== 4) {
        if (active) animationRef.current = requestAnimationFrame(detectFace);
        return;
      }

      try {
        const faces = await detectorRef.current.estimateFaces(videoRef.current);
        if (faces.length > 0) {
          // Get the center of the first detected face
          const face = faces[0];
          const box = face.box;
          const xCenter = box.xMin + box.width / 2;
          const yCenter = box.yMin + box.height / 2;
          
          // Normalize coordinates between -1 and 1
          // X is flipped because camera is mirrored
          const normalizedX = -((xCenter / videoRef.current.videoWidth) * 2 - 1);
          const normalizedY = -((yCenter / videoRef.current.videoHeight) * 2 - 1);

          setFacePosition({ x: normalizedX, y: normalizedY, z: 0 });
        } else {
          // Interpolate back to center if no face detected
          setFacePosition({ x: 0, y: 0, z: 0 });
        }
      } catch (e) {
        console.error("Face detection error:", e);
      }

      if (active) {
        animationRef.current = requestAnimationFrame(detectFace);
      }
    };

    if (isAiModeEnabled) {
      Promise.all([setupCamera(), loadModel()]).then(([camSuccess]) => {
        if (camSuccess && active) {
          detectFace();
        }
      });
    }

    return () => {
      active = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, [isAiModeEnabled, setCameraPermission, setFacePosition]);

  if (!isAiModeEnabled) return null;

  return (
    <video
      ref={videoRef}
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        opacity: 0,
        pointerEvents: 'none'
      }}
      playsInline
      muted
    />
  );
};

export default WebcamTracker;
