import Glib from 'gi://GLib';

export const HOME = Glib.getenv('HOME');

/**
 * True when running from a writable checkout (not the Nix store package).
 * Override with AGS_DESKTOP_SHELL_DEV=1|0.
 */
export const DEV = (() => {
  const override = Glib.getenv('AGS_DESKTOP_SHELL_DEV');
  if (override === '1' || override === 'true') return true;
  if (override === '0' || override === 'false') return false;
  const cwd = Glib.get_current_dir();
  if (cwd.startsWith('/nix/store')) return false;
  return cwd.includes('ags-desktop-shell');
})();

export const PASSWORD_STORE_DIR = Glib.getenv('PASSWORD_STORE_DIR') ?? `${HOME}/.password-store`;
export const CONFIG_DIR = `${HOME}/.config/ags-config`;
