import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  UserCheck, 
  Calendar, 
  Bell, 
  Image as ImageIcon, 
  Users, 
  Check, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Award,
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  UserPlus,
  Flame,
  Pin,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Lock,
  Unlock,
  Eye
} from 'lucide-react';
import { 
  Club, 
  ClubEvent, 
  Announcement, 
  GalleryItem, 
  ControllerApplication, 
  User, 
  ClubCategory, 
  ClubSubsector,
  UserRole 
} from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

interface AdminDashboardProps {
  clubs: Club[];
  events: ClubEvent[];
  announcements: Announcement[];
  gallery: GalleryItem[];
  applications: ControllerApplication[];
  onRefreshData: () => void;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Software Engineering',
  'Business Administration (BBA)',
  'Electrical & Electronic Engineering (EEE)',
  'Textile Engineering',
  'Civil Engineering',
  'Pharmacy',
  'English Language & Literature',
  'Law & Human Rights',
  'Directorate of Student Welfare (DSW)'
];

const WINGS: { slug: ClubSubsector; label: string; club: ClubCategory }[] = [
  { slug: 'programming', label: 'Programming Club', club: 'computer_club' },
  { slug: 'cyber_security', label: 'Cyber Security Wing', club: 'computer_club' },
  { slug: 'research', label: 'Research & Innovation Wing', club: 'computer_club' },
  { slug: 'sports', label: 'Sports & Athletics Wing', club: 'events_and_clubs' },
  { slug: 'cultural', label: 'Cultural & Performing Arts Wing', club: 'events_and_clubs' },
  { slug: 'tour', label: 'Tour & Adventure Wing', club: 'events_and_clubs' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  clubs,
  events,
  announcements,
  gallery,
  applications,
  onRefreshData
}) => {
  const { user, role, loginAsDemo } = useAuth();
  
  // Active sub-tab inside Dashboard
  const [currentTab, setCurrentTab] = useState<
    'announcements' | 'gallery' | 'users' | 'applications' | 'events' | 'clubs'
  >('announcements');

  const [actionProcessing, setActionProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-dismiss success notification
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /* ==========================================================================
     1. NOTICES & ANNOUNCEMENTS STATE & HANDLERS
     ========================================================================== */
  const [annModalOpen, setAnnModalOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'urgent' | 'important' | 'general' | 'competition'>('general');
  const [annCategory, setAnnCategory] = useState('Notice');
  const [annImageUrl, setAnnImageUrl] = useState('');
  const [annAttachmentName, setAnnAttachmentName] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [annClubId, setAnnClubId] = useState<ClubCategory | 'all'>('all');
  const [annSearch, setAnnSearch] = useState('');
  const [annPriorityFilter, setAnnPriorityFilter] = useState<'all' | 'urgent' | 'important' | 'general' | 'competition'>('all');

  const handleOpenCreateAnn = () => {
    setEditingAnnId(null);
    setAnnTitle('');
    setAnnContent('');
    setAnnPriority('general');
    setAnnCategory('Notice');
    setAnnImageUrl('');
    setAnnAttachmentName('');
    setAnnPinned(false);
    setAnnClubId('all');
    setAnnModalOpen(true);
  };

  const handleOpenEditAnn = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setAnnPriority(ann.priority);
    setAnnCategory(ann.category);
    setAnnImageUrl(ann.imageUrl || '');
    setAnnAttachmentName(ann.attachmentName || '');
    setAnnPinned(ann.pinned);
    setAnnClubId(ann.clubId);
    setAnnModalOpen(true);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionProcessing(true);

    const payload = {
      title: annTitle.trim(),
      content: annContent.trim(),
      priority: annPriority,
      category: annCategory,
      imageUrl: annImageUrl.trim() || undefined,
      attachmentName: annAttachmentName.trim() || undefined,
      pinned: annPinned,
      clubId: annClubId
    };

    try {
      if (editingAnnId) {
        await api.updateAnnouncement(editingAnnId, payload, user?.id);
        setSuccessMessage('Notice and attached image updated successfully.');
      } else {
        await api.createAnnouncement(payload, user?.id);
        setSuccessMessage('New announcement published successfully.');
      }
      setActionProcessing(false);
      setAnnModalOpen(false);
      onRefreshData();
    } catch (e) {
      setActionProcessing(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the notice: "${title}"?`)) return;
    try {
      await api.deleteAnnouncement(id, user?.id);
      setSuccessMessage('Notice deleted successfully.');
      onRefreshData();
    } catch (e) {
      //
    }
  };

  /* ==========================================================================
     2. MEDIA & GALLERY STATE & HANDLERS
     ========================================================================== */
  const [galModalOpen, setGalModalOpen] = useState(false);
  const [editingGalId, setEditingGalId] = useState<string | null>(null);
  const [galTitle, setGalTitle] = useState('');
  const [galCaption, setGalCaption] = useState('');
  const [galImageUrl, setGalImageUrl] = useState('');
  const [galBatchUrls, setGalBatchUrls] = useState('');
  const [galWingSlug, setGalWingSlug] = useState<ClubSubsector>('sports');
  const [galEventName, setGalEventName] = useState('Campus Highlights 2026');
  const [galFilterWing, setGalFilterWing] = useState<string>('all');
  const [isBatchMode, setIsBatchMode] = useState(false);

  const handleOpenCreateGal = () => {
    setEditingGalId(null);
    setGalTitle('');
    setGalCaption('');
    setGalImageUrl('');
    setGalBatchUrls('');
    setGalWingSlug('sports');
    setGalEventName('Campus Highlights 2026');
    setIsBatchMode(false);
    setGalModalOpen(true);
  };

  const handleOpenEditGal = (item: GalleryItem) => {
    setEditingGalId(item.id);
    setGalTitle(item.title);
    setGalCaption(item.caption);
    setGalImageUrl(item.imageUrl);
    setGalWingSlug(item.wingSlug);
    setGalEventName(item.eventName);
    setIsBatchMode(false);
    setGalModalOpen(true);
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionProcessing(true);

    try {
      if (editingGalId) {
        await api.updateGalleryItem(editingGalId, {
          title: galTitle.trim(),
          caption: galCaption.trim(),
          imageUrl: galImageUrl.trim(),
          wingSlug: galWingSlug,
          eventName: galEventName.trim()
        }, user?.id);
        setSuccessMessage('Photo details updated successfully.');
      } else {
        if (isBatchMode && galBatchUrls.trim()) {
          const urls = galBatchUrls
            .split(/[\n,]/)
            .map(u => u.trim())
            .filter(u => u.startsWith('http') || u.startsWith('/'));

          if (urls.length === 0) {
            alert('Please provide at least one valid image URL (http://... or /assets/...)');
            setActionProcessing(false);
            return;
          }

          await api.createGalleryItem({
            title: galTitle.trim() || undefined,
            caption: galCaption.trim() || undefined,
            imageUrls: urls,
            wingSlug: galWingSlug,
            eventName: galEventName.trim()
          }, user?.id);
          setSuccessMessage(`Successfully uploaded ${urls.length} images to ${galWingSlug.toUpperCase()} album.`);
        } else {
          if (!galImageUrl.trim()) {
            alert('Image URL is required.');
            setActionProcessing(false);
            return;
          }
          await api.createGalleryItem({
            title: galTitle.trim() || `${galWingSlug.toUpperCase()} Photo`,
            caption: galCaption.trim(),
            imageUrl: galImageUrl.trim(),
            wingSlug: galWingSlug,
            eventName: galEventName.trim()
          }, user?.id);
          setSuccessMessage('New image added to gallery album.');
        }
      }
      setActionProcessing(false);
      setGalModalOpen(false);
      onRefreshData();
    } catch (e) {
      setActionProcessing(false);
    }
  };

  const handleDeleteGallery = async (id: string, title: string) => {
    if (!window.confirm(`Permanently remove image "${title}" from the gallery?`)) return;
    try {
      await api.deleteGalleryItem(id, user?.id);
      setSuccessMessage('Photo removed from album.');
      onRefreshData();
    } catch (e) {
      //
    }
  };

  /* ==========================================================================
     3. USERS & CONTROLLERS MEMBERSHIP STATE & HANDLERS
     ========================================================================== */
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userStudentId, setUserStudentId] = useState('');
  const [userDepartment, setUserDepartment] = useState(DEPARTMENTS[0]);
  const [userSemester, setUserSemester] = useState('5th Semester');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [userClubAffiliation, setUserClubAffiliation] = useState<ClubCategory>('computer_club');
  const [userAssignedWing, setUserAssignedWing] = useState<ClubSubsector | ''>('programming');
  const [userPhone, setUserPhone] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'administrator' | 'controller' | 'user'>('all');

  const fetchUsers = async () => {
    try {
      const res = await api.getUsers(user?.id);
      if (res.success && res.users) {
        setUsersList(res.users);
      }
    } catch (e) {
      //
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, user]);

  const handleOpenCreateUser = () => {
    setEditingUserId(null);
    setUserName('');
    setUserEmail('');
    setUserStudentId('');
    setUserDepartment(DEPARTMENTS[0]);
    setUserSemester('3rd Semester');
    setUserRole('controller');
    setUserClubAffiliation('computer_club');
    setUserAssignedWing('programming');
    setUserPhone('');
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUserId(u.id);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserStudentId(u.studentId);
    setUserDepartment(u.department);
    setUserSemester(u.semester || '5th Semester');
    setUserRole(u.role);
    setUserClubAffiliation(u.clubAffiliation || 'computer_club');
    setUserAssignedWing(u.assignedWing || '');
    setUserPhone(u.phone || '');
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionProcessing(true);

    const payload = {
      name: userName.trim(),
      email: userEmail.trim(),
      studentId: userStudentId.trim(),
      department: userDepartment,
      semester: userSemester,
      role: userRole,
      clubAffiliation: userClubAffiliation,
      assignedWing: (userRole === 'controller' && userAssignedWing) ? (userAssignedWing as ClubSubsector) : undefined,
      phone: userPhone.trim() || undefined
    };

    try {
      if (editingUserId) {
        const res = await api.updateUser(editingUserId, payload, user?.id);
        if (res.success) {
          setSuccessMessage(`User "${payload.name}" updated successfully.`);
        }
      } else {
        const res = await api.createUser(payload, user?.id);
        if (res.success) {
          setSuccessMessage(`New ${payload.role.toUpperCase()} "${payload.name}" added successfully.`);
        }
      }
      setActionProcessing(false);
      setUserModalOpen(false);
      fetchUsers();
      onRefreshData();
    } catch (e) {
      setActionProcessing(false);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (u.id === user?.id) {
      alert('You cannot delete your own logged-in administrator account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove user "${u.name}" (${u.role.toUpperCase()}) from the university registry?`)) return;

    try {
      const res = await api.deleteUser(u.id, user?.id);
      if (res.success) {
        setSuccessMessage(res.message || 'User removed successfully.');
        fetchUsers();
        onRefreshData();
      }
    } catch (e) {
      //
    }
  };

  const handleQuickRoleChange = async (u: User, newRole: UserRole) => {
    try {
      const res = await api.updateUser(u.id, { role: newRole }, user?.id);
      if (res.success) {
        setSuccessMessage(`Role for ${u.name} changed to ${newRole.toUpperCase()}.`);
        fetchUsers();
        onRefreshData();
      }
    } catch (e) {
      //
    }
  };

  /* ==========================================================================
     4. CONTROLLER & MEMBERSHIP APPLICATIONS APPROVALS
     ========================================================================== */
  const [selectedApp, setSelectedApp] = useState<ControllerApplication | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [appFilter, setAppFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const handleApproveApplication = async (appId: string) => {
    setActionProcessing(true);
    try {
      const res = await api.approveApplication(
        appId,
        adminNoteInput || 'Approved by University Directorate of Student Welfare.',
        user?.id
      );
      setActionProcessing(false);
      if (res.success) {
        setSuccessMessage('Application approved! Candidate promoted to Club Controller.');
        setSelectedApp(null);
        setAdminNoteInput('');
        fetchUsers();
        onRefreshData();
      }
    } catch (e) {
      setActionProcessing(false);
    }
  };

  const handleRejectApplication = async (appId: string) => {
    setActionProcessing(true);
    try {
      const res = await api.rejectApplication(
        appId,
        adminNoteInput || 'Candidate does not fulfill current trimester prerequisites.',
        user?.id
      );
      setActionProcessing(false);
      if (res.success) {
        setSuccessMessage('Application marked as rejected.');
        setSelectedApp(null);
        setAdminNoteInput('');
        onRefreshData();
      }
    } catch (e) {
      setActionProcessing(false);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!window.confirm('Delete this application record?')) return;
    try {
      await api.deleteApplication(appId, user?.id);
      setSuccessMessage('Application record removed.');
      onRefreshData();
    } catch (e) {
      //
    }
  };

  /* ==========================================================================
     5. EVENTS MANAGEMENT STATE & HANDLERS
     ========================================================================== */
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventKicker, setEventKicker] = useState('');
  const [eventClubId, setEventClubId] = useState<ClubCategory>('computer_club');
  const [eventWingSlug, setEventWingSlug] = useState<ClubSubsector>('programming');
  const [eventCategory, setEventCategory] = useState('Competition');
  const [eventDate, setEventDate] = useState('2026-11-25');
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [eventVenue, setEventVenue] = useState('Software Lab 402');
  const [eventCapacity, setEventCapacity] = useState('150');
  const [eventDesc, setEventDesc] = useState('');
  const [eventBanner, setEventBanner] = useState('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80');
  const [attendeeRosterEvent, setAttendeeRosterEvent] = useState<ClubEvent | null>(null);

  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setEventTitle('');
    setEventKicker('');
    setEventClubId('computer_club');
    setEventWingSlug('programming');
    setEventCategory('Workshop');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTime('10:00 AM');
    setEventVenue('Central Auditorium');
    setEventCapacity('100');
    setEventDesc('');
    setEventBanner('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80');
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: ClubEvent) => {
    setEditingEventId(evt.id);
    setEventTitle(evt.title);
    setEventKicker(evt.kicker || '');
    setEventClubId(evt.clubId);
    setEventWingSlug(evt.wingSlug);
    setEventCategory(evt.category);
    setEventDate(evt.date);
    setEventTime(evt.time);
    setEventVenue(evt.venue);
    setEventCapacity(String(evt.capacity));
    setEventDesc(evt.description);
    setEventBanner(evt.bannerUrl);
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionProcessing(true);

    const payload = {
      title: eventTitle.trim(),
      kicker: eventKicker.trim() || undefined,
      clubId: eventClubId,
      wingSlug: eventWingSlug,
      category: eventCategory,
      date: eventDate,
      time: eventTime,
      venue: eventVenue,
      capacity: Number(eventCapacity) || 100,
      description: eventDesc,
      bannerUrl: eventBanner
    };

    try {
      if (editingEventId) {
        await api.updateEvent(editingEventId, payload, user?.id);
        setSuccessMessage('Event updated successfully.');
      } else {
        await api.createEvent(payload, user?.id);
        setSuccessMessage('New event published successfully.');
      }
      setActionProcessing(false);
      setEventModalOpen(false);
      onRefreshData();
    } catch (err) {
      setActionProcessing(false);
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;
    try {
      await api.deleteEvent(id, user?.id);
      setSuccessMessage('Event deleted successfully.');
      onRefreshData();
    } catch (err) {
      //
    }
  };

  // KPI Metrics
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const totalUsersCount = usersList.length;
  const controllersCount = usersList.filter(u => u.role === 'controller').length;
  const adminsCount = usersList.filter(u => u.role === 'administrator').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      
      {/* Toast Alert for Operations */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium text-xs shadow-xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Top Banner: Admin Executive Console */}
      <div className="bg-gradient-to-r from-[#D40000] via-[#850000] to-[#400000] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-red-500/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 shadow-xl ring-2 ring-white/80 flex items-center justify-center shrink-0">
            <img 
              src="/city-university-logo.jpg" 
              alt="City University Official Logo" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/90 text-amber-300 font-bold text-[11px] uppercase tracking-wider border border-amber-300/40">
                <Shield className="w-3.5 h-3.5" /> Full Administrator Authority
              </span>
              {role !== 'administrator' && (
                <button
                  onClick={() => loginAsDemo('administrator')}
                  className="px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-red-950 font-bold text-[10px] cursor-pointer"
                >
                  Switch to Admin Mode
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
              Administrator Central Command Dashboard
            </h1>
            <p className="text-xs text-red-100 max-w-xl">
              Directorate of Student Welfare • Full CRUD access over Notices, Images, Events, Members & Controllers.
            </p>
          </div>
        </div>

        {/* Quick KPI Stat Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-black/35 backdrop-blur-xs border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-red-200 uppercase font-bold">Total Notices</span>
            <span className="text-xl font-bold font-mono text-white">{announcements.length}</span>
          </div>
          <div className="bg-black/35 backdrop-blur-xs border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-red-200 uppercase font-bold">Photo Media</span>
            <span className="text-xl font-bold font-mono text-white">{gallery.length}</span>
          </div>
          <div className="bg-black/35 backdrop-blur-xs border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-red-200 uppercase font-bold">Controllers</span>
            <span className="text-xl font-bold font-mono text-amber-300">{controllersCount}</span>
          </div>
          <div className="bg-black/35 backdrop-blur-xs border border-white/10 px-3.5 py-2 rounded-xl text-center">
            <span className="block text-[10px] text-red-200 uppercase font-bold">Pending Apps</span>
            <span className="text-xl font-bold font-mono text-emerald-300">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Role Quick Switcher Strip for Instant Verification */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-100 dark:bg-[#16060E] border border-neutral-200 dark:border-[#380E1C] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-neutral-700 dark:text-neutral-300">Current Session:</span>
          <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-[#D40000] text-white">
            {role.toUpperCase()}
          </span>
          <span className="text-neutral-500 hidden sm:inline">
            ({user?.name || 'Administrator'} • {user?.email})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500 font-semibold text-[11px]">Role Presets:</span>
          <button
            onClick={() => loginAsDemo('administrator')}
            className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
              role === 'administrator'
                ? 'bg-[#D40000] text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            Administrator
          </button>
          <button
            onClick={() => loginAsDemo('controller', 'programming')}
            className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
              role === 'controller'
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            Controller
          </button>
          <button
            onClick={() => loginAsDemo('user')}
            className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
              role === 'user'
                ? 'bg-slate-700 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            Regular Student
          </button>
        </div>
      </div>

      {/* Main Administrative Control Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-xs font-bold">
        {/* TAB 1: NOTICES & PRESS CMS */}
        <button
          onClick={() => setCurrentTab('announcements')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'announcements'
              ? 'bg-[#D40000] text-white shadow-sm'
              : 'bg-white dark:bg-[#151620] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-red-400'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notices & Press CMS ({announcements.length})</span>
        </button>

        {/* TAB 2: GALLERY & PHOTO ALBUMS */}
        <button
          onClick={() => setCurrentTab('gallery')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'gallery'
              ? 'bg-[#D40000] text-white shadow-sm'
              : 'bg-white dark:bg-[#151620] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-red-400'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Photo Albums & Media ({gallery.length})</span>
        </button>

        {/* TAB 3: USERS & CONTROLLERS DIRECTORY */}
        <button
          onClick={() => setCurrentTab('users')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'users'
              ? 'bg-[#D40000] text-white shadow-sm'
              : 'bg-white dark:bg-[#151620] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-red-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users & Controllers ({totalUsersCount})</span>
        </button>

        {/* TAB 4: MEMBERSHIP & CONTROLLER APPROVALS */}
        <button
          onClick={() => setCurrentTab('applications')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'applications'
              ? 'bg-[#D40000] text-white shadow-sm'
              : 'bg-white dark:bg-[#151620] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-red-400'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Membership & Controller Approvals</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-red-950 font-bold text-[10px]">
              {pendingCount}
            </span>
          )}
        </button>

        {/* TAB 5: EVENTS & COMPETITIONS */}
        <button
          onClick={() => setCurrentTab('events')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'events'
              ? 'bg-[#D40000] text-white shadow-sm'
              : 'bg-white dark:bg-[#151620] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-red-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events & Competitions ({events.length})</span>
        </button>

        {/* TAB 6: CLUBS & WINGS STRUCTURE */}
        <button
          onClick={() => setCurrentTab('clubs')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'clubs'
              ? 'bg-[#D40000] text-white shadow-sm'
              : 'bg-white dark:bg-[#151620] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-red-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Clubs Structure</span>
        </button>
      </div>

      {/* =====================================================================
          TAB 1: NOTICES & PRESS CMS (NEW, UPDATE NOTICE & IMAGES, DELETE)
          ===================================================================== */}
      {currentTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-neutral-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#D40000]" />
                Official Notices & Press Circulars CMS
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Full administrative control: publish new circulars, attach/update poster images, edit text, and delete notices.
              </p>
            </div>

            <button
              onClick={handleOpenCreateAnn}
              className="px-4 py-2.5 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Notice</span>
            </button>
          </div>

          {/* Notice Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#141520] border border-neutral-200 dark:border-[#2D1B22] p-3 rounded-2xl shadow-xs text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search circulars by keyword..."
                value={annSearch}
                onChange={e => setAnnSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
            <select
              value={annPriorityFilter}
              onChange={e => setAnnPriorityFilter(e.target.value as any)}
              className="w-full sm:w-48 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Circulars</option>
              <option value="important">Important Notices</option>
              <option value="competition">Contests & Auditions</option>
              <option value="general">General Updates</option>
            </select>
          </div>

          {/* Notices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements
              .filter(a => {
                if (annPriorityFilter !== 'all' && a.priority !== annPriorityFilter) return false;
                if (annSearch.trim()) {
                  const q = annSearch.toLowerCase();
                  return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
                }
                return true;
              })
              .map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white dark:bg-[#141520] border border-neutral-200 dark:border-[#2D1B22] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-red-300 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        {ann.pinned && (
                          <span className="px-2 py-0.5 rounded-full bg-[#D40000] text-white font-bold text-[9px] uppercase flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          ann.priority === 'urgent'
                            ? 'bg-red-600 text-white'
                            : ann.priority === 'competition'
                            ? 'bg-amber-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}>
                          {ann.priority}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {ann.category}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        {new Date(ann.publishedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-neutral-900 dark:text-white leading-snug">
                      {ann.title}
                    </h4>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>

                    {/* Attached Image Poster Preview */}
                    {ann.imageUrl && (
                      <div className="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 aspect-16/9 bg-neutral-900 group">
                        <img 
                          src={ann.imageUrl} 
                          alt={ann.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                          Attached Poster
                        </span>
                      </div>
                    )}

                    {ann.attachmentName && (
                      <div className="text-[11px] text-neutral-500 font-medium">
                        Attachment: <span className="underline">{ann.attachmentName}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Edit Notice & Image, Delete Notice */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-400">
                      Signatory: <strong>{ann.authorName}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditAnn(ann)}
                        className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                        title="Edit notice text and update attached image"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Notice</span>
                      </button>

                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id, ann.title)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer transition-colors"
                        title="Permanently delete notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: GALLERY & PHOTO ALBUMS (LIMITLESS UPLOAD, UPDATE, DELETE)
          ===================================================================== */}
      {currentTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-neutral-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#D40000]" />
                Media & Photo Album Archives Management
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage limitless photos across all 6 wing albums (Sports, Programming, Cyber Security, Research, Cultural, Tour).
              </p>
            </div>

            <button
              onClick={handleOpenCreateGal}
              className="px-4 py-2.5 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Photos to Album</span>
            </button>
          </div>

          {/* Wing Album Filter Selector */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setGalFilterWing('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                galFilterWing === 'all'
                  ? 'bg-[#D40000] text-white font-bold'
                  : 'bg-white dark:bg-[#141520] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              All Albums ({gallery.length})
            </button>
            {WINGS.map(w => {
              const count = gallery.filter(g => g.wingSlug === w.slug).length;
              return (
                <button
                  key={w.slug}
                  onClick={() => setGalFilterWing(w.slug)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    galFilterWing === w.slug
                      ? 'bg-[#D40000] text-white font-bold'
                      : 'bg-white dark:bg-[#141520] border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {w.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Gallery Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery
              .filter(g => galFilterWing === 'all' || g.wingSlug === galFilterWing)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#141520] border border-neutral-200 dark:border-[#2D1B22] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between group hover:border-red-400 transition-all"
                >
                  <div className="relative aspect-4/3 overflow-hidden bg-neutral-900">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white font-bold text-[9px] uppercase">
                        {item.wingSlug.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1">
                        {item.title}
                      </h4>
                      {item.caption && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {item.date}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditGal(item)}
                          className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                          title="Edit image details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGallery(item.id, item.title)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                          title="Delete image from album"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: USERS & CONTROLLERS DIRECTORY (ADD, EDIT, REMOVE)
          ===================================================================== */}
      {currentTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-neutral-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D40000]" />
                User Accounts & Controller Leadership Registry
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Add new users or controllers, update assigned wings and roles, and remove inactive or unauthorized accounts.
              </p>
            </div>

            <button
              onClick={handleOpenCreateUser}
              className="px-4 py-2.5 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User / Controller</span>
            </button>
          </div>

          {/* User Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#141520] border border-neutral-200 dark:border-[#2D1B22] p-3 rounded-2xl shadow-xs text-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, student ID, email, or department..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              {(['all', 'administrator', 'controller', 'user'] as const).map(roleKey => (
                <button
                  key={roleKey}
                  onClick={() => setUserRoleFilter(roleKey)}
                  className={`px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] cursor-pointer transition-colors ${
                    userRoleFilter === roleKey
                      ? 'bg-[#D40000] text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {roleKey}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#141520] border border-neutral-200 dark:border-[#2D1B22] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-[#1A1B28] border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="p-3.5">Member / Official</th>
                    <th className="p-3.5">Student ID</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Assigned Role</th>
                    <th className="p-3.5">Wing / Club Affiliation</th>
                    <th className="p-3.5 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {usersList
                    .filter(u => {
                      if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
                      if (userSearch.trim()) {
                        const q = userSearch.toLowerCase();
                        return (
                          u.name.toLowerCase().includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          u.studentId.toLowerCase().includes(q) ||
                          u.department.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 text-[#D40000] dark:text-red-300 flex items-center justify-center font-bold text-xs uppercase overflow-hidden shrink-0">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                u.name.substring(0, 2)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                                {u.name}
                                {u.id === user?.id && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-neutral-500 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-mono font-semibold">{u.studentId}</td>

                        <td className="p-3.5">
                          <div>{u.department}</div>
                          {u.semester && (
                            <div className="text-[10px] text-neutral-400">{u.semester}</div>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] inline-flex items-center gap-1 ${
                            u.role === 'administrator'
                              ? 'bg-red-100 dark:bg-red-950 text-[#D40000] dark:text-red-300'
                              : u.role === 'controller'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}>
                            {u.role === 'administrator' && <Shield className="w-3 h-3" />}
                            {u.role === 'controller' && <UserCheck className="w-3 h-3" />}
                            <span>{u.role}</span>
                          </span>
                        </td>

                        <td className="p-3.5">
                          {u.assignedWing ? (
                            <span className="font-semibold text-[#D40000] dark:text-red-400">
                              {u.assignedWing.replace('_', ' ').toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-neutral-500">
                              {u.clubAffiliation === 'computer_club' ? 'Computer Club' : 'Events & Clubs'}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Promote / Demote Fast Toggle */}
                            {u.role === 'user' ? (
                              <button
                                onClick={() => handleQuickRoleChange(u, 'controller')}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-[10px] hover:bg-amber-100 cursor-pointer"
                                title="Promote user to Controller"
                              >
                                Promote to Controller
                              </button>
                            ) : u.role === 'controller' ? (
                              <button
                                onClick={() => handleQuickRoleChange(u, 'user')}
                                className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-[10px] hover:bg-neutral-200 cursor-pointer"
                                title="Demote to regular user"
                              >
                                Demote to Member
                              </button>
                            ) : null}

                            {/* Edit user details */}
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 cursor-pointer"
                              title="Edit user details and assigned wing"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Remove user */}
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={u.id === user?.id}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title={u.id === user?.id ? "Cannot remove yourself" : "Remove user from database"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: MEMBERSHIP & CONTROLLER CANDIDACY APPROVALS
          ===================================================================== */}
      {currentTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-neutral-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Controller Candidacy Applications & Approvals
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Exclusive Administrator Review. Approving an applicant immediately provisions them as an official Club Controller.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setAppFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  appFilter === 'all' ? 'bg-[#D40000] text-white' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setAppFilter('pending')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  appFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setAppFilter('approved')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  appFilter === 'approved' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setAppFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                  appFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          {/* Applications Cards */}
          <div className="space-y-4">
            {applications
              .filter(a => appFilter === 'all' || a.status === appFilter)
              .map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-[#141520] border border-neutral-200 dark:border-[#2D1B22] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-neutral-900 dark:text-white">
                          {app.applicantName}
                        </h4>
                        <span className="text-xs font-mono text-neutral-500 font-semibold">
                          ({app.studentId})
                        </span>
                        {app.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px] uppercase">
                            Pending Review
                          </span>
                        )}
                        {app.status === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] uppercase">
                            Approved Controller
                          </span>
                        )}
                        {app.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 font-bold text-[10px] uppercase">
                            Rejected
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {app.applicantEmail} • {app.department} • {app.currentSemester} • <strong>CGPA: {app.cgpa}</strong>
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/60 text-[#D40000] dark:text-red-300 font-bold">
                        Target Wing: {app.targetWing.toUpperCase()}
                      </span>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Statements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#1A1B28] border border-neutral-200 dark:border-neutral-800">
                      <span className="font-bold text-[#D40000] dark:text-red-400 block mb-1">
                        Statement of Intent & Vision:
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {app.statementOfIntent}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#1A1B28] border border-neutral-200 dark:border-neutral-800">
                      <span className="font-bold text-[#D40000] dark:text-red-400 block mb-1">
                        Leadership & Technical Experience:
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {app.experience}
                      </p>
                      {app.portfolioLink && (
                        <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5 text-[#D40000] dark:text-red-400">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <a href={app.portfolioLink} target="_blank" rel="noopener noreferrer" className="underline font-semibold">
                            View Candidate Portfolio / GitHub
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes if reviewed */}
                  {app.adminNotes && (
                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-[#1B150F] border border-amber-200 dark:border-amber-900/60 text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-300 block">
                        DSW Review Decision:
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300 italic mt-0.5">
                        "{app.adminNotes}"
                      </p>
                      {app.reviewedBy && (
                        <p className="text-[10px] text-neutral-500 mt-1">
                          Evaluated by {app.reviewedBy} on {new Date(app.reviewedAt || '').toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions for Pending Applications */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {app.status === 'pending' ? (
                      <>
                        <input
                          type="text"
                          placeholder="Optional admin review notes / congrats / feedback..."
                          value={selectedApp?.id === app.id ? adminNoteInput : ''}
                          onChange={e => {
                            setSelectedApp(app);
                            setAdminNoteInput(e.target.value);
                          }}
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                        />

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectApplication(app.id)}
                            disabled={actionProcessing}
                            className="px-3.5 py-2 rounded-xl border border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold cursor-pointer transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveApplication(app.id)}
                            disabled={actionProcessing}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve as Controller</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full flex justify-end">
                        <button
                          onClick={() => handleDeleteApplication(app.id)}
                          className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-red-600 text-xs font-semibold cursor-pointer"
                        >
                          Remove Log
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: EVENTS & COMPETITIONS MANAGEMENT
          ===================================================================== */}
      {currentTab === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold font-heading text-neutral-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D40000]" />
                University Events & Competitions Management
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Publish new hackathons, tournaments, tours, and seminars. View registered student rosters.
              </p>
            </div>

            <button
              onClick={handleOpenCreateEvent}
              className="px-4 py-2.5 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white dark:bg-[#141520] border border-neutral-200 dark:border-[#2D1B22] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 hover:border-red-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-[10px] uppercase">
                      {evt.wingSlug.replace('_', ' ')} • {evt.category}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">{evt.date}</span>
                  </div>

                  <h4 className="font-bold text-base text-neutral-900 dark:text-white mt-2">
                    {evt.title}
                  </h4>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                    {evt.description}
                  </p>

                  <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span>Venue: <strong>{evt.venue}</strong></span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {evt.registeredCount} / {evt.capacity} registered
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setAttendeeRosterEvent(evt)}
                    className="text-[#D40000] dark:text-red-400 font-semibold hover:underline cursor-pointer"
                  >
                    View Attendees ({evt.registrations?.length || 0})
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditEvent(evt)}
                      className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      title="Edit Event"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 6: CLUBS METADATA (TWO MAJOR CLUBS STRUCTURE)
          ===================================================================== */}
      {currentTab === 'clubs' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold font-heading text-neutral-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D40000]" />
              City University Clubs Governance Structure
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Two central university organizations, advisory leadership, and affiliated subsector wings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clubs.map((c) => (
              <div
                key={c.id}
                className="bg-white dark:bg-[#141520] border border-neutral-200 dark:border-[#2D1B22] rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-[#D40000] dark:text-red-300 font-mono">
                    {c.shortCode}
                  </span>
                  <span className="text-xs text-neutral-500 font-semibold">{c.totalMembers} Members</span>
                </div>

                <h4 className="font-bold text-lg font-heading text-neutral-900 dark:text-white">{c.name}</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">"{c.motto}"</p>

                <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <p>Faculty Advisor: <strong>{c.advisorName}</strong> ({c.advisorDesignation})</p>
                  <p>Student President: <strong>{c.presidentName}</strong></p>
                  <p>Official Email: <strong>{c.email}</strong></p>
                  <p>Hotline: <strong>{c.hotline}</strong></p>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Active Subsector Wings:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.wings.map(w => (
                      <span key={w.id} className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs font-medium">
                        {w.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: NOTICE CREATE / EDIT (TITLE, CONTENT, ATTACHED IMAGE)
          ===================================================================== */}
      {annModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151620] border border-neutral-200 dark:border-[#382026] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
            <div className="bg-[#D40000] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold font-heading text-base">
                  {editingAnnId ? 'Update Notice & Attached Poster' : 'Publish New University Notice'}
                </h3>
              </div>
              <button onClick={() => setAnnModalOpen(false)} className="text-white cursor-pointer hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call for Intra-University Programming Contest (IUPC 2026)"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D40000]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Priority Level
                  </label>
                  <select
                    value={annPriority}
                    onChange={e => setAnnPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  >
                    <option value="general">General Circular</option>
                    <option value="important">Important Notice</option>
                    <option value="urgent">🔴 Urgent / Reschedule</option>
                    <option value="competition">🏆 Contest / Tournament</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Notice, Contest, Sports, Exam, Tour"
                    value={annCategory}
                    onChange={e => setAnnCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Notice Attached Image Poster */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#11121A] border border-neutral-200 dark:border-neutral-800">
                <label className="block font-bold text-neutral-800 dark:text-neutral-200">
                  Attached Poster Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://... or /assets/aistudio/... or leave blank"
                  value={annImageUrl}
                  onChange={e => setAnnImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#171824] text-neutral-900 dark:text-white"
                />
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="text-[10px] text-neutral-400 self-center">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => setAnnImageUrl('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80')}
                    className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    Tech/Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnImageUrl('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80')}
                    className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    Sports
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnImageUrl('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80')}
                    className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  >
                    Tour
                  </button>
                  {annImageUrl && (
                    <button
                      type="button"
                      onClick={() => setAnnImageUrl('')}
                      className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-600 text-[10px] cursor-pointer"
                    >
                      Clear Image
                    </button>
                  )}
                </div>
                {annImageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden h-28 border border-neutral-300 dark:border-neutral-700 bg-neutral-900">
                    <img src={annImageUrl} alt="Poster preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Notice Content & Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter detailed notice information, eligibility, venues, schedule..."
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annPinned}
                    onChange={e => setAnnPinned(e.target.checked)}
                    className="w-4 h-4 text-[#D40000] rounded"
                  />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Pin this notice at the top of the portal
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAnnId ? 'Save Notice Updates' : 'Publish Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: GALLERY IMAGE ADD / EDIT (LIMITLESS BATCH OR SINGLE)
          ===================================================================== */}
      {galModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151620] border border-neutral-200 dark:border-[#382026] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
            <div className="bg-[#D40000] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                <h3 className="font-bold font-heading text-base">
                  {editingGalId ? 'Update Photo & Album Info' : 'Add Photos to Wing Album'}
                </h3>
              </div>
              <button onClick={() => setGalModalOpen(false)} className="text-white cursor-pointer hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="p-6 space-y-4 overflow-y-auto text-xs">
              
              {!editingGalId && (
                <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsBatchMode(false)}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      !isBatchMode ? 'bg-[#D40000] text-white' : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    Single Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBatchMode(true)}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      isBatchMode ? 'bg-[#D40000] text-white' : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    Batch Upload (Limitless)
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Target Wing Album *
                  </label>
                  <select
                    value={galWingSlug}
                    onChange={e => setGalWingSlug(e.target.value as ClubSubsector)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  >
                    {WINGS.map(w => (
                      <option key={w.slug} value={w.slug}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Event / Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Annual Sports Gala 2026"
                    value={galEventName}
                    onChange={e => setGalEventName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Photo Title / Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Football Championship Final Match"
                  value={galTitle}
                  onChange={e => setGalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                />
              </div>

              {/* Single or Batch URL input */}
              {isBatchMode && !editingGalId ? (
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Image URLs (One per line or comma-separated) *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="https://images.unsplash.com/...&#10;https://images.unsplash.com/...&#10;/public/assets/aistudio/sports_dbf5c39a.jpg"
                    value={galBatchUrls}
                    onChange={e => setGalBatchUrls(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Paste limitless photo URLs to instantly populate the selected album.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://... or /assets/aistudio/..."
                    value={galImageUrl}
                    onChange={e => setGalImageUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white font-mono"
                  />
                  {galImageUrl && (
                    <div className="rounded-xl overflow-hidden aspect-16/9 bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                      <img src={galImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Caption / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional brief description of this moment..."
                  value={galCaption}
                  onChange={e => setGalCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGalModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingGalId ? 'Update Photo' : 'Add to Album'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: USER / CONTROLLER CREATE & EDIT
          ===================================================================== */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151620] border border-neutral-200 dark:border-[#382026] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
            <div className="bg-[#D40000] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h3 className="font-bold font-heading text-base">
                  {editingUserId ? 'Edit User / Controller Profile' : 'Add New User or Controller'}
                </h3>
              </div>
              <button onClick={() => setUserModalOpen(false)} className="text-white cursor-pointer hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-3.5 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arifuzzaman Abir"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    University Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. arifuzzamanabir2025@gmail.com"
                    value={userEmail}
                    onChange={e => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Student / Faculty ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CU-23-CSE-099"
                    value={userStudentId}
                    onChange={e => setUserStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Assigned Role *
                  </label>
                  <select
                    value={userRole}
                    onChange={e => setUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white font-bold"
                  >
                    <option value="user">Regular Student / Member</option>
                    <option value="controller">Club Controller (Manage Events & Notices)</option>
                    <option value="administrator">Full University Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Department
                  </label>
                  <select
                    value={userDepartment}
                    onChange={e => setUserDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Trimester / Semester
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 5th Semester"
                    value={userSemester}
                    onChange={e => setUserSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Wing assignment for controllers */}
              {userRole === 'controller' && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
                  <label className="block font-bold text-amber-900 dark:text-amber-300">
                    Controller Assigned Subsector Wing:
                  </label>
                  <select
                    value={userAssignedWing}
                    onChange={e => setUserAssignedWing(e.target.value as ClubSubsector)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-[#11121A] text-neutral-900 dark:text-white font-semibold"
                  >
                    {WINGS.map(w => (
                      <option key={w.slug} value={w.slug}>
                        {w.label} ({w.club === 'computer_club' ? 'CUCC' : 'Events & Clubs'})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-neutral-500">
                    This controller will have administrative authority over competitions, announcements, and albums for this wing.
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Contact Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+880 17..."
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUserId ? 'Save Profile Changes' : 'Create User'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: EVENT CREATE & EDIT
          ===================================================================== */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151620] border border-neutral-200 dark:border-[#382026] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col">
            <div className="bg-[#D40000] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <h3 className="font-bold font-heading text-base">
                  {editingEventId ? 'Edit Event Details' : 'Create New University Event'}
                </h3>
              </div>
              <button onClick={() => setEventModalOpen(false)} className="text-white cursor-pointer hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="p-6 space-y-3.5 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Intra University Programming Contest"
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Kicker / Header Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. WORKSHOP · PROGRAMMING"
                    value={eventKicker}
                    onChange={e => setEventKicker(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Club Organization
                  </label>
                  <select
                    value={eventClubId}
                    onChange={e => setEventClubId(e.target.value as ClubCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  >
                    <option value="computer_club">Computer Club (CUCC)</option>
                    <option value="events_and_clubs">Events & Clubs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    Subsector Wing
                  </label>
                  <select
                    value={eventWingSlug}
                    onChange={e => setEventWingSlug(e.target.value as ClubSubsector)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  >
                    {WINGS.map(w => (
                      <option key={w.slug} value={w.slug}>{w.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Capacity</label>
                  <input
                    type="number"
                    value={eventCapacity}
                    onChange={e => setEventCapacity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Software Lab 402 or Central Playground"
                  value={eventVenue}
                  onChange={e => setEventVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Banner Image URL</label>
                <input
                  type="text"
                  value={eventBanner}
                  onChange={e => setEventBanner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">Description</label>
                <textarea
                  rows={3}
                  value={eventDesc}
                  onChange={e => setEventDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#11121A] text-neutral-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2 rounded-xl bg-[#D40000] hover:bg-red-800 text-white font-bold cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingEventId ? 'Save Event' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 5: ATTENDEE ROSTER MODAL
          ===================================================================== */}
      {attendeeRosterEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151620] border border-neutral-200 dark:border-[#382026] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="bg-[#D40000] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold font-heading text-base">{attendeeRosterEvent.title}</h3>
                <p className="text-xs text-red-100">Registered Student Attendee Pass Roster</p>
              </div>
              <button onClick={() => setAttendeeRosterEvent(null)} className="text-white cursor-pointer hover:opacity-80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto text-xs space-y-3">
              {attendeeRosterEvent.registrations?.length ? (
                <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {attendeeRosterEvent.registrations.map(r => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white block">{r.userName}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">{r.studentId} • {r.department}</span>
                      </div>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        {r.ticketCode}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-neutral-400">No students registered yet for this event.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
