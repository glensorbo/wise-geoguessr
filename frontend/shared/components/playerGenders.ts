type PlayerGender = 'male' | 'female';

type PlayerProfile = {
  gender: PlayerGender;
  beard?: true;
};

const PLAYER_PROFILES: Record<string, PlayerProfile> = {
  Glen: { gender: 'male', beard: true },
  Lotte: { gender: 'female' },
  Malin: { gender: 'female' },
  Sigurd: { gender: 'male' },
  Thomas: { gender: 'male', beard: true },
  Thorjan: { gender: 'male' },
  'Tor Arve': { gender: 'male' },
};

export const getPlayerProfile = (name: string): PlayerProfile | undefined =>
  PLAYER_PROFILES[name];
