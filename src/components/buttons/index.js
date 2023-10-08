'use strict'

import Vue from 'vue'

import CodeBtn from './CodeBtn.vue'
import ConnectBtn from './ConnectBtn.vue'
import EmergencyBtn from './EmergencyBtn.vue'
import SDCardBtn from './SDCardBtn.vue'
import UploadBtn from './UploadBtn.vue'

import ATXBtnPollen from './ATXBtnPollen.vue'
import MotStatusBtnPollen from './MotStatusBtnPollen.vue'
import DoorsBtnPollen from './DoorsBtnPollen.vue'
import ZLimitsBtnPollen from './ZLimitsBtnPollen.vue'

Vue.component('code-btn', CodeBtn)
Vue.component('connect-btn', ConnectBtn)
Vue.component('emergency-btn', EmergencyBtn)
Vue.component('sd-card-btn', SDCardBtn)
Vue.component('upload-btn', UploadBtn)

Vue.component('atx-btn-pollen', ATXBtnPollen)
Vue.component('mot-status-btn-pollen', MotStatusBtnPollen)
Vue.component('doors-btn-pollen', DoorsBtnPollen)
Vue.component('zlimits-btn-pollen', ZLimitsBtnPollen)