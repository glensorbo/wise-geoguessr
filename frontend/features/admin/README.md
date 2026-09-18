# 👥 Admin Feature

Admin-only user management panel. Only accessible when the authenticated user has `role: 'admin'`.

## Components

| Component             | Description                                                                          |
| --------------------- | ------------------------------------------------------------------------------------ |
| `UserTable`           | Data table listing all users with inline role toggle and action buttons              |
| `DeleteUserDialog`    | Confirmation dialog before permanently deleting a user                               |
| `ResetPasswordDialog` | Generates a new password reset link; shows copyable link when SMTP is not configured |

## Rules

- Admins cannot delete themselves (delete button is disabled for the current user's row).
- Admins cannot change their own role (role chip is non-interactive for the current user's row).
- Role toggle is a single click: `admin → user` or `user → admin`.
- If SMTP is configured, password resets are sent automatically and the dialog closes.
- If SMTP is not configured, the reset link is shown in a copyable field.

## Analytics Events

All three destructive admin actions emit events via `useAnalytics` on success. No PII is included — user identifiers and names are never sent as event properties.

| Event                  | Component             | Properties                    | Description                                                                                                                                     |
| ---------------------- | --------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `user_role_changed`    | `UserTable`           | `new_role: 'admin' \| 'user'` | Fired when an admin toggles another user's role                                                                                                 |
| `user_deleted`         | `DeleteUserDialog`    | _(none)_                      | Fired when a user is permanently deleted                                                                                                        |
| `admin_password_reset` | `ResetPasswordDialog` | `method: 'email' \| 'link'`   | Fired when a password reset is triggered; `method` reflects whether a reset email was sent or a manual link was generated (SMTP not configured) |
