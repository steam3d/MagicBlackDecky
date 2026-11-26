import { findModuleExport, findVar } from "@decky/ui";

export enum UIComposition {
    Hidden = 0,
    Notification = 1,
    Overlay = 2,
    Opaque = 3,
    OverlayKeyboard = 4,
    OverlayQAM = 5,
    OverlayKeyboard1 = 6,
}

type UICompositionHook = (
    composition: UIComposition,
    requestName?: string,
) => { releaseComposition: () => void };

// Steam's composition hook is an internal module-scope variable. Decky UI 5's
// resolver exposes those through findVar; findModuleChild only searches public
// module exports and no longer sees this hook after the Steam client update.
const isUICompositionHook = (candidate: unknown): candidate is UICompositionHook => {
    if (typeof candidate !== "function") return false;

    const source = candidate.toString();
    return (
        source.includes("AddMinimumCompositionStateRequest") &&
        source.includes("ChangeMinimumCompositionStateRequest") &&
        source.includes("RemoveMinimumCompositionStateRequest") &&
        !source.includes("m_mapCompositionStateRequests")
    );
};

const resolvedUICompositionHook =
    findVar(isUICompositionHook) ?? findModuleExport(isUICompositionHook);
let didWarnAboutMissingCompositionHook = false;

export const useUIComposition = (composition: UIComposition): void => {
    if (!isUICompositionHook(resolvedUICompositionHook)) {
        if (!didWarnAboutMissingCompositionHook) {
            didWarnAboutMissingCompositionHook = true;
            console.error("[MagicBlack] Steam UI composition hook was not found");
        }
        return;
    }

    resolvedUICompositionHook(composition, "MagicBlack");
};
