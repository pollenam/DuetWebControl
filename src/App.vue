<style>
#title:not(:hover) {
	color: inherit;
}

.empty-table-fix td {
	padding-left: 0 !important;
	padding-right: 0 !important;
}

.global-control.theme--light {
	background-color: #F5F5F5 !important;
}
#global-container .v-card.theme--light {
	background-color: #F5F5F5 !important;
}

.not_legacy {
	height: 100%
}

.global-control.theme--dark {
	background-color: #515151 !important;
}
#global-container .v-card.theme--dark {
	background-color: #515151 !important;
}

input[type='number'] {
	-moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
}

a:not(:hover) {
	text-decoration: none;
}

textarea {
	line-height: 1.25rem !important;
}

.theme--dark textarea {
	caret-color: #FFF;
}

.v-item-group.theme--dark .v-btn__content {
	color: #FFF !important;
}

.v-speed-dial--fixed {
	z-index: 5;
}

.v-btn {
	text-transform: unset !important;
}
</style>

<template>
	<v-app>
		<v-navigation-drawer v-if="!showBottomNavigation" v-model="drawer" clipped fixed app :width="$vuetify.breakpoint.smAndDown ? 275 : 256" :expand-on-hover="iconMenu" :mini-variant="iconMenu">
			<div class="mb-3 hidden-sm-and-up">
				<div class="ma-2">
					<connect-btn v-if="showConnectButton" class="mb-2" block/>
				</div>
				<div class="ma-2">
        <v-btn block href="https://pollenam.zendesk.com/" target="_blank" rel="nooperner">Support</v-btn>
        </div>
		<div class="ma-2 d-flex justify-space-around">
          <atx-btn-pollen class="mt-2"></atx-btn-pollen>
          <doors-btn-pollen class="mt-2"></doors-btn-pollen>
        </div>
			</div>

			<v-list class="pt-0" :dense="!$vuetify.breakpoint.smAndDown" :expand="!$vuetify.breakpoint.smAndDown">
				<v-list-group v-for="(category, index) in categories" :key="index" :prepend-icon="category.icon" no-action :value="isExpanded(category)">
					<template #activator>
						<v-list-item-title class="mr-0">
							{{ category.translated ? category.caption : $t(category.caption) }}
						</v-list-item-title>
					</template>

					<v-list-item v-for="(page, pageIndex) in getPages(category)" :key="`${index}-${pageIndex}`" v-ripple :to="page.path" @click.prevent="">
						<v-list-item-icon>
							<v-icon v-text="page.icon"></v-icon>
						</v-list-item-icon>
						<v-list-item-title>
							{{ page.translated ? page.caption : $t(page.caption) }}
						</v-list-item-title>
					</v-list-item>
				</v-list-group>
			</v-list>
		</v-navigation-drawer>

		<v-app-bar ref="appToolbar" app clipped-left>
			<v-app-bar-nav-icon v-show="!showBottomNavigation" @click.stop="drawer = !drawer">
				<v-icon>mdi-menu</v-icon>
			</v-app-bar-nav-icon>
      <router-link class="px-1" to="/" id="title">{{ name }}</router-link>
			<connect-btn v-if="showConnectButton" class="hidden-xs-only ml-3"/>

      <atx-btn-pollen class="hidden-xs-only ml-12"></atx-btn-pollen>
      <doors-btn-pollen class="hidden-xs-only"></doors-btn-pollen>
      <a href="https://pollenam.zendesk.com/" target="_blank" rel="nooperner" class="hidden-xs-only ml-5 text-white">Support</a>

			<div style="-webkit-box-flex: 1 !important; -ms-flex-positive: 1 !important; flex-grow: 0.6 !important;">
			</div>
      <!-- <v-img src="./assets/honeyprint-sx2-logo.png" aspect-ratio="1" contain height="30px" class="hidden-md-and-down"></v-img> -->
      <v-img src="./assets/honeyprint-sx2-logo-small.png" aspect-ratio="1" contain height="30px"></v-img>

			<div style="-webkit-box-flex: 1 !important; -ms-flex-positive: 1 !important; flex-grow: 0.6 !important;">
			</div>

      <div class="v-toolbar-pollen-item mr-12">
        <span class="hidden-md-and-down">
          <v-icon small class="mr-1">mdi-information</v-icon> {{ $t('panel.status.caption') }}
        </span>

        <status-label-pollen class="ml-2"></status-label-pollen>
      </div>

			<emergency-btn/>
		</v-app-bar>

		<v-main id="content">
			<v-container class="hidden-sm-and-down" id="global-container" fluid v-if="isLegacyView">
				<fff-container-panel v-if="isFFForUnset" />
				<cnc-container-panel v-else/>
			</v-container>

			<v-divider class="hidden-sm-and-down"/>

			<v-container :class="{not_legacy: !isLegacyView }" fluid>
				<keep-alive>
					<router-view/>
				</keep-alive>
			</v-container>
		</v-main>

		<notification-display/>

		<v-bottom-navigation v-if="showBottomNavigation" app>
			<v-menu v-for="(category, index) in categories" :key="index" top offset-y>
				<template #activator="{ on }">
					<v-btn v-on="on">
						{{ category.translated ? category.caption : $t(category.caption) }}
						<v-icon v-text="category.icon" class="mb-1"/>
					</v-btn>
				</template>

				<v-list-item v-for="(page, pageIndex) in getPages(category)" :key="`${index}-${pageIndex}`" :to="page.path" @click.prevent="" class="global-control">
					<v-icon v-text="page.icon" class="mr-2"/>
					{{ page.translated ? page.caption : $t(page.caption) }}
				</v-list-item>
			</v-menu>
		</v-bottom-navigation>

		<connect-dialog/>
		<connection-dialog/>
		<file-transfer-dialog/>
		<messagebox-dialog/>
		<plugin-install-dialog/>

		<component v-for="component in injectedComponentNames" :is="component" :key="component"/>

    <console-drawer-pollen-dialog></console-drawer-pollen-dialog>
	</v-app>
