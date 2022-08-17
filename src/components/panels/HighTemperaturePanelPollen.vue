<template>
	<v-card :elevation="0">
		<v-card-title class="v-card__title--dense">
      <v-icon class="mr-2">mdi-thermometer-chevron-up</v-icon>
      {{ $t('panel.highTemperaturePollen.title') }}
		</v-card-title>

		<v-card-text>
			<v-row dense class="row--separated-cols row--dashboard-first-row">
				<v-col class="d-flex flex-column">
					<strong>
						Room
					</strong>
					<span>
            XX / <tool-input style="display: inline-block;" :tool="tool" :tool-heater-index="toolHeaterIndex" active></tool-input>
					</span>
				</v-col>

				<v-col class="d-flex flex-column">
					<strong>
						Radiant
					</strong>
					<span>
						XX / <tool-input style="display: inline-block;"  :tool="tool" :tool-heater-index="toolHeaterIndex" active></tool-input>
					</span>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

export default {
	computed: {
	},
	mounted() {
	},
	watch: {
	}
}
</script>
