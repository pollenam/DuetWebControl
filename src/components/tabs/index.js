'use strict'

import Vue from 'vue'

import SettingsGeneralTab from './SettingsGeneralTab.vue'
import SettingsMachineTab from './SettingsMachineTab.vue'

import SettingsGeneralTabPollen from './SettingsGeneralTabPollen.vue'


import PluginsExternalTab from './PluginsExternalTab.vue'
import PluginsIntegratedTab from './PluginsIntegratedTab.vue'

Vue.use(SettingsGeneralTab)
Vue.use(SettingsGeneralTabPollen)
Vue.use(SettingsMachineTab)

Vue.component('plugins-external-tab', PluginsExternalTab);
Vue.component('plugins-integrated-tab', PluginsIntegratedTab);

