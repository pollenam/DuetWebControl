<template>
  <div class="v-toolbar-pollen-item">
    <v-icon small class="mr-1">mdi-lock-outline</v-icon> {{ $t('panel.doors.caption') }}

    <v-switch :value="state.doorsLocked" hide-details="'auto'" :loading="sendingCode" :color="'success'" @change="togglePower" class="ml-2" :disabled="uiFrozen">
    </v-switch>
  </div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['state'])
	},
	data() {
		return {
			sendingCode: false
		}
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
