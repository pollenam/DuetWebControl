<template>
	<v-row :dense="$vuetify.breakpoint.mobile">
		<v-col cols="12">
			<v-row>
				<v-col cols="12" lg="6">
					<job-control-panel-pollen  class="mb-2"></job-control-panel-pollen>
				</v-col>
				<v-col cols="12" md="6" lg="4">
					<high-temperature-panel-pollen  class="mb-2"></high-temperature-panel-pollen>
				</v-col>
				<v-col cols="12" md="6" lg="2">
					<light-factor-pollen-panel  class="mb-2"></light-factor-pollen-panel>
				</v-col>
			</v-row>
			<v-row>
				<v-col cols="12" md="9">
					<build-surface-pollen-panel  class="mb-2"></build-surface-pollen-panel>
				</v-col>
				<v-col class="hidden-xs-only hidden-sm-only" md="3">
					<macro-list-pollen></macro-list-pollen>
				</v-col>
			</v-row>
			<v-row>
        <v-col cols="12" md="6" lg="3">
          <extruder-panel-pollen :extruderNumber="1"></extruder-panel-pollen>
        </v-col>
        <v-col cols="12" md="6" lg="3">
          <extruder-panel-pollen :extruderNumber="2"></extruder-panel-pollen>
        </v-col>
        <v-col cols="12" md="6" lg="3">
          <extruder-panel-pollen :extruderNumber="3"></extruder-panel-pollen>
        </v-col>
        <v-col cols="12" md="6" lg="3">
					<extruder-panel-pollen :extruderNumber="4"></extruder-panel-pollen>
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
