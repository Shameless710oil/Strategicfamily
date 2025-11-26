import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, projectId, publicAnonKey } from '../utils/supabase/client';
import { KidsManager } from './KidsManager';
import { MemoryBoard } from './MemoryBoard';
import { AppointmentScheduler } from './AppointmentScheduler';
import { TipsPanel } from './TipsPanel';
import { CommunicationHub } from './CommunicationHub';
import { Button } from './ui/button';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Image, 
  Lightbulb,
  LogOut,
  Menu
} from 'lucide-react';

interface FamilyDashboardProps {
  session: any;
  onSignOut: () => void;
}

type ViewType = 'kids' | 'memories' | 'appointments' | 'communications' | 'tips';

export function FamilyDashboard({ session, onSignOut }: FamilyDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('kids');
  const [familyData, setFamilyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch family data
  const fetchFamilyData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/family`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setFamilyData(data.family);
      }
    } catch (error) {
      console.error('Error fetching family data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onSignOut();
  };

  const navigationItems = [
    { id: 'kids' as ViewType, icon: Users, label: 'FAMILY', color: '#00ffff' },
    { id: 'memories' as ViewType, icon: Image, label: 'MEMORIES', color: '#ff00ff' },
    { id: 'appointments' as ViewType, icon: Calendar, label: 'SCHEDULE', color: '#00ff88' },
    { id: 'communications' as ViewType, icon: MessageSquare, label: 'COMMS', color: '#ffff00' },
    { id: 'tips' as ViewType, icon: Lightbulb, label: 'TIPS', color: '#ff0088' },
  ];

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center">
          <div 
            className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 mb-2"
            style={{ borderColor: '#00ffff' }}
          ></div>
          <p 
            className="font-mono text-xs"
            style={{ 
              color: '#00ffff',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
            }}
          >
            LOADING DASHBOARD...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 0, 255, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      {/* Scanline effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)'
        }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Header */}
      <div 
        className="relative z-20 flex items-center justify-between px-3 py-2 border-b"
        style={{
          borderColor: 'rgba(0, 255, 255, 0.3)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
      >
        <div>
          <h1 
            className="font-mono text-sm tracking-wider"
            style={{
              color: '#00ffff',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
            }}
          >
            THE STRATEGIC FAMILY ESSENTIAL
          </h1>
          <p 
            className="text-xs font-mono"
            style={{
              color: '#ff00ff',
              textShadow: '0 0 5px rgba(255, 0, 255, 0.6)'
            }}
          >
            {familyData?.parentName || session?.user?.email}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              color: '#00ffff'
            }}
            className="lg:hidden font-mono"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="font-mono text-xs"
            style={{
              color: '#ff0088',
              textShadow: '0 0 5px rgba(255, 0, 136, 0.5)'
            }}
          >
            <LogOut className="w-3 h-3 mr-1" />
            EXIT
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-20">
        <div 
          className={`flex ${menuOpen ? 'flex-col' : 'flex-row'} gap-1 p-2 border-b overflow-x-auto`}
          style={{
            borderColor: 'rgba(0, 255, 255, 0.2)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}
        >
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setMenuOpen(false);
              }}
              variant={currentView === item.id ? 'default' : 'ghost'}
              size="sm"
              className="font-mono text-xs whitespace-nowrap"
              style={
                currentView === item.id 
                  ? {
                      background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
                      color: '#000',
                      border: '1px solid #00ffff',
                      boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)',
                      textShadow: 'none'
                    }
                  : {
                      color: item.color,
                      textShadow: `0 0 10px ${item.color}80`
                    }
              }
            >
              <item.icon className="w-3 h-3 mr-1" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="relative z-10 h-[calc(100%-80px)] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {currentView === 'kids' && (
              <KidsManager 
                familyData={familyData} 
                accessToken={session.access_token}
                onUpdate={fetchFamilyData}
              />
            )}
            {currentView === 'memories' && (
              <MemoryBoard 
                familyData={familyData}
                accessToken={session.access_token}
              />
            )}
            {currentView === 'appointments' && (
              <AppointmentScheduler 
                familyData={familyData}
                accessToken={session.access_token}
              />
            )}
            {currentView === 'communications' && (
              <CommunicationHub 
                familyData={familyData}
                accessToken={session.access_token}
              />
            )}
            {currentView === 'tips' && (
              <TipsPanel 
                accessToken={session.access_token}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status indicator */}
      <motion.div
        className="absolute bottom-2 right-2 flex items-center gap-2 text-xs font-mono opacity-50"
        style={{
          color: '#00ffff',
          textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{
            background: '#00ffff',
            boxShadow: '0 0 10px #00ffff'
          }}
        />
        SYSTEM ONLINE
      </motion.div>
    </div>
  );
}