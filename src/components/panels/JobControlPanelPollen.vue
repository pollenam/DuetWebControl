<template>
	<v-card :elevation="0">
		<v-card-title class="v-card__title--dense">
      <span v-if="isPrinting">
        <v-icon class="mr-2">mdi-play-speed</v-icon>
        {{ $t('panel.jobControl.running') }}
        <span class="text--gray">
        {{ printFile }}
        </span>
      </span>

      <span v-else>
        <v-icon class="mr-2">mdi-sleep</v-icon>
        {{ $t('generic.status.idle') }}
      </span>

	        <v-spacer></v-spacer>
			  	<v-btn v-if="!isPaused" class="ms-0 ms-md-2" @click="handlePause" elevation="0" :disabled="uiFrozen || !isPrinting || isPausing">
              		<v-icon class="mr-1">mdi-pause</v-icon> {{ pauseText }}
            	</v-btn>
				<v-btn v-if="isPaused" class="ms-0 ms-md-2" @click="handleResume" elevation="0" :disabled="uiFrozen || !isPrinting || isPausing || !allMotorsReady">
              		<v-icon class="mr-1">mdi-play</v-icon> {{ resumeText }}
            	</v-btn>

				<code-btn v-if="isPaused" class="ms-0 ms-md-2" code="M0">
					<v-icon class="mr-1">mdi-stop</v-icon> {{ cancelText }}
				</code-btn>

				<v-btn class="ms-0 ms-md-2" v-if="processAnotherAvailable" @click="processAnotherCode" elevation="0" :disabled="uiFrozen || !allMotorsReady">
              		<v-icon class="mr-1">mdi-restart</v-icon> {{ processAnotherText }}
            	</v-btn>

				<!-- <code-btn class="ms-0 ms-md-2" v-if="processAnotherAvailable" :code="processAnotherCode()">
					<v-icon class="mr-1">mdi-restart</v-icon> {{ processAnotherText }}
				</code-btn> -->
		</v-card-title>

		<v-card-text>
			<v-row dense class="row--separated-cols">
				<v-col class="d-flex flex-column justify-center text-center">
					<span class="pollen-attr-header">
						{{ $t('panel.jobData.jobDuration') }}
					</span>
					<span>
            {{ displayJobDuration }}
					</span>
				</v-col>

				<v-col class="d-flex flex-column justify-center text-center">
					<span class="pollen-attr-header">
						{{ $t('panel.jobData.progress') }}
					</span>
					<span>
						{{ displayJobProgress }}
					</span>
				</v-col>

				<v-col class="d-flex flex-column justify-center text-center">
					<span class="pollen-attr-header">
						{{ $t('panel.jobData.layerHeight') }}
					</span>
					<span>
						{{ displayLayerHeight }}
					</span>
				</v-col>

        <v-col class="d-flex flex-column justify-center text-center">
					<span class="pollen-attr-header">
						{{ $t('panel.jobData.speed') }}
					</span>
					<span>
						{{ jobSpeed }}
					</span>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import Vue from 'vue'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import { DisconnectedError } from '@/utils/errors'
import { MachineMode, StatusType, isPaused, isPrinting } from '@/store/machine/modelEnums'
import { extractFileName } from '../../utils/path.js'

