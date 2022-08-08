<style scoped>
span {
	border-radius: 5px;
}
</style>

<template>
	<span class="px-2 subtitle-2" :class="statusClass">
		{{ statusText }}
	</span>
</template>

<script>
'use strict'

import { mapState } from 'vuex'

import { MachineMode, StatusType } from '../../store/machine/modelEnums.js'

export default {
	computed: {
		...mapState('machine/model', ['state']),
		...mapState('settings', ['darkTheme']),
		statusText() {
			let type = this.state.status;
			if (!this.state.status) {
				type = 'unknown';
			} else if (this.state.status === StatusType.processing && this.state.machineMode === MachineMode.fff) {
				type = 'printing';
			}
			return this.$t(`generic.status.${type}`);
		},
		statusClass() {
			switch (this.state.status) {
				case StatusType.disconnected: return 'red darken-2 white--text';
				case StatusType.starting: return 'light-blue darken-3';
				case StatusType.updating: return 'blue darken-3';
				case StatusType.off: return 'red darken-2 white--text';
				case StatusType.halted: return 'red white--text';
				case StatusType.pausing: return 'yellow darken-3';
				case StatusType.paused: return 'orange darken-2';
				case StatusType.resuming: return 'yellow darken-3';
				case StatusType.processing: return 'green white--text';
				case StatusType.simulating: return 'light-blue darken-3';
				case StatusType.busy: return 'amber darken-2 white--text';
				case StatusType.changingTool: return 'grey darken-3';
				case StatusType.idle: return 'light-green darken-3';
				default: return 'red white--text';
			}
		}
	}
}
</script>
