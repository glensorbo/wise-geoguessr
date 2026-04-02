import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export type RecapSlide = {
  key: string;
  emoji: string;
  label: string;
  value: string;
  subtext: string;
  gradient: string;
  confetti?: boolean;
};

type RecapCardProps = {
  slide: RecapSlide;
  direction: 1 | -1;
};

const variants = {
  enter: (direction: number) => ({
    x: direction * 300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction * -300,
    opacity: 0,
  }),
};

export const RecapCard = ({ slide, direction }: RecapCardProps) => {
  useEffect(() => {
    if (!slide.confetti) {
      return;
    }
    const timer = setTimeout(() => {
      void confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }, 1000);
    return () => clearTimeout(timer);
  }, [slide.confetti, slide.key]);

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={slide.key}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{ width: '100%' }}
      >
        <Box
          sx={{
            background: slide.gradient,
            borderRadius: 3,
            minHeight: 420,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: { xs: 4, sm: 6 },
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{ fontSize: '4rem', lineHeight: 1.2 }}
              aria-hidden="true"
            >
              {slide.emoji}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.85,
                mt: 1,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              {slide.label}
            </Typography>
          </Box>

          <Typography
            variant="h3"
            component="p"
            sx={{
              fontWeight: 800,
              textAlign: 'center',
              wordBreak: 'break-word',
            }}
          >
            {slide.value}
          </Typography>

          <Typography
            variant="body1"
            sx={{ opacity: 0.8, textAlign: 'center', fontSize: '1rem' }}
          >
            {slide.subtext}
          </Typography>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};
