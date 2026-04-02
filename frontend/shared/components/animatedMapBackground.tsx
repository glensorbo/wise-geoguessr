import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Simplified continent outlines in equirectangular projection (1000×500 viewBox).
// Based on simplified Natural Earth data (public domain).
const CONTINENT_PATHS = [
  // North America
  'M 80,115 L 50,90 L 45,65 L 70,55 L 110,68 L 125,60 L 155,70 L 170,55 L 210,60 L 250,68 L 290,88 L 308,120 L 295,155 L 310,170 L 290,195 L 265,215 L 265,235 L 255,248 L 230,262 L 205,255 L 195,262 L 182,252 L 175,240 L 148,220 L 120,208 L 100,188 L 88,162 Z',
  // Greenland
  'M 298,108 L 295,80 L 300,58 L 318,42 L 348,35 L 380,38 L 402,50 L 408,68 L 398,85 L 375,98 L 348,108 Z',
  // South America
  'M 195,270 L 225,268 L 265,275 L 290,295 L 298,325 L 292,355 L 285,385 L 268,415 L 248,445 L 228,458 L 210,448 L 198,428 L 192,400 L 192,370 L 188,340 L 192,310 Z',
  // Europe
  'M 445,150 L 448,130 L 442,108 L 450,88 L 462,75 L 482,68 L 508,72 L 522,88 L 530,100 L 518,112 L 532,122 L 535,138 L 525,148 L 510,155 L 488,158 L 468,152 Z',
  // Africa
  'M 448,158 L 478,152 L 508,158 L 530,175 L 548,200 L 558,232 L 562,265 L 558,298 L 545,328 L 532,355 L 515,378 L 500,395 L 482,398 L 462,385 L 448,365 L 438,338 L 432,308 L 428,278 L 428,248 L 432,218 L 438,188 Z',
  // Asia (main body, excluding Indian subcontinent)
  'M 528,85 L 558,68 L 600,58 L 650,52 L 700,55 L 752,62 L 800,72 L 842,82 L 882,92 L 918,110 L 942,132 L 948,158 L 940,178 L 918,195 L 890,205 L 858,212 L 822,215 L 785,210 L 758,205 L 728,205 L 700,212 L 678,222 L 658,228 L 638,220 L 618,210 L 598,200 L 575,192 L 555,178 L 542,162 L 535,142 L 528,118 Z',
  // Indian subcontinent
  'M 612,205 L 640,200 L 668,208 L 678,228 L 672,248 L 658,268 L 640,272 L 622,262 L 612,242 Z',
  // Japan
  'M 898,120 L 912,108 L 924,112 L 928,125 L 920,138 L 908,142 L 898,135 Z',
  // Australia
  'M 778,368 L 800,345 L 830,338 L 865,342 L 898,355 L 920,372 L 928,392 L 918,408 L 895,420 L 862,425 L 828,420 L 800,410 L 780,395 Z',
];

// City coordinates in 1000×500 equirectangular space.
// Formula: x = (lon + 180) × (1000/360), y = (90 − lat) × (500/180)
const PINS = [
  { x: 173, y: 156 }, // Los Angeles
  { x: 295, y: 136 }, // New York
  { x: 370, y: 316 }, // São Paulo
  { x: 500, y: 108 }, // London
  { x: 508, y: 233 }, // Lagos
  { x: 586, y: 167 }, // Cairo
  { x: 603, y: 94 }, // Moscow
  { x: 653, y: 181 }, // Dubai
  { x: 714, y: 169 }, // Delhi
  { x: 822, y: 139 }, // Beijing
  { x: 889, y: 150 }, // Tokyo
  { x: 919, y: 345 }, // Sydney
];

const PIN_DURATION = 4;
const PIN_SPACING = 2.8;
const PIN_CYCLE = PINS.length * PIN_SPACING;

interface MapPinProps {
  x: number;
  y: number;
  index: number;
  pinFill: string;
}

const MapPin = ({ x, y, index, pinFill }: MapPinProps) => {
  const delay = index * PIN_SPACING;
  const repeatDelay = PIN_CYCLE - PIN_DURATION;

  return (
    <>
      {/* Ripple ring that expands outward after the pin lands */}
      <motion.circle
        cx={x}
        cy={y - 12}
        r={6}
        fill="none"
        stroke={pinFill}
        strokeWidth={1.5}
        initial={{ opacity: 0 }}
        animate={{ r: [6, 20], opacity: [0.8, 0] }}
        transition={{
          duration: 0.9,
          delay: delay + 0.65,
          repeat: Infinity,
          repeatDelay: PIN_CYCLE - 0.9,
          ease: 'easeOut',
        }}
      />
      {/* Pin body: drops in, holds, then fades out */}
      <motion.g
        initial={{ opacity: 0, y: -22 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [-22, 0, 0, 0],
        }}
        transition={{
          duration: PIN_DURATION,
          times: [0, 0.18, 0.82, 1],
          delay,
          repeat: Infinity,
          repeatDelay,
          ease: ['easeOut', 'linear', 'easeIn'],
        }}
      >
        {/* Teardrop pin shape: tip at (x,y), head centred at (x, y-12) */}
        <path
          d={`M ${x},${y} C ${x - 3},${y - 4} ${x - 6},${y - 8} ${x - 6},${y - 12} A 6,6 0 1,1 ${x + 6},${y - 12} C ${x + 6},${y - 8} ${x + 3},${y - 4} ${x},${y} Z`}
          fill={pinFill}
        />
        <circle cx={x} cy={y - 12} r={2.2} fill="white" opacity={0.5} />
      </motion.g>
    </>
  );
};

export const AnimatedMapBackground = () => {
  const theme = useTheme();

  const isDark = theme.palette.mode === 'dark';
  const mapFill = isDark ? '#8b5cf6' : '#6d28d9';
  const mapOpacity = isDark ? 0.08 : 0.05;
  const pinFill = isDark ? '#fbbf24' : '#d97706';
  const pinOpacity = isDark ? 0.6 : 0.4;

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* 200%-wide container scrolls left continuously, creating a seamless world loop */}
      <motion.div
        style={{
          position: 'absolute',
          width: '200%',
          height: '100%',
          top: 0,
          left: 0,
        }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
      >
        <svg
          viewBox="0 0 2000 500"
          preserveAspectRatio="xMidYMid slice"
          style={{ width: '100%', height: '100%', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Continent fills — two side-by-side copies for seamless wrap */}
          <g fill={mapFill} opacity={mapOpacity}>
            {CONTINENT_PATHS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g fill={mapFill} opacity={mapOpacity} transform="translate(1000, 0)">
            {CONTINENT_PATHS.map((d, i) => (
              <path key={`b${i}`} d={d} />
            ))}
          </g>

          {/* Pins — duplicated across both map copies */}
          <g opacity={pinOpacity}>
            {PINS.map((pin, i) => (
              <MapPin key={i} x={pin.x} y={pin.y} index={i} pinFill={pinFill} />
            ))}
          </g>
          <g opacity={pinOpacity} transform="translate(1000, 0)">
            {PINS.map((pin, i) => (
              <MapPin
                key={`b${i}`}
                x={pin.x}
                y={pin.y}
                index={i}
                pinFill={pinFill}
              />
            ))}
          </g>
        </svg>
      </motion.div>
    </Box>
  );
};
