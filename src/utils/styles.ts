import { StyleClass } from '../types/style-classes';

export const classes = (
  ...classes: (StyleClass | boolean | null | undefined | (string & {}))[]
): string[] => classes.filter(Boolean) as string[];
