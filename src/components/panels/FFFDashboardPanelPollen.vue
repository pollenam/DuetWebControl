<template>
	<v-row :dense="$vuetify.breakpoint.mobile">
		<v-col cols="12" sm="8" md="8" lg="9" xl="9">
			<v-row>
				<v-col cols="6" sm="8" md="8" lg="9" xl="9">
					<job-control-panel-pollen  class="mb-2"></job-control-panel-pollen>
				</v-col>
				<v-col cols="6" sm="8" md="8" lg="9" xl="9">
					<high-temperature-panel-pollen  class="mb-2"></high-temperature-panel-pollen>
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
