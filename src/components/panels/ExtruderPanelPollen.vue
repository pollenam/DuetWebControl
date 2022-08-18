<style scoped>

.center-label {
	text-align: center;
}

</style>
<template>
	<v-card elevation="0">
		<v-card-title class="v-card__title--dense justify-space-between">
      <v-icon class="mr-1">mdi-water-outline</v-icon>
			{{ $t('panel.extruderPollen.title') }} {{ extruderNumber }}
			<v-spacer></v-spacer>
			<v-checkbox class="v-input--checkbox--extruder-selection" hide-details="auto" color="success"></v-checkbox>
		</v-card-title>

		<v-card-text class="d-flex flex-column v-card__text--with-rows-highlighted">
			<v-row class="row--highlighted">
        <v-col cols="12 d-flex flex-column">
          <div class="center-label">XX tr/min</div>
          <percentage-input-pollen></percentage-input-pollen>
        </v-col>
      </v-row>
      <v-row class="row--highlighted" dense>
        <v-col cols="6">
          <code-btn block color="primary" code="TODO" tile>
            Extrude <v-icon class="mr-1">mdi-arrow-down-bold</v-icon>
          </code-btn>
        </v-col>
        <v-col cols="6">
          <code-btn block color="primary" code="TODO" tile>
            Retract <v-icon class="mr-1">mdi-arrow-up-bold</v-icon>
          </code-btn>
        </v-col>
      </v-row>
      <v-row class="row--highlighted">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">Mixer</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <percentage-input-pollen></percentage-input-pollen>
        </v-col>
      </v-row>
			<v-row>
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">Feeder</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :bed="bedHeaters[0]" :bed-index="0" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row class="row--highlighted justify-space-between align-center">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">Screw</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :bed="bedHeaters[0]" :bed-index="0" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row class="justify-space-between align-center">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">Nozzle</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :bed="bedHeaters[0]" :bed-index="0" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row class="row--highlighted">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">Extrusion Factor</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <percentage-input-pollen></percentage-input-pollen>
        </v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  props: {
    extruderNumber: {
      type: Number,
      required: true
    }
  },
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['move']),
		...mapState('machine/settings', ['displayedExtruders']),
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
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/settings', ['toggleExtruderVisibility']),
	}
}
</script>
