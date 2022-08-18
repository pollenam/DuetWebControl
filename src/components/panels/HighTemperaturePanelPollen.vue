<template>
	<v-card :elevation="0">
		<v-card-title class="v-card__title--dense">
      <v-icon class="mr-2">mdi-thermometer-chevron-up</v-icon>
      {{ $t('panel.highTemperaturePollen.title') }}
		</v-card-title>

		<v-card-text>
			<v-row dense class="row--separated-cols row--dashboard-first-row">
				<v-col class="d-flex flex-column">
					<span class="pollen-attr-header">
						Room
					</span>
					<span>
						<temperature-tool-input :bed="bedHeaters[0]" :bed-index="0" active></temperature-tool-input>
					</span>
				</v-col>

				<v-col class="d-flex flex-column">
					<span class="pollen-attr-header">
						Radiant
					</span>
					<span>
						<temperature-tool-input :bed="bedHeaters[0]" :bed-index="0" active></temperature-tool-input>
					</span>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState } from 'vuex'

export default {
	computed: {
		...mapState('machine/model', ['heat']),
		bedHeaters() {
			return this.heat.bedHeaters
				.map(heaterIndex => {
					if (heaterIndex >= 0 && heaterIndex < this.heat.heaters.length && this.heat.heaters[heaterIndex]) {
						return this.heat.heaters[heaterIndex];
					}
					return null;
				});
		}
	},
	mounted() {
	},
	watch: {
	}
}
</script>
