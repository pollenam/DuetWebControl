<template>
  <div class="v-toolbar-pollen-item">
    <span class="pollen-attr-header mb-2">{{ $t('panel.buildSurfacePollen.zLimits') }}</span>
    <v-switch :value="zlimit" hide-details="auto" class="ms-1 mt-0 mb-2" @change="toggleZLimits" :color="'success'" :disabled="uiFrozen"></v-switch>
  </div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
        ...mapState('machine/model', ['move']),
        ...mapState('machine/model', {
			zlimit: state => state.global.Z_LIMITS,
		}),
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		async toggleZLimits() {
			//await this.sendCode(`echo ${this.move.limitAxes}`);
			//await this.sendCode(`echo ${Boolean(this.move.limitAxes)}`);
			await this.sendCode(this.move.limitAxes ? 'M98 P"/macros/HONEYPRINT/Z_Limits" S0' : 'M98 P"/macros/HONEYPRINT/Z_Limits" S1');
		}
	}
}
</script>
