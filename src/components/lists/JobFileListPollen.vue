<style scoped>
.list-icon {
	display: flex;
	flex-shrink: 0;
	align-content: center;
	justify-content: center;
	width: 48px;
}

.icon-menu {
	min-width: 0 !important;
}
</style>

<template>
	<div>
		<v-toolbar dense elevation="0">
			<sd-card-btn v-if="volumes.length > 2" v-model="volume" class="hidden-sm-and-down"/>
			<directory-breadcrumbs v-model="directory" class="pl-0" />

			<v-spacer/>

			<upload-btn class="hidden-sm-and-down" elevation="0" :directory="directory" target="gcodes" color="primary"/>
			<v-btn elevation="0" class="hidden-sm-and-down mr-3 ml-3" :disabled="uiFrozen" @click="showNewDirectory = true">
				<v-icon class="mr-1">mdi-folder-plus</v-icon> {{ $t('button.newDirectory.caption') }}
			</v-btn>
			<v-btn class="hidden-sm-and-down mr-3" color="primary" :loading="loading || fileinfoProgress !== -1" :disabled="uiFrozen" elevation="0" @click="refresh">
				<v-icon class="mr-1">mdi-refresh</v-icon> {{ $t('button.refresh.caption') }}
			</v-btn>
		</v-toolbar>

		<!-- <base-file-list show-expand :expanded.sync="expanded" ref="filelist" v-model="selection" :headers="headers" :directory.sync="directory" :filelist.sync="filelist" :loading.sync="loading" sort-table="jobs" @directoryLoaded="directoryLoaded" @fileClicked="fileClicked" no-files-text="list.jobs.noJobs"> -->
		<base-file-list 
			disable-pagination 
			hide-default-footer 
			:directory.sync="directory" 
			ref="filelist" 
			v-model="selection" 
			:headers="headers"
			:filelist.sync="filelist"
			sort-table="jobs"
			@directoryLoaded="directoryLoaded"
			@fileClicked="fileClicked" 
			no-files-text="list.jobs.noJobs">
			<v-progress-linear slot="progress" :indeterminate="fileinfoProgress === -1" :value="(fileinfoProgress / filelist.length) * 100"/>

			<template #folder="{ item }">
				<div :class="{ 'list-icon mr-2': hasThumbnails, 'mr-1': !hasThumbnails }">
					<v-icon> mdi-folder</v-icon>
				</div>
				{{ item.name }}
			</template>
			<template #file="{ item }">
				<div :class="{ 'list-icon mr-2': hasThumbnails, 'mr-1': !hasThumbnails }">
					<v-icon v-if="!(item.thumbnails instanceof Array) || !getSmallThumbnail(item.thumbnails)">
						{{ (item.thumbnails instanceof Array) ? 'mdi-file' : 'mdi-asterisk' }}
					</v-icon>
					<v-menu v-else right offset-x open-on-hover open-on-focus close-on-content-click :min-width="16">
						<template #activator="{ on, attrs }">
							<div v-bind="attrs" v-on="on" @click.stop="" tabindex="0">
								<thumbnail-img :thumbnail="getSmallThumbnail(item.thumbnails)" icon/>
							</div>
						</template>

						<v-card class="d-flex">
							<thumbnail-img :thumbnail="getBigThumbnail(item.thumbnails)"/>
						</v-card>
					</v-menu>
				</div>
				{{ item.name }}	
			</template>

			<template #context-menu>
				<v-list-item v-show="isFile && !isPrinting" @click="start">
					<v-icon class="mr-1">mdi-play</v-icon> {{ $t('list.jobs.start') }}
				</v-list-item>
				<v-list-item v-show="isFile && !isPrinting" @click="simulate">
					<v-icon class="mr-1">mdi-fast-forward</v-icon> {{ $t('list.jobs.simulate') }}
				</v-list-item>
				<v-list-item v-show="isFile" v-for="(menuItem, index) in contextMenuItems.jobFileList" :key="index" @click="contextMenuAction(menuItem)">
					<v-icon class="mr-1">{{ menuItem.icon }}</v-icon> {{ menuItem.name }}
				</v-list-item>
			</template>
		</base-file-list>

		<v-speed-dial v-model="fab" bottom right fixed direction="top" transition="scale-transition" class="hidden-md-and-up">
			<template #activator>
				<v-btn v-model="fab" dark color="primary" fab>
					<v-icon v-if="fab">mdi-close</v-icon>
					<v-icon v-else>mdi-dots-vertical</v-icon>
				</v-btn>
			</template>

			<v-btn fab :disabled="uiFrozen" elevation="0" @click="showNewDirectory = true">
				<v-icon>mdi-folder-plus</v-icon>
			</v-btn>

			<v-btn elevation="0" fab color="info" :loading="loading || fileinfoProgress !== -1" :disabled="uiFrozen" @click="refresh">
				<v-icon>mdi-refresh</v-icon>
			</v-btn>

			<upload-btn elevation="0" fab dark :directory="directory" target="gcodes" color="primary">
				<v-icon>mdi-arrow-up-bold-hexagon-outline</v-icon>
			</upload-btn>
		</v-speed-dial>

		<new-directory-dialog :shown.sync="showNewDirectory" :directory="directory"/>
		<confirm-dialog :shown.sync="startJobDialog.shown" :title="startJobDialog.title" :prompt="startJobDialog.prompt" @confirmed="start(startJobDialog.item)"/>
	</div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import i18n from '@/i18n'
