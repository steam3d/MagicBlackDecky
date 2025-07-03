import "./i18n"
import {
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  ToggleField,
  Navigation,
  SliderField, 
} from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { Trans } from 'react-i18next'
import { t } from 'i18next';
import { BlackOverlay, State } from "./blackOverlay";
import { LogoIcon } from "./icons";
import { QUICK_ACCESS_MENU, START, WARNING } from "./ButtonIcons";


const Content: VFC<{ serverAPI: ServerAPI, state: State }> = ({ state }) => {

  const [enableOverlay, setEnableOverlay] = useState<boolean>(false);
  const [isFullBrightness, setIsFullBrightness] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(state.GetOpacity());

  const handleToggleFullBrightness = (enable: boolean) => {
    setIsFullBrightness(enable);
    if (enable) {
      SteamClient.System.Display.SetBrightness(1.0);

    }
    state.SetOled(enable);
  }

  useEffect(() => {
    setEnableOverlay(state.GetState());
    setIsFullBrightness(state.GetOled());
    setOpacity(state.GetOpacity());
    state.onStateChanged(onStateChanged);
    state.onOledChanged(onOledChanged);
    state.onOpacityChanged(onOpacityChanged);
    return () => {
      state.offStateChanged(onStateChanged);
      state.offOledChanged(onOledChanged);
      state.offOpacityChanged(onOpacityChanged);
    };
  }, []);

  const onStateChanged = (b: boolean) => {
    setEnableOverlay(b);
  }

  const onOledChanged = (l: boolean) => {
    setIsFullBrightness(l);
  };
  
  const onOpacityChanged = (o: number) => {
    setOpacity(o);
  };

  return (
    <div>
      <PanelSection>
        <PanelSectionRow>
          <div className={staticClasses.Text} style={{ paddingLeft: "0px", paddingRight: "0px" }}>
            <Trans
              i18nKey="help_message"
              components={{ Key1: <QUICK_ACCESS_MENU style={{ height: "24px", width: "auto", marginBottom: "-6.5px" }} />, Key2: <START style={{ height: "24px", width: "auto", marginBottom: "-6.5px" }} /> }}
            />
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ToggleField checked={enableOverlay}
            label={t("toggle_enableoverlay_label")}
            description={<Trans i18nKey="toggle_enableoverlay_description" components={{ Key: <QUICK_ACCESS_MENU style={{ height: "18px", width: "auto", marginBottom: "-5px" }} /> }} />} onChange={(b) => { state.SetState(b); Navigation.CloseSideMenus(); }} />
        </PanelSectionRow>
        <PanelSection>
          <PanelSectionRow>
            <ToggleField
              checked={isFullBrightness}
              label={t("oled_saver_label")}
              description={<Trans i18nKey="oled_saver_description" />}
              onChange={handleToggleFullBrightness}
            />
          </PanelSectionRow>
          {isFullBrightness && (
            <PanelSectionRow>
              <SliderField
                label={t("overlay_opacity_label")}
                description={
                  <Trans
                    i18nKey="overlay_opacity_description"
                  />
                }
                value={opacity}
                min={0.0}
                max={1.0}
                step={0.05}
                showValue={true}
                onChange={(val: number) => {
                  state.SetOpacity(val);
            }}
          />
        </PanelSectionRow>
        )}
        </PanelSection>
      <PanelSectionRow>
          <div className={staticClasses.Label} style={{ paddingLeft: "0px", paddingRight: "0px" }}>
            <Trans
                i18nKey="warning_message"
                components={{ Key1: <WARNING style={{ height: "16px", width: "auto", marginBottom: "-3.5px", paddingRight: "0px" }} />}}
              />
          </div>
      </PanelSectionRow>
      </PanelSection>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  const state = new State();
  serverApi.routerHook.addGlobalComponent("BlackOverlay", () => (<BlackOverlay state={state} />));

  return {
    title: <div className={staticClasses.Title}>MagicBlack</div>,
    content: <Content serverAPI={serverApi} state={state} />,
    icon: <LogoIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
      serverApi.routerHook.removeGlobalComponent("BlackOverlay");
    },
  };
});
