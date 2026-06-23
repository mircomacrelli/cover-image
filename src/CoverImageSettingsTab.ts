import {App, PluginSettingTab, SettingDefinitionItem} from 'obsidian';
import CoverImage from './CoverImage';
import {DEFAULT_PROPERTY} from './constants';


export class CoverImageSettingsTab extends PluginSettingTab {
    constructor(app: App, plugin: CoverImage) {
        super(app, plugin);
        this.icon = 'image';
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        return [
            {
                heading: 'Note',
                type: 'group',
                items: [
                    {
                        name: 'Property name',
                        desc: 'Change the property name from which the cover is read',
                        control: {
                            type: 'text',
                            key: 'propertyName',
                            defaultValue: DEFAULT_PROPERTY,
                            validate: (value) =>
                                /^[a-zA-Z][a-zA-Z0-9_-]*[a-zA-Z]$/.test(value) ?  undefined : 'Must be a valid property name'
                        }
                    }
                ]
            }
        ];
    }
}