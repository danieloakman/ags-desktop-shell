import { StyleClass } from '../types/style-classes';

/** Default GTK spacing between related siblings (icon+label, button groups). */
export const SPACING = 4;

export const classes = (
  ...classes: (StyleClass | boolean | null | undefined | (string & {}))[]
): string[] => classes.filter(Boolean) as string[];
