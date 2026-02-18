'use client';

import React, { useState, useEffect } from 'react';

export default function JudgeDashboard({ user }) {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [scores, setScores] = useState({
        innovation: 0,
        execution: 0,
        presentation: 0,
        impact: 0,
    });
    const [feedback, setFeedback] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [gradedSubmissionIds, setGradedSubmissionIds] = useState(new Set());

    useEffect(() => {
        fetchSubmissions();
        fetchMyScores();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await fetch('/api/submissions');
            const data = await res.json();
            if (res.ok) {
                setSubmissions(data);
            }
        } catch (error) {
            console.error("Failed to fetch submissions", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyScores = async () => {
        try {
            const res = await fetch('/api/scores');
            const data = await res.json();
            if (res.ok) {
                const gradedIds = new Set(data.map(s => s.submission._id));
                setGradedSubmissionIds(gradedIds);
            }
        } catch (error) {
            console.error("Failed to fetch scores", error);
        }
    };

    const handleScoreChange = (e) => {
        const { name, value } = e.target;
        setScores(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const handleSubmitScore = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const res = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionId: selectedSubmission._id,
                    criteria: scores,
                    feedback
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Score submitted successfully!' });
                setGradedSubmissionIds(prev => new Set(prev).add(selectedSubmission._id));
                setTimeout(() => {
                    setSelectedSubmission(null);
                    setMessage(null);
                    setScores({ innovation: 0, execution: 0, presentation: 0, impact: 0 });
                    setFeedback("");
                }, 1500);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to submit score' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading submissions...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Judge Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Submissions to Grade</h2>
                    {submissions.length === 0 ? (
                        <p>No submissions found.</p>
                    ) : (
                        <ul className="space-y-4">
                            {submissions.map(sub => (
                                <li
                                    key={sub._id}
                                    className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${selectedSubmission?._id === sub._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} ${gradedSubmissionIds.has(sub._id) ? 'opacity-75' : ''}`}
                                    onClick={() => setSelectedSubmission(sub)}
                                >
                                    <h3 className="font-bold text-lg">{sub.title}</h3>
                                    <p className="text-sm text-gray-600">Event: {sub.event?.title}</p>
                                    <p className="text-sm text-gray-600">Team: {sub.team?.name}</p>
                                    {gradedSubmissionIds.has(sub._id) && (
                                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">Graded</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div>
                    {selectedSubmission ? (
                        <div className="border rounded-lg p-6 bg-white shadow-sm sticky top-6">
                            <h2 className="text-2xl font-bold mb-2">{selectedSubmission.title}</h2>
                            <p className="text-gray-700 mb-4">{selectedSubmission.description}</p>
                            <div className="mb-6">
                                <a href={selectedSubmission.repoLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-4">GitHub Repo</a>
                                {selectedSubmission.demoLink && (
                                    <a href={selectedSubmission.demoLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Live Demo</a>
                                )}
                            </div>

                            {gradedSubmissionIds.has(selectedSubmission._id) ? (
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded">
                                    You have already graded this submission.
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitScore}>
                                    <h3 className="font-semibold text-lg mb-4">Scoring</h3>

                                    <div className="space-y-4 mb-6">
                                        {['innovation', 'execution', 'presentation', 'impact'].map(criteria => (
                                            <div key={criteria}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                                    {criteria} (0-10)
                                                </label>
                                                <input
                                                    type="number"
                                                    name={criteria}
                                                    min="0" max="10"
                                                    value={scores[criteria]}
                                                    onChange={handleScoreChange}
                                                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 h-24"
                                            placeholder="Optional feedback..."
                                        />
                                    </div>

                                    {message && (
                                        <div className={`p-3 mb-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {message.text}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Score'}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 border rounded-lg bg-gray-50 text-gray-500">
                            Select a submission to grade
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
