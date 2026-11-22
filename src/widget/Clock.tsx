import { Gtk } from 'ags/gtk4';
import { createPoll } from 'ags/time';
import { apps } from './Apps';
import { classes, SPACING } from '../utils/styles';
import { createBinding } from 'ags';

const DATE_CMD = `date +'%I:%M:%S %b %d'`;
export const time = createPoll('', 1000, DATE_CMD);

const calendarApps = apps.fuzzy_query('calendar');

export default function Clock() {
  return (
    // `flat` removes Adwaita's default MenuButton fill so bg-selected isn't double-painted.
    <menubutton name="clock" cssClasses={classes('flat', 'rounded-full', 'bg-selected')}>
      <label cssClasses={classes('px')} label={time} />

      <popover>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={SPACING}>
          {calendarApps.map((app) => (
            <button onClicked={() => app.launch()} cssClasses={classes('btn-ghost')}>
              <box spacing={SPACING}>
                <image iconName={createBinding(app, 'icon_name')} />
                <label label={createBinding(app, 'name')} />
              </box>
            </button>
          ))}

          <Gtk.Calendar />
        </box>
      </popover>
    </menubutton>
  );
}
