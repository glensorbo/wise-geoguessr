import Avatar from '@mui/material/Avatar';
import { memo } from 'react';

import { getPlayerProfile } from './playerGenders';

const DICEBEAR_BASE = 'https://avatar.sorbo.io/9.x';
const BG_COLORS = 'b6e3f4,c0aede,d1d4f9';
const MALE_CLOTHES = 'openJacket,shirt,tShirt,turtleNeck';
const MALE_HAIR = 'sideComed,spiky,undercut';
const FEMALE_CLOTHES = 'dress,openJacket,shirt,tShirt,turtleNeck';

const buildAvatarUrl = (name: string): string => {
  const base = `${DICEBEAR_BASE}/toon-head/svg?seed=${encodeURIComponent(name)}&radius=50&backgroundColor=${BG_COLORS}`;

  const profile = getPlayerProfile(name);
  if (!profile) {
    return base;
  }

  if (profile.gender === 'female') {
    return `${base}&beardProbability=0&rearHairProbability=75&clothes=${FEMALE_CLOTHES}`;
  }

  const beardProbability = profile.beard ? 100 : 0;
  const hairParams = profile.bald ? 'hairProbability=0' : `hair=${MALE_HAIR}`;
  return `${base}&beardProbability=${beardProbability}&rearHairProbability=0&${hairParams}&clothes=${MALE_CLOTHES}`;
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
