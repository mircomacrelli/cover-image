import {App, debounce, Debouncer, PluginSettingTab, Setting, SettingDefinitionItem, TextComponent} from 'obsidian';
import CoverImage from './CoverImage';


export class CoverImageSettingsTab extends PluginSettingTab {
    private plugin: CoverImage;
    private readonly updatePropertyName: Debouncer<[value: string], Promise<void>>;

    constructor(app: App, plugin: CoverImage) {
        super(app, plugin);
        this.plugin = plugin;
        this.icon = 'image';

        this.updatePropertyName = debounce(async (value: string): Promise<void> => {
            this.plugin.settings.propertyName = value;
            await this.plugin.saveSettings();
            this.plugin.updateLeaves();
        }, 500);
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            {
                name: 'Property name',
                desc: 'Change the property name from which the cover is read',
                render: (setting: Setting): void => {
                    setting.addText((text: TextComponent): TextComponent =>
                        text.setValue(this.plugin.settings.propertyName)
                            .onChange(async (value: string): Promise<void> => {
                                this.updatePropertyName(value);
                            })
                    );
                }
            }
        ];
    }
}