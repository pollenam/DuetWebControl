'use strict'

import i18n from '../../i18n'
import Vue from 'vue';

import { registerRoute } from '../../routes';
import { registerPluginContextMenuItem, ContextMenuType } from '../index.js';
import { registerPluginData, PluginDataType } from '../../store';
import Gauge from './Gauge/gauge.vue';
import ColorPicker from './ColorPicker.vue';
import FSOverlay from './FSOverlay.vue'
import GCodeViewer from './GCodeViewer.vue';

Vue.component('gcodeviewer-gauge', Gauge);
Vue.component('gcodeviewer-color-picker', ColorPicker);
Vue.component('fs-overlay', FSOverlay);

registerRoute(GCodeViewer, {
  Job: {
    GCodeViewer: {
      icon: 'mdi-file-eye-outline',
      caption: 'plugins.gcodeViewer.caption',
      path: '/Job/GCodeViewer',
    },
  },
});

registerPluginContextMenuItem(() => i18n.t('plugins.gcodeViewer.view3D'), '/Job/GCodeViewer', 'mdi-file-eye-outline', 'view-3d-model', ContextMenuType.JobFileList);
registerPluginData('GCodeViewer', PluginDataType.machineCache, 'toolColors', ['#00FFFF', '#FF00FF', '#FFFF00', '#000000', '#FFFFFF']);
registerPluginData('GCodeViewer', PluginDataType.machineCache, 'useHQRendering', false);
registerPluginData('GCodeViewer', PluginDataType.machineCache, 'useSpecular', true);
