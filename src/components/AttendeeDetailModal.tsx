import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Attendee } from '@/types/attendee';
import { Character } from './Character';
import { Crown } from 'lucide-react';

interface AttendeeDetailModalProps {
  attendee: Attendee | null;
  open: boolean;
  onClose: () => void;
}

export const AttendeeDetailModal: React.FC<AttendeeDetailModalProps> = ({
  attendee,
  open,
  onClose,
}) => {
  if (!attendee) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md pixel-card bg-black border-4 border-white p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-white/5 border-b-4 border-white/10">
          <DialogTitle className="text-center font-pixel text-xs flex items-center justify-center gap-2 text-white">
            CHARACTER INFO
            {attendee.is_winner && <Crown className="w-4 h-4 text-amber" />}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-8 p-10">
          <div className="relative p-6 bg-white/5 border-4 border-white/10">
            <Character
              facePhotoUrl={(attendee as any).photo_url}
              size="lg"
              animate
              hasCrown={attendee.is_winner}
              spriteName={(attendee as any).sprite_name}
            />
          </div>

          <div className="w-full space-y-6">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl font-pixel text-amber mb-2 tracking-tighter uppercase">{attendee.name}</h3>
              {attendee.is_winner && (
                <div className="bg-amber text-black px-4 py-2 font-pixel text-[10px] animate-pulse">
                  WINNER
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/5 p-4 border-2 border-white/10 flex flex-col items-center gap-2">
                <span className="text-[8px] font-pixel text-white/50">ENTRY DATE</span>
                <span className="text-[10px] font-pixel text-white">
                  {new Date(attendee.created_at).toLocaleDateString('th-TH', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