import { isPrinting, StatusType } from '@/store/machine/modelEnums.js'
import { DisconnectedError, InvalidPasswordError } from '@/utils/errors.js'
import Path from '@/utils/path.js'

export default {
	computed: {
		...mapState('machine/cache', ['fileInfos']),
		...mapState('machine/model', {
			gCodesDirectory: state => state.directories.gCodes,
			currentJob: state => state.job.file.fileName,
			lastJobFile: state => state.job.lastFileName,
			job: state => state.job,
			lastFileDuration: state => state.job.lastDuration,
			status: state => state.state.status,
			volumes: state => state.volumes
		}),
		...mapState('machine/honeyprint_cache', ['jobsHistory']),
		...mapState('settings', ['language']),
		...mapState('uiInjection', ['contextMenuItems']),
		...mapGetters(['isConnected', 'uiFrozen']),
		headers() {
			return [
				{
					class: 'pl-0',
					cellClass: 'pl-0',
					text: i18n.t('list.baseFileList.fileName'),
					value: 'name'
				},
				{
					text: i18n.t('list.baseFileList.size'),
					value: 'size',
					unit: 'bytes'
				},
				{
					text: i18n.t('list.baseFileList.lastModified'),
					value: 'lastModified',
					unit: 'date'
				},
				{
					text: i18n.t('list.jobs.printTime'),
					value: 'printTime',
					unit: 'time'
				},
				{
					text: i18n.t('list.jobs.generatedBy'),
					value: 'generatedBy'
				},
				{
					text: "",
					value: 'expand',
					unit: 'boolean'
				}
			];
		},
		isFile() {
			return (this.selection.length === 1) && !this.selection[0].isDirectory;
		},
		isPrinting() {
			return isPrinting(this.status);
		},
		loading: {
			get() { return this.loadingValue || this.fileinfoProgress !== -1; },
			set(value) { this.loadingValue = value; }
		},
		volume: {
			get() { return Path.getVolume(this.directory); },
			set(value) { this.directory = (value === Path.getVolume(this.gCodesDirectory)) ? this.gCodesDirectory : `${value}:`; }
		}
	},
	data() {
		return {
			expanded: [],
			directory: Path.gCodes,
			selection: [],
			hasThumbnails: false,
			filelist: [],
			loadingValue: false,
			fileinfoDirectory: undefined,
			fileinfoProgress: -1,
			startJobDialog: {
				title: '',
				prompt: '',
				item: undefined,
				shown: false
			},
			showNewDirectory: false,
			fab: false,
			customCurrentJob: undefined,
		}
	},
	methods: {
		...mapActions('machine', ['sendCode', 'getFileInfo']),
		...mapMutations('machine/cache', ['clearFileInfo', 'setFileInfo']),
		...mapMutations('machine/honeyprint_cache', ['addJobHistory', 'updateHistory']),
		getBigThumbnail(thumbnails) {
			let biggestThumbnail = null;
			for (const thumbnail of thumbnails) {
				if (thumbnail.data !== null && (!biggestThumbnail || thumbnail.height > biggestThumbnail.height)) {
					biggestThumbnail = thumbnail;
				}
			}
			return biggestThumbnail;
		},
		getSmallThumbnail(thumbnails) {
			let smallestThumbnail = null;
			for (const thumbnail of thumbnails) {
				if (thumbnail.data !== null && (!smallestThumbnail || Math.abs(48 - thumbnail.height) < Math.abs(48 - smallestThumbnail.height))) {
					smallestThumbnail = thumbnail;
				}
			}
			return smallestThumbnail;
		},
		refresh() {
			this.clearFileInfo(this.directory);
			this.$refs.filelist.refresh();
		},
		async requestFileInfo(directory, fileIndex, fileCount) {
			if (fileIndex === 0) {
				this.hasThumbnails = false;
			}

			if (this.fileinfoDirectory === directory) {
				if (this.isConnected && fileIndex < fileCount) {
					// Update progress
					this.fileinfoProgress = fileIndex;

					// Try to get file info for the next file
					const file = this.filelist[fileIndex];
					if (!file.isDirectory) {
						let gotFileInfo = false;
						try {
							// Check if it is possible to parse this file
							const filename = Path.combine(directory, file.name);
							if (Path.isGCodePath(file.name, this.gCodesDirectory)) {
								// Get the fileinfo either from our cache or from the Duet
								let fileInfo = this.fileInfos[filename];
								if (!fileInfo) {
									fileInfo = await this.getFileInfo({ filename, readThumbnailContent: true });
									this.setFileInfo({ filename, fileInfo });
								}

								// Start again if the number of files has changed
								if (fileCount !== this.filelist.length) {
									fileIndex = -1;
									fileCount = this.filelist.length;
									this.requestFileInfo(directory, fileIndex, fileCount);
									return;
								}

								// Set file info
								gotFileInfo = true;
								file.height = fileInfo.height;
								file.layerHeight = fileInfo.layerHeight;
								file.filament = fileInfo.filament;
								file.generatedBy = fileInfo.generatedBy;
								file.printTime = fileInfo.printTime ? fileInfo.printTime : null;
								file.simulatedTime = fileInfo.simulatedTime ? fileInfo.simulatedTime : null;
								file.thumbnails = fileInfo.thumbnails ? fileInfo.thumbnails : [];
								if (fileInfo.thumbnails && fileInfo.thumbnails.length !== 0) {
									this.hasThumbnails = true;
								}
								//this.lastPrintedJob.forEach(element => {
										//if(element.name  ===  Path.combine(this.directory,file.name)) {
											//file.lastPrint = new Date(element.date);
										//}
								//});
							}
						} catch (e) {
							// Deal with the error. If the connection has been terminated, the next call will invalidate everything
							if (!(e instanceof DisconnectedError) && !(e instanceof InvalidPasswordError)) {
								console.warn(e);
								this.$log('error', this.$t('error.fileinfoRequestFailed', [file.name]), e.message);
							}
						}

						// Remove loading state from the items if no info could be found
						if (!gotFileInfo) {
							file.height = null;
							file.layerHeight = null;
							file.filament = [];
							file.generatedBy = null;
							file.printTime = null;
							file.simulatedTime = null;
							file.thumbnails = null;
						}
					}

					// Move on to the next item
					this.requestFileInfo(directory, fileIndex + 1, fileCount);
				} else {
					// No longer connected or finished
					this.fileinfoProgress = -1;
					this.fileinfoDirectory = undefined;
				}
			}
		},
		async directoryLoaded(directory) {
			if (this.fileinfoDirectory !== directory) {
				this.fileinfoDirectory = directory;
				this.filelist.forEach(function(item) {
					if (item.isDirectory) {
						item.height = null;
						item.layerHeight = null;
						item.filament = null;
						item.generatedBy = null;
						item.printTime = null;
						item.simulatedTime = null;
						item.thumbnails = null;
					}
				});

				await this.requestFileInfo(directory, 0, this.filelist.length);
			}
		},
		fileClicked(item) {
			if (!this.isPrinting) {
				this.startJobDialog.title = this.$t('dialog.startJob.title', [item.name]);
				this.startJobDialog.prompt = this.$t('dialog.startJob.prompt', [item.name]);
				this.startJobDialog.item = item;
				this.startJobDialog.shown = true;
			}
		},
		start(item) {
			// if right click on job then click on "Start" -> this.selection[0]
			// if click on job, then "Yes" on the dialog window -> item
			const obj = (item && item.name) ? item : this.selection[0];
			const printDetails = {printDate: new Date().toLocaleString(), type: this.$t('list.jobs.type.print'), status: this.$t('list.jobs.status.ongoing'), duration: 0, lastModified: obj.lastModified.toLocaleString()}
			const targetPath = Path.combine(this.directory, obj.name);
			this.addJobHistory({filePath:targetPath, printDetails:printDetails});
			this.sendCode(`M98 P"/macros/HONEYPRINT/Start_GCode" S"${targetPath}"`);
			//this.sendCode(`M32 "${targetPath}"`);
		},
		simulate(item) {
			// if right click on job then click on "Simulate" -> this.selection[0]
			// no other options actually
			const obj = (item && item.name) ? item : this.selection[0];
			const printDetails = {printDate: new Date().toLocaleString(), type: this.$t('list.jobs.type.simulation'), status: this.$t('list.jobs.status.ongoing'), duration: 0, lastModified: obj.lastModified.toLocaleString()}
			const targetPath = Path.combine(this.directory, obj.name)
			this.addJobHistory({filePath:targetPath, printDetails:printDetails});
			//this.sendCode(`M98 P"/macros/HONEYPRINT/Simulate_GCode" S"${targetPath}"`);
			this.sendCode(`M37 P"${Path.combine(this.directory, (item && item.name) ? item.name : this.selection[0].name)}"`);
		},
		contextMenuAction(menuItem){
			let path = Path.combine(this.directory, this.selection[0].name);
			if (menuItem.path !== '') {
				this.$router.push(menuItem.path).then(() => {
					this.$root.$emit(menuItem.action, path);
				})
			} else {
				this.$root.$emit(menuItem.action, path);
			}
		}
	},
	mounted() {
		this.directory = this.gCodesDirectory;
	},
	watch: {
		gCodesDirectory(to, from) {
			if (Path.equals(this.directory, from) || !Path.startsWith(this.directory, to)) {
				this.directory = to;
			}
		},
		lastJobFile(to) {
			if (Path.equals(this.directory, Path.extractDirectory(to))) {
				// Refresh the filelist after a short moment so DSF and RRF can update the simulation time first
				setTimeout(this.$refs.filelist.refresh.bind(this), 2000);
			}
		},
		status(to, from) {
			//const printing = isPrinting(to);
			const wasPrinting = isPrinting(from);
			if (to === StatusType.halted && wasPrinting){
				// When "Emergency stop". duration seems to be difficult to get here since job is not running anymore at this time.
				// duration is only an approximation is it manages to get it, probably slightly below the real duration.
				this.updateHistory({filePath:this.customCurrentJob, duration:this.job.duration, status:this.$t('list.jobs.status.halted')});
			}

			/* if (from === StatusType.cancelling && !printing){
				// Cancelling with M0 doesn't really seem to trigger StatusType.cancelling, so it never goes here.
				this.updateHistory({filePath:this.job.file.fileName, duration:this.job.duration, status:this.$t('list.jobs.status.cancelled')});
			} */

			if (this.customCurrentJob !== undefined && from === StatusType.disconnected && to == StatusType.idle && this.jobsHistory[this.customCurrentJob].status === this.$t('list.jobs.status.ongoing')){
				// If disconnexion just occured, not printing anymore, and last job done is still labelled as "ongoing"
				if (this.lastFileDuration !== null && this.lastFileDuration > 0){
					// In case the current print finished successfully while a disconnexion was occuring
					this.updateHistory({filePath:this.customCurrentJob, duration:this.lastFileDuration, status:this.$t('list.jobs.status.success')});
				}
				else if (this.lastFileDuration === 0){
					// In case the current print was cancelled by the machine while a disconnexion was occuring
					this.updateHistory({filePath:this.customCurrentJob, duration:undefined, status:this.$t('list.jobs.status.cancelled')});
				}
			}
		},
		currentJob(to) {
			// This is only updated when a new job is printed. This allows to access the current job even if it has just been cancelled / halted.
			if((to !== null && to !== undefined)){
				this.customCurrentJob = to;
			}
		},
		lastFileDuration(to) {
			if(to === 0){
				// Can be "cancelled by user", "cancelled by machine" or "halted". duration is only an approximation here, probably slightly below the real duration.
				// If "cancelled by user" : already set to "Cancelled by user" when clicking Cancel button
				// If "halted" : already set to "Halted" when status changes
				// The only option left is "Cancelled by machine"
				//console.log(`lastFileDuration to : ${to} (should be 0)`);
				this.updateHistory({filePath:this.customCurrentJob, duration:undefined, status:this.$t('list.jobs.status.cancelled')});
			}
			else if(to !== null){
				// if lastFileDuration is updated to something different than 0 or null, then it must be a success.
				//console.log(`lastFileDuration to : ${to} (should not be null)`);
				this.updateHistory({filePath:this.customCurrentJob, duration:to, status:this.$t('list.jobs.status.success')});
			}
		},
	}
}
</script>
