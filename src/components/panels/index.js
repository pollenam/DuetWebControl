'use strict'

import Vue from 'vue'

import ATXPanel from './ATXPanel.vue'
import ExtrudePanel from './ExtrudePanel.vue'
import ExtrusionFactorsPanel from './ExtrusionFactorsPanel.vue'
import FanPanel from './FanPanel.vue'
import FansPanel from './FansPanel.vue'
import MovementPanel from './MovementPanel.vue'
import JobControlPanel from './JobControlPanel.vue'
import JobDataPanel from './JobDataPanel.vue'
import JobEstimationsPanel from './JobEstimationsPanel.vue'
import JobInfoPanel from './JobInfoPanel.vue'
import SettingsAboutPanel from './SettingsAboutPanel.vue'
import SettingsAppearancePanel from './SettingsAppearancePanel.vue'
import SettingsCommunicationPanel from './SettingsCommunicationPanel.vue'
import SettingsElectronicsPanel from './SettingsElectronicsPanel.vue'
import SettingsGeneralPanel from './SettingsGeneralPanel.vue'
import SettingsListItemsPanel from './SettingsListItemsPanel.vue'
import SettingsMachinePanel from './SettingsMachinePanel.vue'
import SettingsNotificationsPanel from './SettingsNotificationsPanel.vue'
import SettingsWebcamPanel from './SettingsWebcamPanel.vue'
import SpeedFactorPanel from './SpeedFactorPanel.vue'
import StatusPanel from './StatusPanel.vue'
import ToolsPanel from './ToolsPanel.vue'
import WebcamPanel from './WebcamPanel.vue'
import ZBabystepPanel from './ZBabystepPanel.vue'
import FFFContainerPanel from './FFFContainerPanel.vue'
import FFFDashboardPanel from './FFFDashboardPanel.vue'
import CNCAxesPosition from './CNCAxesPosition.vue'
import CNCContainerPanel from './CNCContainerPanel.vue'
import CNCMovementPanel from './CNCMovementPanel.vue'
import CNCDashboardPanel from './CNCDashboardPanel.vue'
import SpindleSpeedPanel from './SpindleSpeedPanel'

import FFFDashboardPanelPollen from './FFFDashboardPanelPollen.vue'
import JobControlPanelPollen from './JobControlPanelPollen.vue'
import HighTemperaturePanelPollen from './HighTemperaturePanelPollen.vue'
import LightFactorPanelPollen from './LightFactorPanelPollen.vue'
import BuildSurfacePanelPollen from './BuildSurfacePanelPollen.vue'
import ExtruderPanelPollen from './ExtruderPanelPollen.vue'
import SettingsGeneralPanelPollen from './SettingsGeneralPanelPollen.vue'
import SettingsAboutPanelPollen from './SettingsAboutPanelPollen.vue'
import SettingsAppearancePanelPollen from './SettingsAppearancePanelPollen.vue'
import SettingsElectronicsPanelPollen from './SettingsElectronicsPanelPollen.vue'

Vue.component('atx-panel', ATXPanel)
Vue.component('extrude-panel', ExtrudePanel)
Vue.component('extrusion-factors-panel', ExtrusionFactorsPanel)
Vue.component('fan-panel', FanPanel)
Vue.component('fans-panel', FansPanel)
Vue.component('job-control-panel', JobControlPanel)
Vue.component('job-data-panel', JobDataPanel)
Vue.component('job-estimations-panel', JobEstimationsPanel)
Vue.component('job-info-panel', JobInfoPanel)
Vue.component('movement-panel', MovementPanel)
Vue.component('settings-about-panel', SettingsAboutPanel)
Vue.component('settings-apperance-panel', SettingsAppearancePanel)
Vue.component('settings-communication-panel', SettingsCommunicationPanel)
Vue.component('settings-electronics-panel', SettingsElectronicsPanel)
Vue.component('settings-general-panel', SettingsGeneralPanel)
Vue.component('settings-machine-panel', SettingsMachinePanel)
Vue.component('settings-list-items-panel', SettingsListItemsPanel)
Vue.component('settings-notifications-panel', SettingsNotificationsPanel)
Vue.component('settings-webcam-panel', SettingsWebcamPanel)
Vue.component('status-panel', StatusPanel)
Vue.component('speed-factor-panel', SpeedFactorPanel)
Vue.component('tools-panel', ToolsPanel)
Vue.component('webcam-panel', WebcamPanel)
Vue.component('z-babystep-panel', ZBabystepPanel)
Vue.component('cnc-axes-position', CNCAxesPosition)
Vue.component('fff-container-panel', FFFContainerPanel)
Vue.component('fff-dashboard-panel', FFFDashboardPanel)
Vue.component('cnc-container-panel', CNCContainerPanel)
Vue.component('cnc-movement-panel', CNCMovementPanel)
Vue.component('cnc-dashboard-panel', CNCDashboardPanel)
Vue.component('spindle-speed-panel', SpindleSpeedPanel)

Vue.component('job-control-panel-pollen', JobControlPanelPollen)
Vue.component('high-temperature-panel-pollen', HighTemperaturePanelPollen)
Vue.component('fff-dashboard-pollen-panel', FFFDashboardPanelPollen)
Vue.component('light-factor-pollen-panel', LightFactorPanelPollen)
Vue.component('build-surface-pollen-panel', BuildSurfacePanelPollen)
Vue.component('extruder-panel-pollen', ExtruderPanelPollen)
Vue.component('settings-general-pollen-panel', SettingsGeneralPanelPollen)
Vue.component('settings-about-pollen-panel', SettingsAboutPanelPollen)
Vue.component('settings-apperance-pollen-panel', SettingsAppearancePanelPollen)
Vue.component('settings-electronics-pollen-panel', SettingsElectronicsPanelPollen)
