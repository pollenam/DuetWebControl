<style lang="scss">
.move-btn {
	padding-left: 0 !important;
	padding-right: 0 !important;
	min-width: 0;
}

.home_btn {
	padding-left: 0 !important;
	padding-right: 0 !important;
	min-width: 0;
}

.theme--light.v-btn.v-btn--outlined {
  background-color: #fee5bd;
  border: 1px solid #f8a531;
}

.axes-movements-wrapper {
  button.move-btn.theme--light.v-btn.v-btn--has-bg {
    border: 0px;
  }

  .row.axes-movements-row-wrapper {
    .col:not(:first-child) {

      button.move-btn.theme--light.v-btn.v-btn--has-bg {
        border-left: 1px solid #fdd48e;
      }
    }
  }

  & > .row:not(:first-child) {
    border-top: 1px solid #f8a531;
  }

  .col.axes-command-bordered-left {
    border-left: 1px solid #f8a531;
  }
}

</style>

<template>
	<v-card elevation="0">
		<v-card-title class="v-card__title--dense justify-space-between">
      <v-icon class="mr-2">mdi-axis-arrow</v-icon>
			{{ $t('panel.buildSurfacePollen.title') }}
      <v-div class="ms-5 grey--text" v-if="!uiFrozen">
        <v-span v-for="(axis, index) in visibleAxes" :key="index" class="ms-3">
          {{ axis.letter }}:
          {{ displayAxisPosition(axis, index) }}
        </v-span>
      </v-div>

			<v-spacer></v-spacer>

      <code-btn v-show="visibleAxes.length" class="mx-0" :elevation="0" :disabled="uiFrozen" code='M98 P"/macros/HONEYPRINT/Compensation_Start"'>
        <v-icon class="mr-1">mdi-grid</v-icon> {{ $t('panel.movement.startCompensation') }}
      </code-btn>
		</v-card-title>

		<v-card-text v-show="visibleAxes.length !== 0">
			<v-row dense class="row--separated-cols">
				<v-col cols="12" md="6">
					<v-row>
            <v-col class="d-flex flex-column justify-center" cols="4" md="2">
							<code-btn outlined fab large class="home_btn" code="G28" :disabled="!canHome" :title="$t('button.home.titleAll')" >
								{{ $t('button.home.captionAll') }}
							</code-btn>
            </v-col>
            <v-col class="d-flex-xs d-flex-sm flex-column justify-center hidden-md-and-down" cols="3">
              <span class="pollen-attr-header">{{ $t('panel.speedFactor.caption') }}</span>
            </v-col>
            <v-col class="d-flex flex-column justify-center" cols="8" md="7">
              <span class="pollen-attr-header hidden-lg-and-up">{{ $t('panel.speedFactor.caption') }}</span>
              <percentage-input-pollen v-model="speedFactor" :step="1" :min="speedFactorMin" :max="speedFactorMax" :disabled="uiFrozen"></percentage-input-pollen>
            </v-col>
					</v-row>
          <div class="axes-movements-wrapper mt-12">
            <v-row v-for="(axis, axisIndex) in visibleAxes" :key="axisIndex" no-gutters>
              <!-- Regular home buttons -->
              <v-col v-if="!isDelta" cols="auto" class="flex-shrink-1 hidden-sm-and-down d-flex justify-center align-center ps-2 pe-3">
                {{ axis.letter }}
              </v-col>

              <!-- Decreasing movements -->
              <v-col>
                <v-row no-gutters class="axes-movements-row-wrapper">
                  <v-col v-for="index in numMoveSteps" :key="index"  :class="getMoveCellClass(index)">
                    <code-btn :code="getMoveCode(axis, index - 1, true)" :disabled="!canMove(axis)" no-wait @contextmenu.prevent="showMoveStepDialog(axis.letter, index - 1)" block tile class="move-btn">
                      {{ showSign(-moveSteps(axis.letter)[index - 1]) }}
                    </code-btn>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Increasing movements -->
              <v-col class="axes-command-bordered-left">
                <v-row no-gutters class="axes-movements-row-wrapper">
                  <v-col v-for="index in numMoveSteps" :key="index" :class="getMoveCellClass(numMoveSteps)">
                    <code-btn :code="getMoveCode(axis, numMoveSteps - index, false)" :disabled="!canMove(axis)" no-wait @contextmenu.prevent="showMoveStepDialog(axis.letter, numMoveSteps - index)" block tile class="move-btn">
                      {{ moveSteps(axis.letter)[numMoveSteps - index] }}
                    </code-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </div>

				</v-col>
				<v-col cols="6" md="2">
          <v-row>
            <v-col>
							<span class="pollen-attr-header">{{ $t('panel.buildSurfacePollen.level') }}</span>
							<code-btn :code="`M290 R1 Z${babystepAmount}`" no-wait block class="mt-3">
								<v-icon>mdi-arrow-collapse-vertical</v-icon> {{ $displayZ(-babystepAmount) }}
							</code-btn>
							<code-btn :code="`M290 R1 Z${-babystepAmount}`" no-wait block class="mt-2">
								<v-icon>mdi-arrow-split-horizontal</v-icon> +{{ $displayZ(babystepAmount) }}
							</code-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex flex-wrap align-center pb-0">
              <span class="pollen-attr-header mb-2">{{ $t('panel.buildSurfacePollen.zLimits') }}</span>
              <v-spacer></v-spacer>
              <v-switch hide-details="auto" class="ms-1 mt-0 mb-2" :color="'success'" :disabled="uiFrozen" v-model="zlimit"></v-switch>
              <code-btn code='M98 P"/macros/HONEYPRINT/Set_Z0"' no-wait block class="mb-2">
                {{ $t('panel.buildSurfacePollen.setZero') }}
              </code-btn>
            </v-col>
          </v-row>
				</v-col>
				<v-col cols="6" md="4">
          <v-row :key="`bed-title-${firstBedIndex()}-0`">
            <v-col class="d-flex flex-column">
              <span class="pollen-attr-header">{{ $t('panel.buildSurfacePollen.bed') }}</span>
              <temperature-tool-input :bed="firstBedHeater()" :bedHeaterIndex="firstBedIndex()" active class="mt-3 mb-0"></temperature-tool-input>
            </v-col>
          </v-row>
          <hr class="hr--separated-rows" />
          <v-row>
            <v-col class="d-flex flex-column">
              <span class="pollen-attr-header">{{ $t('panel.buildSurfacePollen.fan') }}</span>
              <percentage-input-pollen v-model="fanValue" :step="1" :disabled="uiFrozen"></percentage-input-pollen>
            </v-col>
          </v-row>
				</v-col>
			</v-row>
		</v-card-text>

		<mesh-edit-dialog :shown.sync="showMeshEditDialog"></mesh-edit-dialog>
		<input-dialog :shown.sync="moveStepDialog.shown" :title="$t('dialog.changeMoveStep.title')" :prompt="$t('dialog.changeMoveStep.prompt')" :preset="moveStepDialog.preset" is-numeric-value @confirmed="moveStepDialogConfirmed"></input-dialog>

		<v-alert :value="unhomedAxes.length !== 0" type="warning" class="mb-0">
			{{ $tc('panel.movement.axesNotHomed', unhomedAxes.length) }}
			<strong>
				{{ unhomedAxes.map(axis => axis.letter).join(', ') }}
			</strong>
		</v-alert>

		<v-alert :value="visibleAxes.length === 0" type="info">
			{{ $t('panel.movement.noAxes') }}
		</v-alert>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import { KinematicsName, StatusType } from '@/store/machine/modelEnums'

