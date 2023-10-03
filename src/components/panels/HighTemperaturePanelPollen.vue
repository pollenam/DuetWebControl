<template>
	<v-card :elevation="0">
		<v-card-title class="v-card__title--dense">
      <v-icon class="mr-2">mdi-thermometer-chevron-up</v-icon>
      {{ $t('panel.highTemperaturePollen.title') }}
		</v-card-title>

		<v-card-text>
			<v-row dense class="row--separated-cols">
				<v-col class="d-flex flex-column" cols="6">
					<v-row>
						<span class="pollen-attr-header ml-3 mt-3">
							Room
						</span>
					</v-row>
					<v-row>
						<v-col cols="5">
							<v-btn small block @click="chamberTemperatureMemory()" elevation="0" :disabled="this.isProcessing() || !hasChamber" class="mb-1">
								<v-icon small class="mr-0">mdi-restore</v-icon>
								<span class="hidden-sm-and-down hidden-lg-only">
									{{ $t('panel.extruderPollen.memoryShort') }}
								</span>
							</v-btn>
							<v-btn small block @click="chamberTemperatureStop()" elevation="0" :disabled="this.isProcessing() || !hasChamber">
								<v-icon small class="hidden-sm-and-down hidden-lg-only">mdi-power</v-icon>
								<span>
									{{ $t('panel.extruderPollen.stopheatShort') }}
								</span>
							</v-btn>
						</v-col>
						<v-col cols="7">
							<span>
								<temperature-tool-input :chamber="chamberHeaters[0]" :chamberHeaterIndex="0" active :disabled="!hasChamber"></temperature-tool-input>
							</span>
						</v-col>
					</v-row>
				</v-col>

				<v-col class="d-flex flex-column" cols="6">
					<v-row>
						<span class="pollen-attr-header ml-3 mt-3">
							Radiant
						</span>
					</v-row>
					<v-row>
						<v-col cols="5">
							<v-btn small block @click="radiantTemperatureMemory()" elevation="0" :disabled="this.isProcessing() || !hasRadiant" class="mb-1">
								<v-icon small>mdi-restore</v-icon>
								<span class="hidden-sm-and-down hidden-lg-only">
									{{ $t('panel.extruderPollen.memoryShort') }}
								</span>
							</v-btn>
							<v-btn small block @click="radiantTemperatureStop()" elevation="0" :disabled="this.isProcessing() || !hasRadiant">
								<v-icon small class="hidden-sm-and-down hidden-lg-only">mdi-power</v-icon>
								<span>
									{{ $t('panel.extruderPollen.stopheatShort') }}
								</span>
							</v-btn>
						</v-col>
						<v-col cols="7">
							<span>
								<temperature-tool-input :chamber="chamberHeaters[1]" :chamberHeaterIndex="1" active :disabled="!hasRadiant"></temperature-tool-input>
							</span>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapActions } from 'vuex'
import { StatusType } from '@/store/machine/modelEnums.js'

export default {
	computed: {
		...mapState('machine/model', ['heat', 'state']),
		...mapState('machine/model', {
			hasRadiant: state => state.global.APP_RADIANT,
			hasChamber: state => state.global.APP_HEATED_CHAMBER,
		}),
		chamberHeaters() {
			return this.heat.chamberHeaters
				.map(heaterIndex => {
					if (heaterIndex >= 0 && heaterIndex < this.heat.heaters.length && this.heat.heaters[heaterIndex]) {
						return this.heat.heaters[heaterIndex];
					}
					return null;
				});
		}
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		isProcessing() {
      		return this.state.status ===  StatusType.processing
    	},
		async radiantTemperatureMemory() {
			await this.sendCode("M98 P\"/sys/app_memory_RADIANT.g\"");
		},
		async radiantTemperatureStop() {
			await this.sendCode("M141 P1 S-273.1"); //Radiant off
			await this.sendCode("M141 P1 S0"); //Radiant set to 0°C
		},
		async chamberTemperatureMemory() {
			await this.sendCode("M98 P\"/sys/app_memory_CHAMBER.g\"");
		},
		async chamberTemperatureStop() {
			await this.sendCode("M141 S-273.1"); //Chamber off
			await this.sendCode("M141 S0"); //Chamber set to 0°C
		}
	},
	mounted() {
	},
	watch: {
	}
}
</script>
