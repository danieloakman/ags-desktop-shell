import { execAsync } from 'ags/process';
import Icon from '../components/Icon';
import { createExternal, createState } from 'ags';
import { noop } from '@/js-utils';
import { hasTouchDevice } from '../utils/hyprland';
import { classes } from '@/utils/styles';
import { Theme } from '@/utils/theme';

const [isOnScreenKeyboardVisible, setIsOnScreenKeyboardVisible] = createState(false);

export const toggleOnScreenKeyboard = () =>
  execAsync(`zsh -c "kill -34 $(ps -C wvkbd-mobintl | awk 'NR>1 {print $1}')"`)
    .then(() => setIsOnScreenKeyboardVisible((v) => !v))
    .catch((err) => console.error('Failed to toggle on-screen keyboard', err));

export default function OnscreenKeyboard() {
  const icon = isOnScreenKeyboardVisible.as((v) => (v ? 'keyboard-off' : 'keyboard'));
  const visible = createExternal(false, (set) => {
    hasTouchDevice().then(set);
    return noop;
  });

  return (
    <box visible={visible}>
      <button
        onClicked={toggleOnScreenKeyboard}
        tooltipText="Toggle on-screen keyboard"
        cssClasses={isOnScreenKeyboardVisible((v) => classes('rounded-full', v && 'bg-fg-color'))}
      >
        <Icon
          name={icon}
          color={isOnScreenKeyboardVisible((v) => (v ? Theme.bgColor : Theme.fgColor))}
        />
      </button>
    </box>
  );
}
