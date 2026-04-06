const PLAYER_COLORS: Record<string, string> = {
  Glen: '#ec4899',
  Thorjan: '#ef4444',
  Thomas: '#65a30d',
  'Tor Arve': '#f97316',
  Sigurd: '#7c3aed',
  Malin: '#d97706',
  Lotte: '#0891b2',
  Margaux: '#2563eb',
  Eirik: '#0f766e',
};

const FALLBACK_COLORS = [
  '#4f46e5',
  '#2563eb',
  '#0f766e',
  '#16a34a',
  '#ca8a04',
  '#ea580c',
  '#db2777',
];

export const getPlayerColor = (name: string, index = 0): string =>
  PLAYER_COLORS[name] ??
  FALLBACK_COLORS[index % FALLBACK_COLORS.length] ??
  '#666666';

export const getChartSeries = (players: string[]) =>
  players.map((name, index) => ({
    name,
    color: getPlayerColor(name, index),
  }));

const numberFormatter = new Intl.NumberFormat('en-US');

export const formatAxisNumber = (value: unknown): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return typeof value === 'string' ? value : '';
  }
  return numberFormatter.format(value);
};
