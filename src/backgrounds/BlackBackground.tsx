import { FC } from "react";
import { useUIComposition, UIComposition } from "../uiComposition";
import { clampOpacity } from "../utils/opacity";

type BlackBackgroundProps = {
  allowTouch: boolean;
  opacity: number;
};

export const BlackBackground: FC<BlackBackgroundProps> = ({ allowTouch, opacity }) => {
  useUIComposition(allowTouch ? UIComposition.Notification : UIComposition.Overlay);
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#000000",
        opacity: clampOpacity(opacity),
        zIndex: 7002,
        position: "fixed",
        pointerEvents: allowTouch ? "none" : "auto",
      }}
    />
  );
};
