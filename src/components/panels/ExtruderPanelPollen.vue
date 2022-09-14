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
      <v-combobox
          :value="extrudersSelectedMaterials[toolIndex]"
          :items="extrudersAvailableMaterials"
          @change="materialComboboxChange"
          label="Select material"
        ></v-combobox>
			<v-spacer></v-spacer>
			<v-checkbox class="v-input--checkbox--extruder-selection" hide-details="auto" color="success" :input-value="isSelected" @change="selectExtruder()" :disabled="uiFrozen"></v-checkbox>
		</v-card-title>

		<v-card-text class="d-flex flex-column v-card__text--with-rows-highlighted">
			<v-row class="row--highlighted">
        <v-col cols="12 d-flex flex-column">
          <div class="center-label">{{ extrusionSpeed }} {{ $t('generic.rpm') }}</div>
          <percentage-input-pollen :value="extrusionSpeed" :min="getExtrusionSpeedMin()" :max="getExtrusionSpeedMax()" :step="0.1" @input="setExtrusionSpeed($event)"></percentage-input-pollen>
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
            :value="selectedPid[toolIndex]"
            :items="pidItems"
            :label="$t('panel.extruderPollen.selectPidPreset')"
            return-object
            single-line
            @change="PIDComboBoxChange"
          ></v-select>
        </v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import Path from '@/utils/path.js'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['move']),
		...mapState('machine/settings', ['displayedExtruders']),
    ...mapState('machine/model', ['heat', 'tools']),
    ...mapState('machine/honeyprint_cache', ['extrudersAvailableMaterials', 'extrudersSelectedMaterials', 'selectedPid']),
		...mapState('machine/model', {
			macrosDirectory: state => state.directories.macros,
		}),
    isSelected() {
      return this.tool.state == 'active';
    },
    toolExtruder() {
      console.log(this.move.extruders);
      return this.move.extruders[this.tool.extruders[0]];
    },
    extruderNumber() {
      return this.tool.number;
    }
	},
	data() {
		return {
        currentPid: "",
        extrusionSpeed: 1.2,
        pidItems:[]
		}
	},
  props: {
    tool: {
      type: Object,
      required: true
    },
    toolIndex: {
      type: Number,
      required: true
    }
  },
	methods: {
		...mapActions('machine', ['sendCode', 'getFileList']),
		...mapMutations('machine/settings', ['toggleExtruderVisibility']),
		...mapMutations('machine/honeyprint_cache', ['selectedExtruderMaterial', 'selectSelectedPid']),
		getExtrusionFactor() {
      if(this.move.extruders[this.toolIndex * 2] != null) {
        return Math.round(this.move.extruders[this.toolIndex * 2].factor * 100);
      }
      return 0;
		},
		setExtrusionFactor(value) {
      if(this.move.extruders[this.toolIndex * 2] != null) {
        this.sendCode(`M221 D${this.toolIndex * 2} S${value}`);
      }
		},
		getMaxExtrusionFactor() {
      if(this.move.extruders[this.toolIndex * 2] != null) {
        return Math.max(150, this.move.extruders[this.toolIndex * 2].factor * 100 + 50);
      }
      return 0;
    },
    getMixerExtrusionFactor() {
      if(this.move.extruders[(this.toolIndex * 2) + 1] != null) {
        return Math.round(this.move.extruders[(this.toolIndex * 2) + 1].factor * 100);
      }
      return 0;
    },
    setMixerExtrusionFactor(value) {
      if(this.move.extruders[(this.toolIndex * 2) + 1] != null) {
        this.sendCode(`M221 D${(this.toolIndex * 2) + 1} S${value}`);
      }
    },
    getMixerMaxExtrusionFactor() {
      if(this.move.extruders[(this.toolIndex * 2) + 1] != null) {
        return Math.max(150, this.move.extruders[(this.toolIndex * 2) + 1].factor * 100 + 50);
      }
      return 0;
    },
    getExtrusionSpeedMax() {
      return this.extrusionSpeed + this.extrusionSpeed * 0.5 ;
    },
    getExtrusionSpeedMin() {
      return this.extrusionSpeed - this.extrusionSpeed * 0.5;
    },
    selectExtruder() {
      // FIXME Check if we might need M568 instead of TX.
      // See src/components/panels/ToolsPanel.vue toolHeaterClick
      // this.sendCode(`M568 P${tool.number} A0`);
      if (this.isSelected)
      {
        this.sendCode('T-1');
      }
      else
      {
        this.sendCode(`T${this.tool.number}`);
      }
    },
    materialComboboxChange(newValue) {
      console.log('ExtruderPanelPollen getMaxExtrusionFactor extrusionSpeed', this.extrusionSpeed);
      this.selectedExtruderMaterial({
        extruderIndex: this.toolIndex,
        newValue: newValue
      });
    },
    setExtrusionSpeed(value){
      console.log('ExtruderPanelPollen extrusionSpeedChanged', value);
      this.extrusionSpeed = value;
      //TODO call extrudor speed macro ??
    },
    extrusionSpeedChanged(newValue) {
      console.log('ExtruderPanelPollen extrusionSpeedChanged', newValue);
      this.extrusionSpeed = newValue;
      //TODO call extrudor speed macro ??
    },
    async PIDComboBoxChange(newValue) {
			await this.sendCode(`M98 P"${Path.combine(this.macrosDirectory, "PID", newValue)}"`);
      this.selectSelectedPid({
        extruderIndex: this.toolIndex,
        newValue: newValue
      });
    }
  },
  async mounted() {
    this.pidItems = ["files"];
    var files = await this.getFileList(Path.combine(this.macrosDirectory, "PID"));
    files = files.map(file => file.name);
    this.pidItems = files;
  }
}
</script>
