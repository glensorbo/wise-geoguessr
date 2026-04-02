import Avatar from '@mui/material/Avatar';
import { memo } from 'react';

import { getPlayerProfile } from './playerGenders';

const DICEBEAR_BASE = 'https://avatar.sorbo.io/9.x';
const BG_COLORS = 'b6e3f4,c0aede,d1d4f9';
const SKIN_COLORS = 'edb98a,ffdbb4';

const MALE_TOP =
  'dreads01,dreads02,frizzle,shaggy,shaggyMullet,shortCurly,shortFlat,shortRound,shortWaved,sides,theCaesar,theCaesarAndSidePart';
const FEMALE_TOP =
  'bob,bun,curly,curvy,frida,fro,froBand,longButNotTooLong,miaWallace,straight01,straight02,straightAndStrand,bigHair';

const buildAvatarUrl = (name: string): string => {
  const base = `${DICEBEAR_BASE}/avataaars/svg?seed=${encodeURIComponent(name)}&radius=50&backgroundColor=${BG_COLORS}&skinColor=${SKIN_COLORS}`;

  const profile = getPlayerProfile(name);
  if (!profile) {
    return base;
  }

  if (profile.gender === 'female') {
    return `${base}&facialHairProbability=0&top=${FEMALE_TOP}`;
  }

  if (profile.bald) {
    const facialHairProbability = profile.beard ? 100 : 0;
    return `${base}&facialHairProbability=${facialHairProbability}&topProbability=0`;
  }

  const facialHairProbability = profile.beard ? 100 : 0;
  return `${base}&facialHairProbability=${facialHairProbability}&top=${MALE_TOP}`;
};

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