export default {
	computed: {
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapState('machine/model', ['move', 'state', 'heat', 'fans']),
		...mapState('machine/settings', ['moveFeedrate']),
		...mapState('machine/settings', ['babystepAmount']),
		...mapState('machine/honeyprint_cache', ['zLimit']),
		...mapState('machine/model', {
			machineSpeedFactor: state => state.move.speedFactor,
			babystepping: state => (state.move.axes.length >= 3) ? state.move.axes[2].babystep : 0
		}),
		speedFactor: {
			get() { return (this.machineSpeedFactor !== null) ? (this.machineSpeedFactor * 100): 100; },
			set(value) { this.sendCode(`M220 S${value}`); }
		},
		speedFactorMin() { return Math.max(1, Math.min(100, this.speedFactor - 50)); },
		speedFactorMax() { return Math.max(150, this.speedFactor + 50); },
		...mapGetters('machine/settings', ['moveSteps', 'numMoveSteps']),
			fanValue: {
			get() {
				// Even though RRF allows multiple fans to be assigned to a tool,
				// we assume they all share the same fan value if such a config is set
				if(this.fans[2]) {
					return this.fans[2].requestedValue * 100;
				}
				return 0;
			},
			set(value) {
				value = Math.min(100, Math.max(0, value)) / 100;
				this.sendCode(`M106 P2 S${value.toFixed(2)}`);
			}
		},
		isCompensationEnabled() { return this.move.compensation.type.toLowerCase() !== 'none' },
		visibleAxes() {
			return this.move.axes.filter(axis => axis.visible && (axis.letter === "X" || axis.letter === "Y" || axis.letter === "Z"));
		},
		isDelta() {
			return (this.move.kinematics.name === KinematicsName.delta ||
					this.move.kinematics.name === KinematicsName.rotaryDelta);
		},
		canHome() {
			return !this.uiFrozen && (
				this.state.status !== StatusType.pausing &&
				this.state.status !== StatusType.processing &&
				this.state.status !== StatusType.resuming
			);
		},
		unhomedAxes() { return this.move.axes.filter(axis => axis.visible && !axis.homed); }
	},
	data() {
		return {
			showMeshEditDialog: false,
			moveStepDialog: {
				shown: false,
				axis: 'X',
				index: 0,
				preset: 0
			},
			displayToolPosition: true,
			zlimit: true
		}
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/settings', ['setMoveStep']),
		...mapMutations('machine/honeyprint_cache', ['setZlimit']),
		canMove(axis) {
			return (axis.homed || !this.move.noMovesBeforeHoming) && this.canHome;
		},
		getHomeCode(axis) {
			return `G28 ${/[a-z]/.test(axis.letter) ? '\'' : ''}${axis.letter.toUpperCase()}`;
		},
		getMoveCellClass(index) {
			let classes = '';
			if (index === 0 || index === 5) {
				classes += 'hidden-lg-and-down';
			}
			if (index > 1 && index < 4 && index % 2 === 1) {
				classes += 'hidden-md-and-down';
			}
			return classes;
		},
		getMoveCode(axis, index, decrementing) {
			return `M120\nG91\nG1 ${/[a-z]/.test(axis.letter) ? '\'' : ''}${axis.letter.toUpperCase()}${decrementing ? '-' : ''}${this.moveSteps(axis.letter)[index]} F${this.moveFeedrate}\nM121`;
		},
		showSign: (value) => (value > 0) ? `+${value}` : value,
		showMoveStepDialog(axis, index) {
			this.moveStepDialog.axis = axis;
			this.moveStepDialog.index = index;
			this.moveStepDialog.preset = this.moveSteps(this.moveStepDialog.axis)[this.moveStepDialog.index];
			this.moveStepDialog.shown = true;
		},
		moveStepDialogConfirmed(value) {
			this.setMoveStep({ axis: this.moveStepDialog.axis, index: this.moveStepDialog.index, value });
		},
		displayAxisPosition(axis) {
			const position = this.displayToolPosition ? axis.userPosition : axis.machinePosition;
			return (axis.letter === 'Z') ? this.$displayZ(position, false) : this.$display(position, 1);
		},
		firstBedIndex() {
      return this.heat.bedHeaters[0];
    },
		firstBedHeater() {
      return this.heat.heaters[this.firstBedIndex()];
    }
	},
	watch: {
		isConnected() {
			// Hide dialogs when the connection is interrupted
			this.showMeshEditDialog = false;
			this.moveStepDialog.shown = false;
		},
		async zLimit(newValue) {
			this.zlimit = newValue;
		},
		async zlimit(newValue) {
			if(newValue === true) {
				await this.sendCode(`M98 P"/macros/HONEYPRINT/Z_Limits" S1`);
			} else  {
				await this.sendCode(`M98 P"/macros/HONEYPRINT/Z_Limits" S0`);
			}
			this.setZlimit(newValue);
		}
	}
}
</script>
