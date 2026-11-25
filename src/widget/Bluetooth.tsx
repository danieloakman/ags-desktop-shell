import { createBinding, createComputed, For, With } from 'ags';
import { Gtk } from 'ags/gtk4';
import { execAsync } from 'ags/process';
import AstalBluetooth from 'gi://AstalBluetooth';
import Pango from 'gi://Pango';
import Icon from '../components/Icon';
import Card from '@/components/Card';
import { classes, LIST_MAX_HEIGHT, SPACING } from '../utils/styles';
import { createBooleanState } from '@/utils/ags';

const bluetooth = AstalBluetooth.get_default();

const isPowered = createBinding(bluetooth, 'isPowered');
const isConnected = createBinding(bluetooth, 'isConnected');
const devices = createBinding(bluetooth, 'devices').as((list) =>
  [...(list ?? [])].sort((a, b) => {
    if (a.connected !== b.connected) return a.connected ? -1 : 1;
    if (a.paired !== b.paired) return a.paired ? -1 : 1;
    return (a.alias || a.name || '').localeCompare(b.alias || b.name || '');
  }),
);

const connectedLabel = createComputed([devices, isPowered], (devs, powered) => {
  if (!powered) return 'Off';
  const connected = devs.filter((d) => d.connected);
  if (connected.length === 0) return 'On';
  return connected.map((d) => d.alias || d.name).join(', ');
});

function toggleDevice(device: AstalBluetooth.Device) {
  const address = device.address;
  const action = device.connected ? 'disconnect' : 'connect';
  execAsync(`bluetoothctl ${action} ${address}`).catch((err) =>
    console.error(`Failed to ${action} bluetooth device`, err),
  );
}

function toggleDiscovery(adapter: AstalBluetooth.Adapter) {
  try {
    if (adapter.discovering) adapter.stop_discovery();
    else adapter.start_discovery();
  } catch (err) {
    console.error('Failed to toggle bluetooth discovery', err);
  }
}

export default function Bluetooth() {
  const [open, { toggle: toggleOpen }] = createBooleanState(false);
  const adapter = createBinding(bluetooth, 'adapter');

  return (
    <Card name="Bluetooth" orientation={Gtk.Orientation.VERTICAL}>
      <box spacing={SPACING} valign={Gtk.Align.CENTER}>
        <button
          cssClasses={classes('btn-ghost', 'rounded-full')}
          tooltipText={isPowered((v) => (v ? 'Turn Bluetooth off' : 'Turn Bluetooth on'))}
          onClicked={() => bluetooth.toggle()}
        >
          <BluetoothConnection />
        </button>

        <label
          label={connectedLabel}
          hexpand
          xalign={0}
          ellipsize={Pango.EllipsizeMode.END}
        />

        <button onClicked={toggleOpen} cssClasses={classes('btn-ghost', 'rounded-full')}>
          <Icon name={open((v) => (v ? 'chevron-down' : 'chevron-right'))} />
        </button>
      </box>

      <revealer revealChild={open}>
        <box spacing={SPACING} orientation={Gtk.Orientation.VERTICAL} cssClasses={classes('py-sm')}>
          <box spacing={SPACING}>
            <With value={adapter}>
              {(a) =>
                a && (
                  <button
                    hexpand
                    cssClasses={classes('btn-ghost')}
                    sensitive={isPowered}
                    onClicked={() => toggleDiscovery(a)}
                  >
                    <box spacing={SPACING}>
                      <Icon
                        name={createBinding(a, 'discovering').as((v) =>
                          v ? 'bluetooth-searching' : 'search',
                        )}
                      />
                      <label
                        label={createBinding(a, 'discovering').as((v) =>
                          v ? 'Stop scanning' : 'Scan for devices',
                        )}
                      />
                    </box>
                  </button>
                )
              }
            </With>

            <button
              cssClasses={classes('btn-ghost')}
              tooltipText="Open Bluetooth Manager"
              onClicked={() =>
                execAsync('blueman-manager').catch((err) =>
                  console.error('Failed to open bluetooth manager', err),
                )
              }
            >
              <Icon name="list" />
            </button>
          </box>

          <label
            visible={isPowered((p) => !p)}
            label="Bluetooth is off"
            cssClasses={classes('opacity-70')}
          />
          <label
            visible={createComputed([isPowered, devices], (p, d) => p && d.length === 0)}
            label="No devices found"
            cssClasses={classes('opacity-70')}
          />
          <scrolledwindow
            visible={createComputed([isPowered, devices], (p, d) => p && d.length > 0)}
            hscrollbarPolicy={Gtk.PolicyType.NEVER}
            vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
            maxContentHeight={LIST_MAX_HEIGHT}
            propagateNaturalHeight
          >
            <box spacing={SPACING} orientation={Gtk.Orientation.VERTICAL}>
              <For each={devices}>
                {(device: AstalBluetooth.Device) => {
                  const connected = createBinding(device, 'connected');
                  const connecting = createBinding(device, 'connecting');
                  const alias = createBinding(device, 'alias');
                  return (
                    <button cssClasses={classes('btn-ghost')} onClicked={() => toggleDevice(device)}>
                      <box spacing={SPACING}>
                        <Icon
                          name={createComputed([connected, connecting], (c, ing) =>
                            ing ? 'bluetooth-searching' : c ? 'check' : 'dot',
                          )}
                        />
                        <label
                          label={alias}
                          hexpand
                          xalign={0}
                          ellipsize={Pango.EllipsizeMode.END}
                        />
                        <Icon name={connected((c) => (c ? 'bluetooth-connected' : 'bluetooth'))} />
                      </box>
                    </button>
                  );
                }}
              </For>
            </box>
          </scrolledwindow>
        </box>
      </revealer>
    </Card>
  );
}

export function BluetoothConnection() {
  return (
    <Icon
      tooltipText={createComputed(
        [isPowered, isConnected, connectedLabel],
        (powered, connected, label) =>
          !powered ? 'Bluetooth Off' : connected ? `Bluetooth: ${label}` : 'Bluetooth On',
      )}
      name={createComputed([isPowered, isConnected], (powered, connected) =>
        !powered ? 'bluetooth-off' : connected ? 'bluetooth-connected' : 'bluetooth',
      )}
    />
  );
}
