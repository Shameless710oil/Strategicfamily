import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { projectId } from '../utils/supabase/info';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { 
  Lightbulb, 
  Heart, 
  Calendar, 
  AlertCircle, 
  Star,
  RefreshCw
} from 'lucide-react';

interface Tip {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  action?: string;
  icon: string;
}

interface TipsPanelProps {
  accessToken: string;
}

const priorityColors = {
  high: { bg: '#ff0000', text: '#ffffff', border: '#ff6666' },
  medium: { bg: '#ffaa00', text: '#000000', border: '#ffcc66' },
  low: { bg: '#00ff88', text: '#000000', border: '#66ffaa' }
};

const typeIcons = {
  reminder: AlertCircle,
  bonding: Heart,
  milestone: Star,
  health: Calendar,
  general: Lightbulb
};

export function TipsPanel({ accessToken }: TipsPanelProps) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/tips`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setTips(data.tips || []);
      }
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const sortedTips = [...tips].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - 
           priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-orange-400 font-mono">FAMILY TIPS & REMINDERS</h2>
          <p className="text-cyan-400 text-xs font-mono">
            Personalized guidance for your family
          </p>
        </div>

        <Button
          size="sm"
          onClick={fetchTips}
          disabled={loading}
          className="bg-orange-400 hover:bg-orange-500 text-black font-mono"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-400 mb-2"></div>
            <p className="text-orange-400 font-mono text-xs">LOADING TIPS...</p>
          </div>
        </div>
      )}

      {/* Tips List */}
      {!loading && (
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {sortedTips.map((tip, index) => {
              const colors = priorityColors[tip.priority as keyof typeof priorityColors];
              const IconComponent = typeIcons[tip.type as keyof typeof typeIcons] || Lightbulb;

              return (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="p-4 border-2 bg-black"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: 'rgba(0, 0, 0, 0.9)'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="p-2 rounded border-2 flex-shrink-0"
                        style={{ borderColor: colors.border }}
                      >
                        <span className="text-2xl">{tip.icon}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-orange-400 font-mono">
                            {tip.title}
                          </h3>
                          <Badge
                            className="font-mono text-xs whitespace-nowrap"
                            style={{
                              backgroundColor: colors.bg,
                              color: colors.text,
                              borderColor: colors.border
                            }}
                          >
                            {tip.priority.toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-cyan-400 text-xs font-mono mb-3">
                          {tip.message}
                        </p>

                        <div className="flex items-center gap-2">
                          <IconComponent className="w-3 h-3 text-gray-500" />
                          <span className="text-xs font-mono text-gray-500">
                            {tip.type.toUpperCase()}
                          </span>
                          {tip.action && (
                            <>
                              <span className="text-gray-600">•</span>
                              <span className="text-xs font-mono text-orange-400">
                                {tip.action}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* General parenting tips */}
            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 165, 0, 0.2)' }}>
              <h3 className="text-orange-400 font-mono text-sm mb-3">PARENTING INSIGHTS</h3>
              
              <div className="space-y-3">
                <Card className="p-3 border bg-black" style={{ borderColor: 'rgba(255, 165, 0, 0.2)' }}>
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-pink-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs font-mono text-cyan-400 mb-1">
                        💡 Connection Tip
                      </p>
                      <p className="text-xs font-mono text-gray-400">
                        Ask your child about their favorite part of the day during dinner. 
                        Active listening builds trust and opens communication.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-3 border bg-black" style={{ borderColor: 'rgba(255, 165, 0, 0.2)' }}>
                  <div className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs font-mono text-cyan-400 mb-1">
                        🎯 Development Milestone
                      </p>
                      <p className="text-xs font-mono text-gray-400">
                        Celebrate small victories! Every milestone, no matter how small, 
                        is a step in your child's growth journey.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-3 border bg-black" style={{ borderColor: 'rgba(255, 165, 0, 0.2)' }}>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs font-mono text-cyan-400 mb-1">
                        📅 Routine Reminder
                      </p>
                      <p className="text-xs font-mono text-gray-400">
                        Consistent bedtime routines help children feel secure and improve sleep quality. 
                        Try reading together for 15 minutes each night.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-3 border bg-black" style={{ borderColor: 'rgba(255, 165, 0, 0.2)' }}>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs font-mono text-cyan-400 mb-1">
                        🎨 Activity Idea
                      </p>
                      <p className="text-xs font-mono text-gray-400">
                        Create a "memory jar" together. Write down happy moments on slips of paper 
                        and read them at the end of each month.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
