import Box from '@mui/material/Box';
import MuiSkeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

/**
 * Skeleton for a data table — mimics rows of tabular content.
 */
export const TableSkeleton = ({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) => (
  <Stack spacing={1}>
    {/* Header row */}
    <Box sx={{ display: 'flex', gap: 2, pb: 1 }}>
      {Array.from({ length: cols }).map((_, i) => (
        <MuiSkeleton
          key={i}
          variant="text"
          width={`${100 / cols}%`}
          height={24}
        />
      ))}
    </Box>
    {/* Data rows */}
    {Array.from({ length: rows }).map((_item, row) => (
      <Box key={row} sx={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: cols }).map((_col, col) => (
          <MuiSkeleton
            key={col}
            variant="text"
            width={`${100 / cols}%`}
            height={20}
          />
        ))}
      </Box>
    ))}
  </Stack>
);

/**
 * Skeleton for a list of items — mimics a vertically stacked list.
 */
export const ListSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Stack spacing={1.5}>
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <MuiSkeleton variant="circular" width={40} height={40} />
        <Stack flex={1} spacing={0.5}>
          <MuiSkeleton variant="text" width="60%" height={20} />
          <MuiSkeleton variant="text" width="40%" height={16} />
        </Stack>
      </Box>
    ))}
  </Stack>
);

/**
 * Skeleton for a content card — mimics a card with a title and body text.
 */
export const CardSkeleton = ({ count = 3 }: { count?: number }) => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    {Array.from({ length: count }).map((_, i) => (
      <Box
        key={i}
        sx={{
          flex: '1 1 240px',
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <MuiSkeleton
          variant="rectangular"
          height={140}
          sx={{ mb: 1, borderRadius: 0.5 }}
        />
        <MuiSkeleton variant="text" width="70%" height={24} />
        <MuiSkeleton variant="text" width="90%" height={16} />
        <MuiSkeleton variant="text" width="50%" height={16} />
      </Box>
    ))}
  </Box>
);
