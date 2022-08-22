<style scoped>

.center-label {
	text-align: center;
}

</style>
<template>
	<v-card elevation="0" :class="{ 'v-card--highlighted': isSelected }">
		<v-card-title class="v-card__title--dense justify-space-between">
      <v-icon class="mr-1">mdi-water-outline</v-icon>
			{{ $t('panel.extruderPollen.title') }} {{ extruderNumber }}
			<v-spacer></v-spacer>
			<v-checkbox class="v-input--checkbox--extruder-selection" hide-details="auto" color="success" :input-value="isSelected" @change="selectExtruder(extruderNumber)" :disabled="uiFrozen"></v-checkbox>
		</v-card-title>

		<v-card-text class="d-flex flex-column v-card__text--with-rows-highlighted">
			<v-row class="row--highlighted">
        <v-col cols="12 d-flex flex-column">
          <div class="center-label">XX {{ $t('generic.rpm') }}</div>
          <percentage-input-pollen :disabled="uiFrozen"></percentage-input-pollen>
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
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.mixer') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <percentage-input-pollen :disabled="uiFrozen"></percentage-input-pollen>
        </v-col>
      </v-row>
			<v-row>
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.feeder') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :bed="bedHeaters[0]" :bed-index="0" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row class="row--highlighted justify-space-between align-center">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.screw') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :bed="bedHeaters[0]" :bed-index="0" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row class="justify-space-between align-center">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.nozzle') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :bed="bedHeaters[0]" :bed-index="0" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row class="row--highlighted">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.extrusionFactor') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <percentage-input-pollen :disabled="uiFrozen"></percentage-input-pollen>
        </v-col>
			</v-row>
			<v-row v-if="!isSelected">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.pidSet') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <v-select
            v-model="currentPid"
            :items="pidItems"
            item-text="description"
            item-value="value"
            label="$t('panel.extruderPollen.selectPidPreset')"
            return-object
            single-line
          ></v-select>
        </v-col>
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
		...mapState('machine/settings', ['displayedExtruders', 'selectedExtruder']),
    ...mapState('machine/model', ['heat']),
		bedHeaters() {
			return this.heat.bedHeaters
				.map(heaterIndex => {
					if (heaterIndex >= 0 && heaterIndex < this.heat.heaters.length && this.heat.heaters[heaterIndex]) {
						return this.heat.heaters[heaterIndex];
					}
					return null;
				});
		},
    isSelected() {
      return this.selectedExtruder == this.extruderNumber;
    }
	},
	data() {
		return {
        currentPid: { description: 'PID 2', value: 'pid2' },
        pidItems: [
          { description: 'PID 1', value: 'pid1' },
          { description: 'PID 2', value: 'pid2' }
        ]
		}
	},
  props: {
    extruderNumber: {
      type: Number,
      required: true
    }
  },
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/settings', ['toggleExtruderVisibility', 'selectExtruder']),
	}
}
</script>
