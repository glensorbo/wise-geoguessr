import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { useAddResultMutation } from '@frontend/redux/api/gameResultApi';

const KNOWN_PLAYERS = [
  'Glen',
  'Thorjan',
  'Thomas',
  'Tor Arve',
  'Sigurd',
  'Malin',
  'Lotte',
  'Margaux',
  'Eirik',
];

type ScoreRow = { player: string; score: string };

const emptyRow = (): ScoreRow => ({ player: '', score: '' });

const todayIso = () => new Date().toISOString().slice(0, 10);

type Props = {
  open: boolean;
  onClose: () => void;
};

export const AddScoreModal = ({ open, onClose }: Props) => {
  const [date, setDate] = useState(todayIso);
  const [rows, setRows] = useState<ScoreRow[]>(() =>
    KNOWN_PLAYERS.map((p) => ({ player: p, score: '' })),
  );
  const [addResult, { isLoading }] = useAddResultMutation();

  const handleClose = () => {
    onClose();
    setDate(todayIso());
    setRows(KNOWN_PLAYERS.map((p) => ({ player: p, score: '' })));
  };

  const updateRow = (index: number, field: keyof ScoreRow, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const scores: Record<string, number> = {};
    for (const row of rows) {
      const trimmedPlayer = row.player.trim();
      const parsed = Number(row.score);
      if (!trimmedPlayer || row.score === '' || Number.isNaN(parsed)) {
        continue;
      }
      scores[trimmedPlayer] = parsed;
    }

    if (Object.keys(scores).length === 0) {
      toast.error('Add at least one player score');
      return;
    }

    try {
      await addResult({ date, scores }).unwrap();
      toast.success(`✅ Results for ${date} saved!`);
      handleClose();
    } catch {
      toast.error('Failed to save results — check the date or try again');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={(e) => void handleSubmit(e)}>
        <DialogTitle>Add game results</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />

            <Typography variant="subtitle2" color="text.secondary">
              Player scores (leave blank to skip a player)
            </Typography>

            {rows.map((row, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Player"
                  value={row.player}
                  onChange={(e) => updateRow(i, 'player', e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Score"
                  type="number"
                  value={row.score}
                  onChange={(e) => updateRow(i, 'score', e.target.value)}
                  size="small"
                  slotProps={{ htmlInput: { min: 0 } }}
                  sx={{ width: 120 }}
                />
                <IconButton
                  onClick={() => removeRow(i)}
                  size="small"
                  aria-label="Remove player"
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addRow}
              variant="outlined"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              Add player
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" loading={isLoading}>
            Save results
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
