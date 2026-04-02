type PlayerGender = 'male' | 'female';

type PlayerProfile = {
  gender: PlayerGender;
  beard?: true;
  bald?: true;
};

const PLAYER_PROFILES: Record<string, PlayerProfile> = {
  Glen: { gender: 'male', beard: true },
  Lotte: { gender: 'female' },
  Malin: { gender: 'female' },
  Sigurd: { gender: 'male' },
  Thomas: { gender: 'male', beard: true },
  Thorjan: { gender: 'male', bald: true },
  'Tor Arve': { gender: 'male', bald: true },
};

export const getPlayerProfile = (name: string): PlayerProfile | undefined =>
  PLAYER_PROFILES[name];
