import { Gtk } from 'ags/gtk4';
import Volume, { VolumeIndicator } from './Volume';
import Internet, { InternetConnection } from './Internet';
import { Restart, Shutdown, Suspend } from './System';
import Bluetooth, { BluetoothConnection } from './Bluetooth';
import { toggleWindow, WINDOW_NAME } from '../utils/window';
import Modal from '../components/Modal';
import { uptime } from './Uptime';
import { classes, SPACING } from '../utils/styles';
import { Hr } from '@/components/Separators';
import Swaync from './Swaync';
import Brightness from './Brightness';
import { BatteryInfo } from './Battery';
import { createBinding, createComputed } from 'ags';
import Network from 'gi://AstalNetwork';
import Pango from 'gi://Pango';

const network = Network.get_default();
const wifi = createBinding(network, 'wifi');
const primary = createBinding(network, 'primary');

const heroNetworkLabel = createComputed([wifi, primary], (w, p) => {
  if (p === Network.Primary.WIFI) return w?.ssid || 'Wi-Fi';
  if (p === Network.Primary.WIRED) return 'Wired';
  if (w?.enabled) return 'Not connected';
  return 'Offline';
});

function ControlCenterHero() {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={2} valign={Gtk.Align.CENTER}>
      <box spacing={SPACING} valign={Gtk.Align.CENTER}>
        <BatteryInfo showPercentage />
        <box spacing={SPACING} valign={Gtk.Align.CENTER}>
          <InternetConnection />
          <label
            label={heroNetworkLabel}
            ellipsize={Pango.EllipsizeMode.END}
            maxWidthChars={18}
          />
        </box>
      </box>
      <label
        cssClasses={classes('opacity-70', 'font-size-sm')}
        halign={Gtk.Align.START}
        label={uptime(([hours, minutes]) => `${hours}h ${minutes}m up`)}
      />
    </box>
  );
}

export default function ControlCenter() {
  return (
    <Modal
      name={WINDOW_NAME.ControlCenter}
      cssClasses={classes('bg-transparent')}
      valign={Gtk.Align.START}
      halign={Gtk.Align.END}
      margin_top={20}
      margin_end={20}
      width={400}
      opacity={0.9}
    >
      <box
        cssClasses={classes('bg-bg-color', 'rounded', 'p-md')}
        orientation={Gtk.Orientation.VERTICAL}
        spacing={12}
      >
        <centerbox orientation={Gtk.Orientation.HORIZONTAL}>
          <box $type="start" valign={Gtk.Align.CENTER}>
            <ControlCenterHero />
          </box>
          <box $type="end" spacing={SPACING} valign={Gtk.Align.CENTER}>
            <Suspend />
            <Restart />
            <Shutdown />
          </box>
        </centerbox>

        <Hr />

        <Volume />
        <Brightness />
        <Internet />
        <Bluetooth />
      </box>
    </Modal>
  );
}

export function ControlCenterButton() {
  return (
    <box cssClasses={classes('rounded-full', 'bg-selected')}>
      <Swaync cssClasses={['rounded-full', 'btn-ghost-on-bg']} />

      <button
        cssClasses={classes('rounded-full', 'btn-ghost-on-bg')}
        onClicked={() => toggleWindow('control-center')}
      >
        <box spacing={SPACING}>
          <VolumeIndicator />
          <BluetoothConnection />
          <InternetConnection />
          <BatteryInfo />
        </box>
      </button>
    </box>
  );
}
