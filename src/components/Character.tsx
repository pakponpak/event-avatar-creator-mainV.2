import React, { useState, useEffect } from 'react';

export type CharacterExpression = 'happy' | 'crying' | 'shocked' | 'struggling';

interface CharacterProps {
  facePhotoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  onClick?: () => void;
  expression?: CharacterExpression;
  isStruggling?: boolean;
  hasCrown?: boolean;
  spriteName?: string | null;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const sizeMap = {
  sm: 64,
  md: 100,
  lg: 140,
};

export const Character: React.FC<CharacterProps> = ({
  size = 'md',
  animate = false,
  onClick,
  expression,
  isStruggling,
  hasCrown,
  spriteName,
  direction = 'down',
  facePhotoUrl,
}) => {
  const pixelSize = sizeMap[size];
  const [frame, setFrame] = useState(0);

  // Animation logic for sprites
  useEffect(() => {
    if (!animate || isStruggling) return;

    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % 4);
    }, 100);

    return () => clearInterval(interval);
  }, [animate, isStruggling]);

  // Use Abigail as default if somehow missing
  const activeSprite = spriteName || 'Abigail';

  // Determine row based on direction
  let row = 0; // down
  if (direction === 'right') row = 1;
  if (direction === 'up') row = 2;
  if (direction === 'left') row = 3;

  return (
    <div
      className={`relative cursor-pointer select-none no-drag-img flex flex-col items-center
        ${isStruggling ? 'animate-bounce-subtle' : ''}
      `}
      style={{ width: pixelSize, height: pixelSize * 2 }}
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: pixelSize,
          height: pixelSize * 2,
          backgroundImage: `url(/characters/${activeSprite}.png)`,
          backgroundSize: '400% 1400%',
          backgroundPosition: `${frame * 33.33}% ${row * 7.69}%`,
          imageRendering: 'pixelated'
        }}
      >
        {/* Face Photo Overlay */}
        {facePhotoUrl && !expression && !isStruggling && (
          <div
            className="absolute overflow-hidden rounded-full border-2 border-white/20 shadow-sm"
            style={{
              width: '55%',
              height: '30%',
              top: '5%',
              left: '22.5%',
              backgroundImage: `url(${facePhotoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
      </div>

      {hasCrown && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50">
          <svg width="40" height="30" viewBox="0 0 50 30">
            <path
              d="M0,15 L10,0 L25,12 L40,0 L50,15 L50,22 L0,22 Z"
              fill="#FFD700"
              stroke="#B8860B"
              strokeWidth="2"
            />
            <circle cx="10" cy="0" r="3" fill="#FF4444" />
            <circle cx="25" cy="12" r="3" fill="#4444FF" />
            <circle cx="40" cy="0" r="3" fill="#FF4444" />
          </svg>
        </div>
      )}
    </div>
  );
};
