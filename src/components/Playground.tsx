import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Character, CharacterExpression } from './Character';
import type { Attendee } from '@/types/attendee';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface PlaygroundProps {
  attendees: Attendee[];
  onSelectAttendee: (attendee: Attendee) => void;
  onWinnerSelected?: (attendee: Attendee) => void;
}

export interface PlaygroundRef {
  startLuckyDraw: () => void;
}

interface AnimatedCharacter extends Attendee {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  direction: 1 | -1;
  isDragging?: boolean;
}

export const Playground = forwardRef<PlaygroundRef, PlaygroundProps>(({ attendees, onSelectAttendee, onWinnerSelected }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [characters, setCharacters] = useState<AnimatedCharacter[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayWinner, setDisplayWinner] = useState<Attendee | null>(null);
  const [finalWinner, setFinalWinner] = useState<Attendee | null>(null);

  useImperativeHandle(ref, () => ({
    startLuckyDraw: () => {
      if (attendees.length === 0 || isDrawing) return;
      handleLuckyDraw();
    }
  }));

  const handleLuckyDraw = () => {
    setIsDrawing(true);
    setFinalWinner(null);
    let counter = 0;
    const maxCount = 20;
    const intervalTime = 100;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * attendees.length);
      setDisplayWinner(attendees[randomIndex]);
      counter++;

      if (counter > maxCount) {
        clearInterval(interval);
        const finalWinnerObj = attendees[Math.floor(Math.random() * attendees.length)];

        setDisplayWinner(finalWinnerObj);
        setFinalWinner(finalWinnerObj);
        setIsDrawing(false);

        if (onWinnerSelected) {
          onWinnerSelected(finalWinnerObj);
        }

        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, intervalTime);
  };

  useEffect(() => {
    setCharacters(prevChars => {
      const newChars = attendees.map(attendee => {
        const existing = prevChars.find(p => p.id === attendee.id);
        if (existing) {
          return { ...existing, ...attendee };
        }

        return {
          ...attendee,
          x: Math.random() * 30 + 5,
          y: Math.random() * 60 + 20,
          targetX: Math.random() * 30 + 5,
          targetY: Math.random() * 60 + 20,
          speed: 0.15 + Math.random() * 0.2,
          direction: (Math.random() > 0.5 ? 1 : -1) as 1 | -1,
        };
      });

      return newChars.filter(c => attendees.some(a => a.id === c.id));
    });
  }, [attendees]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCharacters(prev => {
        return prev.map(char => {
          if (char.isDragging) return char;

          let { x, y, speed, direction, targetX, targetY } = char;

          const dx = targetX - x;
          const dy = targetY - y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 1.5) {
            targetX = Math.random() * 40 + 5; // Stay on the sand (left side)
            targetY = Math.random() * 75 + 10;
          } else {
            x += (dx / distance) * speed;
            y += (dy / distance) * speed;
            direction = dx > 0 ? 1 : -1;

            if (x < 0) x = 0; if (x > 45) x = 45; // Boundaries for sand
            if (y < 0) y = 0; if (y > 90) y = 90;
          }

          return { ...char, x, y, direction, targetX, targetY };
        });
      });
    }, 40); // Slightly slower update (25fps) to save CPU for 100+ characters

    return () => clearInterval(interval);
  }, []);

  const handleCharacterClick = (id: string) => {
    const char = characters.find(c => c.id === id);
    if (char) {
      onSelectAttendee(char);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[1200px] overflow-hidden pixel-border bg-[#1a1a1a]">
      {/* Beach Background */}
      <div
        className="absolute inset-0 bg-cover bg-top"
        style={{
          backgroundImage: 'url(/map/beach.png)',
          imageRendering: 'pixelated'
        }}
      />

      {/* Overlay darkening for better visibility of characters */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* Characters */}
      <AnimatePresence>
        {characters.map((char) => {
          let expression: CharacterExpression | undefined;
          let isStruggling = false;

          if (char.isDragging) {
            isStruggling = true;
            expression = 'struggling';
          }

          return (
            <motion.div
              key={char.id}
              className="absolute cursor-pointer hover:z-20 w-max"
              style={{
                left: `${char.x}%`,
                top: `${char.y}%`,
                zIndex: char.isDragging ? 50 : 10,
              }}
              onClick={() => handleCharacterClick(char.id)}
            >
              <div className="flex flex-col items-center">
                <Character
                  facePhotoUrl={(char as any).photo_url}
                  size="sm"
                  animate={!char.isDragging}
                  expression={expression}
                  isStruggling={isStruggling}
                  hasCrown={char.is_winner}
                  spriteName={(char as any).sprite_name}
                  direction={char.direction === 1 ? 'right' : 'left'}
                />
                <div className="mt-2 text-center text-[6px] font-pixel bg-black/80 px-2 py-1 border border-white/20 text-white whitespace-nowrap">
                  {char.name}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Rolling Winner Overlay */}
      {isDrawing && displayWinner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center">
            <div className="relative p-8 bg-white/5 border-4 border-amber">
              <Character
                facePhotoUrl={(displayWinner as any).photo_url}
                size="lg"
                animate={false}
                spriteName={(displayWinner as any).sprite_name}
              />
            </div>
            <p className="text-amber text-center mt-6 font-pixel text-xl uppercase animate-bounce">{displayWinner.name}</p>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      <Dialog open={!!finalWinner} onOpenChange={(open) => !open && setFinalWinner(null)}>
        <DialogContent className="sm:max-w-md pixel-card bg-black p-0 border-4 border-amber">
          <DialogHeader className="p-6 border-b-4 border-amber/20">
            <DialogTitle className="text-center font-pixel text-xs text-amber flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4" />
              WINNER FOUND!
              <Sparkles className="w-4 h-4" />
            </DialogTitle>
          </DialogHeader>

          {finalWinner && (
            <div className="flex flex-col items-center justify-center p-10 space-y-8">
              <div className="relative p-6 bg-white/5 border-4 border-amber animate-pulse">
                <Character
                  facePhotoUrl={finalWinner.face_photo_url}
                  size="lg"
                  expression="happy"
                  animate
                  hasCrown
                  spriteName={(finalWinner as any).sprite_name}
                />
              </div>

              <div className="text-center space-y-4">
                <h3 className="text-3xl font-pixel text-amber tracking-tighter uppercase">{finalWinner.name}</h3>
                <p className="text-[10px] font-pixel text-white/50">CONGRATULATIONS!</p>
              </div>

              <Button onClick={() => setFinalWinner(null)} className="w-full pixel-button bg-amber text-black hover:bg-white">
                CLOSE
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {characters.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/30 font-pixel text-xs uppercase tracking-tighter">
            Waiting for players...
          </p>
        </div>
      )}
    </div>
  );
});

Playground.displayName = 'Playground';
