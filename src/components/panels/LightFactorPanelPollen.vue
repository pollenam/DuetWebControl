<template>
	<v-card :elevation="0">
		<v-card-title class="v-card__title--dense">
      <v-icon class="mr-2">mdi-vanish</v-icon>
      {{ $t('panel.lightFactorPollen.title') }}
		</v-card-title>

		<v-card-text>
			<percentage-input-pollen :value="getLightPower()" @input="setLightPower($event)" :min="0" :max="100" :step="1" :disabled="uiFrozen || fans[4] === null"></percentage-input-pollen>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['fans']),
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		setLightPower(value) {
			value = Math.min(100, Math.max(0, value)) / 100;
			if(this.fans[4] != null){
				this.sendCode(`M98 P"/macros/HONEYPRINT/Set_Lights" S${value.toFixed(2)}`);
			}
		},
		getLightPower() {
			if(this.fans[4] != null){
				return this.fans[4].requestedValue * 100;
			}
			return 0;
		},
	}
}
</script>
