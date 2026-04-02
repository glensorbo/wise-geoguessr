import Avatar from '@mui/material/Avatar';
import { memo } from 'react';

const DICEBEAR_BASE = 'https://avatar.sorbo.io/9.x';
const BG_COLORS = 'b6e3f4,c0aede,d1d4f9';

const buildAvatarUrl = (name: string): string =>
  `${DICEBEAR_BASE}/toon-head/svg?seed=${encodeURIComponent(name)}&radius=50&backgroundColor=${BG_COLORS}`;

type PlayerAvatarProps = {
  name: string;
  size?: number;
};

export const PlayerAvatar = memo(({ name, size = 32 }: PlayerAvatarProps) => (
  <Avatar
    src={buildAvatarUrl(name)}
    alt={name}
    sx={{ width: size, height: size }}
  >
    {name.charAt(0).toUpperCase()}
  </Avatar>
));

PlayerAvatar.displayName = 'PlayerAvatar';
