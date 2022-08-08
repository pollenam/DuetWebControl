<template>
  <div class="v-toolbar-pollen-item">
    <v-icon small class="mr-1">mdi-power</v-icon> {{ $t('panel.atx.caption') }}

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
		...mapActions('machine', ['sendCode']),
		async togglePower(state) {
			if (!this.sendingCode) {
				this.sendingCode = true;
				try {
					await this.sendCode(state ? 'M80' : 'M81');
				} catch (e) {
					// handled before we get here
				}
				this.sendingCode = false;
			}
		}
	}
}
</script>
