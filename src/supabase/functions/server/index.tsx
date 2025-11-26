import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Helper function to get authenticated user
async function getAuthenticatedUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    console.log('Authentication error during user retrieval:', error);
    return null;
  }
  return user;
}

// ============ AUTH ROUTES ============

// Sign up new parent account
app.post('/make-server-02502793/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    console.log('Signup attempt for email:', email);
    
    if (!email || !password || !name) {
      console.log('Missing required fields:', { hasEmail: !!email, hasPassword: !!password, hasName: !!name });
      return c.json({ error: 'Missing required fields: email, password, name' }, 400);
    }

    // Validate password length
    if (password.length < 6) {
      console.log('Password too short');
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    console.log('Creating user with Supabase admin...');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured
      email_confirm: true
    });

    if (error) {
      console.log('Supabase createUser error:', error.message, error);
      return c.json({ error: `Account creation failed: ${error.message}` }, 400);
    }

    if (!data || !data.user) {
      console.log('No user data returned from Supabase');
      return c.json({ error: 'Failed to create user - no user data returned' }, 500);
    }

    console.log('User created successfully:', data.user.id);

    // Initialize family data
    try {
      await kv.set(`family:${data.user.id}`, {
        parentName: name,
        email,
        kids: [],
        createdAt: new Date().toISOString()
      });
      console.log('Family data initialized for user:', data.user.id);
    } catch (kvError) {
      console.log('Error initializing family data:', kvError);
      // Don't fail the signup if KV fails
    }

    return c.json({ 
      success: true, 
      userId: data.user.id,
      message: 'Parent account created successfully'
    });
  } catch (error) {
    console.log('Signup error in main handler:', error);
    return c.json({ 
      error: `Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, 500);
  }
});

// Get session (check if user is logged in)
app.get('/make-server-02502793/session', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    
    if (!user) {
      return c.json({ authenticated: false }, 200);
    }

    return c.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      }
    });
  } catch (error) {
    console.log('Session check error:', error);
    return c.json({ error: 'Session check failed' }, 500);
  }
});

// ============ FAMILY/KIDS ROUTES ============

// Get family data
app.get('/make-server-02502793/family', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const familyData = await kv.get(`family:${user.id}`);
    
    if (!familyData) {
      return c.json({ 
        family: { 
          parentName: user.user_metadata?.name || 'Parent',
          kids: [] 
        } 
      });
    }

    return c.json({ family: familyData });
  } catch (error) {
    console.log('Error fetching family data:', error);
    return c.json({ error: 'Failed to fetch family data' }, 500);
  }
});

// Add a kid
app.post('/make-server-02502793/family/kids', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      console.log('Add kid - Unauthorized: No user found');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('Add kid - User ID:', user.id);
    const kidData = await c.req.json();
    console.log('Add kid - Kid data received:', kidData);
    const { name, age, birthdate, avatar, favoriteColor } = kidData;

    if (!name) {
      console.log('Add kid - Missing name');
      return c.json({ error: 'Kid name is required' }, 400);
    }

    let familyData = await kv.get(`family:${user.id}`);
    console.log('Add kid - Existing family data:', familyData);
    
    // Initialize family data if it doesn't exist
    if (!familyData) {
      console.log('Add kid - Initializing new family data');
      familyData = {
        parentName: user.user_metadata?.name || 'Parent',
        email: user.email,
        kids: [],
        createdAt: new Date().toISOString()
      };
    }
    
    const newKid = {
      id: `kid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      age: age || 0,
      birthdate: birthdate || null,
      avatar: avatar || '👶',
      favoriteColor: favoriteColor || '#00ff00',
      addedAt: new Date().toISOString()
    };

    console.log('Add kid - New kid object:', newKid);
    familyData.kids = [...(familyData.kids || []), newKid];
    
    await kv.set(`family:${user.id}`, familyData);
    console.log('Add kid - Family data saved successfully');

    return c.json({ success: true, kid: newKid });
  } catch (error) {
    console.log('Add kid error:', error);
    return c.json({ error: `Failed to add kid: ${error instanceof Error ? error.message : 'Unknown error'}` }, 500);
  }
});

