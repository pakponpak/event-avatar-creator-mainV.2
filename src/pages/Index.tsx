import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CharacterCustomizer } from '@/components/CharacterCustomizer';
import { CameraCapture } from '@/components/CameraCapture';
import { Playground, PlaygroundRef } from '@/components/Playground';
import { MembersList } from '@/components/MembersList';
import { AttendeeDetailModal } from '@/components/AttendeeDetailModal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { supabase } from '@/integrations/supabase/client';
import { sheetApi } from '@/lib/googleSheets';
import { toast } from 'sonner';
import eventBackgroundDefault from '@/assets/event-background.jpg';
import type { Attendee, CharacterCustomization } from '@/types/attendee';
import { ArrowRight, Sparkles, Users, Lock, ChevronLeft, Gift } from 'lucide-react';

type Step = 'landing' | 'name' | 'customize' | 'camera' | 'playground' | 'admin-login' | 'admin-dashboard';

const Index = () => {
  const [step, setStep] = useState<Step>('landing');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const playgroundRef = useRef<PlaygroundRef>(null);
  const USE_SHEETS = !!import.meta.env.VITE_GOOGLE_SHEETS_URL;

  // Admin & Settings State
  const [eventName, setEventName] = useState("ลงทะเบียนเข้างาน");
  const [backgroundImage, setBackgroundImage] = useState(eventBackgroundDefault);
  const [adminPasscode, setAdminPasscode] = useState('');

  const [customization, setCustomization] = useState<CharacterCustomization>({
    name: '',
    faceType: 0,
    clothesType: 0,
    pantsType: 0,
    hairColor: '#2D1B0E',
    skinColor: '#FFDCB5',
    facePhotoUrl: null,
    spriteName: 'Abigail', // Default to a sprite
  });

  // Fetch attendees
  const fetchAttendees = useCallback(async () => {
    let data: any[] = [];

    if (USE_SHEETS) {
      data = await sheetApi.fetchAttendees();
    } else {
      const { data: dbData, error } = await supabase
        .from('attendees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attendees:', error);
        return;
      }
      data = dbData || [];
    }

    // Map face_photo_url to spriteName if it has the prefix
    const mappedAttendees = data.map(a => {
      let sprite_name = 'Abigail';
      let photo_url = null;
      let raw_photo_url = a.face_photo_url;

      if (raw_photo_url?.startsWith('sprite:')) {
        const parts = raw_photo_url.split('|');
        sprite_name = parts[0].substring(7);
        photo_url = parts[1]?.startsWith('photo:') ? parts[1].substring(6) : null;
      }

      return { ...a, sprite_name, photo_url };
    });

    setAttendees(mappedAttendees);
  }, [USE_SHEETS]);

  useEffect(() => {
    fetchAttendees();

    if (!USE_SHEETS) {
      // Subscribe to realtime updates only for Supabase
      const channel = supabase
        .channel('attendees-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'attendees' },
          () => fetchAttendees()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Polling for Google Sheets every 10 seconds since there is no realtime
      const interval = setInterval(fetchAttendees, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchAttendees, USE_SHEETS]);

  // Upload face photo to storage
  const uploadFacePhoto = async (imageData: string): Promise<string | null> => {
    try {
      const base64Data = imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const fileName = `face_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('face-photos')
        .upload(fileName, blob, { contentType: 'image/jpeg' });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('face-photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading face photo:', error);
      return null;
    }
  };

  // Handle registration
  const handleRegister = async (facePhotoData?: string) => {
    setIsLoading(true);

    try {
      let finalFacePhotoUrl = null;
      const selectedSprite = customization.spriteName || 'Abigail';

      if (facePhotoData) {
        const photoUrl = await uploadFacePhoto(facePhotoData);
        finalFacePhotoUrl = `sprite:${selectedSprite}|photo:${photoUrl}`;
      } else {
        finalFacePhotoUrl = `sprite:${selectedSprite}`;
      }

      const payload = {
        name: customization.name,
        face_photo_url: finalFacePhotoUrl,
        position_x: Math.random() * 80 + 10,
        position_y: Math.random() * 60 + 20,
      };

      if (USE_SHEETS) {
        await sheetApi.insertAttendee(payload);
      } else {
        const { error } = await supabase.from('attendees').insert({
          ...payload,
          face_type: 0,
          clothes_type: 0,
          pants_type: 0,
          hair_color: '#2D1B0E',
          skin_color: '#FFDCB5',
        } as any);

        if (error) {
          console.error('Registration error:', error);
          toast.error('เกิดข้อผิดพลาดในการลงทะเบียน');
          return;
        }
      }

      toast.success('ลงทะเบียนสำเร็จ!');
      setStep('playground');
      fetchAttendees();
    } catch (error) {
      console.error('Error:', error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Actions
  const handleAdminLogin = () => {
    if (adminPasscode === '0000') {
      setStep('admin-dashboard');
      setAdminPasscode('');
      toast.success('เข้าสู่ระบบผู้ดูแลสำเร็จ');
    } else {
      toast.error('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleDeleteAttendee = async (id: string) => {
    try {
      if (USE_SHEETS) {
        await sheetApi.deleteAttendee(id);
        toast.success('ลบผู้เข้าร่วมแล้ว');
        fetchAttendees();
      } else {
        const { data, error, status } = await supabase.from('attendees').delete().eq('id', id).select();
        if (error) {
          toast.error(`ลบไม่สำเร็จ: ${error.message}`);
          return;
        }
        if (data && data.length > 0) {
          toast.success('ลบผู้เข้าร่วมแล้ว');
          fetchAttendees();
        } else {
          toast.error('ลบไม่สำเร็จ: ฐานข้อมูลไม่อนุญาต (RLS Policy)');
        }
      }
    } catch (error: any) {
      console.error('DEBUG: Exception during deletion:', error);
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const handleUpdateAttendee = async (id: string, name: string) => {
    try {
      if (USE_SHEETS) {
        await sheetApi.updateAttendee(id, { name });
        toast.success('อัปเดตข้อมูลแล้ว');
        fetchAttendees();
      } else {
        const { data, error } = await supabase.from('attendees').update({ name }).eq('id', id).select();
        if (error) {
          toast.error(`อัปเดตไม่สำเร็จ: ${error.message}`);
          return;
        }
        if (data && data.length > 0) {
          toast.success('อัปเดตข้อมูลแล้ว');
          fetchAttendees();
        } else {
          toast.error('อัปเดตไม่สำเร็จ: ฐานข้อมูลไม่อนุญาต (RLS)');
        }
      }
    } catch (error: any) {
      console.error('DEBUG: Exception during update:', error);
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  const handleAddAttendee = async (name: string) => {
    try {
      const payload = {
        name,
        face_photo_url: `sprite:Abigail`,
        position_x: Math.random() * 80 + 10,
        position_y: Math.random() * 60 + 20,
      };

      if (USE_SHEETS) {
        await sheetApi.insertAttendee(payload);
      } else {
        const { error } = await supabase.from('attendees').insert({
          ...payload,
          face_type: 0,
          clothes_type: 0,
          pants_type: 0,
          hair_color: '#2D1B0E',
          skin_color: '#FFDCB5',
        } as any);
        if (error) throw error;
      }

      toast.success('เพิ่มผู้เข้าร่วมแล้ว');
      fetchAttendees();
    } catch (error) {
      console.error('Error adding attendee:', error);
      toast.error('เพิ่มผู้เข้าร่วมไม่สำเร็จ');
    }
  };

  const handleWinnerSelected = async (winner: Attendee) => {
    try {
      if (USE_SHEETS) {
        await sheetApi.updateAttendee(winner.id, { is_winner: true });
      } else {
        const { error } = await supabase
          .from('attendees')
          .update({ is_winner: true })
          .eq('id', winner.id);
        if (error) throw error;
      }
      fetchAttendees();
    } catch (err) {
      console.error("Error setting winner:", err);
    }
  };

  const handleResetWinners = async () => {
    try {
      if (USE_SHEETS) {
        await sheetApi.resetWinners();
      } else {
        const { error } = await supabase
          .from('attendees')
          .update({ is_winner: false })
          .neq('id', 'placeholder');
        if (error) throw error;
      }
      toast.success('รีเซ็ตรายชื่อผู้โชคดีแล้ว');
      fetchAttendees();
    } catch (error) {
      console.error('Error resetting winners:', error);
      toast.error('รีเซ็ตไม่สำเร็จ');
    }
  };

  // Render Functions
  if (step === 'admin-login') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm space-y-6 animate-fade-in p-8 border rounded-lg shadow-lg bg-card text-card-foreground">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Admin Access</h2>
            <p className="text-muted-foreground">กรอกรหัสผ่านเพื่อเข้าสู่ระบบ</p>
          </div>

          <Input
            type="password"
            placeholder="รหัสผ่าน"
            value={adminPasscode}
            onChange={(e) => setAdminPasscode(e.target.value)}
            className="text-center text-lg tracking-widest"
            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
          />

          <div className="space-y-2">
            <Button className="w-full" onClick={handleAdminLogin}>เข้าสู่ระบบ</Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep('landing')}>ยกเลิก</Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'admin-dashboard') {
    return (
      <AdminDashboard
        attendees={attendees}
        eventName={eventName}
        setEventName={setEventName}
        backgroundImage={backgroundImage}
        setBackgroundImage={setBackgroundImage}
        onDeleteAttendee={handleDeleteAttendee}
        onUpdateAttendee={handleUpdateAttendee}
        onAddAttendee={handleAddAttendee}
        onResetWinners={handleResetWinners}
        onBack={() => setStep('landing')}
      />
    );
  }

  if (step === 'landing') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${backgroundImage})`,
          }}
        />
        <div className="absolute top-4 right-4 z-50">
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10" onClick={() => setStep('admin-login')}>
            <Lock className="w-4 h-4 mr-1" /> Admin
          </Button>
        </div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-coral/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-amber" />
              <span className="text-amber font-display text-lg">Welcome to the Event</span>
              <Sparkles className="w-8 h-8 text-amber" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-gradient leading-tight text-white drop-shadow-lg">{eventName}</h1>
            <p className="text-xl text-white/90 max-w-md mx-auto drop-shadow-md">สร้างตัวละครของคุณและเข้าร่วมงานกับพวกเราได้เลย!</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Button onClick={() => setStep('name')} className="pixel-button bg-coral scale-125 hover:scale-150">
                REGISTER <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button onClick={() => setStep('playground')} className="pixel-button bg-secondary/50 border-white hover:bg-secondary">
                PLAYGROUND
              </Button>
            </div>
            {attendees.length > 0 && <p className="text-white/70 text-sm pt-4">มีผู้ลงทะเบียนแล้ว {attendees.length} คน</p>}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'name') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-gradient">ชื่อของคุณ</h2>
            <p className="text-muted-foreground mt-2">กรอกชื่อที่จะแสดงในงาน</p>
          </div>
          <Input placeholder="ใส่ชื่อของคุณ" value={customization.name} onChange={(e) => setCustomization({ ...customization, name: e.target.value })} className="h-14 text-lg text-center font-display" />
          <div className="flex gap-4">
            <Button onClick={() => setStep('landing')} className="pixel-button bg-gray-600">BACK</Button>
            <Button onClick={() => setStep('customize')} disabled={!customization.name.trim()} className="pixel-button bg-primary flex-1">NEXT</Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'customize') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-display font-bold text-gradient">สร้างตัวละคร</h2>
            <p className="text-muted-foreground mt-2">เลือกตัวละครที่เป็นคุณ</p>
          </div>
          <CharacterCustomizer customization={customization} onChange={setCustomization} />
          <div className="flex gap-4">
            <Button onClick={() => setStep('name')} className="pixel-button bg-gray-600">BACK</Button>
            <Button onClick={() => setStep('camera')} className="pixel-button bg-primary flex-1">NEXT</Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'camera') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
        <div className="w-full max-w-md space-y-6 animate-fade-in text-white">
          <CameraCapture onCapture={(imageData) => handleRegister(imageData)} onSkip={() => handleRegister()} />
          <Button onClick={() => setStep('customize')} className="w-full pixel-button bg-gray-600">BACK</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)]">
        <div className="flex flex-col lg:flex-row gap-4 h-full">
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-display font-bold text-gradient">{eventName}</h1>
              <div className="flex gap-2">
                <Button onClick={() => setStep('landing')} className="pixel-button bg-gray-600">
                  MENU
                </Button>

                <Button
                  onClick={() => playgroundRef.current?.startLuckyDraw()}
                  disabled={attendees.length === 0}
                  className="pixel-button bg-amber"
                >
                  DRAW WINNER
                </Button>

                <Button className="pixel-button bg-primary" onClick={() => {
                  setStep('name');
                  setCustomization({ name: '', faceType: 0, clothesType: 0, pantsType: 0, hairColor: '#2D1B0E', skinColor: '#FFDCB5', facePhotoUrl: null, spriteName: 'Abigail' });
                }}>
                  ADD AVATAR
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <Playground
                ref={playgroundRef}
                attendees={attendees}
                onSelectAttendee={setSelectedAttendee}
                onWinnerSelected={handleWinnerSelected}
              />
            </div>
          </div>
          <div className="w-full lg:w-80 h-64 lg:h-full">
            <MembersList attendees={attendees} onSelectAttendee={setSelectedAttendee} />
          </div>
        </div>
      </div>
      <AttendeeDetailModal attendee={selectedAttendee} open={!!selectedAttendee} onClose={() => setSelectedAttendee(null)} />
    </div>
  );
};

export default Index;
