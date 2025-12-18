import React from 'react';
import { Attendee } from '@/types/attendee';
import { Character } from './Character';
import { Users } from 'lucide-react';

interface MembersListProps {
  attendees: Attendee[];
  onSelectAttendee: (attendee: Attendee) => void;
}

export const MembersList: React.FC<MembersListProps> = ({ attendees, onSelectAttendee }) => {
  return (
    <div className="h-full flex flex-col bg-black pixel-border overflow-hidden shadow-2xl">
      <div className="p-4 border-b-4 border-white/20 bg-white/5 flex items-center gap-2">
        <h2 className="font-pixel text-[10px] text-white">MEMBERS ({attendees.length})</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-1 gap-4">
          {attendees.map((attendee) => (
            <button
              key={attendee.id}
              onClick={() => onSelectAttendee(attendee)}
              className="group flex items-center gap-4 p-4 bg-white/5 border-4 border-white/10 hover:bg-white/10 hover:border-white transition-all text-left"
            >
              <div className="relative w-14 h-14 flex items-center justify-center bg-black border-2 border-white/20 overflow-hidden group-hover:scale-110 transition-transform">
                <Character
                  facePhotoUrl={attendee.face_photo_url}
                  size="sm"
                  animate={false}
                  spriteName={(attendee as any).sprite_name}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-pixel text-[10px] text-amber truncate">{attendee.name}</p>
                <p className="text-[8px] font-pixel text-white/50 mt-2">LV. {Math.floor(Math.random() * 50) + 1}</p>
              </div>
            </button>
          ))}

          {attendees.length === 0 && (
            <div className="text-center py-10">
              <p className="text-[10px] font-pixel text-white/30 uppercase tracking-tighter">Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
