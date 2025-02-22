import React, { useEffect, useRef, useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

function CameraFeed() {
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();
    const chunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);

    useEffect(() => {
        // Check for browser support on mount
        if (!navigator.mediaDevices?.getUserMedia) {
            // Fallback for older browsers
            navigator.mediaDevices = {};
            navigator.mediaDevices.getUserMedia = function (constraints) {
                const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

                if (!getUserMedia) {
                    setError('Your browser does not support camera access. Please try using Chrome or Firefox.');
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }

                return new Promise((resolve, reject) => {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            };
        }

        // Cleanup function
        return () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            // Simple check for basic support
            if (!navigator?.mediaDevices?.getUserMedia) {
                throw new Error('Camera API is not supported in your browser');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Initialize MediaRecorder
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = handleDataAvailable;

            setError(null);
        } catch (err) {
            setError('Failed to access camera: ' + err.message);
            console.error('Camera error:', err);
        }
    };

    const handleDataAvailable = async (event) => {
        if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);

            // Create a blob from the chunks
            const blob = new Blob([event.data], { type: 'video/webm' });

            // Upload to Firebase Storage
            try {
                const timestamp = new Date().toISOString();
                const userId = currentUser?.uid || 'anonymous';
                const path = `camera_feeds/${userId}/${timestamp}.webm`;
                const storageRef = ref(storage, path);

                await uploadBytes(storageRef, blob);
                console.log('Uploaded chunk:', timestamp);

                // Clear the chunks after successful upload
                chunksRef.current = [];
            } catch (err) {
                console.error('Error uploading chunk:', err);
            }
        }
    };

    const startRecording = () => {
        if (!mediaRecorderRef.current) return;

        chunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);

        // Set up interval to stop and start recording every minute
        recordingIntervalRef.current = setInterval(() => {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.start();
        }, 60000); // 60 seconds
    };

    const stopRecording = () => {
        if (!mediaRecorderRef.current) return;

        mediaRecorderRef.current.stop();
        setIsRecording(false);

        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }

        // Stop all tracks
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-lg mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-text-primary">Camera Feed</h1>

                {error && (
                    <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-surface border border-border rounded-lg overflow-hidden mb-4">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-auto"
                    />
                </div>

                <div className="space-x-4">
                    <button
                        onClick={startCamera}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                        disabled={isRecording}
                    >
                        Start Camera
                    </button>

                    <button
                        onClick={startRecording}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                        disabled={isRecording || !mediaRecorderRef.current}
                    >
                        Start Recording
                    </button>

                    <button
                        onClick={stopRecording}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                        disabled={!isRecording}
                    >
                        Stop Recording
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CameraFeed; 