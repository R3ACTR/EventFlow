'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Calendar, 
  Clock, 
  Trophy, 
  FileText, 
  Star, 
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  User,
  MessageSquare,
  BarChart3,
  Eye,
  Save
} from "lucide-react";

export default function JudgeDashboard() {
  const [user, setUser] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [completedEvaluations, setCompletedEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Score form state
  const [scores, setScores] = useState({
    innovation: 0,
    feasibility: 0,
    presentation: 0,
    impact: 0,
    documentation: 0
  });
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchJudgeData(parsedUser.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchJudgeData = async (userId) => {
    try {
      // In a real app, this would fetch from API
      // For now, using mock data
      setTimeout(() => {
        setSubmissions([
          {
            id: 1,
            teamName: "Team Apollo",
            projectName: "AI-Powered Analytics Platform",
            event: "HackTech 2026",
            submittedAt: "2026-02-14T10:30:00Z",
            status: "pending",
            members: 4,
            description: "An AI-powered analytics platform that helps businesses make data-driven decisions."
          },
          {
            id: 2,
            teamName: "HyperLoopers",
            projectName: "Sustainable Transport Solution",
            event: "HackTech 2026",
            submittedAt: "2026-02-13T15:45:00Z",
            status: "pending",
            members: 3,
            description: "A revolutionary sustainable transport solution using magnetic levitation."
          },
          {
            id: 3,
            teamName: "EcoInnovators",
            projectName: "Green Energy Grid",
            event: "HackTech 2026",
            submittedAt: "2026-02-12T09:00:00Z",
            status: "pending",
            members: 5,
            description: "A smart grid system for efficient distribution of renewable energy."
          },
          {
            id: 4,
            teamName: "DataViz Wizards",
            projectName: "Interactive Dashboard",
            event: "HackTech 2026",
            submittedAt: "2026-02-11T14:20:00Z",
            status: "pending",
            members: 4,
            description: "Real-time data visualization dashboard for enterprise analytics."
          }
        ]);

        setCompletedEvaluations([
          {
            id: 101,
            teamName: "CloudNinjas",
            projectName: "Cloud Optimization Tool",
            score: 85,
            evaluatedAt: "2026-02-10T11:00:00Z",
            feedback: "Great innovation and presentation. Consider improving documentation."
          },
          {
            id: 102,
            teamName: "MobileFirst",
            projectName: "Health Tracking App",
            score: 78,
            evaluatedAt: "2026-02-09T16:30:00Z",
            feedback: "Good feasibility but needs more market research."
          },
          {
            id: 103,
            teamName: "BlockChainers",
            projectName: "Supply Chain Tracker",
            score: 92,
            evaluatedAt: "2026-02-08T10:15:00Z",
            feedback: "Excellent work! Very innovative solution with strong impact."
          }
        ]);

        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error fetching judge data:", error);
      setLoading(false);
    }
  };

  const handleOpenEvaluation = (submission) => {
    setSelectedSubmission(submission);
    setShowScoreModal(true);
  };

  const handleScoreChange = (field, value) => {
    setScores({ ...scores, [field]: parseInt(value) });
  };

  const handleSubmitScore = async () => {
    if (!selectedSubmission) return;

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    
    // Create completed evaluation
    const newEvaluation = {
      id: Date.now(),
      teamName: selectedSubmission.teamName,
      projectName: selectedSubmission.projectName,
      score: totalScore,
      evaluatedAt: new Date().toISOString(),
      feedback: feedback
    };

    // Remove from pending
    setSubmissions(submissions.filter(s => s.id !== selectedSubmission.id));
    // Add to completed
    setCompletedEvaluations([newEvaluation, ...completedEvaluations]);
    
    showNotification("Score submitted successfully!", "success");
    setShowScoreModal(false);
    setScores({ innovation: 0, feasibility: 0, presentation: 0, impact: 0, documentation: 0 });
    setFeedback("");
    setSelectedSubmission(null);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  };

  const filteredSubmissions = submissions.filter(sub =>
    sub.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompleted = completedEvaluations.filter(eval_ =>
    eval_.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eval_.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === "success" 
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {notification.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">Judge Dashboard</h1>
              <p className="mt-2 text-amber-100 text-lg">
                Review, evaluate, and score project submissions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Reviews</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{submissions.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{completedEvaluations.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Average Score</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {completedEvaluations.length > 0 
                    ? Math.round(completedEvaluations.reduce((a, b) => a + b.score, 0) / completedEvaluations.length)
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Top Score</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {completedEvaluations.length > 0 
                    ? Math.max(...completedEvaluations.map(e => e.score))
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="border-b border-slate-200">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === "pending"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Pending Reviews ({submissions.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 border-b-2 font-medium transition-colors ${
                  activeTab === "completed"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Completed ({completedEvaluations.length})
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by team or project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "pending" ? (
              filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No pending reviews</h3>
                  <p className="text-slate-500">All submissions have been evaluated.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">{submission.teamName}</h4>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              {submission.event}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium">{submission.projectName}</p>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{submission.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {submission.members} members
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEvaluation(submission)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                          >
                            <Star className="w-4 h-4" />
                            Evaluate
                          </button>
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              filteredCompleted.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No completed evaluations</h3>
                  <p className="text-slate-500">Start reviewing pending submissions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCompleted.map((evaluation) => (
                    <div key={evaluation.id} className="p-4 border border-slate-200 rounded-xl">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900">{evaluation.teamName}</h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getScoreColor(evaluation.score)} bg-opacity-10`}>
                              Score: {evaluation.score}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium">{evaluation.projectName}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(evaluation.evaluatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className={`text-3xl font-bold ${getScoreColor(evaluation.score)}`}>
                              {getScoreGrade(evaluation.score)}
                            </div>
                            <p className="text-xs text-slate-500">Grade</p>
                          </div>
                          <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </div>
                      {evaluation.feedback && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Feedback:</span> {evaluation.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Score Modal */}
      {showScoreModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900">Evaluate: {selectedSubmission.teamName}</h3>
              <p className="text-slate-500">{selectedSubmission.projectName}</p>
            </div>

            {/* Scoring Criteria */}
            <div className="space-y-4 mb-6">
              {[
                { key: "innovation", label: "Innovation", max: 25 },
                { key: "feasibility", label: "Feasibility", max: 25 },
                { key: "presentation", label: "Presentation", max: 20 },
                { key: "impact", label: "Impact", max: 20 },
                { key: "documentation", label: "Documentation", max: 10 }
              ].map((criteria) => (
                <div key={criteria.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">{criteria.label}</label>
                    <span className="text-sm text-slate-500">{scores[criteria.key]}/{criteria.max}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={criteria.max}
                    value={scores[criteria.key]}
                    onChange={(e) => handleScoreChange(criteria.key, e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Total Score */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Total Score</span>
                <span className="text-2xl font-bold text-slate-900">
                  {Object.values(scores).reduce((a, b) => a + b, 0)}/100
                </span>
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Provide constructive feedback..."
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowScoreModal(false);
                  setSelectedSubmission(null);
                }}
                className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitScore}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Submit Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
