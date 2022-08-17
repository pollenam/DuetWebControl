<style>
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

</style>

<template>
	<v-card>
		<v-card-title>
			<!-- TODO I18N -->
			Build Surface

			<v-spacer></v-spacer>

			<v-menu offset-y left>
				<template #activator="{ on }">
					<v-btn v-show="visibleAxes.length" color="primary" small class="mx-0" :elevation="1" v-on="on">
						{{ $t('panel.movement.compensation') }} <v-icon>mdi-menu-down</v-icon>
					</v-btn>
				</template>

				<v-card>
					<v-list>
						<template v-show="move.compensation">
							<v-list-item>
								<v-spacer></v-spacer>
								{{ $t('panel.movement.compensationInUse', [$t(`panel.movement.compensationType.${move.compensation.type}`)]) }}
								<v-spacer></v-spacer>
							</v-list-item>

							<v-divider></v-divider>
						</template>

						<v-list-item :disabled="!canHome" @click="sendCode('G32')">
							<v-icon class="mr-1">mdi-format-vertical-align-center</v-icon> {{ $t(isDelta ? 'panel.movement.runDelta' : 'panel.movement.runBed') }}
						</v-list-item>
						<v-list-item :disabled="!move.compensation.type || move.compensation.type.indexOf('Point') === -1" @click="sendCode('M561')">
							<v-icon class="mr-1">mdi-border-none</v-icon> {{ $t('panel.movement.disableBedCompensation') }}
						</v-list-item>

						<v-divider></v-divider>

						<v-list-item :disabled="!canHome" @click="sendCode('G29')">
							<v-icon class="mr-1">mdi-grid</v-icon> {{ $t('panel.movement.runMesh') }}
						</v-list-item>
						<v-list-item :disabled="uiFrozen" @click="showMeshEditDialog = true">
							<v-icon class="mr-1">mdi-pencil</v-icon> {{ $t('panel.movement.editMesh') }}
						</v-list-item>
						<v-list-item :disabled="uiFrozen" @click="sendCode('G29 S1')">
							<v-icon class="mr-1">mdi-content-save</v-icon> {{ $t('panel.movement.loadMesh') }}
						</v-list-item>
						<v-list-item :disabled="!isCompensationEnabled" @click="sendCode('G29 S2')">
							<v-icon class="mr-1">mdi-grid-off</v-icon> {{ $t('panel.movement.disableMeshCompensation') }}
						</v-list-item>
					</v-list>
				</v-card>
			</v-menu>
		</v-card-title>

		<v-card-text v-show="visibleAxes.length !== 0">
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="7">
					<v-row>
						<v-col class="ma-auto" cols="2">
							<code-btn outlined fab large class="home_btn" code="G28" :disabled="!canHome" :title="$t('button.home.titleAll')" >
								{{ $t('button.home.captionAll') }}
							</code-btn>
						</v-col>
						<v-col cols="10">
							<!-- Mobile home buttons -->
							<v-row class="hidden-md-and-up py-2" no-gutters>
								<v-col>
									<code-btn color="primary" code="G28" :disabled="!canHome" :title="$t('button.home.titleAll')" block tile>
										{{ $t('button.home.captionAll') }}
									</code-btn>
								</v-col>
								<template v-if="!isDelta">
									<v-col v-for="(axis, axisIndex) in visibleAxes" :key="axisIndex">
										<code-btn :color="axis.homed ? 'primary' : 'warning'" :disabled="!canHome" :title="$t('button.home.title', [axis.letter])" :code="getHomeCode(axis)" block tile>
											{{ $t('button.home.caption', [axis.letter]) }}
										</code-btn>
									</v-col>
								</template>
							</v-row>

							<v-row v-for="(axis, axisIndex) in visibleAxes" :key="axisIndex" dense>
								<!-- Regular home buttons -->
								<v-col v-if="!isDelta" cols="auto" class="flex-shrink-1 hidden-sm-and-down">
									{{ axis.letter }}
								</v-col>

								<!-- Decreasing movements -->
								<v-col>
									<v-row no-gutters>
										<v-col v-for="index in numMoveSteps" :key="index"  :class="getMoveCellClass(index)">
											<code-btn :code="getMoveCode(axis, index - 1, true)" :disabled="!canMove(axis)" no-wait @contextmenu.prevent="showMoveStepDialog(axis.letter, index - 1)" block tile class="move-btn">
												{{ showSign(-moveSteps(axis.letter)[index - 1]) }}
											</code-btn>
										</v-col>
									</v-row>
								</v-col>

								<!-- Increasing movements -->
								<v-col>
									<v-row no-gutters>
										<v-col v-for="index in numMoveSteps" :key="index" :class="getMoveCellClass(numMoveSteps)">
											<code-btn :code="getMoveCode(axis, numMoveSteps - index, false)" :disabled="!canMove(axis)" no-wait @contextmenu.prevent="showMoveStepDialog(axis.letter, numMoveSteps - index)" block tile class="move-btn">
												{{ moveSteps(axis.letter)[numMoveSteps - index] }}
											</code-btn>
										</v-col>
									</v-row>
								</v-col>
							</v-row>
						</v-col>

					</v-row>
					<v-row align-content:center>
						<span>Speed Factor</span> <percentage-input v-model="speedFactor" :min="speedFactorMin" :max="speedFactorMax" :disabled="uiFrozen"></percentage-input>
					</v-row>
				</v-col>
				<v-divider vertical></v-divider>
				<v-col cols="3" sm="3" md="3" lg="3" xl="3">
					<v-col>
						<v-row class="mb-2">
							<strong>Level {{ $t('panel.babystepping.current', [$displayZ(babystepping)]) }}</strong>
						</v-row>
						<v-row class="mb-1">
							<code-btn :code="`M290 R1 Z${-babystepAmount}`" no-wait block>
								<v-icon>mdi-arrow-collapse-vertical</v-icon> {{ $displayZ(-babystepAmount) }}
							</code-btn>
						</v-row>
						<v-row class="mb-1">
							<code-btn :code="`M290 R1 Z${babystepAmount}`" no-wait block>
								<v-icon>mdi-arrow-split-horizontal</v-icon> +{{ $displayZ(babystepAmount) }}
							</code-btn>
						</v-row>
						<v-row class="align-center">
							<v-col>
								<v-row class="align-center">
									<span>Z Limits</span>
									<v-switch hide-details="auto" class="ml-2 mt-0" :disabled="uiFrozen">
									</v-switch>
								</v-row>
							</v-col>
							<v-col>
							<code-btn code="M290 R0 S0" no-wait block>
								Set 0
							</code-btn>
							</v-col>
						</v-row>
					</v-col>
				</v-col>
				<v-divider vertical></v-divider>
				<v-col cols="2" sm="2" md="2" lg="2" xl="2">
					<v-col>
						<v-row>
							<v-col>
								<template v-for="(bedHeater, bedIndex) in bedHeaters">
										<template v-if="bedHeater">
											<v-row :key="`bed-title-${bedIndex}-0`">
												<strong>
													Bed
												</strong>
											</v-row>
											<v-row :key="`bed-value-${bedIndex}-0`">
												{{ getHeaterValue(bedHeater) }} / <tool-input :bed="bedHeater" :bed-index="bedIndex" active></tool-input>
											</v-row>
										</template>
								</template>
							</v-col>
						</v-row>
						<v-divider horizontal></v-divider>
						<v-row class="mt-1">
							<strong>
								Fan
							</strong>
						</v-row>
						<v-row>
							<percentage-input v-model="fanValue" :disabled="uiFrozen"></percentage-input>
						</v-row>
					</v-col>
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
		...mapGetters(['isConnected', 'uiFrozen'], ['fans']),
		...mapState('machine/model', ['move', 'state', 'heat']),
		...mapState('machine/settings', ['moveFeedrate']),
		...mapState('machine/settings', ['babystepAmount']),
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
				const fan = (this.fan === -1)
					? ((this.currentTool && this.currentTool.fans.length > 0) ? this.currentTool.fans[0] : -1)
					: this.fan;
				return (fan >= 0 && fan < this.fans.length && this.fans[fan]) ? Math.round(this.fans[fan].requestedValue * 100) : 0;
			},
			set(value) {
				value = Math.min(100, Math.max(0, value)) / 100;
				if (this.fan === -1) {
					this.sendCode(`M106 S${value.toFixed(2)}`);
				} else {
					this.sendCode(`M106 P${this.fan} S${value.toFixed(2)}`);
				}
			}
		},
		isCompensationEnabled() { return this.move.compensation.type.toLowerCase() !== 'none' },
		visibleAxes() { return this.move.axes.filter(axis => axis.visible); },
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
		unhomedAxes() { return this.move.axes.filter(axis => axis.visible && !axis.homed); },
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
	data() {
		return {
			showMeshEditDialog: false,
			moveStepDialog: {
				shown: false,
				axis: 'X',
				index: 0,
				preset: 0
			}
		}
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/settings', ['setMoveStep']),
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
		getHeaterValue(heater) {
			if (heater && heater.sensor >= 0 && heater.sensor < this.sensors.analog.length) {
				const sensor = this.sensors.analog[heater.sensor];
				if (sensor) {
					return this.formatSensorValue(sensor);
				}
			}
			return this.$t('generic.noValue');
		}
	},
	watch: {
		isConnected() {
			// Hide dialogs when the connection is interrupted
			this.showMeshEditDialog = false;
			this.moveStepDialog.shown = false;
		}
	}
}
</script>
