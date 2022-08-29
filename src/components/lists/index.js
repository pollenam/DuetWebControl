'use strict'

import Vue from 'vue'

import BaseFileList from './BaseFileList.vue'
import EventList from './EventList.vue'
import FilamentFileList from './FilamentFileList.vue'
import JobFileList from './JobFileList.vue'
import MacroFileList from './MacroFileList.vue'
import MacroList from './MacroList.vue'
import SystemFileList from './SystemFileList.vue'

import MacroListPollen from './MacroListPollen.vue'
import MacroFileListPollen from './MacroFileListPollen.vue'
import BaseFileListPollen from './BaseFileListPollen.vue'

Vue.component('base-file-list', BaseFileList)
Vue.component('event-list', EventList)
Vue.component('filament-file-list', FilamentFileList)
Vue.component('job-file-list', JobFileList)
Vue.component('macro-file-list', MacroFileList)
Vue.component('macro-list', MacroList)
Vue.component('system-file-list', SystemFileList)

Vue.component('macro-list-pollen', MacroListPollen)
Vue.component('macro-file-list-pollen', MacroFileListPollen)
Vue.component('base-file-list-pollen', BaseFileListPollen)
