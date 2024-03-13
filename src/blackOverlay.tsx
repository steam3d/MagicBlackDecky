import { Router, findModuleChild } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { ULKeys, ULUpperKeys, isPressed } from "./keys";

enum UIComposition {
    Hidden = 0,
    Notification = 1,
    Overlay = 2,
    Opaque = 3,
    OverlayKeyboard = 4,
}

const useUIComposition: (composition: UIComposition) => void = findModuleChild(
    (m) => {
        if (typeof m !== "object") return undefined;
        for (let prop in m) {
            if (
                typeof m[prop] === "function" &&
                m[prop].toString().includes("AddMinimumCompositionStateRequest") &&
                m[prop].toString().includes("ChangeMinimumCompositionStateRequest") &&
                m[prop].toString().includes("RemoveMinimumCompositionStateRequest") &&
                !m[prop].toString().includes("m_mapCompositionStateRequests")
            ) {
                return m[prop];
            }
        }
    }
);

let globalVisibility = false;
export const BlackOverlay: VFC = () => {
    const [visible, setVisible] = useState(false);
    useUIComposition(visible ? UIComposition.Overlay : UIComposition.Hidden);

    let keyPressingTime = Date.now();
    let keyPressed = false;
    let qamPressed = false;

    useEffect(() => {
        const input_register = window.SteamClient.Input.RegisterForControllerStateChanges(
            (changes: any[]) => {
                for (const inputs of changes) {
                    if (isPressed(ULUpperKeys.QAM, inputs.ulUpperButtons) && isPressed(ULKeys.SELECT, inputs.ulButtons)) {
                        if (keyPressed != true && Date.now() - keyPressingTime > 350) {
                            (Router as any).DisableHomeAndQuickAccessButtons();
                            keyPressingTime = Date.now();
                            keyPressed = true;
                            qamPressed = true;
                            globalVisibility = !globalVisibility;
                            setVisible(globalVisibility);
                        }
                    }
                    else {
                        if (qamPressed != false && !isPressed(ULUpperKeys.QAM, inputs.ulUpperButtons)){
                            qamPressed = false;
                            setTimeout(() => {
                                (Router as any).EnableHomeAndQuickAccessButtons();
                                //console.log("Enable QAM");
                            }, 350);                                                  
                        }
                        if (keyPressed != false) {
                            //console.log("Button release");                                
                            keyPressed = false;
                        }
                    }
                }
            }
        );
        return () => {
            input_register.unregister();
        };
    }, []);


    return (
        <>
            {visible &&
                <div style={{
                    height: "100vh",
                    width: "100vw",
                    background: "#000000",
                    opacity: 1,
                    zIndex: 7002,
                    position: "fixed",
                }}
                />
            }
        </>
    );
}
