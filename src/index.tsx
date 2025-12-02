import "./i18n"
import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  staticClasses,
  ToggleField,
  Navigation,
  SliderField,
  Focusable,
  showModal,
  ModalRoot,
  joinClassNames,
  gamepadDialogClasses,
  quickAccessMenuClasses,
} from "@decky/ui";
import {
  routerHook,
} from "@decky/api";

import { FC, useEffect, useState } from "react";
import { Trans } from 'react-i18next'
import { t } from 'i18next';
import { BlackOverlay } from "./blackOverlay";
import { LogoIcon } from "./icons";
import { QUICK_ACCESS_MENU } from "./ButtonIcons";
import initI18n from "./i18n";
import { loadBooleanSetting, loadNumberSetting, saveSetting } from "./settings";
import { StateNumber } from "./state";
import PanelSocialButton from "./socialButton";

const Content: FC<{
  overlayModeState: StateNumber;
  overlayOpacityState: StateNumber;
}> = ({ overlayModeState, overlayOpacityState }) => {

  const [overlayMode, setOverlayMode] = useState<number>(overlayModeState.GetState());
  const [allowTouch, setAllowTouch] = useState<boolean>(false);
  const [muteMic, setMuteMic] = useState<boolean>(false);
  const [muteSound, setMuteSound] = useState<boolean>(false);
  const [closeOnAnyKey, setCloseOnAnyKey] = useState<boolean>(false);
  const [closeOnWake, setCloseOnWake] = useState<boolean>(false);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(overlayOpacityState.GetState());
  const overlayBusy = overlayMode !== 0;
  const overlayEnabled = overlayMode === 1;
  const screensaverEnabled = overlayMode === 2;

  const OptionsPanelSection = joinClassNames(
  gamepadDialogClasses.HighlightOnFocus,
  gamepadDialogClasses.Field,
  quickAccessMenuClasses.PanelSectionRow,
)

  const showQrModal = () => {
    showModal(
        <ModalRoot>
            <span style={{ textAlign: 'center', wordBreak: 'break-word' }}>{t("options_modal")}</span>
        </ModalRoot>,
        window
    );
};

  useEffect(() => {
    const loadSettings = async () => {
      setAllowTouch(await loadBooleanSetting("allow_touch", false));
      setMuteMic(await loadBooleanSetting("mute_mic", false));
      setMuteSound(await loadBooleanSetting("mute_sound", false));
      setCloseOnAnyKey(await loadBooleanSetting("off_anykey", false));
      setCloseOnWake(await loadBooleanSetting("off_upon_waking", false));
      const opacitySetting = await loadNumberSetting("overlay_opacity");
      const resolvedOpacity = opacitySetting == null ? 1 : Math.min(1, Math.max(0, opacitySetting));
      setOverlayOpacity(resolvedOpacity);
      overlayOpacityState.SetState(resolvedOpacity);
    };
    loadSettings();
  }, [overlayOpacityState]);

  useEffect(() => {
    const onOverlayModeChanged = (value: number) => {
      setOverlayMode(value);
    };
    overlayModeState.onStateChanged(onOverlayModeChanged);
    return () => {
      overlayModeState.offStateChanged(onOverlayModeChanged);
    };
  }, [overlayModeState]);

  useEffect(() => {
    const onOpacityChanged = (value: number) => {
      setOverlayOpacity(Math.min(1, Math.max(0, value)));
    };
    overlayOpacityState.onStateChanged(onOpacityChanged);
    return () => overlayOpacityState.offStateChanged(onOpacityChanged);
  }, [overlayOpacityState]);


  return (
    <div>
      <PanelSection>
        <PanelSectionRow>
          <ToggleField checked={overlayEnabled}
            disabled={screensaverEnabled}
            label={t("toggle_enableoverlay_label")}
            description={<Trans i18nKey="toggle_enableoverlay_description" components={{ Key: <QUICK_ACCESS_MENU style={{ height: "18px", width: "auto", marginBottom: "-5px" }} /> }} />}
            onChange={(b) => { overlayModeState.SetState(b ? 1 : 0); Navigation.CloseSideMenus(); }} />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField checked={screensaverEnabled}
            disabled={overlayEnabled}
            label={t("toggle_enablescreensaver_label")}
            description={<Trans i18nKey="toggle_enableoverlay_description" components={{ Key: <QUICK_ACCESS_MENU style={{ height: "18px", width: "auto", marginBottom: "-5px" }} /> }} />}
            onChange={(b) => { overlayModeState.SetState(b ? 2 : 0); Navigation.CloseSideMenus(); }} />
        </PanelSectionRow>

        <Focusable
          noFocusRing={true}
          className={OptionsPanelSection}
          style={{ marginLeft: "-16px", marginRight: "-16px", marginTop: "24px" }}
          onOKButton={() => showQrModal()}>
          <div className={staticClasses.PanelSectionTitle}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            onClick={() => showQrModal()}>
            {t("options_header")}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 3C15.0333 3 12.1332 3.87973 9.66645 5.52796C7.19971 7.17618 5.27712 9.51886 4.14181 12.2597C3.00649 15.0006 2.70944 18.0166 3.28822 20.9264C3.867 23.8361 5.29561 26.5088 7.3934 28.6066C9.49119 30.7044 12.1639 32.133 15.0736 32.7118C17.9834 33.2906 20.9994 32.9935 23.7402 31.8582C26.4811 30.7229 28.8238 28.8003 30.472 26.3336C32.1203 23.8668 33 20.9667 33 18C33 16.0302 32.612 14.0796 31.8582 12.2597C31.1044 10.4399 29.9995 8.78628 28.6066 7.3934C27.2137 6.00052 25.5601 4.89563 23.7402 4.14181C21.9204 3.38799 19.9698 3 18 3ZM20.5 26H15.5V16H20.5V26ZM18 14C17.4067 14 16.8266 13.8241 16.3333 13.4944C15.8399 13.1648 15.4554 12.6962 15.2284 12.1481C15.0013 11.5999 14.9419 10.9967 15.0576 10.4147C15.1734 9.83279 15.4591 9.29824 15.8787 8.87868C16.2982 8.45912 16.8328 8.1734 17.4147 8.05764C17.9967 7.94189 18.5999 8.0013 19.148 8.22836C19.6962 8.45542 20.1648 8.83994 20.4944 9.33329C20.8241 9.82664 21 10.4067 21 11C21 11.7956 20.6839 12.5587 20.1213 13.1213C19.5587 13.6839 18.7956 14 18 14Z" fill="currentColor"></path></svg>
          </div>
        </Focusable>

        <PanelSectionRow>
          <SliderField
            value={Math.round(overlayOpacity * 100)}
            min={0}
            max={100}
            step={5}
            showValue={true}
            valueSuffix="%"
            label={t("slider_overlayopacity_label")}
            description={t("slider_overlayopacity_description")}
            onChange={(value) => {
              const clampedPercent = Math.min(100, Math.max(0, value));
              const normalizedOpacity = clampedPercent / 100;
              setOverlayOpacity(normalizedOpacity);
              overlayOpacityState.SetState(normalizedOpacity);
              void saveSetting("overlay_opacity", normalizedOpacity);
            }}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <ToggleField
            checked={allowTouch}
            label={t("toggle_allowtouch_label")}
            description={t("toggle_allowtouch_description")}
            onChange={(b) => {
              setAllowTouch(b);
              void saveSetting("allow_touch", b);
            }}
            disabled={overlayBusy}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <ToggleField
            checked={closeOnAnyKey}
            label={t("toggle_offanykey_label")}
            description={t("toggle_offanykey_description")}
            onChange={(b) => {
              setCloseOnAnyKey(b);
              void saveSetting("off_anykey", b);
            }}
            disabled={overlayBusy}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            checked={closeOnWake}
            label={t("toggle_offuponwaking_label")}
            description={t("toggle_offuponwaking_description")}
            onChange={(b) => {
              setCloseOnWake(b);
              void saveSetting("off_upon_waking", b);
            }}
            disabled={overlayBusy}
          />
        </PanelSectionRow>

        <PanelSectionRow>
          <ToggleField
            checked={muteMic}
            label={t("toggle_mutemic_label")}
            description={t("toggle_mutemic_description")}
            onChange={(b) => {
              setMuteMic(b);
              void saveSetting("mute_mic", b);
            }}
            disabled={overlayBusy}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField
            checked={muteSound}
            label={t("toggle_mutesound_label")}
            description={t("toggle_mutesound_description")}
            onChange={(b) => {
              setMuteSound(b);
              void saveSetting("mute_sound", b);
            }}
            disabled={overlayBusy}
          />
        </PanelSectionRow>
        <PanelSocialButton url="https://magicpods.app/donate/">
          {t("button_donate")}
        </PanelSocialButton>
      </PanelSection>
    </div>
  );
};

export default definePlugin(() => {
  initI18n();
  const overlayState = new StateNumber(0);
  const overlayOpacityState = new StateNumber(1);
  routerHook.addGlobalComponent("BlackOverlay", () => (<BlackOverlay state={overlayState} opacityState={overlayOpacityState} />));
  return {
    title: <div className={staticClasses.Title}>MagicBlack</div>,
    content: <Content overlayModeState={overlayState} overlayOpacityState={overlayOpacityState} />,
    icon: <LogoIcon />,
    onDismount() {
      routerHook.removeRoute("/decky-plugin-test");
      routerHook.removeGlobalComponent("BlackOverlay");
    },
  };
});
