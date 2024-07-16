<template>
  <div v-if="doors" class="v-toolbar-pollen-item">
    <v-icon small class="mr-1">mdi-lock-outline</v-icon>
    <span class="hidden-md-and-down">
      {{ $t('panel.doors.caption') }}
    </span>

    <v-switch :value="doorsClosed" hide-details="'auto'" :loading="sendingCode" :color="'success'" :dark="!doors || homingSequence" @change="toggleDoors" class="ml-2" :disabled="uiFrozen || !doors || homingSequence">
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
      		doorsClosed: state => state.global.DOORS_CLOSED,
			doors: state => state.global.DOORS_PRESENT,
			homingSequence: state => state.global.HOMING_SEQUENCE_RUNNING,
		}),
	},
	data() {
		return {
			sendingCode: false
		}
	},
	methods: {
		...mapActions('machine', ['runFile']),
		async toggleDoors(state) {
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