// Update a kid
app.put('/make-server-02502793/family/kids/:kidId', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const kidId = c.req.param('kidId');
    const updates = await c.req.json();

    const familyData = await kv.get(`family:${user.id}`);
    if (!familyData || !familyData.kids) {
      return c.json({ error: 'Family not found' }, 404);
    }

    const kidIndex = familyData.kids.findIndex((k: any) => k.id === kidId);
    if (kidIndex === -1) {
      return c.json({ error: 'Kid not found' }, 404);
    }

    familyData.kids[kidIndex] = { ...familyData.kids[kidIndex], ...updates };
    await kv.set(`family:${user.id}`, familyData);

    return c.json({ success: true, kid: familyData.kids[kidIndex] });
  } catch (error) {
    console.log('Error updating kid:', error);
    return c.json({ error: 'Failed to update kid' }, 500);
  }
});

// Delete a kid
app.delete('/make-server-02502793/family/kids/:kidId', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const kidId = c.req.param('kidId');

    const familyData = await kv.get(`family:${user.id}`);
    if (!familyData || !familyData.kids) {
      return c.json({ error: 'Family not found' }, 404);
    }

    familyData.kids = familyData.kids.filter((k: any) => k.id !== kidId);
    await kv.set(`family:${user.id}`, familyData);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting kid:', error);
    return c.json({ error: 'Failed to delete kid' }, 500);
  }
});

// ============ MEMORIES ROUTES ============

// Get all memories
app.get('/make-server-02502793/memories', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const memories = await kv.getByPrefix(`memory:${user.id}:`);
    
    // Sort by timestamp (newest first)
    const sortedMemories = memories.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return c.json({ memories: sortedMemories });
  } catch (error) {
    console.log('Error fetching memories:', error);
    return c.json({ error: 'Failed to fetch memories' }, 500);
  }
});

// Create a memory
app.post('/make-server-02502793/memories', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const memoryData = await c.req.json();
    const { kidId, title, description, photoUrl, milestone, category } = memoryData;

    if (!title || !kidId) {
      return c.json({ error: 'Title and kidId are required' }, 400);
    }

    const memory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      kidId,
      title,
      description: description || '',
      photoUrl: photoUrl || null,
      milestone: milestone || false,
      category: category || 'general',
      timestamp: new Date().toISOString()
    };

    await kv.set(`memory:${user.id}:${memory.id}`, memory);

    return c.json({ success: true, memory });
  } catch (error) {
    console.log('Error creating memory:', error);
    return c.json({ error: 'Failed to create memory' }, 500);
  }
});

// Delete a memory
app.delete('/make-server-02502793/memories/:memoryId', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const memoryId = c.req.param('memoryId');
    await kv.del(`memory:${user.id}:${memoryId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting memory:', error);
    return c.json({ error: 'Failed to delete memory' }, 500);
  }
});

// ============ APPOINTMENTS ROUTES ============

// Get all appointments
app.get('/make-server-02502793/appointments', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const appointments = await kv.getByPrefix(`appointment:${user.id}:`);
    
    // Sort by date (upcoming first)
    const sortedAppointments = appointments.sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    return c.json({ appointments: sortedAppointments });
  } catch (error) {
    console.log('Error fetching appointments:', error);
    return c.json({ error: 'Failed to fetch appointments' }, 500);
  }
});

// Create an appointment
app.post('/make-server-02502793/appointments', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const appointmentData = await c.req.json();
    const { kidId, type, date, time, location, notes, reminderDays } = appointmentData;

    if (!kidId || !type || !date) {
      return c.json({ error: 'KidId, type, and date are required' }, 400);
    }

    const appointment = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      kidId,
      type, // 'doctor', 'dentist', 'activity', etc.
      date,
      time: time || '00:00',
      location: location || '',
      notes: notes || '',
      reminderDays: reminderDays || 7,
      completed: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`appointment:${user.id}:${appointment.id}`, appointment);

    return c.json({ success: true, appointment });
  } catch (error) {
    console.log('Error creating appointment:', error);
    return c.json({ error: 'Failed to create appointment' }, 500);
  }
});

// Update appointment
app.put('/make-server-02502793/appointments/:appointmentId', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const appointmentId = c.req.param('appointmentId');
    const updates = await c.req.json();

    const existingAppointment = await kv.get(`appointment:${user.id}:${appointmentId}`);
    if (!existingAppointment) {
      return c.json({ error: 'Appointment not found' }, 404);
    }

    const updatedAppointment = { ...existingAppointment, ...updates };
    await kv.set(`appointment:${user.id}:${appointmentId}`, updatedAppointment);

    return c.json({ success: true, appointment: updatedAppointment });
  } catch (error) {
    console.log('Error updating appointment:', error);
    return c.json({ error: 'Failed to update appointment' }, 500);
  }
});

// Delete appointment
app.delete('/make-server-02502793/appointments/:appointmentId', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const appointmentId = c.req.param('appointmentId');
    await kv.del(`appointment:${user.id}:${appointmentId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting appointment:', error);
    return c.json({ error: 'Failed to delete appointment' }, 500);
  }
});

