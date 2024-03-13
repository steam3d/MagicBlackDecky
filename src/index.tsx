import "./i18n"
import {
  definePlugin,
  DialogButton,
  Navigation,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { Trans } from 'react-i18next'
import { BlackOverlay } from "./blackOverlay";
import { LogoIcon, Shortcut } from "./icons";
import { t } from 'i18next';


const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  return (
    <div>
      <PanelSection>
        <PanelSectionRow>
          <div className={staticClasses.Text} style={{ paddingLeft: "0px", paddingRight: "0px" }}>
            <Trans
              i18nKey="help_message"
              components={{ Shortcut: <Shortcut /> }}
            />
          </div>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title={t("more_plugins")}>
        <DialogButton
          onClick={() => {
            Navigation.CloseSideMenus();
            Navigation.NavigateToExternalWeb("https://magicpods.app/steamdeck/");
          }}
        >
          MagicPods
        </DialogButton>
      </PanelSection>
    </div>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  serverApi.routerHook.addGlobalComponent("BlackOverlay", BlackOverlay);

  return {
    title: <div className={staticClasses.Title}>MagicBlack</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <LogoIcon />,
    onDismount() {
      serverApi.routerHook.removeRoute("/decky-plugin-test");
      serverApi.routerHook.removeGlobalComponent("BlackOverlay");
    },
  };
});
