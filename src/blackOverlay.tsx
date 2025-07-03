import { findModuleChild } from "decky-frontend-lib";
import { VFC, useEffect, useState } from "react";
import { Button, Input } from "./input";

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

export class State {
    private state = false;
    private onStateChangedListeners: Array<(b: boolean) => void> = [];

    private opacity = 1;
    private onOpacityChangedListeners: Array<(o: number) => void> = [];

    private oled = false;
    private onOledChangedListeners: Array<(l: boolean) => void> = [];
    onStateChanged(callback: (b: boolean) => void) {
        this.onStateChangedListeners.push(callback);
    }

    offStateChanged(callback: (b: boolean) => void) {
        const index = this.onStateChangedListeners.indexOf(callback);
        if (index !== -1) {
            this.onStateChangedListeners.splice(index, 1);
        }
    }

    SetState(b: boolean) {
        if (this.state === b)
            return;

        this.state = b;
        this.onStateChangedListeners.forEach(callback => {
            callback(b);
        });
    }

    GetState(): boolean {
        return this.state;
    }

        onOledChanged(callback: (l: boolean) => void) {
        this.onOledChangedListeners.push(callback);
    }

    offOledChanged(callback: (l: boolean) => void) {
        const index = this.onOledChangedListeners.indexOf(callback);
        if (index !== -1) {
            this.onOledChangedListeners.splice(index, 1);
        }
    }

    SetOled(l: boolean) {
        if (this.oled === l)
            return;

        this.oled = l;
        this.onOledChangedListeners.forEach(callback => {
            callback(l);
        });
    }

    GetOled(): boolean {
        return this.oled;
    }
    SetOpacity(o: number) {
        const clamped = Math.max(0, Math.min(1, o));
        if (this.opacity === clamped) return;
        this.opacity = clamped;
        this.onOpacityChangedListeners.forEach(cb => cb(this.opacity));
    }
    GetOpacity(): number {
        return this.opacity;
    }
    onOpacityChanged(callback: (o: number) => void) {
        this.onOpacityChangedListeners.push(callback);
    }
    offOpacityChanged(callback: (o: number) => void) {
        const index = this.onOpacityChangedListeners.indexOf(callback);
        if (index !== -1) {
            this.onOpacityChangedListeners.splice(index, 1);
        }
    }
}

export const BlackBackground: VFC<{ opacity: number }> = ({ opacity }) => {
    useUIComposition(UIComposition.Notification);
    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            background: "#000000",
            opacity: opacity,
            zIndex: 7002,
            position: "fixed",
            pointerEvents: "none"
        }} />
    )
}

export const BlackOverlay: VFC<{ state: State }> = ({ state }) => {
    const [visible, setVisible] = useState(false);
    const [opacity, setOpacity] = useState(state.GetOpacity());

    useEffect(() => {
        state.onStateChanged(onStateChanged);
        state.onOpacityChanged(onOpacityChanged);
        const suspend_register = SteamClient.User.RegisterForPrepareForSystemSuspendProgress((() => {
            state.SetState(false);
        }));
        const input = new Input([Button.QUICK_ACCESS_MENU, Button.START]);
        input.onShortcutPressed(onShortcutPressed);
        return () => {
            state.offStateChanged(onStateChanged);
            state.offOpacityChanged(onOpacityChanged);
            suspend_register.unregister();
            input.offShortcutPressed(onShortcutPressed);
            input.unregister();
        };
    }, []);

    const onShortcutPressed = () => {
        state.SetState(!state.GetState());
    }

    const onStateChanged = (b: boolean) => {
        setVisible(b);
    }

    const onOpacityChanged = (o: number) => {
        setOpacity(o);
    };

    return (
        <>
            {visible &&
                <BlackBackground opacity={opacity} />
            }
        </>
    );
}