// ============ MESSAGES ROUTES ============

// Get messages between parent and kid
app.get('/make-server-02502793/messages/:kidId', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const kidId = c.req.param('kidId');
    const messages = await kv.getByPrefix(`message:${user.id}:${kidId}:`);
    
    // Sort by timestamp (oldest first for chat display)
    const sortedMessages = messages.sort((a: any, b: any) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.log('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Send a message
app.post('/make-server-02502793/messages', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const messageData = await c.req.json();
    const { kidId, content, type, stickerId } = messageData;

    if (!kidId || !content) {
      return c.json({ error: 'KidId and content are required' }, 400);
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from: 'parent',
      to: kidId,
      content,
      type: type || 'text', // 'text', 'sticker', 'walkie-talkie'
      stickerId: stickerId || null,
      timestamp: new Date().toISOString(),
      read: false
    };

    await kv.set(`message:${user.id}:${kidId}:${message.id}`, message);

    return c.json({ success: true, message });
  } catch (error) {
    console.log('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// ============ TIPS ROUTES ============

// Get personalized tips
app.get('/make-server-02502793/tips', async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get family data to personalize tips
    const familyData = await kv.get(`family:${user.id}`);
    const appointments = await kv.getByPrefix(`appointment:${user.id}:`);
    
    const tips = [];
    const now = new Date();

    // Check for upcoming appointments
    appointments.forEach((apt: any) => {
      const aptDate = new Date(apt.date);
      const daysUntil = Math.ceil((aptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil >= 0 && daysUntil <= apt.reminderDays) {
        tips.push({
          id: `tip_apt_${apt.id}`,
          type: 'reminder',
          priority: 'high',
          title: `Upcoming ${apt.type} appointment`,
          message: `${daysUntil} days until appointment on ${apt.date}`,
          action: 'View Appointments',
          icon: '📅'
        });
      }
    });

    // Add general parenting tips
    const generalTips = [
      {
        id: 'tip_bond_1',
        type: 'bonding',
        priority: 'medium',
        title: 'Quality Time Tip',
        message: 'Set aside 15 minutes of undivided attention with each child today',
        icon: '💝'
      },
      {
        id: 'tip_milestone_1',
        type: 'milestone',
        priority: 'low',
        title: 'Capture Memories',
        message: 'Document a special moment today - they grow up so fast!',
        icon: '📸'
      },
      {
        id: 'tip_health_1',
        type: 'health',
        priority: 'medium',
        title: 'Health Check',
        message: 'Annual checkups are important! Have you scheduled them?',
        icon: '🏥'
      }
    ];

    // Add a few random general tips
    const randomTips = generalTips.sort(() => Math.random() - 0.5).slice(0, 2);
    tips.push(...randomTips);

    return c.json({ tips });
  } catch (error) {
    console.log('Error fetching tips:', error);
    return c.json({ error: 'Failed to fetch tips' }, 500);
  }
});

// Health check
app.get('/make-server-02502793/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);