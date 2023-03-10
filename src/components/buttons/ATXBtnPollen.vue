<template>
  <div class="v-toolbar-pollen-item">
    <v-icon small class="mr-1">mdi-power</v-icon>
    <span class="hidden-md-and-down">
      {{ $t('panel.atx.caption') }}
    </span>

    <v-switch :value="state.atxPower" hide-details="'auto'" :loading="sendingCode" :color="'success'" @change="togglePower" class="ml-2" :disabled="uiFrozen">
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
					await this.runFile(state ? '/macros/HONEYPRINT/VPower_On' : '/macros/HONEYPRINT/VPower_Off');
				} catch (e) {
					// handled before we get here
				}
				this.sendingCode = false;
			}
		}
	}
}
</script>
