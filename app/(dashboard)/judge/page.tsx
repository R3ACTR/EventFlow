import { auth } from "@/auth";
import { redirect } from "next/navigation";
import JudgeDashboardClient from "./JudgeDashboardClient";

export const dynamic = 'force-dynamic';

export default function JudgeDashboard() {
  const { data: session, status } = useSession();
  const user = session?.user;
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
  const [isReadOnly, setIsReadOnly] = useState(false);

  const fetchJudgeData = async () => {
    try {
      const res = await fetch("/api/judge/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.pending || []);
        setCompletedEvaluations(data.completed || []);
      }
    } catch (error) {
      console.error("Error fetching judge data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchJudgeData();
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [status, user?.id]);



  const handleOpenEvaluation = (submission) => {
    setSelectedSubmission(submission);
    setScores({ innovation: 0, feasibility: 0, presentation: 0, impact: 0, documentation: 0 });
    setFeedback("");
    setIsReadOnly(false);
    setShowScoreModal(true);
  };

  const handleViewEvaluation = (evaluation) => {
    setSelectedSubmission(evaluation);
    if (evaluation.criteriaScores) {
      setScores(evaluation.criteriaScores);
    } else {
      setScores({ innovation: 0, feasibility: 0, presentation: 0, impact: 0, documentation: 0 });
    }
    setFeedback(evaluation.feedback || "");
    setIsReadOnly(true);
    setShowScoreModal(true);
  };

  const handleScoreChange = (field, value) => {
    setScores({ ...scores, [field]: parseInt(value) });
  };

  const handleSubmitScore = async () => {
    if (!selectedSubmission) return;

    setIsSubmitting(true);
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    try {
      const res = await fetch(`/api/submissions/${selectedSubmission.id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: totalScore,
          feedback,
          criteriaScores: scores
        }),
      });

      if (res.ok) {
        showNotification("Score submitted successfully!", "success");
        setShowScoreModal(false);
        setScores({ innovation: 0, feasibility: 0, presentation: 0, impact: 0, documentation: 0 });
        setFeedback("");
        setSelectedSubmission(null);
        // Refresh data
        fetchJudgeData();
      } else {
        const data = await res.json();
        showNotification(data.error || "Failed to submit score", "error");
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      showNotification("Failed to submit score", "error");
    } finally {
      setIsSubmitting(false);
    }
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
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === "success"
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
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === "pending"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
              >
                Pending Reviews ({submissions.length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 border-b-2 font-medium transition-colors ${activeTab === "completed"
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
                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 focus:ring-2  text-sm text-black"
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
                          <button
                            onClick={() => handleViewEvaluation(evaluation)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                          >
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
              <h3 className="text-xl font-bold text-slate-900">
                {isReadOnly ? "Evaluation Details" : `Evaluate: ${selectedSubmission.teamName}`}
              </h3>
              <p className="text-slate-500">{selectedSubmission.projectName}</p>
            </div>

            {/* Scoring Criteria */}
            <div className={`space-y-4 mb-6 ${isReadOnly ? 'grid grid-cols-2 gap-4 space-y-0' : ''}`}>
              {[
                { key: "innovation", label: "Innovation", max: 25 },
                { key: "feasibility", label: "Feasibility", max: 25 },
                { key: "presentation", label: "Presentation", max: 20 },
                { key: "impact", label: "Impact", max: 20 },
                { key: "documentation", label: "Documentation", max: 10 }
              ].map((criteria) => (
                <div key={criteria.key} className={isReadOnly ? "col-span-1" : ""}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-slate-700">{criteria.label}</label>
                    <span className="text-sm text-slate-500 font-mono">
                      {scores[criteria.key] || 0}<span className="text-slate-300">/</span>{criteria.max}
                    </span>
                  </div>
                  {isReadOnly ? (
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${((scores[criteria.key] || 0) / criteria.max) * 100}%` }}
                      />
                    </div>
                  ) : (
                    <input
                      type="range"
                      min={0}
                      max={criteria.max}
                      value={scores[criteria.key] || 0}
                      onChange={(e) => handleScoreChange(criteria.key, e.target.value)}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Total Score */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Total Score</span>
                <span className="text-2xl font-bold text-slate-900">
                  {Object.values(scores).reduce((a, b) => a + (Number(b) || 0), 0)}/100
                </span>
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Feedback {isReadOnly ? "" : "(Optional)"}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-4 py-2 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReadOnly ? 'bg-slate-50 text-slate-600' : ''}`}
                placeholder={isReadOnly ? "No feedback provided." : "Provide constructive feedback..."}
                rows={4}
                readOnly={isReadOnly}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowScoreModal(false);
                  setSelectedSubmission(null);
                }}
                className={`flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors ${isReadOnly ? 'w-full' : ''}`}
              >
                {isReadOnly ? "Close" : "Cancel"}
              </button>
              {!isReadOnly && (
                <button
                  onClick={handleSubmitScore}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Submit Score
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
