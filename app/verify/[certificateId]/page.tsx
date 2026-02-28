import dbConnect from "@/lib/db-connect";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Award,
  Download,
} from "lucide-react";

interface Props {
  params: {
    certificateId: string;
  };
}

export default async function VerifyCertificate({ params }: Props) {
  const { certificateId } = await params;

  await dbConnect();

  let certificate = null;

  try {
    certificate = await Certificate.findOne({ certificateId: certificateId } as any)
      .populate("event")
      .lean();
  } catch (error) {
    console.error("Certificate verification failed:", error);
    return <ErrorState message="System error occurred while verifying certificate." />;
  }

  if (!certificate) {
    return (
      <ErrorState
        title="Invalid Certificate"
        message={`The certificate ID ${certificateId} could not be found.`}
        showRetry
      />
    );
  }

  const formattedDate =
    certificate.event?.startDate
      ? new Date(certificate.event.startDate).toLocaleDateString()
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-900 text-white p-4 relative overflow-hidden">
      <BackgroundGlow />

      <div className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700/50 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Certificate Verified</h1>
          <p className="text-slate-400">
            This certificate is valid and authentic.
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              label="Recipient"
              icon={<User className="h-5 w-5 text-indigo-400" />}
              value={certificate.recipientName}
            />

            <InfoItem
              label="Role"
              icon={<Award className="h-5 w-5 text-purple-400" />}
              value={certificate.role}
              capitalize
            />

            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
                Event
              </label>
              <div className="flex items-center gap-2 text-xl font-bold">
                <Calendar className="h-5 w-5 text-cyan-400" />
                {certificate.event?.title || "Unknown Event"}
              </div>
              {formattedDate && (
                <p className="text-sm text-slate-400 mt-1 ml-7">
                  {formattedDate}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
                Certificate ID
              </label>
              <code className="block bg-black/30 p-3 rounded text-indigo-300 font-mono text-sm break-all">
                {certificate.certificateId}
              </code>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {certificate.certificateUrl && (
            <a
              href={certificate.certificateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Download className="h-5 w-5" />
              Download PDF
            </a>
          )}

          <Link
            href="/verify"
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Verify Another
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable UI Components ---------- */

function BackgroundGlow() {
  return (
    <>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
    </>
  );
}

function ErrorState({
  title = "Verification Error",
  message,
  showRetry = false,
}: {
  title?: string;
  message: string;
  showRetry?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-space-900 text-white p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-slate-700">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900/30 mb-6">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-slate-400 mb-6">{message}</p>
        {showRetry && (
          <Link
            href="/verify"
            className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg transition-colors font-medium"
          >
            Verify Another
          </Link>
        )}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  icon,
  value,
  capitalize = false,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1 block">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 text-lg font-medium ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {icon}
        {value}
      </div>
    </div>
  );
}
