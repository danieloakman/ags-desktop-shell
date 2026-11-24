import { StyleClass } from '../types/style-classes';

/** Default GTK spacing between related siblings (icon+label, button groups). */
export const SPACING = 4;

/** Max height for control-center device/network lists (~5 rows). */
export const LIST_MAX_HEIGHT = 180;

export const classes = (
  ...classes: (StyleClass | boolean | null | undefined | (string & {}))[]
): string[] => classes.filter(Boolean) as string[];
