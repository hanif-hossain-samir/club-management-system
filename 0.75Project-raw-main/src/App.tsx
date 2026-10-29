import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Sun, Moon } from 'lucide-react';
import { Navbar } from './components/Navbar.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { NoticeTicker } from './components/NoticeTicker.tsx';
import { Footer } from './components/Footer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { EventTicketModal } from './components/EventTicketModal.tsx';
import { SearchModal } from './components/SearchModal.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { ClubsPage } from './pages/ClubsPage.tsx';
import { EventsPage } from './pages/EventsPage.tsx';
import { AnnouncementsPage } from './pages/AnnouncementsPage.tsx';
import { GalleryPage } from './pages/GalleryPage.tsx';
import { MembershipPage } from './pages/MembershipPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { AboutContactPage } from './pages/AboutContactPage.tsx';

import { 
  Club, 
  ClubEvent, 
  Announcement, 
  GalleryItem, 
  ControllerApplication, 
  ClubWing, 
  EventRegistration 
} from './types.ts';
import { api } from './services/api.ts';
import { 
  INITIAL_CLUBS, 
  INITIAL_EVENTS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_GALLERY, 
  INITIAL_APPLICATIONS 
} from './data/initialData.ts';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('home');

  // Collections state
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [events, setEvents] = useState<ClubEvent[]>(INITIAL_EVENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [applications, setApplications] = useState<ControllerApplication[]>(INITIAL_APPLICATIONS);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedWing, setSelectedWing] = useState<ClubWing | null>(null);
  const [selectedEventModal, setSelectedEventModal] = useState<ClubEvent | null>(null);
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<Announcement | null>(null);
  const [activeTicket, setActiveTicket] = useState<{ event: ClubEvent; registration: EventRegistration } | null>(null);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial data from backend API
  const loadData = async () => {
    try {
      const [clubsRes, eventsRes, annRes, galRes, appRes] = await Promise.all([
        api.getClubs().catch(() => ({ success: false, clubs: INITIAL_CLUBS })),
        api.getEvents().catch(() => ({ success: false, events: INITIAL_EVENTS })),
        api.getAnnouncements().catch(() => ({ success: false, announcements: INITIAL_ANNOUNCEMENTS })),
        api.getGallery().catch(() => ({ success: false, gallery: INITIAL_GALLERY })),
        api.getApplications(user?.id).catch(() => ({ success: false, applications: INITIAL_APPLICATIONS }))
      ]);

      if (clubsRes.success && clubsRes.clubs) setClubs(clubsRes.clubs);
      if (eventsRes.success && eventsRes.events) setEvents(eventsRes.events);
      if (annRes.success && annRes.announcements) setAnnouncements(annRes.announcements);
      if (galRes.success && galRes.gallery) setGallery(galRes.gallery);
      if (appRes.success && appRes.applications) setApplications(appRes.applications);
    } catch (e) {
      // Keep initial fallback
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handlers
  const handleEventRegistered = (updatedEvent: ClubEvent, registration: EventRegistration) => {
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const handleOpenTicket = (event: ClubEvent, registration: EventRegistration) => {
    setActiveTicket({ event, registration });
  };

  const handlePhotoLiked = (id: string, newLikes: number) => {
    setGallery(prev => prev.map(g => g.id === id ? { ...g, likes: newLikes } : g));
  };

  const handlePhotoAdded = (item: GalleryItem) => {
    setGallery(prev => [item, ...prev]);
  };

  const handlePhotosAdded = (newItems: GalleryItem[]) => {
    setGallery(prev => [...newItems, ...prev]);
  };

  const handleApplicationSubmitted = (app: ControllerApplication) => {
    setApplications(prev => [app, ...prev]);
  };

  const handleSelectWingFromHome = (wing: ClubWing) => {
    setSelectedWing(wing);
    setActiveTab('clubs');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0E0307] dark:bg-[radial-gradient(ellipse_120%_90%_at_50%_-15%,rgba(145,20,45,0.22),rgba(14,3,7,1))] text-neutral-900 dark:text-[#FFF0F3] transition-colors duration-300">
      
      {/* Navbar with Day/Night Switch and Role Selector */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setAuthModalOpen(true)}
        openSearchModal={() => setSearchModalOpen(true)}
      />

      {/* Official Circulars Ticker */}
      <NoticeTicker
        announcements={announcements}
        onSelectNotice={(ann) => {
          setSelectedNoticeModal(ann);
          setActiveTab('announcements');
        }}
      />

      {/* Main Pages Content with bottom spacing for mobile navigation */}
      <main className="flex-1 pb-16 md:pb-0">
        {activeTab === 'home' && (
          <HomePage
            clubs={clubs}
            events={events}
            setActiveTab={setActiveTab}
            onSelectEvent={(evt) => {
              setSelectedEventModal(evt);
              setActiveTab('events');
            }}
            onSelectWing={handleSelectWingFromHome}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubsPage
            clubs={clubs}
            selectedWing={selectedWing}
            setSelectedWing={setSelectedWing}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'events' && (
          <EventsPage
            events={events}
            onEventRegistered={handleEventRegistered}
            selectedEventForModal={selectedEventModal}
            setSelectedEventForModal={setSelectedEventModal}
            openTicketModal={handleOpenTicket}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsPage
            announcements={announcements}
            selectedNotice={selectedNoticeModal}
            setSelectedNotice={setSelectedNoticeModal}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryPage
            gallery={gallery}
            onPhotoLiked={handlePhotoLiked}
            onPhotoAdded={handlePhotoAdded}
            onPhotosAdded={handlePhotosAdded}
          />
        )}

        {activeTab === 'membership' && (
          <MembershipPage
            onApplicationSubmitted={handleApplicationSubmitted}
          />
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboard
            clubs={clubs}
            events={events}
            announcements={announcements}
            gallery={gallery}
            applications={applications}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'about' && (
          <AboutContactPage />
        )}
      </main>

      {/* University Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Digital Pass Ticket Modal */}
      {activeTicket && (
        <EventTicketModal
          event={activeTicket.event}
          registration={activeTicket.registration}
          onClose={() => setActiveTicket(null)}
        />
      )}

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        clubs={clubs}
        events={events}
        announcements={announcements}
        setActiveTab={setActiveTab}
        onSelectEvent={(evt) => {
          setSelectedEventModal(evt);
          setActiveTab('events');
        }}
        onSelectWing={handleSelectWingFromHome}
        onSelectAnnouncement={(ann) => {
          setSelectedNoticeModal(ann);
          setActiveTab('announcements');
        }}
      />

      {/* Floating Day / Night Mode Switcher Button */}
      <aside aria-label="Theme switcher" className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30">
        <button
          onClick={toggleTheme}
          aria-label={theme === 'light' ? 'Switch to Night Mode (Dark & Deep-Red)' : 'Switch to Day Mode (White & Deep-Red)'}
          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 sm:gap-2.5 cursor-pointer border backdrop-blur-md ${
            theme === 'light'
              ? 'bg-white hover:bg-neutral-50 text-neutral-900 border-[#D40000]/30 shadow-red-950/15'
              : 'bg-[#18050E]/95 hover:bg-[#230714] text-[#FFF0F3] border-[#571329] shadow-black ring-1 ring-red-500/30'
          }`}
          title={theme === 'light' ? 'Switch to Night Mode: Dark & Deep-Red Background' : 'Switch to Day Mode: White & Deep-Red Background'}
        >
          {theme === 'light' ? (
            <>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-100 text-[#D40000] flex items-center justify-center">
                <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              </div>
              <div className="text-left leading-tight pr-1">
                <span className="block text-[10px] sm:text-[11px] font-bold text-[#D40000]">Night Mode</span>
                <span className="hidden sm:block text-[9px] text-neutral-500 font-medium">Dark & Deep-Red</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-900/60 text-amber-300 flex items-center justify-center">
                <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
              </div>
              <div className="text-left leading-tight pr-1">
                <span className="block text-[10px] sm:text-[11px] font-bold text-[#E5486B]">Day Mode</span>
                <span className="hidden sm:block text-[9px] text-neutral-300 font-medium">White & Deep-Red</span>
              </div>
            </>
          )}
        </button>
      </aside>

      {/* Mobile Navigation Bar below the mobile screen (Home, Clubs, Events, Gallery, About, Admin) */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
