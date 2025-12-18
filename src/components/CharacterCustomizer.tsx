import React from 'react';
import { Character } from './Character';
import { Sparkles } from 'lucide-react';
import type { CharacterCustomization } from '@/types/attendee';

interface CharacterCustomizerProps {
  customization: CharacterCustomization;
  onChange: (customization: CharacterCustomization) => void;
}

const SPRITE_OPTIONS = [
  'Abigail', 'Alex', 'Haley', 'Harvey', 'Leah', 'Sebastian', 'Shane', 'Penny', 'Maru', 'Sam'
];

export const CharacterCustomizer: React.FC<CharacterCustomizerProps> = ({
  customization,
  onChange,
}) => {
  const updateField = <K extends keyof CharacterCustomization>(
    field: K,
    value: CharacterCustomization[K]
  ) => {
    onChange({ ...customization, [field]: value });
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-black/80 pixel-border w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center gap-3 text-amber font-pixel text-[10px] text-center">
        <Sparkles className="w-4 h-4" />
        <span>SELECT YOUR HERO</span>
      </div>

      {/* Character Preview */}
      <div className="relative p-4 bg-white/5 border-2 border-dashed border-white/20">
        <Character
          facePhotoUrl={null}
          spriteName={customization.spriteName || SPRITE_OPTIONS[0]}
          size="lg"
          animate
        />
      </div>

      {/* Sprite Selection Grid */}
      <div className="w-full space-y-4">
        <span className="text-[10px] text-white/60 font-pixel block text-center uppercase tracking-tighter">Classics</span>
        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
          {SPRITE_OPTIONS.map((name) => (
            <button
              key={name}
              className={`flex flex-col items-center p-4 border-4 transition-all ${customization.spriteName === name
                ? 'border-amber bg-amber/10 scale-105 z-10'
                : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                }`}
              onClick={() => updateField('spriteName', name)}
            >
              <div
                className="w-12 h-16 overflow-hidden mb-2"
                style={{
                  backgroundImage: `url(/characters/${name}.png)`,
                  backgroundSize: '400% 1400%',
                  backgroundPosition: '0% 0%',
                  imageRendering: 'pixelated'
                }}
              />
              <span className={`text-[8px] font-pixel truncate w-full text-center ${customization.spriteName === name ? 'text-amber' : 'text-white/70'}`}>
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
