<style scoped>

.center-label {
	text-align: center;
}

</style>
<template>
	<v-card>
		<v-card-title class="pb-0">
			Extruder XX
			<v-spacer></v-spacer>
			TODO SELECTED BUTTONS
		</v-card-title>

		<v-card-text class="d-flex flex-column pb-0">
			<v-row class="flex-column">
					<div class="center-label">XX tr/min</div>
					<percentage-input></percentage-input>
			</v-row>
			<v-row class="justify-space-around align-center mb-1">
				<code-btn color="primary" code="TODO" tile>
					Extrude <v-icon class="mr-1">mdi-arrow-down-bold</v-icon>
				</code-btn>
				<code-btn color="primary" code="TODO" tile>
					Retract <v-icon class="mr-1">mdi-arrow-up-bold</v-icon>
				</code-btn>
			</v-row>
			<v-row class="align-center pl-2 mb-1">
				Mixer <percentage-input></percentage-input>
			</v-row>
			<v-row class="justify-space-between align-center pl-2">
				<div>Feeder </div> <div>XX / <tool-input style="display: inline-block;"  :tool="tool" :tool-heater-index="toolHeaterIndex" active></tool-input></div>
			</v-row>
			<v-row class="justify-space-between align-center pl-2">
				<div>Screw </div> <div>XX / <tool-input style="display: inline-block;"  :tool="tool" :tool-heater-index="toolHeaterIndex" active></tool-input></div>
			</v-row>
			<v-row class="justify-space-between align-center pl-2">
				<div>Nozzle </div> <div>XX / <tool-input style="display: inline-block;"  :tool="tool" :tool-heater-index="toolHeaterIndex" active></tool-input></div>
			</v-row>
			<v-row class="align-center pl-2 mb-1">
				Extrusion Factor <percentage-input></percentage-input>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['move']),
		...mapState('machine/settings', ['displayedExtruders']),
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/settings', ['toggleExtruderVisibility']),
	}
}
</script>
