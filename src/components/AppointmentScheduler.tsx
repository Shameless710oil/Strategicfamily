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
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { Plus, Calendar, Clock, MapPin, Trash2, CheckCircle } from 'lucide-react';

interface Appointment {
  id: string;
  kidId: string;
  type: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  reminderDays: number;
  completed: boolean;
  createdAt: string;
}

interface AppointmentSchedulerProps {
  familyData: any;
  accessToken: string;
}

const appointmentTypes = [
  { value: 'doctor', label: 'Doctor Visit', icon: '🏥', color: '#00ffff' },
  { value: 'dentist', label: 'Dentist', icon: '🦷', color: '#00ff00' },
  { value: 'checkup', label: 'Annual Checkup', icon: '📋', color: '#ff00ff' },
  { value: 'vaccine', label: 'Vaccination', icon: '💉', color: '#ffff00' },
  { value: 'specialist', label: 'Specialist', icon: '👨‍⚕️', color: '#ff6600' },
  { value: 'therapy', label: 'Therapy', icon: '🧠', color: '#00ff88' },
  { value: 'activity', label: 'Activity/Class', icon: '🎨', color: '#8800ff' },
  { value: 'sports', label: 'Sports', icon: '⚽', color: '#00aaff' },
  { value: 'other', label: 'Other', icon: '📅', color: '#ff0088' }
];

