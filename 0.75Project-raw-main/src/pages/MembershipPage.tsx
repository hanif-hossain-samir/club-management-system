import React, { useState } from 'react';
import { 
  Award, 
  Shield, 
  CheckCircle2, 
  Search, 
  AlertCircle, 
  QrCode
} from 'lucide-react';
import { ControllerApplication, ClubCategory, ClubSubsector, User } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { DigitalMembershipCard } from '../components/DigitalMembershipCard.tsx';

interface MembershipPageProps {
  onApplicationSubmitted: (app: ControllerApplication) => void;
}

export const MembershipPage: React.FC<MembershipPageProps> = ({
  onApplicationSubmitted
}) => {
  const { user } = useAuth();
  const [activeStream, setActiveStream] = useState<'controller' | 'student'>('controller');

  // Controller Application Form State
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [department, setDepartment] = useState(user?.department || 'Computer Science & Engineering');
  const [currentSemester, setCurrentSemester] = useState('5th Semester');
  const [cgpa, setCgpa] = useState('3.65');
  const [targetClub, setTargetClub] = useState<ClubCategory>('computer_club');
  const [targetWing, setTargetWing] = useState<ClubSubsector>('programming');
  const [statementOfIntent, setStatementOfIntent] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Status Tracker State
  const [trackStudentId, setTrackStudentId] = useState('');
  const [trackedApp, setTrackedApp] = useState<ControllerApplication | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);

  // Student Member Card state
  const [showMemberCardModal, setShowMemberCardModal] = useState(false);
  const [cardUser, setCardUser] = useState<User | null>(user);

  // Sync user state
  React.useEffect(() => {
    if (user) {
      setApplicantName(user.name);
      setApplicantEmail(user.email);
      setStudentId(user.studentId);
      if (user.department) setDepartment(user.department);
      setCardUser(user);
    }
  }, [user]);

  const handleControllerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    try {
      const res = await api.submitApplication({
        applicantName,
        applicantEmail,
        studentId,
        department,
        currentSemester,
        cgpa,
        targetClub,
        targetWing,
        statementOfIntent,
        experience,
        portfolioLink
      });

      setSubmitting(false);

      if (res.success && res.application) {
        setSubmitSuccess(
          `Application submitted successfully! Application ID: #${res.application.id.toUpperCase()}. It has been forwarded to the Directorate of Student Welfare (Administrators) for official review.`
        );
        onApplicationSubmitted(res.application);
        // Clear intent
        setStatementOfIntent('');
        setExperience('');
      } else {
        setSubmitError(res.message || 'Submission failed. Please check inputs.');
      }
    } catch (err: any) {
      setSubmitting(false);
      setSubmitError(err.message || 'Network error.');
    }
  };

  const handleTrackStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackStudentId.trim()) return;

    setTrackLoading(true);
    setTrackSearched(true);
    try {
      // Get all applications to check (or from api)
      const res = await api.getApplications(user?.id);
      setTrackLoading(false);
      if (res.success && res.applications) {
        const found = res.applications.find(
          a => a.studentId.toLowerCase() === trackStudentId.trim().toLowerCase()
        );
        setTrackedApp(found || null);
      }
    } catch (e) {
      setTrackLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 text-center max-w-3xl mx-auto space-y-3">
        <div className="flex justify-center mb-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-md ring-4 ring-red-100 dark:ring-red-950 flex items-center justify-center">
            <img 
              src="/city-university-logo.jpg" 
              alt="City University Official Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/70 text-[#D40000] dark:text-red-300 text-xs font-bold uppercase tracking-wider">
          University Membership & Executive Leadership
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white">
          Club Membership & Controller Applications
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Join as a regular club member or apply to become an official Club Controller with event administration credentials.
        </p>

        {/* Tab switch */}
        <div className="flex justify-center gap-3 pt-4">
          <button
            onClick={() => setActiveStream('controller')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeStream === 'controller'
                ? 'bg-[#D40000] text-white ring-2 ring-red-400/40 shadow-md'
                : 'bg-white dark:bg-[#161722] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-red-400'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Controller Membership Application (Admin Approval)</span>
          </button>

          <button
            onClick={() => setActiveStream('student')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              activeStream === 'student'
                ? 'bg-[#D40000] text-white ring-2 ring-red-400/40 shadow-md'
                : 'bg-white dark:bg-[#161722] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-red-400'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Student Digital Club Card Pass</span>
          </button>
        </div>
      </div>

      {/* STREAM 1: Controller Application Flow */}
      {activeStream === 'controller' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Form (Col 8) */}
          <div className="lg:col-span-8 bg-white dark:bg-[#18050E] rounded-2xl border border-neutral-200 dark:border-[#380E1C] p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2 text-[#D40000] dark:text-red-400 font-bold text-sm">
                <Shield className="w-5 h-5" />
                <span>Executive Controller Candidacy Form</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Controllers are granted rights to add, update, and manage events, announcements, and photo galleries for their assigned club wing.
              </p>
            </div>

            {/* Success or Error Notice */}
            {submitSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <h5 className="font-bold">Application Received!</h5>
                  <p className="mt-1 leading-relaxed">{submitSuccess}</p>
                </div>
              </div>
            )}

            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <h5 className="font-bold">Submission Notice</h5>
                  <p className="mt-1 leading-relaxed">{submitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleControllerSubmit} className="space-y-5 text-xs">
              
              {/* Applicant Personal Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Candidate Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    placeholder="e.g. Ahsan Habib"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    University Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={e => setApplicantEmail(e.target.value)}
                    placeholder="e.g. ahsan.habib@cityuniversity.edu"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                  />
                </div>
              </div>

              {/* Student Academic Standing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    placeholder="e.g. CU-22-CSE-091"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Academic Semester *
                  </label>
                  <select
                    value={currentSemester}
                    onChange={e => setCurrentSemester(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  >
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Current CGPA *
                  </label>
                  <input
                    type="text"
                    required
                    value={cgpa}
                    onChange={e => setCgpa(e.target.value)}
                    placeholder="e.g. 3.75"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Computer Science & Engineering"
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                />
              </div>

              {/* Target Wing Choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-red-50/50 dark:bg-[#1C0D12] border border-red-200 dark:border-[#381620]">
                <div>
                  <label className="block font-bold text-[#D40000] dark:text-red-400 mb-1">
                    1. Target Major Club Entity *
                  </label>
                  <select
                    value={targetClub}
                    onChange={e => {
                      const newClub = e.target.value as ClubCategory;
                      setTargetClub(newClub);
                      setTargetWing(newClub === 'computer_club' ? 'programming' : 'sports');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#11121A] text-neutral-900 dark:text-white font-medium"
                  >
                    <option value="computer_club">Computer Club (CUCC)</option>
                    <option value="events_and_clubs">Events & Clubs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#D40000] dark:text-red-400 mb-1">
                    2. Desired Wing Subsector *
                  </label>
                  <select
                    value={targetWing}
                    onChange={e => setTargetWing(e.target.value as ClubSubsector)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#11121A] text-neutral-900 dark:text-white font-medium"
                  >
                    {targetClub === 'computer_club' ? (
                      <>
                        <option value="programming">Programming Club</option>
                        <option value="cyber_security">Cyber Security Club</option>
                        <option value="research">Research Club</option>
                      </>
                    ) : (
                      <>
                        <option value="sports">Sports Club</option>
                        <option value="cultural">Cultural Club</option>
                        <option value="tour">Tour & Adventure Club</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Statement of Intent */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Statement of Intent & Vision for the Wing * (Min. 50 characters)
                </label>
                <textarea
                  rows={4}
                  required
                  value={statementOfIntent}
                  onChange={e => setStatementOfIntent(e.target.value)}
                  placeholder="Describe your vision, proposed events, workshop topics, or competition plans if appointed as Controller..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                />
              </div>

              {/* Prior Experience */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Relevant Technical, Leadership, or Event Experience *
                </label>
                <textarea
                  rows={3}
                  required
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  placeholder="Hackathons attended, CTF rankings, student organizations led, athletic tournaments played, or stage productions..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                />
              </div>

              {/* Portfolio Link */}
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  GitHub / LinkedIn / Portfolio / Social Link (Optional)
                </label>
                <input
                  type="url"
                  value={portfolioLink}
                  onChange={e => setPortfolioLink(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>{submitting ? 'Submitting to Directorate...' : 'Submit Controller Application to Administrators'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Status Tracker & Prerequisite Guidelines (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Application Status Checker */}
            <div className="bg-white dark:bg-[#18050E] rounded-2xl border border-neutral-200 dark:border-[#380E1C] p-6 shadow-xs space-y-4">
              <h4 className="font-bold text-sm font-heading text-neutral-900 dark:text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-[#D40000] dark:text-red-400" />
                Track Submitted Application Status
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Enter your university student ID to check if your Controller application was approved by Administrators.
              </p>

              <form onSubmit={handleTrackStatus} className="flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Enter Student ID (e.g. CU-22-CSE-091)"
                  value={trackStudentId}
                  onChange={e => setTrackStudentId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={trackLoading}
                  className="px-3 py-2 rounded-lg bg-[#D40000] text-white font-bold cursor-pointer"
                >
                  Track
                </button>
              </form>

              {/* Result display */}
              {trackSearched && (
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  {trackedApp ? (
                    <div className="space-y-2 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#191A26] border border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {trackedApp.applicantName}
                        </span>
                        {trackedApp.status === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] uppercase">
                            Approved ✓
                          </span>
                        )}
                        {trackedApp.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px] uppercase">
                            Under Review ⏳
                          </span>
                        )}
                        {trackedApp.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold text-[10px] uppercase">
                            Not Approved ✗
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-neutral-500">
                        Target Wing: <strong>{trackedApp.targetWing.toUpperCase()}</strong> ({trackedApp.targetClub === 'computer_club' ? 'Computer Club' : 'Events & Clubs'})
                      </p>

                      {trackedApp.adminNotes && (
                        <div className="p-2.5 rounded-lg bg-white dark:bg-[#12131C] border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300">
                          <span className="block font-bold text-[#D40000] dark:text-red-400">DSW Admin Review:</span>
                          <span className="italic">"{trackedApp.adminNotes}"</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-neutral-500 text-center py-2">
                      No application record found for this Student ID.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Prerequisites & Regulations */}
            <div className="bg-amber-50/70 dark:bg-[#1A140E] rounded-2xl border border-amber-300 dark:border-amber-900/60 p-6 space-y-3 text-xs">
              <h4 className="font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-4 h-4" />
                Administrative Controller Regulations
              </h4>
              <ul className="space-y-2 text-neutral-700 dark:text-neutral-300 leading-relaxed list-disc list-inside">
                <li>
                  <strong>Prerequisite:</strong> Minimum 4th trimester / semester completion with cumulative GPA ≥ 3.20.
                </li>
                <li>
                  <strong>Direct Authority:</strong> Approved controllers acquire credentials to publish notices and organize competitions for their subsector wing.
                </li>
                <li>
                  <strong>Approval Protocol:</strong> Applications are exclusively vetted and sanctioned by the University Directorate of Student Welfare (Administrators).
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* STREAM 2: Student Membership Card Issuance */}
      {activeStream === 'student' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#141520] rounded-2xl border border-neutral-200 dark:border-[#2D1B22] p-8 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 text-[#D40000] dark:text-red-400 flex items-center justify-center font-bold mx-auto shadow-sm">
            <QrCode className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold font-heading text-neutral-900 dark:text-white">
              Official City University Club Pass
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              Every registered student is entitled to an official digital membership card featuring an active QR token, departmental affiliation, and validity stamp.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#171824] border border-neutral-200 dark:border-neutral-800 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Member Name:</span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">{cardUser?.name || 'Nafis Fuad'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Student ID:</span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">{cardUser?.studentId || 'CU-23-CSE-188'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Department:</span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100">{cardUser?.department || 'Computer Science & Engineering'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Primary Affiliation:</span>
              <span className="font-bold text-[#D40000] dark:text-red-400">City University Computer Club</span>
            </div>
          </div>

          <button
            onClick={() => setShowMemberCardModal(true)}
            className="w-full py-3.5 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate & View Digital ID Card</span>
          </button>
        </div>
      )}

      {/* Digital Member Card Modal */}
      {showMemberCardModal && cardUser && (
        <DigitalMembershipCard
          user={cardUser}
          onClose={() => setShowMemberCardModal(false)}
        />
      )}

    </div>
  );
};
