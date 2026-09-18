import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import { LoginForm } from './loginForm';

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
};

export const LoginModal = ({ open, onClose }: LoginModalProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogContent sx={{ p: 3 }}>
      <LoginForm onSuccess={onClose} />
    </DialogContent>
  </Dialog>
);
