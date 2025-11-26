import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase/client';
import { AuthScreen } from './components/AuthScreen';
import { FamilyDashboard } from './components/FamilyDashboard';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #ff00ff, #8b00ff, #1a0033)'
        }}
      >
        <div className="text-center">
          <div 
            className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mb-4"
            style={{ borderColor: '#00ffff' }}
          ></div>
          <p className="font-mono" style={{ color: '#00ffff' }}>INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" theme="dark" />
      <div 
        className="min-h-screen flex items-center justify-center p-4 md:p-8"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1a0033 0%, #0a001a 50%, #000000 100%)',
        }}
      >
        {/* Gaming Device Frame */}
        <div 
          className="relative w-full max-w-6xl"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(255, 0, 255, 0.3)) drop-shadow(0 0 80px rgba(0, 255, 255, 0.2))'
          }}
        >
          {/* Device Body */}
          <div 
            className="relative rounded-3xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(145deg, #1a1a2e, #0f0f1e)',
              border: '3px solid transparent',
              backgroundImage: 'linear-gradient(145deg, #1a1a2e, #0f0f1e), linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.8), 0 10px 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Decorative top bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    background: '#ff0088',
                    boxShadow: '0 0 10px #ff0088'
                  }}
                />
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    background: '#00ffff',
                    boxShadow: '0 0 10px #00ffff'
                  }}
                />
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    background: '#ff00ff',
                    boxShadow: '0 0 10px #ff00ff'
                  }}
                />
              </div>
              <div 
                className="text-xs font-mono px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(0, 255, 255, 0.1)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  color: '#00ffff',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
                }}
              >
                FAMILY-LINK v2.0
              </div>
            </div>

            {/* Screen Bezel */}
            <div 
              className="relative rounded-2xl p-1"
              style={{
                background: 'linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%)',
                boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Inner Screen Frame */}
              <div 
                className="relative rounded-xl overflow-hidden"
                style={{
                  background: '#000000',
                  border: '2px solid rgba(0, 255, 255, 0.2)',
                  boxShadow: '0 0 20px rgba(255, 0, 255, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.9)'
                }}
              >
                {/* CRT Screen Effect Overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none z-50"
                  style={{
                    background: 'linear-gradient(transparent 50%, rgba(0, 255, 255, 0.03) 50%)',
                    backgroundSize: '100% 4px',
                    opacity: 0.4
                  }}
                />
                
                {/* Screen Glow */}
                <div 
                  className="absolute inset-0 pointer-events-none z-40"
                  style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%)',
                  }}
                />

                {/* App Content */}
                <div className="relative z-10 min-h-[600px]">
                  {!session ? (
                    <AuthScreen onAuthSuccess={setSession} />
                  ) : (
                    <FamilyDashboard session={session} onSignOut={() => setSession(null)} />
                  )}
                </div>
              </div>
            </div>

            {/* Device Controls */}
            <div className="flex items-center justify-between mt-4">
              {/* Left side buttons */}
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #2d2d44, #1a1a2e)',
                    border: '1px solid rgba(255, 0, 255, 0.3)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 0, 255, 0.2)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: '#ff00ff' }} />
                </div>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #2d2d44, #1a1a2e)',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 255, 255, 0.2)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00ffff' }} />
                </div>
              </div>

              {/* Center speaker grills */}
              <div className="flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 h-4 rounded-full"
                    style={{ 
                      background: 'rgba(255, 0, 255, 0.2)',
                      boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                ))}
              </div>

              {/* Right side buttons */}
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #2d2d44, #1a1a2e)',
                    border: '1px solid rgba(0, 255, 0, 0.3)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 255, 0, 0.2)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: '#00ff00' }} />
                </div>
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #2d2d44, #1a1a2e)',
                    border: '1px solid rgba(255, 255, 0, 0.3)',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 0, 0.2)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: '#ffff00' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="fixed bottom-0 left-0 right-0 border-t px-4 py-6 z-50"
          style={{ 
            backgroundColor: 'rgba(26, 0, 51, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTopColor: 'rgba(255, 0, 255, 0.2)',
            boxShadow: '0 -4px 20px rgba(255, 0, 255, 0.1)'
          }}
        >
          <p 
            className="text-xs text-center font-mono"
            style={{ 
              color: '#00ffff',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
            }}
          >
            The Strategic Family Essential • Neon Edition
          </p>
        </div>
      </div>
    </>
  );
}