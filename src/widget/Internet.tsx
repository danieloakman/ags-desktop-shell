import { createBinding, createComputed, For, With } from 'ags';
import { Gtk } from 'ags/gtk4';
import Network from 'gi://AstalNetwork';
import Pango from 'gi://Pango';
import { Icon } from '../components/Icon';
import { createBooleanState } from '../utils/ags';
import { classes, LIST_MAX_HEIGHT, SPACING } from '../utils/styles';
import { execAsync } from 'ags/process';
import Card from '@/components/Card';

const network = Network.get_default();

export const wifi = createBinding(network, 'wifi');
export const wired = createBinding(network, 'wired');
export const primary = createBinding(network, 'primary');

const WIFI_STRENGTH: Icon.Name[] = ['wifi-zero', 'wifi-low', 'wifi-high'];
const getWifiStrength = (strength: number): Icon.Name =>
  WIFI_STRENGTH[Math.ceil(strength / 33) - 1] ?? 'wifi-off';

export const primaryConnectionType = primary((p) => {
  if (p === Network.Primary.WIFI) return 'wifi' as const;
  if (p === Network.Primary.WIRED) return 'wired' as const;
  return null;
});

const connectionLabel = createComputed([wifi, wired, primary], (w, wiredDev, p) => {
  if (p === Network.Primary.WIFI) return w?.ssid || 'Wi-Fi';
  if (p === Network.Primary.WIRED) return 'Wired';
  if (w?.enabled) return 'Not connected';
  return 'Offline';
});

function openNetworkEditor() {
  execAsync('nm-connection-editor').catch((err) =>
    console.error('Failed to open network connection manager', err),
  );
}

function toggleWifi(wifiDevice: Network.Wifi) {
  wifiDevice.enabled = !wifiDevice.enabled;
}

function activateAccessPoint(ap: Network.AccessPoint) {
  void Promise.resolve(ap.activate(null)).catch((err) => {
    console.error('Failed to activate access point', err);
    openNetworkEditor();
  });
}

export default function Internet() {
  const [open, { toggle: toggleOpen }] = createBooleanState(false);

  return (
    <Card name="Internet" orientation={Gtk.Orientation.VERTICAL}>
      <box spacing={SPACING} valign={Gtk.Align.CENTER}>
        <With value={wifi}>
          {(wifiDevice) =>
            wifiDevice ? (
              <button
                cssClasses={classes('btn-ghost', 'rounded-full')}
                tooltipText={createBinding(wifiDevice, 'enabled').as((on) =>
                  on ? 'Turn Wi-Fi off' : 'Turn Wi-Fi on',
                )}
                onClicked={() => toggleWifi(wifiDevice)}
              >
                <InternetConnection />
              </button>
            ) : (
              <box cssClasses={classes('rounded-full')}>
                <InternetConnection />
              </box>
            )
          }
        </With>

        <label
          label={connectionLabel}
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
            <With value={wifi}>
              {(wifiDevice) =>
                wifiDevice && (
                  <button
                    hexpand
                    cssClasses={classes('btn-ghost')}
                    sensitive={createBinding(wifiDevice, 'enabled')}
                    onClicked={() => wifiDevice.scan()}
                  >
                    <box spacing={SPACING}>
                      <Icon
                        name={createBinding(wifiDevice, 'scanning').as((s) =>
                          s ? 'wifi-high' : 'search',
                        )}
                      />
                      <label
                        label={createBinding(wifiDevice, 'scanning').as((s) =>
                          s ? 'Scanning…' : 'Scan for networks',
                        )}
                      />
                    </box>
                  </button>
                )
              }
            </With>

            <button
              cssClasses={classes('btn-ghost')}
              tooltipText="Open Network Manager"
              onClicked={openNetworkEditor}
            >
              <Icon name="list" />
            </button>
          </box>

          <label
            visible={wifi((w) => !w)}
            label="Using a wired connection"
            cssClasses={classes('opacity-70')}
            xalign={0}
          />

          <With value={wifi}>
            {(wifiDevice) => {
              if (!wifiDevice) return <box />;

              const enabled = createBinding(wifiDevice, 'enabled');
              const accessPoints = createBinding(wifiDevice, 'accessPoints').as((aps) => {
                const bestBySsid = new Map<string, Network.AccessPoint>();
                for (const ap of aps ?? []) {
                  const ssid = ap.ssid;
                  if (!ssid) continue;
                  const existing = bestBySsid.get(ssid);
                  if (!existing || ap.strength > existing.strength) bestBySsid.set(ssid, ap);
                }
                return [...bestBySsid.values()].sort((a, b) => {
                  if (a.active !== b.active) return a.active ? -1 : 1;
                  return b.strength - a.strength;
                });
              });

              return (
                <box spacing={SPACING} orientation={Gtk.Orientation.VERTICAL}>
                  <label
                    visible={enabled((on) => !on)}
                    label="Wi-Fi is off"
                    cssClasses={classes('opacity-70')}
                    xalign={0}
                  />
                  <label
                    visible={createComputed(
                      [enabled, accessPoints],
                      (on, aps) => on && aps.length === 0,
                    )}
                    label="No networks found"
                    cssClasses={classes('opacity-70')}
                    xalign={0}
                  />
                  <scrolledwindow
                    visible={createComputed(
                      [enabled, accessPoints],
                      (on, aps) => on && aps.length > 0,
                    )}
                    hscrollbarPolicy={Gtk.PolicyType.NEVER}
                    vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                    maxContentHeight={LIST_MAX_HEIGHT}
                    propagateNaturalHeight
                  >
                    <box spacing={SPACING} orientation={Gtk.Orientation.VERTICAL}>
                      <For each={accessPoints}>
                        {(ap: Network.AccessPoint) => {
                          const active = createBinding(ap, 'active');
                          const ssid = createBinding(ap, 'ssid').as((s) => s ?? '');
                          const strength = createBinding(ap, 'strength');
                          return (
                            <button
                              cssClasses={classes('btn-ghost')}
                              onClicked={() => activateAccessPoint(ap)}
                            >
                              <box spacing={SPACING}>
                                <Icon name={active((v) => (v ? 'check' : 'dot'))} />
                                <label
                                  label={ssid}
                                  hexpand
                                  xalign={0}
                                  ellipsize={Pango.EllipsizeMode.END}
                                />
                                <Icon name={strength(getWifiStrength)} />
                              </box>
                            </button>
                          );
                        }}
                      </For>
                    </box>
                  </scrolledwindow>
                </box>
              );
            }}
          </With>
        </box>
      </revealer>
    </Card>
  );
}

export function InternetConnection() {
  const view = createComputed([primaryConnectionType, wifi], (type, wifiDevice) => ({
    type,
    wifiDevice,
  }));

  return (
    <box>
      <With value={view}>
        {({ type, wifiDevice }) => {
          if (type === 'wifi')
            return (
              <Icon
                name={wifiDevice ? getWifiStrength(wifiDevice.strength) : 'wifi'}
                tooltipText={wifiDevice?.ssid ? `Wi-Fi: ${wifiDevice.ssid}` : 'Wi-Fi'}
              />
            );
          if (type === 'wired') return <Icon name="cable" tooltipText="Wired connection" />;
          if (wifiDevice?.enabled) return <Icon name="wifi" tooltipText="Wi-Fi on, not connected" />;
          return <Icon name="wifi-off" tooltipText="No network" />;
        }}
      </With>
    </box>
  );
}
