<template>
	<v-card :elevation="0">
		<v-card-title class="v-card__title--dense">
      <v-icon class="mr-2">mdi-weather-sunny</v-icon>
      {{ $t('panel.lightFactorPollen.title') }}
			<v-spacer></v-spacer>
			<a v-show="speedFactor !== 100 && !uiFrozen" href="javascript:void(0)" @click.prevent="sendCode('M220 S100')" class="subtitle-2">
				<v-icon small class="mr-1">mdi-backup-restore</v-icon> {{ $t('generic.reset') }}
			</a>
		</v-card-title>

		<v-card-text>
			<percentage-input-pollen v-model="speedFactor" :min="speedFactorMin" :max="speedFactorMax" :disabled="uiFrozen"></percentage-input-pollen>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', {
			machineSpeedFactor: state => state.move.speedFactor
		}),
		//TODO change to light controls
		speedFactor: {
			get() { return (this.machineSpeedFactor !== null) ? (this.machineSpeedFactor * 100): 100; },
			set(value) { this.sendCode(`M220 S${value}`); }
		},
		speedFactorMin() { return Math.max(1, Math.min(100, this.speedFactor - 50)); },
		speedFactorMax() { return Math.max(150, this.speedFactor + 50); }
	},
	methods: mapActions('machine', ['sendCode'])
}
</script>
