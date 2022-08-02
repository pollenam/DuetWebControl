
<template>
	<v-card>
		<v-card-title class="pb-1">
			<v-col>
				{{ $t('panel.jobControl.running') }} : {{ printFile }}
			</v-col>
			<v-col>
				<code-btn color="warning" block :disabled="uiFrozen || !isPrinting || isPausing" :code="isPaused ? 'M24' : 'M25'" tabindex="0">
					<v-icon class="mr-1">{{ isPaused ? 'mdi-play' : 'mdi-pause' }}</v-icon> {{ pauseResumeText }}
				</code-btn>
			</v-col>

			<v-col>
				<code-btn color="error" block code="M0">
					<v-icon class="mr-1">mdi-stop</v-icon> {{ cancelText }}
				</code-btn>
			</v-col>
			<v-col>
				<code-btn v-if="!isPrinting && processAnotherCode" color="success" block :code="processAnotherCode">
					<v-icon class="mr-1">mdi-restart</v-icon> {{ processAnotherText }}
				</code-btn>
			</v-col>
		</v-card-title>

		<v-card-text class="pt-0">
			<v-row dense>
				<v-col class="d-flex flex-column">
					<strong>
						{{ $t('panel.jobData.jobDuration') }}
					</strong>
					<span>
						{{ $displayTime(jobDuration) }}
					</span>
				</v-col>

				<v-col class="d-flex flex-column">
					<strong>
						Progress
					</strong>
					<span>
						{{ jobProgress * 100 }} %
					</span>
				</v-col>

				<v-col class="d-flex flex-column">
					<strong>
						<strong>{{ $t('panel.jobInfo.layerHeight') }}</strong>
					</strong>
					<span>
						{{ $displayZ(jobFile.layerHeight) }}
					</span>
				</v-col>

								<v-col class="d-flex flex-column">
					<strong>
						Nozzle size
					</strong>
					<span>
						??
					</span>
				</v-col>
								<v-col class="d-flex flex-column">
					<strong>
						Speed
					</strong>
					<span>
						??
					</span>
				</v-col>
			</v-row>


		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters } from 'vuex'

import { MachineMode, StatusType, isPaused, isPrinting } from '@/store/machine/modelEnums'
import { extractFileName } from '../../utils/path.js'

export default {
	computed: {
		...mapState('machine/model', ['job', 'state']),
		...mapState('machine/model', {
			lastFileName: state => state.job.lastFileName,
			lastFileSimulated: state => state.job.lastFileSimulated,
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
