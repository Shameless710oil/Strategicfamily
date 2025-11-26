import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Plus, Image as ImageIcon, Star, Trash2, Calendar } from 'lucide-react';

interface Memory {
  id: string;
  kidId: string;
  title: string;
  description: string;
  photoUrl: string | null;
  milestone: boolean;
  category: string;
  timestamp: string;
}

interface MemoryBoardProps {
  familyData: any;
  accessToken: string;
}

const categoryOptions = [
  { value: 'general', label: 'General', icon: '📝' },
  { value: 'milestone', label: 'Milestone', icon: '🎯' },
  { value: 'first', label: 'First Time', icon: '🌟' },
  { value: 'achievement', label: 'Achievement', icon: '🏆' },
  { value: 'funny', label: 'Funny Moment', icon: '😄' },
  { value: 'special', label: 'Special Day', icon: '🎉' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'adventure', label: 'Adventure', icon: '🚀' }
];

export function MemoryBoard({ familyData, accessToken }: MemoryBoardProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [formData, setFormData] = useState({
    kidId: '',
    title: '',
    description: '',
    photoUrl: '',
    milestone: false,
    category: 'general'
  });

  const fetchMemories = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/memories`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error('Error fetching memories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/memories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add memory');
      }

      toast.success('Memory saved!');
      setIsAddingMemory(false);
      setFormData({
        kidId: '',
        title: '',
        description: '',
        photoUrl: '',
        milestone: false,
        category: 'general'
      });
      fetchMemories();
    } catch (error: any) {
      console.error('Error adding memory:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!confirm('Delete this memory?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/memories/${memoryId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete memory');
      }

      toast.success('Memory deleted');
      fetchMemories();
    } catch (error: any) {
      console.error('Error deleting memory:', error);
      toast.error(error.message);
    }
  };

  const getKidById = (kidId: string) => {
    return familyData?.kids?.find((k: any) => k.id === kidId);
  };

  const kids = familyData?.kids || [];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-purple-400 font-mono">MEMORY VAULT</h2>
          <p className="text-cyan-400 text-xs font-mono">
            {memories.length} {memories.length === 1 ? 'MEMORY' : 'MEMORIES'} STORED
          </p>
        </div>

        <Dialog open={isAddingMemory} onOpenChange={setIsAddingMemory}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-purple-400 hover:bg-purple-500 text-black font-mono"
              disabled={kids.length === 0}
            >
              <Plus className="w-4 h-4 mr-1" />
              NEW MEMORY
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border-2 border-purple-400 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-purple-400 font-mono">ADD NEW MEMORY</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <Label className="text-purple-400 font-mono text-xs">CHILD</Label>
                <Select 
                  value={formData.kidId} 
                  onValueChange={(value) => setFormData({ ...formData, kidId: value })}
                  required
                >
                  <SelectTrigger className="bg-black border-purple-400 text-purple-400 font-mono">
                    <SelectValue placeholder="Select child" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-purple-400">
                    {kids.map((kid: any) => (
                      <SelectItem key={kid.id} value={kid.id} className="text-purple-400 font-mono">
                        {kid.avatar} {kid.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-purple-400 font-mono text-xs">TITLE</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-black border-purple-400 text-purple-400 font-mono"
                  placeholder="First steps, first words, birthday..."
                />
              </div>

              <div>
                <Label className="text-purple-400 font-mono text-xs">DESCRIPTION</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-black border-purple-400 text-purple-400 font-mono"
                  placeholder="Tell the story of this memory..."
                  rows={4}
                />
              </div>

              <div>
                <Label className="text-purple-400 font-mono text-xs">CATEGORY</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-black border-purple-400 text-purple-400 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-purple-400">
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-purple-400 font-mono">
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-purple-400 font-mono text-xs">PHOTO URL (Optional)</Label>
                <Input
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="bg-black border-purple-400 text-purple-400 font-mono"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="milestone"
                  checked={formData.milestone}
                  onChange={(e) => setFormData({ ...formData, milestone: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="milestone" className="text-purple-400 font-mono text-xs cursor-pointer">
                  <Star className="inline w-3 h-3 mr-1" />
                  Mark as milestone
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-purple-400 hover:bg-purple-500 text-black font-mono"
                >
                  SAVE MEMORY
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingMemory(false)}
                  className="border-gray-600 text-gray-400 font-mono"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {!loading && kids.length === 0 && (
        <div 
          className="border-2 border-dashed p-12 text-center"
          style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
        >
          <p className="text-purple-400 font-mono mb-2">Add children first to create memories</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400 mb-2"></div>
            <p className="text-purple-400 font-mono text-xs">LOADING MEMORIES...</p>
          </div>
        </div>
      )}

      {/* Memories grid */}
      {!loading && memories.length === 0 && kids.length > 0 && (
        <div 
          className="border-2 border-dashed p-12 text-center"
          style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
        >
          <ImageIcon className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
          <p className="text-purple-400 font-mono mb-2">NO MEMORIES YET</p>
          <p className="text-gray-500 text-xs font-mono mb-4">
            Start capturing precious moments and milestones
          </p>
          <Button 
            size="sm"
            onClick={() => setIsAddingMemory(true)}
            className="bg-purple-400 hover:bg-purple-500 text-black font-mono"
          >
            <Plus className="w-4 h-4 mr-1" />
            ADD FIRST MEMORY
          </Button>
        </div>
      )}

      {!loading && memories.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {memories.map((memory) => {
            const kid = getKidById(memory.kidId);
            const category = categoryOptions.find(c => c.value === memory.category);
            
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card 
                  className="p-4 border-2 bg-black"
                  style={{ 
                    borderColor: 'rgba(168, 85, 247, 0.3)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {kid && (
                        <div 
                          className="text-2xl p-2 rounded border"
                          style={{ borderColor: kid.favoriteColor }}
                        >
                          {kid.avatar}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-purple-400 font-mono">{memory.title}</h3>
                          {memory.milestone && (
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                          {kid && <span>{kid.name}</span>}
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(memory.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMemory(memory.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400 hover:bg-opacity-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {memory.description && (
                    <p className="text-cyan-400 text-xs font-mono mb-3">
                      {memory.description}
                    </p>
                  )}

                  {memory.photoUrl && (
                    <img 
                      src={memory.photoUrl} 
                      alt={memory.title}
                      className="w-full rounded border-2 mb-3"
                      style={{ borderColor: kid?.favoriteColor || '#a855f7' }}
                    />
                  )}

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="text-xs font-mono"
                      style={{ borderColor: 'rgba(168, 85, 247, 0.5)', color: '#a855f7' }}
                    >
                      {category?.icon} {category?.label}
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}