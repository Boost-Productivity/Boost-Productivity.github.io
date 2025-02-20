import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, where, Timestamp } from 'firebase/firestore';
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
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || currentUser.uid !== ADMIN_USER_ID) {
            navigate('/');
            return;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const q = query(
            collection(db, 'events'),
            where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newEvents = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp.toDate()
                }))
                .filter(event => event.userId !== ADMIN_USER_ID);

            setEvents(newEvents);
            calculateMetrics(newEvents);
            calculateDailyGoals(newEvents);
        });

        return () => unsubscribe();
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