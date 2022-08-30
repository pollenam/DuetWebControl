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
			<v-checkbox class="v-input--checkbox--extruder-selection" hide-details="auto" color="success" :input-value="isSelected" @change="selectExtruder()" :disabled="uiFrozen"></v-checkbox>
		</v-card-title>

		<v-card-text class="d-flex flex-column v-card__text--with-rows-highlighted">
			<v-row class="row--highlighted">
        <v-col cols="12 d-flex flex-column">
          <div class="center-label">{{ extrusionSpeed }} {{ $t('generic.rpm') }}</div>
          <percentage-input-pollen :disabled="uiFrozen" :value="extrusionSpeed" :min="0.2" :max="12" :step="0.1"></percentage-input-pollen>
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
          <percentage-input-pollen :value="getMixerExtrusionFactor()" @input="setMixerExtrusionFactor($event)" :max="getMixerMaxExtrusionFactor()" :step="1" :disabled="uiFrozen"></percentage-input-pollen>
        </v-col>
      </v-row>
			<v-row>
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.feeder') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :tool="tool" :toolHeaterIndex="0" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row class="row--highlighted justify-space-between align-center">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.screw') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :tool="tool" :toolHeaterIndex="1" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row class="justify-space-between align-center">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.nozzle') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :tool="tool" :toolHeaterIndex="2" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row class="row--highlighted">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.extrusionFactor') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <percentage-input-pollen :value="getExtrusionFactor()" @input="setExtrusionFactor($event)" :max="getMaxExtrusionFactor()" :step="1" :disabled="uiFrozen"></percentage-input-pollen>
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
		...mapState('machine/settings', ['displayedExtruders']),
    ...mapState('machine/model', ['heat', 'tools']),
    isSelected() {
      return this.tool.state == 'active';
    },
    toolExtruder() {
      return this.move.extruders[this.tool.extruders[0]];
    },
    extruderNumber() {
      return this.tool.number;
    },
    extruderHeaters() {
			const toolHeaters = this.tool.heaters
				.filter(heaterIndex => heaterIndex >= 0 && heaterIndex < this.heat.heaters.length && this.heat.heaters[heaterIndex], this)
				.map(heaterIndex => this.heat.heaters[heaterIndex], this);
			return toolHeaters.length ? toolHeaters : [null];
		},
    feederHeater() {
      console.log('ExtruderPanelPollen feederHeater visibleTools', this.visibleTools);
      console.log('ExtruderPanelPollen feederHeater this.extruderHeaters[0]', this.extruderHeaters[0]);
      return this.extruderHeaters[0];
    },
    screwHeater() {
      return this.extruderHeaters[1];
    },
    nozzleHeater() {
      return this.extruderHeaters[2];
    },

		visibleTools() {
			return this.tools.filter(tool => tool !== null);
		}
	},
	data() {
		return {
        currentPid: { description: 'PID 2', value: 'pid2' },
        pidItems: [
          { description: 'PID 1', value: 'pid1' },
          { description: 'PID 2', value: 'pid2' }
        ],
        extrusionSpeed: 1.2
		}
	},
  props: {
    tool: {
      type: Object,
      required: true
    }
  },
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/settings', ['toggleExtruderVisibility']),
		getExtrusionFactor() {
      console.log('ExtruderPanelPollen getExtrusionFactor this.toolExtruder', this.toolExtruder);
			return Math.round(this.toolExtruder.factor * 100);
		},
		setExtrusionFactor(value) {
			this.sendCode(`M221 D${this.tool.number} S${value}`);
		},
		getMaxExtrusionFactor() {
      return Math.max(150, this.toolExtruder.factor * 100 + 50);
    },
    getMixerExtrusionFactor() {
      // FIXME
      return this.getExtrusionFactor();
    },
    setMixerExtrusionFactor(value) {
      // FIXME
      return this.setExtrusionFactor(value);
    },
    getMixerMaxExtrusionFactor() {
      // FIXME
      return this.getMaxExtrusionFactor();
    },
    selectExtruder() {
      // FIXME Check if we might need M568 instead of TX.
      // See src/components/panels/ToolsPanel.vue toolHeaterClick
      // this.sendCode(`M568 P${tool.number} A0`);
      this.sendCode(`T${this.tool.number}`);
    }
	}
}
</script>