export function AppointmentScheduler({ familyData, accessToken }: AppointmentSchedulerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    kidId: '',
    type: 'doctor',
    date: '',
    time: '',
    location: '',
    notes: '',
    reminderDays: 7
  });

  const fetchAppointments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/appointments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/appointments`,
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
        throw new Error(result.error || 'Failed to add appointment');
      }

      toast.success('Appointment scheduled!');
      setIsAdding(false);
      setFormData({
        kidId: '',
        type: 'doctor',
        date: '',
        time: '',
        location: '',
        notes: '',
        reminderDays: 7
      });
      fetchAppointments();
    } catch (error: any) {
      console.error('Error adding appointment:', error);
      toast.error(error.message);
    }
  };

  const handleToggleComplete = async (appointment: Appointment) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/appointments/${appointment.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ completed: !appointment.completed })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update appointment');
      }

      toast.success(appointment.completed ? 'Appointment unmarked' : 'Appointment completed!');
      fetchAppointments();
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Delete this appointment?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/appointments/${appointmentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      toast.success('Appointment deleted');
      fetchAppointments();
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast.error(error.message);
    }
  };

  const getKidById = (kidId: string) => {
    return familyData?.kids?.find((k: any) => k.id === kidId);
  };

  const getAppointmentType = (type: string) => {
    return appointmentTypes.find(t => t.value === type) || appointmentTypes[0];
  };

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    const aptDate = new Date(dateStr);
    const diff = Math.ceil((aptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const kids = familyData?.kids || [];
  const upcomingAppointments = appointments.filter(a => !a.completed && getDaysUntil(a.date) >= 0);
  const pastAppointments = appointments.filter(a => a.completed || getDaysUntil(a.date) < 0);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-cyan-400 font-mono">APPOINTMENT SCHEDULER</h2>
          <p className="text-green-400 text-xs font-mono">
            {upcomingAppointments.length} UPCOMING • {pastAppointments.length} PAST
          </p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="bg-cyan-400 hover:bg-cyan-500 text-black font-mono"
              disabled={kids.length === 0}
            >
              <Plus className="w-4 h-4 mr-1" />
              NEW APPOINTMENT
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black border-2 border-cyan-400 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-cyan-400 font-mono">SCHEDULE APPOINTMENT</DialogTitle>
              <DialogDescription className="text-gray-500 font-mono text-xs">
                Add a new appointment for one of your children
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div>
                <Label className="text-cyan-400 font-mono text-xs">CHILD</Label>
                <Select 
                  value={formData.kidId} 
                  onValueChange={(value) => setFormData({ ...formData, kidId: value })}
                  required
                >
                  <SelectTrigger className="bg-black border-cyan-400 text-cyan-400 font-mono">
                    <SelectValue placeholder="Select child" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-cyan-400">
                    {kids.map((kid: any) => (
                      <SelectItem key={kid.id} value={kid.id} className="text-cyan-400 font-mono">
                        {kid.avatar} {kid.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-cyan-400 font-mono text-xs">APPOINTMENT TYPE</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="bg-black border-cyan-400 text-cyan-400 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-cyan-400">
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-cyan-400 font-mono">
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-cyan-400 font-mono text-xs">DATE</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="bg-black border-cyan-400 text-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <Label className="text-cyan-400 font-mono text-xs">TIME</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="bg-black border-cyan-400 text-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <Label className="text-cyan-400 font-mono text-xs">LOCATION</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-black border-cyan-400 text-cyan-400 font-mono"
                  placeholder="Doctor's office, clinic, etc."
                />
              </div>

              <div>
                <Label className="text-cyan-400 font-mono text-xs">NOTES</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-black border-cyan-400 text-cyan-400 font-mono"
                  placeholder="Any special instructions or reminders..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-cyan-400 font-mono text-xs">REMINDER (DAYS BEFORE)</Label>
                <Input
                  type="number"
                  value={formData.reminderDays}
                  onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) || 7 })}
                  className="bg-black border-cyan-400 text-cyan-400 font-mono"
                  min="0"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-cyan-400 hover:bg-cyan-500 text-black font-mono"
                >
                  SCHEDULE
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
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
          style={{ borderColor: 'rgba(0, 255, 255, 0.3)' }}
        >
          <p className="text-cyan-400 font-mono mb-2">Add children first to schedule appointments</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400 mb-2"></div>
            <p className="text-cyan-400 font-mono text-xs">LOADING SCHEDULE...</p>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      {!loading && upcomingAppointments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-green-400 font-mono text-sm">UPCOMING APPOINTMENTS</h3>
          {upcomingAppointments.map((appointment) => {
            const kid = getKidById(appointment.kidId);
            const aptType = getAppointmentType(appointment.type);
            const daysUntil = getDaysUntil(appointment.date);
            
            return (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card 
                  className="p-4 border-2 bg-black"
                  style={{ 
                    borderColor: daysUntil <= appointment.reminderDays ? '#ffff00' : 'rgba(0, 255, 255, 0.3)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex items-center gap-2 mt-1">
                        <Checkbox
                          checked={appointment.completed}
                          onCheckedChange={() => handleToggleComplete(appointment)}
                          className="border-cyan-400"
                        />
                      </div>

                      {kid && (
                        <div 
                          className="text-2xl p-2 rounded border"
                          style={{ borderColor: kid.favoriteColor }}
                        >
                          {kid.avatar}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{aptType.icon}</span>
                          <h3 className="text-cyan-400 font-mono">{aptType.label}</h3>
                          {daysUntil <= appointment.reminderDays && (
                            <Badge className="bg-yellow-400 text-black font-mono text-xs">
                              {daysUntil === 0 ? 'TODAY' : `${daysUntil}d`}
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1 text-xs font-mono text-gray-400">
                          {kid && <div>{kid.name}</div>}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(appointment.date).toLocaleDateString()}
                            {appointment.time && (
                              <>
                                <Clock className="w-3 h-3 ml-2" />
                                {appointment.time}
                              </>
                            )}
                          </div>
                          {appointment.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              {appointment.location}
                            </div>
                          )}
                          {appointment.notes && (
                            <div className="mt-2 text-cyan-400 italic">
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400 hover:bg-opacity-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Past/Completed Appointments */}
      {!loading && pastAppointments.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="text-gray-500 font-mono text-sm">PAST APPOINTMENTS</h3>
          {pastAppointments.slice(0, 5).map((appointment) => {
            const kid = getKidById(appointment.kidId);
            const aptType = getAppointmentType(appointment.type);
            
            return (
              <Card 
                key={appointment.id}
                className="p-3 border bg-black opacity-60"
                style={{ borderColor: 'rgba(100, 100, 100, 0.3)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{aptType.icon}</span>
                    <div className="text-xs font-mono text-gray-400">
                      <div>{aptType.label} - {kid?.name}</div>
                      <div>{new Date(appointment.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAppointment(appointment.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty state for appointments */}
      {!loading && appointments.length === 0 && kids.length > 0 && (
        <div 
          className="border-2 border-dashed p-12 text-center"
          style={{ borderColor: 'rgba(0, 255, 255, 0.3)' }}
        >
          <Calendar className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-50" />
          <p className="text-cyan-400 font-mono mb-2">NO APPOINTMENTS SCHEDULED</p>
          <p className="text-gray-500 text-xs font-mono mb-4">
            Schedule doctor visits, checkups, and activities
          </p>
          <Button 
            size="sm"
            onClick={() => setIsAdding(true)}
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-mono"
          >
            <Plus className="w-4 h-4 mr-1" />
            SCHEDULE FIRST APPOINTMENT
          </Button>
        </div>
      )}
    </div>
  );
}