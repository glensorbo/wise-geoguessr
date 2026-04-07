import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { YearSelector } from '@frontend/features/geoguessr/components/yearSelector';
import { getCurrentYear } from '@frontend/features/geoguessr/logic';
import { RecapCard } from '@frontend/features/recap/components/recapCard';
import { useRecap } from '@frontend/features/recap/hooks/useRecap';
import { useGetYearsQuery } from '@frontend/redux/api/gameResultApi';

import type { RecapSlide } from '@frontend/features/recap/components/recapCard';
import type { RecapStats } from '@frontend/features/recap/logic/recapStats';

const buildSlides = (year: number, stats: RecapStats): RecapSlide[] => {
  const slides: RecapSlide[] = [
    {
      key: 'intro',
      emoji: '🌍',
      label: `${year} Season Recap`,
      value: `${stats.totalRounds} rounds played`,
      subtext: 'Tap → to begin',
      gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%)',
    },
  ];

  if (stats.champion) {
    slides.push({
      key: 'champion',
      emoji: '👑',
      label: 'Season Champion',
      value: stats.champion.name,
      subtext: `${stats.champion.wins} win${stats.champion.wins !== 1 ? 's' : ''} this season`,
      gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
      confetti: true,
    });
  }

  if (stats.sharpshooter) {
    slides.push({
      key: 'sharpshooter',
      emoji: '🎯',
      label: 'Sharpshooter',
      value: stats.sharpshooter.name,
      subtext: `${stats.sharpshooter.score.toLocaleString()} pts on ${stats.sharpshooter.date}`,
      gradient: 'linear-gradient(135deg, #312e81 0%, #7c3aed 100%)',
    });
  }

  if (stats.mostImproved) {
    slides.push({
      key: 'mostImproved',
      emoji: '📈',
      label: 'Most Improved',
      value: stats.mostImproved.name,
      subtext: `+${Math.round(stats.mostImproved.delta).toLocaleString()} avg pts vs last season`,
      gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    });
  }

  if (stats.closestRivalry) {
    slides.push({
      key: 'closestRivalry',
      emoji: '🤝',
      label: 'Closest Rivalry',
      value: `${stats.closestRivalry.player1} vs ${stats.closestRivalry.player2}`,
      subtext: `Avg gap of just ${stats.closestRivalry.avgDiff.toLocaleString()} pts over ${stats.closestRivalry.rounds} rounds`,
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)',
    });
  }

  if (stats.mostInconsistent) {
    slides.push({
      key: 'mostInconsistent',
      emoji: '😬',
      label: 'Most Inconsistent',
      value: stats.mostInconsistent.name,
      subtext: `Score std deviation of ${Math.round(stats.mostInconsistent.stdDev).toLocaleString()} pts`,
      gradient: 'linear-gradient(135deg, #4c0519 0%, #f43f5e 100%)',
    });
  }

  if (stats.longestWinStreak) {
    slides.push({
      key: 'longestWinStreak',
      emoji: '🔥',
      label: 'Longest Win Streak',
      value: stats.longestWinStreak.name,
      subtext: `${stats.longestWinStreak.streak} consecutive win${stats.longestWinStreak.streak !== 1 ? 's' : ''}`,
      gradient: 'linear-gradient(135deg, #431407 0%, #f97316 100%)',
    });
  }

  slides.push({
    key: 'totalRounds',
    emoji: '🏁',
    label: "That's a wrap!",
    value: `${stats.totalRounds} rounds`,
    subtext: `Thanks for playing the ${year} season!`,
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #6366f1 100%)',
  });

  return slides;
};

export const RecapPage = () => {
  const { year: yearParam } = useParams<{ year: string }>();
  const year = Number(yearParam) > 2000 ? Number(yearParam) : getCurrentYear();
  const navigate = useNavigate();

  const { data: availableYears = [], isLoading: yearsLoading } =
    useGetYearsQuery();

  const yearOptions = useMemo(
    () =>
      Array.from(new Set([getCurrentYear(), ...availableYears])).toSorted(
        (a, b) => b - a,
      ),
    [availableYears],
  );

  const handleYearChange = (newYear: number) => {
    setCurrentIndex(0);
    void navigate(`/recap/${newYear}`);
  };

  const { stats, isLoading, hasData } = useRecap(year);

  const slides = buildSlides(year, stats);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const safeIndex = Math.min(currentIndex, slides.length - 1);

  const goNext = useCallback(() => {
    if (safeIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [safeIndex, slides.length]);

  const goPrev = useCallback(() => {
    if (safeIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [safeIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goNext();
      }
      if (e.key === 'ArrowLeft') {
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  const currentSlide = slides[safeIndex]!;

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: { xs: 3, md: 6 },
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography
            component={Link}
            to="/"
            variant="body2"
            sx={{
              textDecoration: 'none',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            ← Back
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {year} Season Recap
          </Typography>
          <YearSelector
            year={year}
            yearOptions={yearOptions}
            yearsLoading={yearsLoading}
            disabled={isLoading}
            onChange={handleYearChange}
          />
        </Stack>

        {isLoading ? (
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
        ) : !hasData ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              borderRadius: 3,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Nothing to recap yet! 🌍
            </Typography>
            <Typography color="text.secondary">
              No rounds found for {year} — come back after playing some games.
            </Typography>
          </Box>
        ) : (
          <RecapCard slide={currentSlide} direction={direction} />
        )}

        {!isLoading && hasData && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'center' }}
          >
            <IconButton
              onClick={goPrev}
              disabled={safeIndex === 0}
              aria-label="Previous slide"
              size="large"
            >
              <ArrowBackRoundedIcon />
            </IconButton>

            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              {slides.map((slide, i) => (
                <Box
                  key={slide.key}
                  sx={{
                    width: i === safeIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    bgcolor:
                      i === safeIndex ? 'primary.main' : 'action.disabled',
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setDirection(i > safeIndex ? 1 : -1);
                    setCurrentIndex(i);
                  }}
                />
              ))}
            </Stack>

            <IconButton
              onClick={goNext}
              disabled={safeIndex === slides.length - 1}
              aria-label="Next slide"
              size="large"
            >
              <ArrowForwardRoundedIcon />
            </IconButton>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};