</template>

<script>
'use strict'

import Vue from 'vue'
import Piecon from 'piecon'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import { Menu, Routes } from './routes'
import { isPrinting, StatusType } from './store/machine/modelEnums.js'
import { MachineMode } from './store/machine/modelEnums.js';
import { DashboardMode } from './store/settings.js'

export default {
	computed: {
		...mapState({
			boards: state => state.machine.model.boards,
			job: state => state.machine.model.job,
			currentJobFile: state => state.machine.model.job.file.fileName,
			lastFileDuration: state => state.machine.model.job.lastDuration,
			lastFileName: state => state.machine.model.job.lastFileName,
			jobsHistory: state => state.machine.honeyprint_cache.jobsHistory,
			menuDirectory: state => state.machine.model.directories.menu,
			name: state => state.machine.model.network.name,
			status: state => state.machine.model.state.status,
			stopByUser: state => state.machine.model.global.stop_by_user,

			darkTheme: state => state.settings.darkTheme,
			webcam: state => state.settings.webcam,
			machineMode: state => state.machine.model.state.machineMode,
			bottomNavigation: state => state.settings.bottomNavigation,
			iconMenu: state => state.settings.iconMenu,
			injectedComponents: state => state.uiInjection.injectedComponents
		}),
		...mapState('settings',['dashboardMode']),
		...mapGetters('machine', ['hasTemperaturesToDisplay']),
		...mapGetters('machine/model', ['jobProgress']),
		categories() {
			return Object.keys(Menu)
				.map(key => Menu[key])
				.filter(item => item.condition || item.pages.some(page => page.condition));
		},
		currentPageCondition() {
			const currentRoute = this.$route;
			let checkRoute = function(route, isChild) {
				let flag = (route.path === currentRoute.path && route.condition);
				if (!flag && isChild) {
					let curPath = currentRoute.path.replace(/\/$/, '');
					if (curPath.endsWith(route.path))
						flag = (curPath.substring(0, curPath.length-route.path.length) + route.path === curPath && route.condition)
				}
				if (!flag && route.children !== undefined) {
					flag = route.children.some(child => checkRoute(child, true));
				}
				return flag;
			};
			return Routes.some(route => checkRoute(route));
		},
		isFFForUnset() {
			if (this.dashboardMode === DashboardMode.default) {
				return !this.machineMode || this.machineMode === MachineMode.fff;
			}
			return this.dashboardMode === DashboardMode.fff;
		},
		isLegacyView() {
      // FIXME: Update to take into account all legacy views

			const currentRoute = this.$route;

      return currentRoute.path.match(/legacy/);
		},
		showBottomNavigation() {
			return this.$vuetify.breakpoint.mobile && !this.$vuetify.breakpoint.xsOnly && this.bottomNavigation;
		},
	},
	data() {
		return {
			drawer: this.$vuetify.breakpoint.lgAndUp,
			injectedComponentNames: [],
			showConnectButton: process.env.NODE_ENV === 'development',
			trackedHistoryJob: null,
			trackedHistoryCompleted: false,
			stopByUserPending: false
		}
	},
	methods: {
		...mapActions(['connect', 'disconnectAll']),
		...mapActions('machine', { sendMachineCode: 'sendCode' }),
		...mapActions('settings', ['load']),
		...mapMutations('machine/honeyprint_cache', ['addJobHistory', 'updateHistory']),
		isExpanded(category) {
			if (this.$vuetify.breakpoint.smAndDown) {
				const route = this.$route;
				return category.pages.some(page => page.path === route.path);
			}
			return true;
		},
		getPages(category) {
			return category.pages.filter(page => {
				return page.condition
				});
		},
		formatHistoryDate(value) {
			if (!value) {
				return '';
			}

			if (value instanceof Date) {
				return value.toLocaleString();
			}

			const date = new Date(value);
			return isNaN(date.getTime()) ? value.toString() : date.toLocaleString();
		},
		getLastHistoryEntry(filePath) {
			const history = this.jobsHistory[filePath];
			return (history instanceof Array && history.length) ? history[history.length - 1] : null;
		},
		hasOngoingHistory(filePath) {
			const lastEntry = this.getLastHistoryEntry(filePath);
			return lastEntry && lastEntry.status === this.$t('list.jobs.status.ongoing');
		},
		trackStartedJob() {
			const filePath = this.currentJobFile;
			if (!filePath || !isPrinting(this.status)) {
				return;
			}

			this.trackedHistoryJob = filePath;
			this.trackedHistoryCompleted = false;

			if (this.hasOngoingHistory(filePath)) {
				return;
			}

			this.addJobHistory({
				filePath,
				printDetails: {
					printDate: new Date().toLocaleString(),
					lastModified: this.formatHistoryDate(this.job.file.lastModified),
					duration: 0,
					status: this.$t('list.jobs.status.ongoing'),
					type: this.status === StatusType.simulating ? this.$t('list.jobs.type.simulation') : this.$t('list.jobs.type.print')
				}
			});
		},
		finishTrackedJob(status, duration) {
			const filePath = this.trackedHistoryJob || this.currentJobFile || this.lastFileName;
			if (!filePath || this.trackedHistoryCompleted) {
				return;
			}

			const lastEntry = this.getLastHistoryEntry(filePath);
			if (!lastEntry || lastEntry.status !== this.$t('list.jobs.status.ongoing')) {
				this.trackedHistoryCompleted = true;
				return;
			}

			this.updateHistory({ filePath, duration, status });
			this.trackedHistoryCompleted = true;
		},
		getTrackedHistoryFilePath() {
			return this.trackedHistoryJob || this.currentJobFile || this.lastFileName;
		},
		getTrackedHistoryDuration() {
			return (this.job.duration !== null && this.job.duration !== undefined) ? this.job.duration : this.lastFileDuration;
		},
		isStopByUser(value) {
			return value === true || value === 'true' || value === 1 || value === '1';
		},
		async resetStopByUser() {
			try {
				await this.sendMachineCode({ code: 'set global.stop_by_user = false', log: false, noWait: true });
			} catch (e) {
				console.warn(e);
			}
		},
		markTrackedJobCancelledByUser() {
			const filePath = this.getTrackedHistoryFilePath();
			if (!filePath) {
				return;
			}

			this.updateHistory({
				filePath,
				duration: this.getTrackedHistoryDuration(),
				status: this.$t('list.jobs.status.cancelledByUser'),
				forceStatus: true
			});
			this.trackedHistoryCompleted = true;
		},
		handleStopByUser(value) {
			if (!this.isStopByUser(value)) {
				return;
			}

			this.stopByUserPending = true;
			this.markTrackedJobCancelledByUser();
			this.resetStopByUser();
		},
		finishTrackedJobFromDuration(duration) {
			if (duration === null || duration === undefined) {
				return;
			}

			if (this.stopByUserPending) {
				this.finishTrackedJob(this.$t('list.jobs.status.cancelledByUser'), this.getTrackedHistoryDuration());
				this.stopByUserPending = false;
			} else if (duration > 0) {
				this.finishTrackedJob(this.$t('list.jobs.status.success'), duration);
			} else {
				this.finishTrackedJob(this.$t('list.jobs.status.cancelled'), undefined);
			}
		},
		updateTitle() {
			if (this.status === StatusType.disconnected) {
				document.title = `(${this.name})`;
			} else {
				const jobProgress = this.jobProgress;
				const title = ((jobProgress > 0 && isPrinting(this.status)) ? `(${(jobProgress * 100).toFixed(1)}%) ` : '') + this.name;
				if (document.title !== title) {
					document.title = title;
				}
			}
		},
	},
	mounted() {
		// Attempt to disconnect from every machine when the page is being unloaded
		window.addEventListener('unload', this.disconnectAll);

		// Connect if running on a board
		if (process.env.NODE_ENV === 'production') {
			this.connect();
		}

		// Attempt to load the settings
		this.load();

		// Validate navigation
		Vue.prototype.$vuetify = this.$vuetify;
		this.$router.beforeEach((to, from, next) => {
			if (Routes.some(route => route.path === to.path && !route.condition)) {
				next('/');
			} else {
				next();
			}
		});

		// Set up Piecon
		Piecon.setOptions({
			color: '#fa9901',			// Pie chart color
			background: '#bbb',		// Empty pie chart color
			shadow: '#fff',			// Outer ring color
			fallback: false			// Toggles displaying percentage in the title bar (possible values - true, false, 'force')
		});
	},
	watch: {
		currentPageCondition(to) {
			if (!to) {
				this.$router.push('/');
			}
		},
		darkTheme(to) {
			this.$vuetify.theme.dark = to;
		},
		status(to, from) {
			if (to === StatusType.disconnected || from === StatusType.disconnected) {
				this.updateTitle();
			}

			const printing = isPrinting(to);
			if (printing !== isPrinting(from)) {
				if (printing) {
					this.trackStartedJob();
					this.stopByUserPending = false;

					// Go to Job Status when a print starts
					if (this.$router.currentRoute.path !== '/Job/Status') {
						this.$router.push('/Job/Status');
					}
				} else {
					if (to === StatusType.halted) {
						this.finishTrackedJob(this.$t('list.jobs.status.halted'), this.job.duration);
					} else {
						this.finishTrackedJobFromDuration(this.lastFileDuration);
					}

					// Remove the Piecon again when the print has finished
					Piecon.reset();
				}
			}
		},
		currentJobFile(to) {
			if (to && isPrinting(this.status)) {
				this.trackStartedJob();
			}
		},
		stopByUser(to) {
			this.handleStopByUser(to);
		},
		lastFileDuration(to) {
			this.finishTrackedJobFromDuration(to);
		},
		name() { this.updateTitle(); },
		jobProgress(to, from) {
			if (isPrinting(this.status) && Math.round(to * 100) !== Math.round(from * 100)) {
				Piecon.setProgress(to * 100);
			}
			this.updateTitle();
		},
		injectedComponents() {
			this.injectedComponents.forEach(function(item) {
				if (this.injectedComponentNames.indexOf(item.name) === -1) {
					this.$options.components[item.name] = item.component;
					this.injectedComponentNames.push(item.name);
				}
			}, this);
		}
	}
}
</script>
