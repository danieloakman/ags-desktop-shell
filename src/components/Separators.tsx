import { Accessor } from 'ags';
import { Gtk } from 'ags/gtk4';
import { classes } from '@/utils/styles';
import { StyleClass } from '@/types/style-classes';

export interface VrProps extends Omit<Partial<Gtk.Separator.ConstructorProps>, 'visible'> {
  visible?: Accessor<boolean> | boolean;
}

export function Vr(props: VrProps) {
  return <Gtk.Separator {...props} />;
}

export interface HrProps extends Omit<Partial<JSX.IntrinsicElements['box']>, 'name' | 'cssClasses'> {
  cssClasses?: StyleClass[];
}

export function Hr({ cssClasses = [], ...props }: HrProps) {
  return <box name="Hr" cssClasses={classes('border-b', ...cssClasses)} {...props} />;
}
