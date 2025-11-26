import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner@2.0.3';
import { MessageSquare, Radio, Sticker, Send, Mic, Image } from 'lucide-react';

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  type: string;
  stickerId: string | null;
  timestamp: string;
  read: boolean;
}

interface CommunicationHubProps {
  familyData: any;
  accessToken: string;
}

export function CommunicationHub({ familyData, accessToken }: CommunicationHubProps) {
  const [selectedKid, setSelectedKid] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const kids = familyData?.kids || [];

  useEffect(() => {
    if (selectedKid) {
      fetchMessages(selectedKid);
    }
  }, [selectedKid]);

  useEffect(() => {
    if (kids.length > 0 && !selectedKid) {
      setSelectedKid(kids[0].id);
    }
  }, [kids]);

  const fetchMessages = async (kidId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/messages/${kidId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedKid) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-02502793/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            kidId: selectedKid,
            content: newMessage,
            type: 'text'
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      setNewMessage('');
      fetchMessages(selectedKid);
      toast.success('Message sent!');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message);
    }
  };

  const getKidById = (kidId: string) => {
    return kids.find((k: any) => k.id === kidId);
  };

  const selectedKidData = getKidById(selectedKid);

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="messages" className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3 bg-black border border-yellow-400">
            <TabsTrigger value="messages" className="text-yellow-400 font-mono text-xs data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <MessageSquare className="w-3 h-3 mr-1" />
              CHAT
            </TabsTrigger>
            <TabsTrigger value="walkie" className="text-yellow-400 font-mono text-xs data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Radio className="w-3 h-3 mr-1" />
              WALKIE
            </TabsTrigger>
            <TabsTrigger value="stickers" className="text-yellow-400 font-mono text-xs data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
              <Sticker className="w-3 h-3 mr-1" />
              STICKERS
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Messages Tab */}
        <TabsContent value="messages" className="flex-1 flex flex-col mt-0">
          {kids.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-yellow-400 font-mono text-center">
                Add children to start messaging
              </p>
            </div>
          ) : (
            <>
              {/* Kid Selector */}
              <div 
                className="px-4 py-2 border-b flex gap-2 overflow-x-auto"
                style={{ borderColor: 'rgba(255, 255, 0, 0.3)' }}
              >
                {kids.map((kid: any) => (
                  <Button
                    key={kid.id}
                    size="sm"
                    variant={selectedKid === kid.id ? 'default' : 'ghost'}
                    onClick={() => setSelectedKid(kid.id)}
                    className={`font-mono text-xs whitespace-nowrap ${
                      selectedKid === kid.id
                        ? 'bg-yellow-400 text-black'
                        : 'text-yellow-400'
                    }`}
                  >
                    {kid.avatar} {kid.name}
                  </Button>
                ))}
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 px-4 py-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-400 mb-2"></div>
                      <p className="text-yellow-400 font-mono text-xs">LOADING...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div 
                    className="border-2 border-dashed p-8 text-center"
                    style={{ borderColor: 'rgba(255, 255, 0, 0.3)' }}
                  >
                    <MessageSquare className="w-10 h-10 text-yellow-400 mx-auto mb-3 opacity-50" />
                    <p className="text-yellow-400 font-mono text-sm mb-1">NO MESSAGES YET</p>
                    <p className="text-gray-500 text-xs font-mono">
                      Start a conversation with {selectedKidData?.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const isFromParent = message.from === 'parent';
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isFromParent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded font-mono text-xs ${
                              isFromParent
                                ? 'bg-yellow-400 text-black'
                                : 'bg-gray-800 text-yellow-400 border border-yellow-400'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div 
                className="p-4 border-t"
                style={{ 
                  borderColor: 'rgba(255, 255, 0, 0.3)',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)'
                }}
              >
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Message ${selectedKidData?.name}...`}
                    className="bg-black border-yellow-400 text-yellow-400 font-mono"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Walkie-Talkie Tab */}
        <TabsContent value="walkie" className="flex-1 flex flex-col p-4">
          <div className="flex-1 flex items-center justify-center">
            <Card 
              className="p-8 text-center border-2 bg-black"
              style={{ borderColor: 'rgba(255, 255, 0, 0.5)' }}
            >
              <Radio className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-yellow-400 font-mono mb-2">WALKIE-TALKIE MODE</h3>
              <p className="text-gray-400 text-xs font-mono mb-6">
                Push and hold to talk • Release to send
              </p>

              <motion.button
                className="w-32 h-32 rounded-full border-4 flex items-center justify-center"
                style={{ 
                  borderColor: isRecording ? '#ff0000' : '#ffff00',
                  backgroundColor: isRecording ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 255, 0, 0.1)'
                }}
                onMouseDown={() => setIsRecording(true)}
                onMouseUp={() => setIsRecording(false)}
                onMouseLeave={() => setIsRecording(false)}
                whileTap={{ scale: 0.95 }}
              >
                <Mic 
                  className={`w-12 h-12 ${isRecording ? 'text-red-400' : 'text-yellow-400'}`}
                />
              </motion.button>

              {isRecording && (
                <motion.p
                  className="text-red-400 font-mono text-xs mt-4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  RECORDING...
                </motion.p>
              )}

              <p className="text-gray-500 text-xs font-mono mt-4">
                Feature prototype • Voice recording coming soon
              </p>
            </Card>
          </div>
        </TabsContent>

        {/* Stickers Tab */}
        <TabsContent value="stickers" className="flex-1 p-4">
          <div className="h-full">
            <Card 
              className="p-6 text-center border-2 bg-black h-full flex flex-col items-center justify-center"
              style={{ borderColor: 'rgba(255, 255, 0, 0.5)' }}
            >
              <Sticker className="w-16 h-16 text-yellow-400 mb-4" />
              <h3 className="text-yellow-400 font-mono mb-2">STICKER CREATOR</h3>
              <p className="text-gray-400 text-xs font-mono mb-4">
                Draw custom stickers • Save to your collection
              </p>

              <div 
                className="w-full max-w-sm aspect-square border-2 mb-4 flex items-center justify-center"
                style={{ borderColor: 'rgba(255, 255, 0, 0.3)' }}
              >
                <div className="text-center">
                  <Image className="w-12 h-12 text-yellow-400 mx-auto mb-2 opacity-50" />
                  <p className="text-gray-500 text-xs font-mono">
                    Drawing canvas coming soon
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  disabled
                  className="bg-yellow-400 text-black font-mono"
                >
                  CREATE STICKER
                </Button>
                <Button 
                  disabled
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 font-mono"
                >
                  VIEW COLLECTION
                </Button>
              </div>

              <p className="text-gray-500 text-xs font-mono mt-4">
                Feature prototype • Full sticker editor coming soon
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
