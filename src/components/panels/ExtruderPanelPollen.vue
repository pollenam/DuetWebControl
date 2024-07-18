<style lang="scss">
  .v-input.extruder-material-combobox {
    input[type="text"] {
      width: 1px;
    }
  }
  .v-btn-toggle {
    display: flex;
    //grid-template-columns: repeat(6, minmax(50px, 1fr)); /* Adjust the min-width to control the button width */
    flex-wrap: wrap;
  }
  .amount-btn {
    /* padding-left: 0 !important; */
    /* padding-right: 0 !important; */
    min-width: 50px;
    flex: 1 0 30%; /* Adjust the percentage to control the button width */
    //margin: 1%; /* Adjust the margin to control the spacing between buttons */
  }

  .center-label {
    text-align: center;
  }
</style>
<template>
	<v-card elevation="0" :class="{ 'v-card--highlighted': isSelected }">
		<v-card-title class="v-card__title--dense justify-space-between">
      <div>
        <v-icon class="mr-1">mdi-printer-3d-nozzle</v-icon>
        {{ $t('panel.extruderPollen.title') }} {{ extruderNumber }}
      </div>
      <v-combobox
      class="mx-2 extruder-material-combobox"
          :value="extrudersSelectedMaterials[toolIndex]"
          :items="extrudersAvailableMaterials"
          @change="materialComboboxChange"
          label="Select material"
        ></v-combobox>
			<v-checkbox class="v-input--checkbox--extruder-selection" hide-details="auto" color="success" :input-value="isSelected" @change="selectExtruder()" :disabled="uiFrozen || shouldAllowSelect"></v-checkbox>
		</v-card-title>

		<v-card-text class="d-flex flex-column v-card__text--with-rows-highlighted">
			<v-row dense class="row--highlighted">
        <v-col cols="12 d-flex flex-column">
          <div class="center-label">{{ feedrate }} {{ $t('generic.mmPerSec') }}</div>
          <percentage-input-pollen :value="feedrate" :min="getExtrusionSpeedMin()" :max="getExtrusionSpeedMax()" :step="0.1" @input="setFeedrate($event)" :disabled="uiFrozen"></percentage-input-pollen>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col>
          <span class="pollen-attr-header">
          {{ $t('panel.extrude.amount', ['mm']) }}
          </span>
          <v-btn-toggle v-model="amount" mandatory class="d-flex">
            <v-btn v-for="(savedAmount, index) in extruderAmounts" :key="index" :value="savedAmount" :disabled="uiFrozen || tool.extruders.length == 0" @contextmenu.prevent="editAmount(index)" tile class="flex-grow-1 amount-btn">
              {{ savedAmount }}
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
      <v-row dense>
        <template>
          <v-col cols="6">
            <v-btn block @click="buttonClicked(true)" :loading="busy" elevation="0" :disabled="uiFrozen || this.isProcessing() || tool.extruders.length == 0">
              <v-icon class="mr-1">mdi-arrow-down-bold</v-icon>
              <span class="hidden-lg-only">
                {{ $t('panel.extruderPollen.extrude') }}
              </span>
              <span class="hidden-md-and-down hidden-xl-only">
                {{ $t('panel.extruderPollen.extrudeShort') }}
              </span>
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn block @click="buttonClicked(false)" :loading="busy" elevation="0" :disabled="uiFrozen || this.isProcessing() || tool.extruders.length == 0">
              <v-icon class="mr-1">mdi-arrow-up-bold</v-icon>
              <span class="hidden-lg-only">
                {{ $t('panel.extruderPollen.retract') }}
              </span>
              <span class="hidden-md-and-down hidden-xl-only">
                {{ $t('panel.extruderPollen.retractShort') }}
              </span>
            </v-btn>
          </v-col>
        </template>
        <!-- <template  v-if="shouldShowStop">
          <v-col cols="12">
            <v-btn block @click="stopInfinite()" elevation="0" :disabled="uiFrozen">
              <v-icon class="mr-1">mdi-stop</v-icon>
                {{ $t('panel.extruderPollen.stop') }}
              <v-progress-circular indeterminate class="ml-5" size="15"></v-progress-circular>
            </v-btn>
          </v-col>
        </template> -->
          <!-- <v-col cols="6">
            <v-btn block @click="temperatureMemory()" elevation="0" :disabled="this.isProcessing()">
              <v-icon class="mr-1">mdi-restore</v-icon>
              <span class="hidden-sm-only hidden-lg-only">
                {{ $t('panel.extruderPollen.memory') }}
              </span>
              <span class="hidden-xs-only hidden-md-only hidden-xl-only">
                {{ $t('panel.extruderPollen.memoryShort') }}
              </span>
            </v-btn>
          </v-col> -->
          <v-col cols="12">
            <v-btn block @click="temperatureStop()" elevation="0" :disabled="this.isProcessing()">
              <v-icon class="mr-1">mdi-power</v-icon>
              <span class="hidden-sm-only hidden-lg-only">
                {{ $t('panel.extruderPollen.stopheat') }}
              </span>
              <span class="hidden-xs-only hidden-md-only hidden-xl-only">
                {{ $t('panel.extruderPollen.stopheatShort') }}
              </span>
            </v-btn>
          </v-col>
      </v-row>
      <v-row class="row--highlighted" dense>
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.buildSurfacePollen.fan') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <percentage-input-pollen :value="getFanValue()" @input="setFanValue($event)" :step="1" :disabled="uiFrozen || tool.fans.length == 0"></percentage-input-pollen>
          <!-- <percentage-input-pollen v-model="fanValue" :step="1" :disabled="uiFrozen || tool.fans.length == 0"></percentage-input-pollen> -->
        </v-col>
      </v-row>
			<!-- <v-row dense>
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.feeder') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :tool="tool" :toolHeaterIndex="0" active></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row dense class="row--highlighted justify-space-between align-center">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.screw') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :tool="tool" :toolHeaterIndex="1" active></temperature-tool-input>
        </v-col>
			</v-row> -->
      <v-row dense>
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.nozzle') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <temperature-tool-input :tool="tool" :toolHeaterIndex="0" active :disabled="tool.heaters.length == 0"></temperature-tool-input>
        </v-col>
			</v-row>
			<v-row dense class="row--highlighted">
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.extrusionFactor') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <percentage-input-pollen :value="getExtrusionFactor()" @input="setExtrusionFactor($event)" :max="getMaxExtrusionFactor()" :step="1" :disabled="uiFrozen || !shouldShowExtruderFactor"></percentage-input-pollen>
        </v-col>
			</v-row>
			<v-row dense>
        <v-col cols="3 d-flex align-center">
          <span class="pollen-attr-header">{{ $t('panel.extruderPollen.pidSet') }}</span>
        </v-col>
        <v-col cols="9 d-flex align-center">
          <v-select
            :value="selectedPid[toolIndex]"
            :items="pidItems"
            :label="$t('panel.extruderPollen.selectPidPreset')"
            :disabled="uiFrozen"
            return-object
            single-line
            @change="PIDComboBoxChange"
          ></v-select>
        </v-col>
			</v-row>
		</v-card-text>

    <input-dialog :shown.sync="editAmountDialog.shown" :title="$t('dialog.editExtrusionAmount.title')" :prompt="$t('dialog.editExtrusionAmount.prompt')" :preset="editAmountDialog.preset" is-numeric-value @confirmed="setAmount"></input-dialog>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import Path from '@/utils/path.js'
