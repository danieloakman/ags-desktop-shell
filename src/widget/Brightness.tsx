import { createExternal } from 'ags';
import { execAsync } from 'ags/process';
import { noop, debounce } from '@/js-utils';
import { createExternalState } from '../utils/ags';
import Icon from '../components/Icon';
import Card from '@/components/Card';
import { Gtk } from 'ags/gtk4';
import { classes, SPACING } from '@/utils/styles';

/** Only real display backlights — ignores keyboard LEDs that brightnessctl lists first. */
const BRIGHTNESSCTL = 'brightnessctl -c backlight';

export const maxBrightness = createExternal(0, (set) => {
  execAsync(`${BRIGHTNESSCTL} max`)
    .then((stdout) => set(parseInt(stdout.trim(), 10) || 0))
    .catch(() => set(0));
  return noop;
});

const [currentBrightness, setCurrentBrightness] = createExternalState<number>(0, (set) => {
  Promise.all([
    execAsync(`${BRIGHTNESSCTL} get`).then((stdout) => parseInt(stdout.trim(), 10)),
    execAsync(`${BRIGHTNESSCTL} max`).then((stdout) => parseInt(stdout.trim(), 10)),
  ])
    .then(([brightness, max]) => {
      if (!max) return set(0);
      set((brightness / max) * 100);
    })
    .catch(() => set(0));
  return noop;
});
export { currentBrightness as brightness };

export const canControlBrightness = maxBrightness((max) => max > 1);

export const setBrightness = debounce(async (value: number) => {
  await execAsync(`swayosd-client --brightness ${value}`).catch((err) =>
    console.error('brightness set error', err),
  );
  setCurrentBrightness(value);
}, 100);

export default function Brightness() {
  return (
    <Card
      name="Brightness"
      visible={canControlBrightness}
      hexpand
      orientation={Gtk.Orientation.HORIZONTAL}
      spacing={SPACING}
    >
      <button
        cssClasses={classes('btn-ghost', 'rounded-full')}
        onClicked={() => (currentBrightness.get() === 100 ? setBrightness(1) : setBrightness(100))}
      >
        <Icon name="sun" />
      </button>
      <slider
        value={currentBrightness}
        min={1}
        max={100}
        step={1}
        onChangeValue={({ value }) => {
          setBrightness(Math.round(value));
        }}
        hexpand
      />
    </Card>
  );
}
