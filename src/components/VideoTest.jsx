import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { IoThumbsUpOutline, IoThumbsUp, IoChatbubbleOutline } from 'react-icons/io5';

const VIDEO_SOURCES = {
    A: {
        id: 'video_a',
        path: 'test_videos/content_01_version_a_with_intro.mp4',
        title: 'Video'
    },
    B: {
        id: 'video_b',
        path: 'test_videos/content_01_version_b_without_intro.mp4',
        title: 'Video'
    }
};

function VideoTest() {
    const [version, setVersion] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [sessionId, setSessionId] = useState('');
    const [liked, setLiked] = useState(false);
    const [watchTime, setWatchTime] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState('');
    const videoRef = useRef(null);
    const watchTimeIntervalRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);

    // Initialize session and determine video version
    useEffect(() => {
        const initializeVideo = async () => {
            const newSessionId = crypto.randomUUID();
            setSessionId(newSessionId);

            // Randomly select version A or B
            const selectedVersion = Math.random() < 0.5 ? 'A' : 'B';
            setVersion(selectedVersion);

            // Get video URL from Firebase Storage
            const storage = getStorage();
            const videoRef = ref(storage, VIDEO_SOURCES[selectedVersion].path);

            try {
                const url = await getDownloadURL(videoRef);
                setVideoUrl(url);
                setIsMuted(true);

                // Ensure video starts playing when loaded
                if (videoRef.current) {
                    videoRef.current.muted = true;
                    videoRef.current.play().catch(error => {
                        console.error('Error auto-playing video:', error);
                    });
                }

                // Log video view event
                logEvent('video_view', {
                    version: selectedVersion,
                    sessionId: newSessionId
                });
            } catch (error) {
                console.error('Error getting video URL:', error);
            }
        };

        initializeVideo();

        return () => {
            if (watchTimeIntervalRef.current) {
                clearInterval(watchTimeIntervalRef.current);
            }
        };
    }, []);

    // Track watch time
    useEffect(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        let lastPlayTime = 0;
        let isPlaying = false;

        const handlePlay = () => {
            isPlaying = true;
            lastPlayTime = Date.now();

            // Start tracking watch time
            watchTimeIntervalRef.current = setInterval(() => {
                if (isPlaying) {
                    const currentTime = Date.now();
                    const newWatchTime = watchTime + (currentTime - lastPlayTime) / 1000;
                    setWatchTime(newWatchTime);
                    lastPlayTime = currentTime;

                    // Log watch time every second
                    logEvent('video_watch_time', {
                        version,
                        sessionId,
                        watchTime: newWatchTime
                    });
                }
            }, 1000);
        };

        const handlePause = () => {
            isPlaying = false;
            if (watchTimeIntervalRef.current) {
                clearInterval(watchTimeIntervalRef.current);
            }
        };

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, [videoRef.current, version, sessionId, watchTime]);

    const handleLike = async () => {
        const newLikedState = !liked;
        setLiked(newLikedState);

        logEvent('video_like', {
            version,
            sessionId,
            action: newLikedState ? 'like' : 'unlike'
        });
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!feedback.trim()) return;

        logEvent('video_feedback', {
            version,
            sessionId,
            feedback: feedback.trim()
        });

        setFeedback('');
        setShowFeedback(false);
    };

    const handleDoubleTap = async () => {
        if (!liked) {
            setLiked(true);
            logEvent('video_like', {
                version,
                sessionId,
                action: 'like',
                method: 'double_tap'
            });
        }
    };

    const logEvent = async (eventType, data) => {
        try {
            await addDoc(collection(db, 'events'), {
                type: eventType,
                timestamp: new Date(),
                ...data
            });
        } catch (error) {
            console.error('Error logging event:', error);
        }
    };

    if (!version || !videoUrl) return null;

    const videoData = VIDEO_SOURCES[version];

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="relative h-[100vh] w-full max-w-[500px] bg-black">
                <div className="h-full w-full relative">
                    <video
                        ref={videoRef}
                        className="h-full w-full object-cover"
                        playsInline
                        autoPlay
                        muted={isMuted}
                        loop
                        src={videoUrl}
                        onClick={() => {
                            const video = videoRef.current;
                            if (video) {
                                const newMutedState = !video.muted;
                                video.muted = newMutedState;
                                setIsMuted(newMutedState);
                            }
                        }}
                    />

                    {/* Sound Indicator - now using React state instead of DOM element */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {isMuted && (
                            <div className="bg-black/50 rounded-full p-6">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Interaction Overlay */}
                    <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6">
                        <button
                            onClick={handleLike}
                            className="flex flex-col items-center gap-1"
                        >
                            {liked ? (
                                <IoThumbsUp className="text-primary w-8 h-8" />
                            ) : (
                                <IoThumbsUpOutline className="text-white w-8 h-8" />
                            )}
                            <span className="text-white text-sm">
                                {liked ? 'Liked' : 'Like'}
                            </span>
                        </button>

                        <button
                            onClick={() => setShowFeedback(true)}
                            className="flex flex-col items-center gap-1"
                        >
                            <IoChatbubbleOutline className="text-white w-8 h-8" />
                            <span className="text-white text-sm">Feedback</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            {showFeedback && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-text-primary">
                            Share your thoughts
                        </h3>
                        <form onSubmit={handleFeedbackSubmit}>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full h-32 bg-background border border-border rounded-lg p-3 text-text-primary resize-none focus:outline-none focus:border-primary"
                                placeholder="What did you think about this video?"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFeedback(false)}
                                    className="px-4 py-2 text-text-primary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-md"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoTest; 