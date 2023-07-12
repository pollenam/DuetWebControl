<template>
  <div class="v-toolbar-pollen-item">
    <v-icon small class="mr-1">mdi-lock-outline</v-icon>
    <span class="hidden-md-and-down">
      {{ $t('panel.doors.caption') }}
    </span>

    <v-switch :value="doors" hide-details="'auto'" :loading="sendingCode" :color="'success'" :dark="!hidedoors || homingSequence" @change="togglePower" class="ml-2" :disabled="uiFrozen || !hidedoors || homingSequence">
    </v-switch>
  </div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['state']),
		...mapState('machine/model', {
      		doors: state => state.global.DOORS_CLOSED,
			hidedoors: state => state.global.DOORS_PRESENT,
			homingSequence: state => state.global.HOMING_SEQUENCE_RUNNING,
		}),
	},
	data() {
		return {
			sendingCode: false
		}
	},
	shouldShowDoors() {
		return "'off disabled'";

    },
	methods: {
		...mapActions('machine', ['runFile']),
		async togglePower(state) {
			if (!this.sendingCode) {
				this.sendingCode = true;
				try {
					await this.runFile(state ? '/macros/HONEYPRINT/Doors_On' : '/macros/HONEYPRINT/Doors_Off');
				} catch (e) {
					// handled before we get here
				}
				this.sendingCode = false;
			}
		}
	}
}
</script>
