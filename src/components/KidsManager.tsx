import { useState } from 'react';
import { motion } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { Plus, User, Cake, Palette, Trash2 } from 'lucide-react';

interface Kid {
  id: string;
  name: string;
  age: number;
  birthdate: string;
  avatar: string;
  favoriteColor: string;
  addedAt: string;
}

interface KidsManagerProps {
  familyData: any;
  accessToken: string;
  onUpdate: () => void;
}

const avatarOptions = ['👶', '👧', '🧒', '👦', '🧑', '👨', '👩', '🎮', '⚽', '🎨', '📚', '🚀', '🦖', '🐱', '🐶'];
const colorOptions = [
  '#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff6600', 
  '#00ff88', '#8800ff', '#ff0088', '#00aaff', '#ff8844'
];

export function KidsManager({ familyData, accessToken, onUpdate }: KidsManagerProps) {
  const [isAddingKid, setIsAddingKid] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    birthdate: '',
    avatar: '👶',
    favoriteColor: '#00ff00'
  });
  const [loading, setLoading] = useState(false);

  const handleAddKid = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/family/kids`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            name: formData.name,
            age: parseInt(formData.age) || 0,
            birthdate: formData.birthdate,
            avatar: formData.avatar,
            favoriteColor: formData.favoriteColor
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add kid');
      }

      toast.success(`${formData.name} added to family!`);
      setIsAddingKid(false);
      setFormData({
        name: '',
        age: '',
        birthdate: '',
        avatar: '👶',
        favoriteColor: '#00ff00'
      });
      onUpdate();
    } catch (error: any) {
      console.error('Error adding kid:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKid = async (kidId: string, kidName: string) => {
    if (!confirm(`Remove ${kidName} from family?`)) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/family/kids/${kidId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete kid');
      }

      toast.success(`${kidName} removed from family`);
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting kid:', error);
      toast.error(error.message);
    }
  };

  const kids = familyData?.kids || [];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-green-400 font-mono">FAMILY MEMBERS</h2>
          <p className="text-cyan-400 text-xs font-mono">
            {kids.length} {kids.length === 1 ? 'CHILD' : 'CHILDREN'} REGISTERED
          </p>
        </div>

        <Dialog open={isAddingKid} onOpenChange={setIsAddingKid}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-green-400 hover:bg-green-500 text-black font-mono"
            >
              <Plus className="w-4 h-4 mr-1" />
              ADD CHILD
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border-2 border-green-400">
            <DialogHeader>
              <DialogTitle className="text-green-400 font-mono">ADD NEW CHILD</DialogTitle>
              <DialogDescription className="text-gray-500 text-xs font-mono">
                Add a new child to your family to start tracking memories and milestones.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddKid} className="space-y-4">
              <div>
                <Label className="text-green-400 font-mono text-xs">NAME</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-black border-green-400 text-green-400 font-mono"
                  placeholder="Child's name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-green-400 font-mono text-xs">AGE</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="bg-black border-green-400 text-green-400 font-mono"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label className="text-green-400 font-mono text-xs">BIRTHDATE</Label>
                  <Input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    className="bg-black border-green-400 text-green-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-green-400 font-mono text-xs mb-2 block">AVATAR</Label>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: emoji })}
                      className={`text-2xl p-2 border-2 rounded ${
                        formData.avatar === emoji 
                          ? 'border-green-400 bg-green-400 bg-opacity-20' 
                          : 'border-gray-600 hover:border-green-400'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-green-400 font-mono text-xs mb-2 block">THEME COLOR</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, favoriteColor: color })}
                      className={`w-8 h-8 rounded border-2 ${
                        formData.favoriteColor === color 
                          ? 'border-white scale-110' 
                          : 'border-gray-600 hover:border-white'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-400 hover:bg-green-500 text-black font-mono"
                >
                  {loading ? 'ADDING...' : 'ADD CHILD'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingKid(false)}
                  className="border-gray-600 text-gray-400 font-mono"
                >
                  CANCEL
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kids Grid */}
      {kids.length === 0 ? (
        <div 
          className="border-2 border-dashed p-12 text-center"
          style={{ borderColor: 'rgba(0, 255, 0, 0.3)' }}
        >
          <User className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
          <p className="text-green-400 font-mono mb-2">NO CHILDREN REGISTERED</p>
          <p className="text-gray-500 text-xs font-mono mb-4">
            Add your first child to start tracking memories and milestones
          </p>
          <Button 
            size="sm"
            onClick={() => setIsAddingKid(true)}
            className="bg-green-400 hover:bg-green-500 text-black font-mono"
          >
            <Plus className="w-4 h-4 mr-1" />
            ADD CHILD
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {kids.map((kid: Kid) => (
            <motion.div
              key={kid.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Card 
                className="p-4 border-2 bg-black"
                style={{ 
                  borderColor: kid.favoriteColor + '80',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="text-4xl p-2 rounded border-2"
                      style={{ borderColor: kid.favoriteColor }}
                    >
                      {kid.avatar}
                    </div>
                    <div>
                      <h3 
                        className="font-mono"
                        style={{ color: kid.favoriteColor }}
                      >
                        {kid.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-1">
                        {kid.age > 0 && (
                          <span className="flex items-center gap-1">
                            <Cake className="w-3 h-3" />
                            {kid.age} years
                          </span>
                        )}
                        {kid.birthdate && (
                          <span>{new Date(kid.birthdate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteKid(kid.id, kid.name)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400 hover:bg-opacity-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Stats could go here */}
                <div 
                  className="pt-3 border-t grid grid-cols-3 gap-2 text-center"
                  style={{ borderColor: kid.favoriteColor + '30' }}
                >
                  <div>
                    <div className="text-xs font-mono text-gray-500">MEMORIES</div>
                    <div className="font-mono text-cyan-400">0</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-gray-500">EVENTS</div>
                    <div className="font-mono text-cyan-400">0</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-gray-500">MESSAGES</div>
                    <div className="font-mono text-cyan-400">0</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}