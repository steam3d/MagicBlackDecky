import { FC, useCallback, useEffect, useRef, useState } from "react";
//import { Button, Input } from "./input";
import { loadBooleanSetting, loadNumberSetting } from "./settings";
import { AudioController } from "./audioController";
import { useCatchAllGamepad } from "./hooks/useCatchAllGamepad";
import { useResumeFromSuspendNotification } from "./hooks/useResumeFromSuspendNotification";
import { StateNumber } from "./state";
import { BlackBackground } from "./backgrounds/BlackBackground";
import { ScreensaverBackground, ScreensaverOverlay } from "./backgrounds/ScreensaverBackground";
import { clampOpacity } from "./utils/opacity";

const loadOverlaySettings = async () => {
    const [allow_touch, mute_mic, mute_sound, off_anykey, off_upon_waking, overlay_opacity_response] = await Promise.all([
        loadBooleanSetting("allow_touch", false),
        loadBooleanSetting("mute_mic", false),
        loadBooleanSetting("mute_sound", false),
        loadBooleanSetting("off_anykey", false),
        loadBooleanSetting("off_upon_waking", false),
        loadNumberSetting("overlay_opacity"),
    ]);
    const overlay_opacity = clampOpacity(overlay_opacity_response ?? 1);
    return { allow_touch, mute_mic, mute_sound, off_anykey, off_upon_waking, overlay_opacity };
};
export const BlackOverlay: FC<{ state: StateNumber; opacityState: StateNumber }> = ({ state, opacityState }: { state: StateNumber; opacityState: StateNumber }) => {
    const [visibleMode, setVisibleMode] = useState<number>(state.GetState());
    const [allowTouch, setAllowTouch] = useState<boolean>(false);
    const [opacity, setOpacity] = useState<number>(opacityState.GetState());
    const micControllerRef = useRef<AudioController>(new AudioController(true));
    const outputControllerRef = useRef<AudioController>(new AudioController());
    const stateChangeTokenRef = useRef(0);
    const delayedSubscriptionRef = useRef<number | null>(null); //Fixed issue where the user enables the black screen from the keyboard to avoid it turning off immediately.
    const { subscribe: captureGamepadInput, release: releaseGamepadCapture } = useCatchAllGamepad();
    const screensaverSurfaceRef = useRef<HTMLDivElement | null>(null);
    const { subscribe: subscribeResumeFromSuspend, release: releaseResumeFromSuspend } = useResumeFromSuspendNotification();

    const clearDelayedSubscription = useCallback(() => {
        if (delayedSubscriptionRef.current) {
            window.clearTimeout(delayedSubscriptionRef.current);
            delayedSubscriptionRef.current = null;
        }
    }, []);

    const stopAnyKeyCapture = useCallback(() => {
        clearDelayedSubscription();
        releaseGamepadCapture();
    }, [clearDelayedSubscription, releaseGamepadCapture]);

    const handleAnyGamepadEvent = useCallback(() => {
        console.log("Gamepad input captured");
        stopAnyKeyCapture();
        if (state.GetState() !== 0) {
            state.SetState(0);
        }
    }, [state, stopAnyKeyCapture]);

    const handleResumeFromSuspend = useCallback(() => {
        console.log("[MagicBlack] Resume from suspend notification received");
        releaseResumeFromSuspend();
        if (state.GetState() !== 0) {
            state.SetState(0);
        }
    }, [state, releaseResumeFromSuspend]);

    const scheduleAnyKeySubscription = useCallback(() => {
        clearDelayedSubscription();
        delayedSubscriptionRef.current = window.setTimeout(() => {
            delayedSubscriptionRef.current = null;
            captureGamepadInput(handleAnyGamepadEvent);
        }, 200);
    }, [captureGamepadInput, clearDelayedSubscription, handleAnyGamepadEvent]);

    const applyOverlaySettings = useCallback(async (token: number, mode: number) => {
        const settings = await loadOverlaySettings();
        if (token !== stateChangeTokenRef.current) {
            return;
        }
        setAllowTouch(settings.allow_touch);
        if (token == stateChangeTokenRef.current) {
            setVisibleMode(mode);
        }
        const overlayOpacity = clampOpacity(settings.overlay_opacity);
        opacityState.SetState(overlayOpacity);
        setOpacity(overlayOpacity);

        if (settings.off_anykey) {
            scheduleAnyKeySubscription();
        } else {
            stopAnyKeyCapture();
        }

        if (settings.off_upon_waking) {
            subscribeResumeFromSuspend(handleResumeFromSuspend);
        } else {
            releaseResumeFromSuspend();
        }

        if (token !== stateChangeTokenRef.current) {
            return;
        }
        if (settings.mute_mic) {
            await micControllerRef.current.mute();
        } else {
            await micControllerRef.current.restore();
        }
        if (token !== stateChangeTokenRef.current) {
            return;
        }
        if (settings.mute_sound) {
            await outputControllerRef.current.mute();
        } else {
            await outputControllerRef.current.restore();
        }
    }, [scheduleAnyKeySubscription, stopAnyKeyCapture, opacityState, subscribeResumeFromSuspend, releaseResumeFromSuspend, handleResumeFromSuspend]);

    const onStateChanged = useCallback((mode: number) => {
        const token = stateChangeTokenRef.current + 1;
        stateChangeTokenRef.current = token;

        if (mode === 1 || mode === 2) {
            void applyOverlaySettings(token, mode);
            return;
        }

        stopAnyKeyCapture();
        releaseResumeFromSuspend();
        setVisibleMode(0);
        void micControllerRef.current.restore();
        void outputControllerRef.current.restore();
    }, [applyOverlaySettings, stopAnyKeyCapture, releaseResumeFromSuspend]);

    //Due september steam client update we cannot use shortcuts anymore
    //const onShortcutPressed = () => {
    //    state.SetState(state.GetState() === 1 ? 0 : 1);
    //}

    useEffect(() => {
        state.onStateChanged(onStateChanged);

        //const input = new Input([Button.QUICK_ACCESS_MENU, Button.START]);
        //input.onShortcutPressed(onShortcutPressed);
        return () => {
            state.offStateChanged(onStateChanged);
            //input.offShortcutPressed(onShortcutPressed);
            //input.unregister();
        };
    }, [state, onStateChanged]);

    useEffect(() => {
        return () => {
            stopAnyKeyCapture();
            releaseResumeFromSuspend();
            stateChangeTokenRef.current += 1;
            void micControllerRef.current.restore();
            void outputControllerRef.current.restore();
        };
    }, [stopAnyKeyCapture, releaseResumeFromSuspend]);

    useEffect(() => {
        const onOpacityChanged = (value: number) => {
            setOpacity(clampOpacity(value));
        };
        opacityState.onStateChanged(onOpacityChanged);
        return () => {
            opacityState.offStateChanged(onOpacityChanged);
        };
    }, [opacityState]);

    return (
        <>
            {visibleMode === 1 &&
                <BlackBackground allowTouch={allowTouch} opacity={opacity} />
            }
            {visibleMode === 2 &&
                <ScreensaverBackground ref={screensaverSurfaceRef} allowTouch={allowTouch} opacity={opacity}>
                    <ScreensaverOverlay surfaceRef={screensaverSurfaceRef} />
                </ScreensaverBackground>
            }
        </>
    );
}
