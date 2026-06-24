import {App, PluginSettingTab, SettingDefinitionItem} from 'obsidian';
import CoverImage from './CoverImage';


export class CoverImageSettingsTab extends PluginSettingTab {
    plugin: CoverImage;

    constructor(app: App, plugin: CoverImage) {
        super(app, plugin);
        this.plugin = plugin;
        this.icon = 'image';
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            {
                name: 'Property name',
                desc: 'Change the property name from which the cover is read',
                render: (setting) => {
                    setting.addText((text) =>
                        text.setValue(this.plugin.settings.propertyName)
                            .onChange(async (value) => {
                                this.plugin.settings.propertyName = value;
                                this.plugin.updateLeaves();
                                await this.plugin.saveSettings();
                            })
                    )
                }
            }
        ];
    }
}