import { Accessor } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';

/** GTK icon-theme name (resolved at runtime; not a committed catalog). */
export type NativeIcon = string;

function iconTheme(): Gtk.IconTheme | null {
  const display = Gdk.Display.get_default();
  if (!display) return null;
  return Gtk.IconTheme.get_for_display(display);
}

let cachedNames: string[] | null = null;

function iconNames(): string[] {
  if (cachedNames) return cachedNames;
  const theme = iconTheme();
  cachedNames = theme ? [...theme.get_icon_names()].sort() : [];
  return cachedNames;
}

export interface NativeIconProps {
  name: NativeIcon | Accessor<NativeIcon>;
  size?: number;
}

export default function NativeIcon({ name, size = 18 }: NativeIconProps) {
  return <image iconName={name} pixelSize={size} />;
}

/** Resolve a window class / hint to a theme icon name, if one exists. */
export function lookupNativeIcon(name: string): NativeIcon | undefined {
  const theme = iconTheme();
  if (!theme) return undefined;
  if (theme.has_icon(name)) return name;
  const lower = name.toLowerCase();
  return iconNames().find(
    (i) => i.toLowerCase().includes(lower) || lower.includes(i.toLowerCase()),
  );
}
