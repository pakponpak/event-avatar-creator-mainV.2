
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Pencil, Plus, Image as ImageIcon, Type, Upload, Loader2, Users, Crown, RotateCcw } from 'lucide-react';
import { Attendee } from '@/types/attendee';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminDashboardProps {
    attendees: Attendee[];
    eventName: string;
    setEventName: (name: string) => void;
    backgroundImage: string;
    setBackgroundImage: (url: string) => void;
    onDeleteAttendee: (id: string) => void;
    onUpdateAttendee: (id: string, name: string) => void;
    onAddAttendee: (name: string) => void;
    onResetWinners: () => void;
    onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
    attendees,
    eventName,
    setEventName,
    backgroundImage,
    setBackgroundImage,
    onDeleteAttendee,
    onUpdateAttendee,
    onAddAttendee,
    onResetWinners,
    onBack,
}) => {
    const [newAttendeeName, setNewAttendeeName] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [bgUrlInput, setBgUrlInput] = useState(backgroundImage);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        if (!newAttendeeName.trim()) return;
        onAddAttendee(newAttendeeName);
        setNewAttendeeName('');
        setIsAddDialogOpen(false);
    };

    const startEdit = (attendee: Attendee) => {
        setEditingId(attendee.id);
        setEditName(attendee.name);
    };

    const saveEdit = () => {
        if (editingId && editName.trim()) {
            onUpdateAttendee(editingId, editName);
            setEditingId(null);
            setEditName('');
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('โปรดเลือกไฟล์รูปภาพ');
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `bg_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('face-photos')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('face-photos')
                .getPublicUrl(filePath);

            setBackgroundImage(publicUrl);
            setBgUrlInput(publicUrl);
            toast.success('อัปโหลดรูปพื้นหลังสำเร็จ');
        } catch (error) {
            console.error('Error uploading background:', error);
            toast.error('อัปโหลดรูปพื้นหลังไม่สำเร็จ');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-pixel text-gradient">ADMIN DASHBOARD</h1>
                        <p className="text-[8px] font-pixel text-white/40 mt-1 uppercase">Permissions Check: Select & Register Active</p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            variant="destructive"
                            onClick={onResetWinners}
                            className="pixel-button bg-red-600 hover:bg-red-700"
                        >
                            RESET ผู้โชคดี
                        </Button>
                        <Button variant="outline" onClick={onBack} className="pixel-button bg-gray-600">กลับ</Button>
                    </div>
                </div>

                {/* Global Settings */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-lg space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Type className="w-5 h-5" /> ชื่อกิจกรรม
                        </h2>
                        <div className="flex gap-2">
                            <Input
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                                placeholder="ชื่อกิจกรรม"
                            />
                        </div>
                    </div>

                    <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-lg space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" /> รูปพื้นหลัง
                        </h2>
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={bgUrlInput}
                                    onChange={(e) => setBgUrlInput(e.target.value)}
                                    placeholder="ใส่ลิงก์รูปภาพ"
                                />
                                <Button onClick={() => setBackgroundImage(bgUrlInput)}>ตกลง</Button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                                <span>หรือ:</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์จากเครื่อง'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendees Management */}
                <div className="border rounded-lg bg-card text-card-foreground shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5" /> จัดการผู้เข้าร่วม
                        </h2>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="pixel-button bg-green-600 hover:bg-green-700">
                                    + เพิ่มคนใหม่
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="pixel-card">
                                <DialogHeader>
                                    <DialogTitle className="font-pixel">เพิ่มผู้เข้าร่วมใหม่</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-pixel text-[10px]">ชื่อ</Label>
                                        <Input
                                            id="name"
                                            value={newAttendeeName}
                                            onChange={(e) => setNewAttendeeName(e.target.value)}
                                            placeholder="กรอกชื่อ"
                                            className="pixel-input"
                                        />
                                    </div>
                                    <Button onClick={handleAdd} className="w-full pixel-button">ตกลง</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>รูป</TableHead>
                                    <TableHead>ชื่อ</TableHead>
                                    <TableHead className="text-right">จัดการ</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {attendees.map((attendee) => (
                                    <TableRow key={attendee.id}>
                                        <TableCell>
                                            <div className="relative w-10 h-10">
                                                {(attendee as any).photo_url ? (
                                                    <img
                                                        src={(attendee as any).photo_url}
                                                        alt={attendee.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center p-1"
                                                    >
                                                        <div
                                                            className="w-6 h-8"
                                                            style={{
                                                                backgroundImage: `url(/characters/${(attendee as any).sprite_name || 'Abigail'}.png)`,
                                                                backgroundSize: '400% 1400%',
                                                                backgroundPosition: '0% 0%',
                                                                imageRendering: 'pixelated'
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                {attendee.is_winner && (
                                                    <div className="absolute -top-2 -right-2 bg-amber rounded-full p-0.5 shadow-lg">
                                                        <Crown className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {editingId === attendee.id ? (
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        className="h-8"
                                                    />
                                                    <Button size="sm" onClick={saveEdit}>บันทึก</Button>
                                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>ยกเลิก</Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-black">
                                                    <span className="font-medium">{attendee.name}</span>
                                                    {attendee.is_winner && <span className="text-[10px] bg-amber/20 text-amber px-1.5 py-0.5 rounded-full font-bold">WINNER</span>}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => startEdit(attendee)}
                                                    className="w-10 h-10 border-2 border-blue-500 hover:bg-blue-500/20"
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        if (window.confirm(`ลบ "${attendee.name}"?`)) {
                                                            onDeleteAttendee(attendee.id);
                                                        }
                                                    }}
                                                    className="w-10 h-10 border-2 border-red-500 hover:bg-red-500/20"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {attendees.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                                            ยังไม่มีผู้ลงทะเบียน
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};
