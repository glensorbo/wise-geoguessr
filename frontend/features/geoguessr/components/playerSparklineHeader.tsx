import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

interface PlayerSparklineHeaderProps {
  name: string;
  color: string;
  data: number[];
}

export const PlayerSparklineHeader = ({
  name,
  color,
  data,
}: PlayerSparklineHeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 0.75,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {data.length >= 2 && (
        <SparkLineChart
          data={data}
          width={52}
          height={22}
          plotType="line"
          color={color}
          disableAxisListener
          sx={{ flexShrink: 0 }}
        />
      )}
      <Typography
        variant="inherit"
        noWrap
        sx={{ fontWeight: 500, lineHeight: 1.2 }}
      >
        {name}
      </Typography>
    </Box>
  );
};
