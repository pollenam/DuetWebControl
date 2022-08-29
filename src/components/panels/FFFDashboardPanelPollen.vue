<template>
	<v-row :dense="$vuetify.breakpoint.mobile">
		<v-col cols="12">
			<v-row align="stretch">
				<v-col cols="12" lg="6" class="d-flex">
					<job-control-panel-pollen  class="w-100 mb-2"></job-control-panel-pollen>
				</v-col>
				<v-col cols="12" md="6" lg="4" class="d-flex">
					<high-temperature-panel-pollen  class="w-100 mb-2"></high-temperature-panel-pollen>
				</v-col>
				<v-col cols="12" md="6" lg="2" class="d-flex">
					<light-factor-pollen-panel  class="w-100 mb-2"></light-factor-pollen-panel>
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
        <v-col cols="12" md="6" lg="3" v-for="tool in extruderTools" :key=tool.number>
          <extruder-panel-pollen :tool="tool"></extruder-panel-pollen>
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
			machineMode: state => state.state.machineMode,
      tools: state => state.tools
		}),
		...mapGetters(['uiFrozen']),
		...mapGetters('machine/model', ['currentTool']),
		showATXPanel() {
			return !this.isFFForUnset && this.atxPower !== null;
		},
		showFansPanel() {
			return (this.currentTool && this.currentTool.fans.length > 0) || this.fans.some(fan => fan && !fan.thermostatic.control);
		},
    extruderTools() {
    console.log('extruderTools', this.tools);
      return this.tools;
    }
	}
}
</script>
