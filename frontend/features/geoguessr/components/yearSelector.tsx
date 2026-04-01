import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';

type YearSelectorProps = {
  year: number;
  yearOptions: number[];
  yearsLoading: boolean;
  disabled?: boolean;
  onChange: (year: number) => void;
};

export const YearSelector = ({
  year,
  yearOptions,
  yearsLoading,
  disabled = false,
  onChange,
}: YearSelectorProps) => {
  if (yearsLoading) {
    return (
      <Skeleton
        variant="rounded"
        height={40}
        sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}
      />
    );
  }

  return (
    <FormControl
      size="small"
      sx={{ minWidth: 140, width: { xs: '100%', sm: 'auto' } }}
    >
      <InputLabel id="year-select-label">Year</InputLabel>
      <Select
        labelId="year-select-label"
        value={String(year)}
        label="Year"
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {yearOptions.map((y) => (
          <MenuItem key={y} value={String(y)}>
            {y}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