import { DisconnectedError } from '@/utils/errors'
import { StatusType } from '../../store/machine/modelEnums.js'

const EXTRUSION_SPEED_MIN = 1;
const EXTRUSION_SPEED_MAX = 50;

export default {
	computed: {
    ...mapGetters('machine/model', ['currentTool']),
	  ...mapGetters(['isConnected', 'uiFrozen']),
    ...mapState('machine/model', ['move', 'state', 'fans']),
	  ...mapState('machine/settings', ['displayedExtruders', 'extruderAmounts']),
    ...mapState('machine/model', ['global', 'heat', 'tools']),
    ...mapState('machine/honeyprint_cache', ['extrudersAvailableMaterials', 'extrudersSelectedMaterials', 'selectedPid', 'extrusionRate']),
	  ...mapState('machine/model', {
	  macrosDirectory: state => state.directories.macros,
	  //tools: state => state.tools,
	  /* infiniteExtrusionStatus: state => state.infiniteExtrusionStatus,
    infiniteStatus: state => state.infiniteStatus,
    T1Selected: state => state.global.T1_Selected,
    T2Selected: state => state.global.T2_Selected,
    T3Selected: state => state.global.T3_Selected,
    T4Selected: state => state.global.T4_Selected, */
	}),
    /* fanValue: {
			get() {
				// Even though RRF allows multiple fans to be assigned to a tool,
				// we assume they all share the same fan value if such a config is set
				
        let fanNumber = this.tool.fans.length == 0 ? null : this.tool.fans[0];
        if(fanNumber !== null){
          if(this.fans[fanNumber]) {
            return this.fans[fanNumber].requestedValue * 100;
          }
        }
				return 0;
			},
			set(value) {
        let fanNumber = this.tool.fans.length == 0 ? null : this.tool.fans[0];
        if(fanNumber !== null){
          value = Math.min(100, Math.max(0, value)) / 100;
          this.sendCode(`M106 P${fanNumber} S${value.toFixed(2)}`);
        }
			}
		}, */
    /* sortedExtruderAmounts() {
      return this.extruderAmounts.slice().sort((a, b) => a - b)
    }, */
    /* shouldShowInfinite() {
		if (this.infiniteExtrusionStatus === null || this.infiniteExtrusionStatus === undefined)
		{
			return false;
		}
		return this.infiniteExtrusionStatus[this.toolIndex] === 'stopped'
    }, */
    /* shouldShowStop() {
		if (this.infiniteExtrusionStatus === null || this.infiniteExtrusionStatus === undefined)
		{
			return false;
		}
		return this.infiniteExtrusionStatus[this.toolIndex] !== 'stopped'
    }, */
    shouldShowExtruderFactor() {
      return true
      /* if (this.infiniteExtrusionStatus === null || this.infiniteExtrusionStatus === undefined)
		{
			return false;
		}
		return this.infiniteExtrusionStatus[0] === 'stopped' &&
		this.infiniteExtrusionStatus[1]  === 'stopped' &&
        this.infiniteExtrusionStatus[2]  === 'stopped' &&
        this.infiniteExtrusionStatus[3] === 'stopped' */
    },
    shouldAllowSelect() {
		return !this.shouldShowExtruderFactor || 
		this.state.status === StatusType.processing ||
    this.state.status === StatusType.changingTool;
    },
    /* isSelected2(value) {
		if (value == 1){
			return this.T1Selected === '1';
		}
		else if (value == 2){
			return this.T2Selected === '1';
		}
		else if (value == 3){
			return this.T3Selected === '1';
		}
		else if (value == 4){
			return this.T4Selected === '1';
		}
		else {
			return this.tool.state === 'active';
		}
      //return this.tool.state === 'active';
    }, */
    isSelected() {
      return this.tool.state === 'active';
    },
    toolExtruder() {
      return this.move.extruders[this.tool.extruders[0]];
    },
    extruderNumber() {
      return this.tool.number;
    }
	},
	data() {
		return {
      busy: false,
      currentPid: "",
      amount: 10,
      feedrate: 5,
      editAmountDialog: {
        shown: false,
        index: 0,
        preset: 0
      },
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
		...mapMutations('machine/settings', ['setExtrusionAmount', 'setExtrusionFeedrate']),
    ...mapMutations('machine/honeyprint_cache', ['selectedExtruderMaterial', 'selectSelectedPid']),
		//...mapMutations('machine/honeyprint_cache', ['selectedExtruderMaterial', 'selectSelectedPid', 'selectInfiniteExtrusionRate']),
    getFanValue(){
      let fanNumber = this.tool.fans.length == 0 ? null : this.tool.fans[0];
      if(fanNumber !== null){
        if(this.fans[fanNumber]) {
          return this.fans[fanNumber].requestedValue * 100;
        }
      }
      return 0;
		},
    setFanValue(value) {
      let fanNumber = this.tool.fans.length == 0 ? null : this.tool.fans[0];
      if(fanNumber !== null){
        value = Math.min(100, Math.max(0, value)) / 100;
        this.sendCode(`M106 P${fanNumber} S${value.toFixed(2)}`);
      }
		},
    getExtrusionFactor() {
      if(this.move.extruders[this.toolIndex] != null) {
        return Math.round(this.move.extruders[this.toolIndex].factor * 100);
      }
      return 0;
		},
		setExtrusionFactor(value) {
      if(this.move.extruders[this.toolIndex] != null) {
        this.sendCode(`M221 D${this.toolIndex} S${value}`);
      }
		},
		getMaxExtrusionFactor() {
      if(this.move.extruders[this.toolIndex] != null) {
        return Math.max(150, this.move.extruders[this.toolIndex].factor * 100 + 50);
      }
      return 0;
    },
    /* getExtruderRate() {
      return this.feedrate;
    }, */
    getExtrusionSpeedMax() {
      var candidateValue = this.feedrate + this.feedrate * 0.5;
      if (candidateValue >= EXTRUSION_SPEED_MAX)
      {
        return EXTRUSION_SPEED_MAX;
      }
      else
      {
        return candidateValue;
      }
    },
    getExtrusionSpeedMin() {
      var candidateValue = this.feedrate - this.feedrate * 0.5;
      if (candidateValue <= EXTRUSION_SPEED_MIN)
      {
        return EXTRUSION_SPEED_MIN;
      }
      else
      {
        return candidateValue;
      }
    },
    selectExtruder() {
      if (!this.isConnected) {
				return;
			}

			try {
				if (this.isSelected) {
					// Deselect current tool
					this.sendCode('T-1');
				} else {
					// Select new tool
					this.sendCode(`T${this.tool.number}`);
				}
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					this.$log('error', e.message);
				}
			}

      /* if (this.isSelected)
      {
        this.sendCode('T-1');
      }
      else
      {
        var previouslySelectedExtruderTool = this.selectedExtruderTool();

        this.sendCode(`T${this.tool.number}`);

        if (previouslySelectedExtruderTool != undefined && previouslySelectedExtruderTool != null)
        {
          // Force previously selected extruder to active and not standby
          this.sendCode(`M568 P${previouslySelectedExtruderTool.number} A2`);
        }
      } */
    },
    isProcessing() {
      return this.state.status ===  StatusType.processing
    },
    /* selectedExtruderTool() {
      var selectedTools =
        this.tools
            .filter(tool => tool !== null)
            .filter(tool => tool.extruders.length > 0)
            .filter(tool => tool.state == 'active');

      return selectedTools[0];
    }, */
    materialComboboxChange(newValue) {
      this.selectedExtruderMaterial({
        extruderIndex: this.toolIndex,
        newValue: newValue
      });
    },
    setFeedrate(value){
      this.feedrate = value;
    },
    /* async setExtrusionSpeed(value) {
      this.extrusionSpeed = value;

      if (this.infiniteExtrusionStatus[this.toolIndex] !== "stopped") {
        try {
          // await this.sendInfinite({code: "stop", toolNumber:this.tool.number});
          if (this.infiniteExtrusionStatus[this.toolIndex] === "extrude") {
            await this.sendCode("M98 P\"/macros/HONEYPRINT/Set_Extrusion_Rate\" X1 " + this.getRPMForInfinite(true));
          } else {
            await this.sendCode("M98 P\"/macros/HONEYPRINT/Set_Extrusion_Rate\" X1 " + this.getRPMForInfinite(false));
          }
          // await this.sendInfinite({code: "startExtrude", toolNumber: this.tool.number});
				} catch (e) {
					if (!(e instanceof DisconnectedError)) {
						console.warn(e);
					}
				}  
      }

      this.selectInfiniteExtrusionRate({ index: this.toolIndex, value: this.extrusionSpeed });
    }, */
    async PIDComboBoxChange(newValue) {
			await this.sendCode(`M98 P"${Path.combine(this.macrosDirectory, "PID", newValue)}" B${this.tool.number}`);
      this.selectSelectedPid({
        extruderIndex: this.toolIndex,
        newValue: newValue
      });
    },

    /* getSelectedTools() {
      var selectedTools = "";
      if(this.infiniteExtrusionStatus[0] !== 'stopped') {
        selectedTools = selectedTools + "1";
      }

      if(this.infiniteExtrusionStatus[1] !== 'stopped') {
        selectedTools = selectedTools + "2";
      }

      if(this.infiniteExtrusionStatus[2] !== 'stopped') {
        selectedTools = selectedTools + "3";
      }

      if(this.infiniteExtrusionStatus[3] !== 'stopped') {
        selectedTools = selectedTools + "4";
      }

      selectedTools = selectedTools + (this.tool.number);
      return selectedTools;
    }, */
    /* getSelectedToolsForStop() {
      var selectedTools = "";
      if(this.infiniteExtrusionStatus[0] !== 'stopped' && this.tool.number !== 1) {
        selectedTools = selectedTools + "1";
      }

      if(this.infiniteExtrusionStatus[1] !== 'stopped' && this.tool.number !== 2) {
        selectedTools = selectedTools + "2";
      }

      if(this.infiniteExtrusionStatus[2] !== 'stopped' && this.tool.number !== 3) {
        selectedTools = selectedTools + "3";
      }

      if(this.infiniteExtrusionStatus[3] !== 'stopped' && this.tool.number !== 4) {
        selectedTools = selectedTools + "4";
      }
      return selectedTools;
    }, */
    /* numberOfToolsExtruding() {
      var i = 0;
      this.infiniteExtrusionStatus.forEach((e) => {
        if(e !== "stopped") {
          i++;
        }
      });
      return i;
    }, */
    /* getRPMForInfinite(isExtruding) {
      var rpmCommand = "";

      if(this.tool.number === 1) {
        rpmCommand = rpmCommand +"A";
      }
      if(this.tool.number === 2) {
        rpmCommand = rpmCommand +"B";
      }
      if (this.tool.number === 3) {
        rpmCommand = rpmCommand +"C";
      }
      if (this.tool.number === 4) {
        rpmCommand = rpmCommand + "D";
      }
      //rpmCommand = rpmCommand + this.getToolNumberLetterForExtrusionRate();

      if(isExtruding)
        rpmCommand = rpmCommand +  this.extrusionSpeed;
      else
        rpmCommand = rpmCommand + "-" + this.extrusionSpeed;

      return rpmCommand;
    }, */
    /* getToolNumberLetterForExtrusionRate() {
      if(this.tool.number === 1) {
        return "A";
      }
      if(this.tool.number === 2) {
        return "B";
      }
      if (this.tool.number === 3) {
        return "C";
      }
      if (this.tool.number === 4) {
        return  "D";
      }
    }, */
    /* async temperatureMemory() {
      if (this.state.atxPower){
        await this.sendCode("M98 P\"/sys/memory_T" + this.tool.number +".g\"");
        await this.sendCode("M568 P" + this.tool.number +" A2");
			}
      else{
        this.$log('warning', this.$t('notification.turnOnVPower'));
      }
    }, */
    async temperatureStop() {
      await this.sendCode("G10 P" + this.tool.number +" S0");
      await this.sendCode("M568 P" + this.tool.number +" A0");
      //await this.sendCode("M991");
    },
    async buttonClicked(extrude) {
      if (!this.currentTool.extruders.length) {
				return;
			}
			this.busy = true;
			try {
				await this.sendCode(`M120\nM83\nG1 E${extrude ? this.amount : -this.amount} F${this.feedrate * 60}\nM121`);
			} catch (e) {
				// handled before we get here
			}
			this.busy = false;
		},
    editAmount(index) {
			this.editAmountDialog.index = index;
			this.editAmountDialog.preset = this.extruderAmounts[index];
			this.editAmountDialog.shown = true;
		},
		setAmount(value) {
			this.setExtrusionAmount({ index: this.editAmountDialog.index, value });
			this.amount = value;
		},
    /* async infiniteExtrude() {
      try {
        await this.sendCode("M98 P\"/macros/SELECT/Select\" T" + this.getSelectedTools());
        await this.sendCode("M98 P\"/macros/HONEYPRINT/Set_Extrusion_Rate\" X1 " + this.getRPMForInfinite(true));
        await this.sendInfinite({code: "startExtrude", toolNumber: this.tool.number});
      } catch (e) {
        if (!(e instanceof DisconnectedError)) {
          console.warn(e);
        }
      }
    },
    async infiniteRetract() {
      try {
        await this.sendCode("M98 P\"/macros/SELECT/Select\" T" + this.getSelectedTools());
        await this.sendCode("M98 P\"/macros/HONEYPRINT/Set_Extrusion_Rate\" X1 " + this.getRPMForInfinite(false));
        await this.sendInfinite({code: "startRetract", toolNumber:this.tool.number});
      } catch (e) {
        if (!(e instanceof DisconnectedError)) {
          console.warn(e);
        }
      }
    },
    async stopInfinite() {
      try {
        if(this.numberOfToolsExtruding() > 1) {
          await this.sendCode("M98 P\"/macros/SELECT/Select\" T" + this.getSelectedToolsForStop());
        }
        await this.sendInfinite({code: "stop", toolNumber:this.tool.number});
        await this.sendCode("M98 P\"/macros/HONEYPRINT/Set_Extrusion_Rate\" X1 " + this.getToolNumberLetterForExtrusionRate() + "0");
      } catch (e) {
        if (!(e instanceof DisconnectedError)) {
          console.warn(e);
        }
      }
    } */
  },
  async mounted() {
    this.pidItems = [];
    var files = await this.getFileList(Path.combine(this.macrosDirectory, "PID"));
    if(files) {
      files = files.map(file => file.name);
      this.pidItems = files;
    }

    this.feedrate = this.extrusionRate[this.toolIndex];
  },
  watch: {
    extrusionRate(to) {
      this.feedrate = to[this.toolIndex];
    }
  }
}
</script>