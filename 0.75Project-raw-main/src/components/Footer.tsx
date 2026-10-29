import React from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="bg-[#141416] dark:bg-[#0D0307] text-neutral-300 border-t-4 border-[#D40000] dark:border-red-600 transition-colors">
      
      {/* Top Banner */}
      <div className="bg-[#D40000] text-white py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <a 
              href="https://cityuniversity.ac.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md shrink-0 flex items-center justify-center ring-2 ring-white/60 hover:ring-white hover:scale-105 active:scale-95 transition-all cursor-pointer group/seal"
              title="Click logo to visit City University official website: https://cityuniversity.ac.bd/"
              aria-label="Visit City University Official Website"
            >
              <img 
                src="/city-university-logo.jpg" 
                alt="City University Official Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </a>
            <div>
              <h4 className="font-bold text-base font-heading tracking-wide">
                <a
                  href="https://cityuniversity.ac.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline inline-flex items-center gap-1.5"
                  title="Visit City University Official Website"
                >
                  <span>City University Events & Club (CUEC)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              </h4>
              <p className="text-xs text-red-100">
                ...creating a culture of excellence • Directorate of Student Welfare
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setActiveTab('membership')}
              className="px-4 py-2 rounded-lg bg-white text-[#D40000] hover:bg-neutral-100 font-bold transition-colors cursor-pointer shadow-sm"
            >
              Apply as Controller
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className="px-4 py-2 rounded-lg bg-red-900/60 hover:bg-red-900 border border-red-300/40 text-white font-semibold transition-colors cursor-pointer"
            >
              View Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
        
        {/* Col 1: About */}
        <div className="space-y-3">
          <h5 className="font-bold text-sm text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
            About CUEC
          </h5>
          <p className="text-neutral-400 leading-relaxed">
            The central authority coordinating extracurricular, academic, and athletic life at City University under the Directorate of Student Welfare (DSW).
          </p>
          <div className="pt-2 text-neutral-400 space-y-1">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
              <span>Permanent Campus, Khagan, Birulia, Savar, Dhaka</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-red-500 shrink-0" />
              <span>+880 2-9876543 (Ext. 201/305)</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500 shrink-0" />
              <span>dsw.cuec@cityuniversity.edu</span>
            </p>
          </div>
        </div>

        {/* Col 2: Computer Club Wings */}
        <div className="space-y-3">
          <h5 className="font-bold text-sm text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
            1. Computer Club
          </h5>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab('clubs')} 
                className="hover:text-red-400 transition-colors text-left"
              >
                • <strong>Programming Club:</strong> ICPC, Hackathons & Software Engineering
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('clubs')} 
                className="hover:text-red-400 transition-colors text-left"
              >
                • <strong>Cyber Security Club:</strong> CTFs, Ethical Hacking & Blue Teaming
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('clubs')} 
                className="hover:text-red-400 transition-colors text-left"
              >
                • <strong>Research Club:</strong> AI, Machine Learning & IEEE Publications
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Events & Clubs Wings */}
        <div className="space-y-3">
          <h5 className="font-bold text-sm text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
            2. Events & Clubs
          </h5>
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab('clubs')} 
                className="hover:text-red-400 transition-colors text-left"
              >
                • <strong>Sports Club:</strong> CPCL Cricket, Football & Indoor Badminton
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('clubs')} 
                className="hover:text-red-400 transition-colors text-left"
              >
                • <strong>Cultural Club:</strong> Rhythm of City, Drama & Classical Music
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('clubs')} 
                className="hover:text-red-400 transition-colors text-left"
              >
                • <strong>Tour & Adventure Club:</strong> Sajek Treks & Coastal Expeditions
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Quick Portals & Hours */}
        <div className="space-y-3">
          <h5 className="font-bold text-sm text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
            Central Portals
          </h5>
          <ul className="space-y-2">
            <li>
              <button onClick={() => setActiveTab('membership')} className="hover:text-red-400 transition-colors">
                • Controller Membership Application
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('membership')} className="hover:text-red-400 transition-colors">
                • Student Digital Club ID Card
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('events')} className="hover:text-red-400 transition-colors">
                • Intra Hackathon & CTF Registrations
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('announcements')} className="hover:text-red-400 transition-colors">
                • Circulars & Official Notice Board
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('dashboard')} className="hover:text-red-400 transition-colors font-semibold text-red-400">
                • Administrative & Controller CMS Login
              </button>
            </li>
            <li>
              <a 
                href="https://cityuniversity.ac.bd/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-red-400 transition-colors text-white font-medium inline-flex items-center gap-1.5"
                title="Visit City University Official Website"
              >
                • City University Official Website
                <ExternalLink className="w-3 h-3 text-red-400" />
              </a>
            </li>
          </ul>

          <div className="pt-2 text-neutral-500 text-[11px]">
            <p>Office Hours: Sat - Thu (09:00 AM - 05:00 PM)</p>
            <p>Closed on Fridays and University Holidays</p>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 py-4 px-4 sm:px-8 text-center text-[11px] text-neutral-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2 pb-20 md:pb-4">
        <p>© 2026 City University Events & Club (CUEC). All Rights Reserved.</p>
        <p className="flex items-center gap-1">
          Governed by Directorate of Student Welfare • City University
        </p>
      </div>
    </footer>
  );
};
