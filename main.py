# The decky plugin module is located at decky-loader/plugin
# For easy intellisense checkout the decky-loader code one directory up
# or add the `decky-loader/plugin` path to `python.analysis.extraPaths` in `.vscode/settings.json`
from mp.settings import Settings
import decky

class Plugin:
    async def load_setting(self, key):
        return self.settings.load(key)

    async def save_setting(self, key, value):
        self.settings.save(key, value)
    
    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        self.settings = Settings(decky.DECKY_PLUGIN_SETTINGS_DIR)
        pass

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        pass

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        pass