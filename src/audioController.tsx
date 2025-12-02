export interface Device {
    id: number;
    sName: string;
    bHasOutput: boolean;
    bIsDefaultOutputDevice: boolean;
    flOutputVolume: number;
    bHasInput: boolean;
    bIsDefaultInputDevice: boolean;
    flInputVolume: number;
}

export interface AudioDeviceInfo {
    activeOutputDeviceId: number;
    activeInputDeviceId: number;
    overrideOutputDeviceId: number;
    overrideInputDeviceId: number;
    vecDevices: Device[];
}

export class AudioController {
    private readonly isInputDevice: boolean;
    private savedVolume = -1;

    constructor(isInputDevice = false) {
        this.isInputDevice = isInputDevice;
    }

    private async getActiveDeviceInfo(): Promise<{ deviceId: number | null; volume: number | null } | null> {
        if (!SteamClient?.System?.Audio?.GetDevices) {
            return null;
        }

        try {
            const devices = (await SteamClient.System.Audio.GetDevices()) as AudioDeviceInfo | null;
            if (!devices) {
                return null;
            }

            let deviceId: number | null | undefined = null;
            if (this.isInputDevice) {
                deviceId = devices.activeInputDeviceId;
            } else {
                deviceId = devices.activeOutputDeviceId;
            }
            deviceId = deviceId ?? null;

            const device = devices.vecDevices?.find((dev) => dev.id === deviceId);
            let volume: number | null = null;
            if (device) {
                const volumeValue = this.isInputDevice ? device.flInputVolume : device.flOutputVolume;
                if (typeof volumeValue === "number") {
                    volume = volumeValue;
                }
            }
            return { deviceId, volume };
        } catch (error) {
            const label = this.isInputDevice ? "microphone" : "speakers";
            console.error(`MagicBlack: Failed to read ${label} info`, error);
            return null;
        }
    }


    private async setVolume(deviceId: number, volume: number){
        if (!SteamClient?.System?.Audio?.SetDeviceVolume) {
            return;
        }

        try {
            const channel = this.isInputDevice ? 0 : 1;
            await SteamClient.System.Audio.SetDeviceVolume(deviceId, channel, volume);
        } catch (error) {
            const label = this.isInputDevice ? "microphone" : "speakers";
            console.error(`MagicBlack: Failed to mute ${label}`, error);
        }        
    }

    async mute() {
        const info = await this.getActiveDeviceInfo();
        if (info === null || info.deviceId === null || info.volume === null)
            return;

        if (info.volume > 0) {
            this.savedVolume = info.volume;
        }

        await this.setVolume(info.deviceId, 0);
    }

    async restore() {

        const restoreVolume = this.savedVolume;
        this.savedVolume = -1;
        
        if (restoreVolume === -1) {
            return;
        }

        const info = await this.getActiveDeviceInfo();
        if (info === null || info.deviceId === null || info.volume === null || info.volume !== 0)
            return;

        await this.setVolume(info.deviceId, restoreVolume);        
    }
}
