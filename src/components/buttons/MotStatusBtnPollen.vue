<template>
  <div class="v-toolbar-pollen-item">
    <v-icon small class="mr-1">mdi-engine-outline</v-icon>
    <span class="hidden-md-and-down">
      {{ $t('panel.motors.caption') }}
    </span>

    <v-switch :value="motors" hide-details="'auto'" :loading="sendingCode" :dark="homingSequence || !state.atxPower" :color="'success'" @change="toggleMotor" class="ml-2" :disabled="uiFrozen || homingSequence || !state.atxPower">
    </v-switch>
  </div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', {
			homingSequence: state => state.global.HOMING_SEQUENCE_RUNNING,
			motors: state => state.global.MOTORS_ENABLED,
		}),
		...mapState('machine/model', ['state']),
	},
	data() {
		return {
			sendingCode: false,
		}
	},
	methods: {
		...mapActions('machine', ['runFile', 'sendCode']),
		async toggleMotor(state) {
			if (!this.sendingCode) {
				this.sendingCode = true;
				try {
					await this.runFile(state ? '/macros/HONEYPRINT/Motor_Enable' : '/macros/HONEYPRINT/Motor_Disable');
				} catch (e) {
					// handled before we get here
				}
				this.sendingCode = false;
			}
		}
	}
}
</script>
