import { useState } from 'react';
import { motion } from 'motion/react';
import { supabase, projectId, publicAnonKey } from '../utils/supabase/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';
import { Loader2, Users, Lock } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (session: any) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        toast.success('Welcome back!');
        onAuthSuccess(data.session);
      } else {
        // Sign up - call backend
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-02502793/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              name: formData.name
            })
          }
        );

        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Signup failed');
        }

        // Now login with the new account
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        toast.success('Account created! Welcome to The Strategic Family Essential!');
        onAuthSuccess(data.session);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
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
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.05) 2px, rgba(0, 255, 255, 0.05) 4px)'
        }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Neon glow accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 0, 255, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 py-6">
        {/* Logo/Title */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users 
              className="w-8 h-8"
              style={{ 
                color: '#ff00ff',
                filter: 'drop-shadow(0 0 10px #ff00ff)'
              }}
            />
            <h1 
              className="font-mono tracking-wider" 
              style={{ 
                fontSize: '24px',
                color: '#00ffff',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)'
              }}
            >
              THE STRATEGIC FAMILY ESSENTIAL
            </h1>
          </div>
          <p 
            className="text-xs font-mono"
            style={{
              color: '#ff00ff',
              textShadow: '0 0 10px rgba(255, 0, 255, 0.6)'
            }}
          >
            {isLogin ? 'PARENT ACCESS PORTAL' : 'NEW FAMILY REGISTRATION'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form 
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div 
            className="p-6 border-2 space-y-4 rounded-lg"
            style={{
              borderColor: 'rgba(0, 255, 255, 0.4)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.1), inset 0 0 30px rgba(0, 0, 0, 0.5)'
            }}
          >
            {!isLogin && (
              <div>
                <Label 
                  htmlFor="name" 
                  className="font-mono text-xs mb-2 block"
                  style={{ 
                    color: '#00ffff',
                    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                  }}
                >
                  PARENT NAME
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                  className="bg-black font-mono"
                  style={{
                    borderColor: '#ff00ff',
                    color: '#00ffff',
                    boxShadow: '0 0 10px rgba(255, 0, 255, 0.2)'
                  }}
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <Label 
                htmlFor="email" 
                className="font-mono text-xs mb-2 block"
                style={{ 
                  color: '#00ffff',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                }}
              >
                EMAIL ADDRESS
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-black font-mono"
                style={{
                  borderColor: '#ff00ff',
                  color: '#00ffff',
                  boxShadow: '0 0 10px rgba(255, 0, 255, 0.2)'
                }}
                placeholder="parent@email.com"
              />
            </div>

            <div>
              <Label 
                htmlFor="password" 
                className="font-mono text-xs mb-2 block"
                style={{ 
                  color: '#00ffff',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                }}
              >
                <Lock className="inline w-3 h-3 mr-1" />
                PASSWORD
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-black font-mono"
                style={{
                  borderColor: '#ff00ff',
                  color: '#00ffff',
                  boxShadow: '0 0 10px rgba(255, 0, 255, 0.2)'
                }}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full text-black font-mono border-2"
              style={{
                background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
                borderColor: '#00ffff',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  PROCESSING...
                </>
              ) : (
                isLogin ? 'ACCESS SYSTEM' : 'CREATE FAMILY ACCOUNT'
              )}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', name: '' });
              }}
              className="font-mono text-xs underline"
              style={{
                color: '#ff00ff',
                textShadow: '0 0 10px rgba(255, 0, 255, 0.5)'
              }}
            >
              {isLogin ? 'Need an account? REGISTER HERE' : 'Already registered? LOGIN HERE'}
            </button>
          </div>
        </motion.form>

        {/* Info text */}
        <motion.p 
          className="font-mono text-xs text-center mt-6 max-w-sm"
          style={{
            color: '#666',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Secure family management system • Track memories, appointments & more
        </motion.p>
      </div>
    </div>
  );
}