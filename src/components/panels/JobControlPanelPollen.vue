<template>
	<v-card :elevation="0">
		<v-card-title class="v-card__title--dense justify-space-between">
      <div v-if="isPrinting">
        <v-icon class="mr-2">mdi-play</v-icon>
        {{ $t('panel.jobControl.running') }}
        <span class="text--gray">
        {{ printFile }}
        </span>
      </div>

      <div v-if="!isPrinting">
        <v-icon class="mr-2">mdi-sleep</v-icon>
        {{ $t('generic.status.idle') }}
      </div>

      <div>
				<code-btn small class="ms-0 ms-md-2 mt-2 mt-md-0" :disabled="uiFrozen || !isPrinting || isPausing" :code="isPaused ? 'M24' : 'M25'" tabindex="0">
					<v-icon class="mr-1">{{ isPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon> {{ pauseResumeText }}
				</code-btn>

				<code-btn small class="ms-0 ms-md-2 mt-2 mt-md-0" code="M0">
					<v-icon class="mr-1">mdi-stop</v-icon> {{ cancelText }}
				</code-btn>

				<code-btn small class="ms-0 ms-md-2 mt-2 mt-md-0" v-if="!isPrinting && processAnotherCode" :code="processAnotherCode">
					<v-icon class="mr-1">mdi-restart</v-icon> {{ processAnotherText }}
				</code-btn>
      </div>
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
						{{ $t('panel.jobData.nozzleSize') }}
					</span>
					<span>
						{{ nozzleSize }}
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
import { mapState, mapGetters } from 'vuex'

import { MachineMode, StatusType, isPaused, isPrinting } from '@/store/machine/modelEnums'
import { extractFileName } from '../../utils/path.js'

export default {
	computed: {
		...mapState('machine/model', ['job', 'state']),
		...mapState('machine/model', {
			lastFileName: state => state.job.lastFileName,
			lastFileSimulated: state => state.job.lastFileSimulated,
			move: state => state.move,
			machineMode: state => state.state.machineMode,
			status: state => state.state.status,
			thumbnails: state => state.job.file.thumbnails,
			jobFile: state => state.job.file

		}),
		...mapGetters(['uiFrozen']),
		...mapGetters('machine/model', ['jobProgress']),
		isPausing() { return this.status === StatusType.pausing; },
		isPaused() { return isPaused(this.status); },
		isPrinting() { return isPrinting(this.status); },
		pauseResumeText() {
			if (this.isSimulating) {
				return this.$t(this.isPaused ? 'panel.jobControl.resumeSimulation' : 'panel.jobControl.pauseSimulation');
			}
			if (this.machineMode === MachineMode.fff) {
				return this.$t(this.isPaused ? 'panel.jobControl.resumePrint' : 'panel.jobControl.pausePrint');
			}
			return this.$t(this.isPaused ? 'panel.jobControl.resumeJob' : 'panel.jobControl.pauseJob');
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
		processAnotherCode() {
			if (this.lastFileName) {
				if (this.lastFileSimulated) {
					return `M37 P"${this.lastFileName}"`;
				}
				return `M32 "${this.lastFileName}"`;
			}
			return '';
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
			return this.job.layers[this.job.layers.length - 1].time;
		},
		jobDuration() {
			return isPrinting(this.state.status) ? this.job.duration : this.job.lastDuration;
		},
		printFile() {
			return (this.job.file.fileName !== null) ? extractFileName(this.job.file.fileName) : null;
		},
    nozzleSize() {
      console.log('this.job', this.job);
      console.log('this.job.file', this.job.file);
      return 'n/a' // FIXME
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
    }
	},
	data() {
		return {
			isSimulating: false
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
