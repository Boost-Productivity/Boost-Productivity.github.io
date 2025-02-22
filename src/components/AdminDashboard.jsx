import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAuth } from 'firebase/auth';

const ALLOWED_EMAILS = ['jacob.beauchamp75@gmail.com'];
const ADMIN_USER_ID = 'zsQNFSuTo2cC1TVCdEMeBA4VbbS2';

function AdminDashboard() {
    const [events, setEvents] = useState([]);
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        totalGoals: 0,
        activeUsers: 0,
        anonymousGoals: 0
    });
    const [dailyGoals, setDailyGoals] = useState([]);
    const [videoMetrics, setVideoMetrics] = useState({
        totalViews: 0,
        versionAViews: 0,
        versionBViews: 0,
        averageWatchTime: 0,
        totalLikes: 0
    });
    const [versionMetrics, setVersionMetrics] = useState({
        A: {
            views: 0,
            avgWatchTime: 0,
            likes: 0,
            feedback: []
        },
        B: {
            views: 0,
            avgWatchTime: 0,
            likes: 0,
            feedback: []
        }
    });
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || currentUser.uid !== ADMIN_USER_ID) {
            navigate('/');
            return;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const fetchEvents = async () => {
            const q = query(
                collection(db, 'events'),
                where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
                orderBy('timestamp', 'desc')
            );

            console.time('fetchEvents');
            const snapshot = await getDocs(q);
            console.timeEnd('fetchEvents');

            console.time('processEvents');
            const newEvents = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp.toDate()
                }))
                .filter(event => event.userId !== ADMIN_USER_ID);
            console.timeEnd('processEvents');

            console.time('calculations');
            setEvents(newEvents);
            calculateMetrics(newEvents);
            calculateDailyGoals(newEvents);
            console.timeEnd('calculations');
        };

        fetchEvents();
    }, [currentUser, navigate]);

    const calculateMetrics = (events) => {
        const uniqueUsers = new Set(events.map(e => e.userId).filter(id => id !== 'anonymous'));
        const goalSubmissions = events.filter(e => e.type === 'node_submitted');
        const anonymousGoals = goalSubmissions.filter(e => e.userId === 'anonymous');
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeUsers = new Set(
            events
                .filter(e => new Date(e.timestamp) > last24h)
                .map(e => e.userId)
        ).size;

        setMetrics({
            totalUsers: uniqueUsers.size,
            totalGoals: goalSubmissions.length,
            activeUsers,
            anonymousGoals: anonymousGoals.length
        });

        // Video metrics
        const videoViews = events.filter(e => e.type === 'video_view');
        const versionAViews = videoViews.filter(e => e.version === 'A').length;
        const versionBViews = videoViews.filter(e => e.version === 'B').length;

        const videoEvents = events.filter(e => e.type.startsWith('video_'));

        const metrics = {
            A: {
                views: videoEvents.filter(e => e.version === 'A' && e.type === 'video_view').length,
                likes: videoEvents.filter(e => e.version === 'A' && e.type === 'video_like' && e.action === 'like').length,
                avgWatchTime: 0,
                feedback: videoEvents
                    .filter(e => e.version === 'A' && e.type === 'video_feedback')
                    .map(e => ({ feedback: e.feedback, timestamp: e.timestamp }))
            },
            B: {
                views: videoEvents.filter(e => e.version === 'B' && e.type === 'video_view').length,
                likes: videoEvents.filter(e => e.version === 'B' && e.type === 'video_like' && e.action === 'like').length,
                avgWatchTime: 0,
                feedback: videoEvents
                    .filter(e => e.version === 'B' && e.type === 'video_feedback')
                    .map(e => ({ feedback: e.feedback, timestamp: e.timestamp }))
            }
        };

        // Calculate average watch time per session for each version
        const watchTimesBySession = {
            A: new Map(),
            B: new Map()
        };

        videoEvents
            .filter(e => e.type === 'video_watch_time')
            .forEach(e => {
                const version = e.version;
                const sessionId = e.sessionId;
                const watchTime = e.watchTime;

                if (version && sessionId) {
                    // Keep only the maximum watch time for each session
                    const currentMax = watchTimesBySession[version].get(sessionId) || 0;
                    if (watchTime > currentMax) {
                        watchTimesBySession[version].set(sessionId, watchTime);
                    }
                }
            });

        // Calculate average watch time for each version
        ['A', 'B'].forEach(version => {
            const watchTimes = Array.from(watchTimesBySession[version].values());
            metrics[version].avgWatchTime = watchTimes.length > 0
                ? Math.round(watchTimes.reduce((sum, time) => sum + time, 0) / watchTimes.length)
                : 0;
        });

        setVersionMetrics(metrics);
    };

    const calculateDailyGoals = (events) => {
        const dailyCounts = {};
        const goalEvents = events.filter(e => e.type === 'node_submitted');

        goalEvents.forEach(event => {
            const date = event.timestamp.toISOString().split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        const sortedData = Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        setDailyGoals(sortedData);
    };

    if (!currentUser || currentUser.uid !== ADMIN_USER_ID) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-text-primary p-8">
            <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-surface p-4 rounded-lg border border-border">
                    <h3 className="text-text-secondary text-sm mb-1">Total Users</h3>
                    <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border">
                    <h3 className="text-text-secondary text-sm mb-1">Total Goals</h3>
                    <div className="text-2xl font-bold">{metrics.totalGoals}</div>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border">
                    <h3 className="text-text-secondary text-sm mb-1">Active Users (24h)</h3>
                    <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                </div>
                <div className="bg-surface p-4 rounded-lg border border-border">
                    <h3 className="text-text-secondary text-sm mb-1">Anonymous Goals</h3>
                    <div className="text-2xl font-bold">{metrics.anonymousGoals}</div>
                </div>
            </div>

            {/* Goals Over Time Chart */}
            <div className="bg-surface p-4 rounded-lg border border-border mb-8">
                <h2 className="text-lg font-bold mb-4">Goals Created (Last 30 Days)</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyGoals}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="date"
                                stroke="#666"
                                tick={{ fill: '#666' }}
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fill: '#666' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1E1F25',
                                    border: '1px solid #333',
                                    borderRadius: '4px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#4C9AFF"
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Goals Section */}
            <div className="bg-surface p-4 rounded-lg border border-border mb-8">
                <h2 className="text-lg font-bold mb-4">Recent Goals</h2>
                <div className="space-y-4">
                    {events
                        .filter(event => event.type === 'node_submitted')
                        .slice(0, 20)
                        .map(event => (
                            <div key={event.id} className="bg-background p-4 rounded-lg border border-border">
                                <div className="text-lg">{event.data.goalText}</div>
                                <div className="mt-2 text-sm text-text-secondary flex flex-col gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className={event.userId === 'anonymous' ? 'text-yellow-500' : 'text-green-500'}>
                                            {event.userId === 'anonymous' ? '👤 Anonymous' : '✓ ' + event.userId}
                                        </span>
                                        <span>{new Date(event.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs opacity-60">
                                        Session: {event.sessionId || 'No session ID'}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* A/B Test Comparison */}
            <div className="bg-surface p-4 rounded-lg border border-border mb-8">
                <h2 className="text-lg font-bold mb-4">A/B Test Comparison</h2>

                <div className="grid grid-cols-2 gap-8">
                    {['A', 'B'].map(version => (
                        <div key={version} className="space-y-6">
                            <div className="text-xl font-semibold mb-4 text-center">
                                Version {version}
                                <span className="text-sm text-text-secondary ml-2">
                                    ({version === 'A' ? 'with intro' : 'without intro'})
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-background p-4 rounded-lg border border-border">
                                    <h3 className="text-text-secondary text-sm mb-1">Views</h3>
                                    <div className="text-2xl font-bold">{versionMetrics[version].views}</div>
                                </div>
                                <div className="bg-background p-4 rounded-lg border border-border">
                                    <h3 className="text-text-secondary text-sm mb-1">Average Watch Time</h3>
                                    <div className="text-2xl font-bold">{versionMetrics[version].avgWatchTime}s</div>
                                </div>
                                <div className="bg-background p-4 rounded-lg border border-border">
                                    <h3 className="text-text-secondary text-sm mb-1">Likes</h3>
                                    <div className="text-2xl font-bold">{versionMetrics[version].likes}</div>
                                </div>

                                <div className="bg-background p-4 rounded-lg border border-border">
                                    <h3 className="text-text-secondary text-sm mb-2">Feedback</h3>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                        {versionMetrics[version].feedback.map((item, i) => (
                                            <div key={i} className="text-sm p-3 bg-surface rounded border border-border">
                                                <div>{item.feedback}</div>
                                                <div className="text-xs text-text-secondary mt-1">
                                                    {new Date(item.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Events Section */}
            <div className="bg-surface p-4 rounded-lg border border-border">
                <h2 className="text-lg font-bold mb-4">Recent Events</h2>
                <div className="space-y-4">
                    {events
                        .filter(event => event.type !== 'node_submitted')
                        .slice(0, 10)
                        .map(event => (
                            <div key={event.id} className="bg-background p-4 rounded-lg border border-border">
                                <div className="font-medium">{event.type}</div>
                                <div className="text-text-secondary text-sm">
                                    User: {event.userId}
                                </div>
                                <div className="text-text-secondary text-sm">
                                    {new Date(event.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard; 