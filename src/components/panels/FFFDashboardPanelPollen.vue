<template>
	<v-row :dense="$vuetify.breakpoint.mobile">
		<v-col cols="12" sm="12" md="12" lg="12" xl="12">
			<v-row>
				<v-col cols="5" sm="5" md="5" lg="5" xl="5">
					<job-control-panel-pollen  class="mb-2"></job-control-panel-pollen>
				</v-col>
				<v-col cols="5" sm="5" md="5" lg="5" xl="5">
					<high-temperature-panel-pollen  class="mb-2"></high-temperature-panel-pollen>
				</v-col>
				<v-col cols="2" sm="2" md="2" lg="2" xl="2">
					<light-factor-pollen-panel  class="mb-2"></light-factor-pollen-panel>
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="9" sm="9" md="9" lg="9" xl="9">
					<build-surface-pollen-panel  class="mb-2"></build-surface-pollen-panel>
				</v-col>
				<v-col class="hidden-xs-only" sm="3" md="3" lg="3" xl="3">
					<macro-list></macro-list>
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="3" sm="3" md="3" lg="3" xl="3">
					<extruder-pollen-panel></extruder-pollen-panel>
				</v-col>
					<v-col cols="3" sm="3" md="3" lg="3" xl="3">
					<extruder-pollen-panel></extruder-pollen-panel>
				</v-col>
					<v-col cols="3" sm="3" md="3" lg="3" xl="3">
					<extruder-pollen-panel></extruder-pollen-panel>
				</v-col>
					<v-col cols="3" sm="3" md="3" lg="3" xl="3">
					<extruder-pollen-panel></extruder-pollen-panel>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script>
'use strict'

import { mapState, mapGetters } from 'vuex'

export default {
	computed: {
		...mapState('machine/model', {
			fans: state => state.fans,
			atxPower: state => state.state.atxPower,
			machineMode: state => state.state.machineMode
		}),
		...mapGetters(['uiFrozen']),
		...mapGetters('machine/model', ['currentTool']),
		showATXPanel() {
			return !this.isFFForUnset && this.atxPower !== null;
		},
		showFansPanel() {
			return (this.currentTool && this.currentTool.fans.length > 0) || this.fans.some(fan => fan && !fan.thermostatic.control);
		}
	}
}
</script>