export default {
	computed: {
		...mapState('machine/model', ['job', 'state', 'move']),
		...mapState('machine/model', {
			lastFileName: state => state.job.lastFileName,
			lastFileSimulated: state => state.job.lastFileSimulated,
			move: state => state.move,
			machineMode: state => state.state.machineMode,
			status: state => state.state.status,
			thumbnails: state => state.job.file.thumbnails,
			jobFile: state => state.job.file,
			motors: state => state.global.MOTORS_ENABLED,
			xReady: state => state.global.RDY_X,
			aReady: state => state.global.RDY_A,
			bReady: state => state.global.RDY_B,
			dReady: state => state.global.RDY_D,
			yReady: state => state.global.RDY_Y,
			cReady: state => state.global.RDY_C,
			ed1sDriversReady: state => state.global.RDY_ED1S,
			ed1sAlarm: state => state.global.ALARM_ED1S,
			zReady: state => state.global.RDY_Z,
		}),
		...mapGetters(['uiFrozen']),
		...mapGetters('machine/model', ['jobProgress']),
		isPausing() { return this.status === StatusType.pausing; },
		isPaused() { return isPaused(this.status); },
		isPrinting() { return isPrinting(this.status); },
		pauseText() {
			if (this.isSimulating) {
				return this.$t('panel.jobControl.pauseSimulation');
			}
			if (this.machineMode === MachineMode.fff) {
				return this.$t('panel.jobControl.pausePrint');
			}
			return this.$t('panel.jobControl.pauseJob');
		},
		resumeText() {
			if (this.isSimulating) {
				return this.$t('panel.jobControl.resumeSimulation');
			}
			if (this.machineMode === MachineMode.fff) {
				return this.$t('panel.jobControl.resumePrint');
			}
			return this.$t('panel.jobControl.resumeJob');
		},
		cancelText() {
			if (this.isSimulating) {
				return this.$t('panel.jobControl.cancelSimulation');
			}
			if (this.machineMode === MachineMode.fff) {
				return this.$t('panel.jobControl.cancelPrint');
			}
			return this.$t('panel.jobControl.cancelJob');
		},
		processAnotherText() {
			if (this.lastFileSimulated) {
				return this.$t('panel.jobControl.repeatSimulation');
			}
			if (this.machineMode === MachineMode.fff) {
				return this.$t('panel.jobControl.repeatPrint');
			}
			return this.$t('panel.jobControl.repeatJob');
		},
		validThumbnails() {
			return this.thumbnails.filter(thumbnail => !!thumbnail.data);
		},
		lastLayerTime() {
			if (!this.job.layers.length) {
				return undefined;
			}
			return this.job.layers[this.job.layers.length - 1].tie;
		},
		jobDuration() {
			return isPrinting(this.state.status) ? this.job.duration : this.job.lastDuration;
		},
		printFile() {
			return (this.job.file.fileName !== null) ? extractFileName(this.job.file.fileName) : null;
		},
		nozzleSize() {
			return 'n/a';
		},
		jobSpeed() {
			if (!isPrinting() && this.move.currentMove.topSpeed == 0) {
				return 'n/a';
			}
			return Vue.prototype.$display(this.move.currentMove.topSpeed, 0, 'mm/s')
		},
		displayJobProgress() {
			if (!isPrinting() && this.jobProgress == 0) {
				return 'n/a';
			}
			return `${(this.jobProgress * 100).toFixed(2)} %`;
		},
		displayLayerHeight() {
			if (!isPrinting() && this.jobFile.layerHeight == 0) {
				return 'n/a';
			}
			return Vue.prototype.$displayZ(this.jobFile.layerHeight);
		},
		displayJobDuration() {
			if (!isPrinting() && this.jobDuration == 0) {
				return 'n/a';
			}
			return Vue.prototype.$displayTime(this.jobDuration);
		},
		processAnotherAvailable() {
		return (!this.isPrinting && this.lastFileName);
			},
		visibleAxes() {
			return this.move.axes.filter(axis => axis.visible && Object.keys(this.motorStatus()).includes(axis.letter));
		},
		allMotorsReady(){
			return this.visibleAxes.every(axis => this.motorStatus(axis.letter)[2] == 1);
		}
	},
	data() {
		return {
			isSimulating: false
		}
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/honeyprint_cache', ['addLastPrintedJobDate']),
		motorStatus(axisLetter){
			// returns only the status of the motor if "axisLetter" parameter exists, returns the whole object if no parameter is provided
			let status = {
				'X': [this.xReady && !this.motors, !this.xReady && this.motors, this.xReady && this.motors],
				'A': [this.aReady && !this.motors, !this.aReady && this.motors, this.aReady && this.motors],
				'B': [this.bReady && !this.motors, !this.bReady && this.motors, this.bReady && this.motors],
				'D': [this.dReady && !this.motors, !this.dReady && this.motors, this.dReady && this.motors],
				'Y': [this.yReady && !this.motors, !this.yReady && this.motors, this.yReady && this.motors],
				'C': [this.cReady && !this.motors, !this.cReady && this.motors, this.cReady && this.motors],
				'Z': [this.ed1sDriversReady && !this.motors, this.ed1sAlarm, this.ed1sDriversReady && this.motors]
				//'Z': [this.ed1sDriversReady, this.ed1sAlarm, this.zReady]
			};
			if (axisLetter !== undefined){
				return status[`${axisLetter}`];
			} else{
				return status;
			}	
		},
		async stopInfiniteThenResume() {
			try {
				await this.sendCode('M991');
				await this.sendCode('M24');
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					console.warn(e);
				}
			}	
		},
		handlePause(){
			this.sendCode('M25');
		},
		handleResume(){
			this.stopInfiniteThenResume();
		},
		async processAnotherCode(){
			if (this.lastFileName) {
				if (this.lastFileSimulated) {
					this.sendCode(`M37 P"${this.lastFileName}"`);
				}
				else {
					await this.sendCode('M991');
					this.sendCode(`M32 "${this.lastFileName}"`);
				}
			}
		}
	},
	mounted() {
		this.isSimulating = (this.status === StatusType.simulating);
	},
	watch: {
		status(to) {
			if (to === StatusType.simulating) {
				this.isSimulating = true;
			} else if (!this.isPrinting) {
				this.isSimulating = false;
			}
		}
	}
}
</script>
