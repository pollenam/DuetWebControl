'use strict'

import { FileNotFoundError } from '@/utils/errors.js'
import patch from '@/utils/patch.js'
import Path from '@/utils/path.js'
import Vue from 'vue'

// Older versions stored localized labels in the history entries. They are
// converted to locale-independent keys when the history is loaded, so the
// stored data no longer depends on the UI language.
const legacyStatusKeys = {
	'En cours': 'ongoing', 'Ongoing': 'ongoing',
	'Succès': 'success', 'Success': 'success',
	'Annulé par le système': 'cancelled', 'Cancelled by machine': 'cancelled',
	'Annulé par un utilisateur': 'cancelledByUser', 'Cancelled by user': 'cancelledByUser',
	'Interrompu': 'halted', 'Halted': 'halted'
}
const legacyTypeKeys = {
	'Impression': 'print', 'Print': 'print',
	'Simulation': 'simulation'
}

export default function(connector) {
	return {
		namespaced: true,
		state: {
			showed_macros: [],
      		extrudersAvailableMaterials: [], // Populated from pam_materials.json (only entries with show_material === true)
      		pamMaterials: {}, // Full material data loaded from pam_materials.json: { <name>: { Cold, Extruder, Nozzle, show_material } }
      		extrudersSelectedMaterials: ['ABS', 'ABS', 'ABS', 'ABS'],
			selectedPid: ['','','',''],
			jobsHistory: {}, // Read-only cache of the jobs history for display. Written by the external history daemon, never from DWC.
			extrusionRate: [5, 5, 5, 5],
			zLimit: true
    },
		actions: {
			async load({ state, commit, dispatch }) {
				if (!connector) {
					return;
				}

				let cache, legacyJobsHistory;
				try {
					cache = await dispatch(`machine/download`, {
						filename: Path.honeyprintStoreFile,
						showProgress: false,
						showSuccess: false,
						showError: false
					}, { root: true });
				} catch (e) {
          console.log("HoneyprintCache load: error downloading");
          /*
           * Let's stop throwing this now that we don't have a defaul file
					if (!(e instanceof FileNotFoundError)) {
						throw e;
					}
           */
				}
				//Create file if cache is empty
        /*
         *
         * Disable here
         *
				if(!cache) {
					try {
						const content = new Blob([JSON.stringify({
							showed_macros: []
							})]);
						await dispatch(`machine/upload`, {
							filename: Path.honeyprintStoreFile,
							content,
							showProgress: false,
							showSuccess: false,
							showError: false
						}, { root: true });
						cache = {};
					} catch (e) {
						// handled before we get here
					}
				}
        */

				if (cache) {
					if (cache.jobsHistory) {
						legacyJobsHistory = cache.jobsHistory;
						delete cache.jobsHistory;
					}
					// Available materials must come exclusively from pam_materials.json,
					// never from the (possibly stale) honeyprint store cache.
					delete cache.extrudersAvailableMaterials;
					delete cache.pamMaterials;
					commit('load', cache);
				}

				// Load the list of selectable materials from pam_materials.json
				let pamMaterials;
				try {
					pamMaterials = await dispatch(`machine/download`, {
						filename: Path.pamMaterialsFile,
						showProgress: false,
						showSuccess: false,
						showError: false
					}, { root: true });
				} catch (e) {
					console.log("HoneyprintCache load: error downloading pam_materials.json");
				}

				if (pamMaterials) {
					commit('loadMaterials', pamMaterials);
				}

				await dispatch('loadJobsHistoryFromBoard');
				if (legacyJobsHistory && Object.keys(state.jobsHistory).length === 0) {
					// Show the legacy history that used to live in the store file. DWC no
					// longer writes the history (the external daemon owns it) — display only.
					commit('loadJobsHistory', legacyJobsHistory);
				}
			},
			// Downloads the jobs history file for display only. DWC never writes this file:
			// it is produced by the external history daemon, DWC just reads it.
			async loadJobsHistoryFromBoard({ commit, dispatch }) {
				if (!connector) {
					return;
				}

				let fileContent;
				try {
					fileContent = await dispatch(`machine/download`, {
						filename: Path.honeyprintJobsHistoryFile,
						showProgress: false,
						showSuccess: false,
						showError: false
					}, { root: true });
				} catch (e) {
					if (!(e instanceof FileNotFoundError)) {
						console.log("HoneyprintCache: error downloading jobs history");
					}
					return;
				}

				if (fileContent && fileContent.jobsHistory) {
					commit('loadJobsHistory', fileContent.jobsHistory);
				}
			},
			// Periodic refresh of the data that may be changed from outside this tab
			// (showed macros, materials). The jobs history is deliberately NOT reloaded
			// here: this tab is its writer, and replacing it with the on-disk copy
			// could revert updates whose upload is still pending or has failed.
			async refresh({ dispatch, commit }) {
				if (!connector) {
					return;
				}

				// Re-read the history so the display reflects the external daemon's latest writes
				dispatch('loadJobsHistoryFromBoard');

				let cache;
				try {
					cache = await dispatch(`machine/download`, {
						filename: Path.honeyprintStoreFile,
						showProgress: false,
						showSuccess: false,
						showError: false
					}, { root: true });
				} catch (e) {
					console.log("HoneyprintCache refresh: error downloading");
				}

				if (cache) {
					delete cache.jobsHistory;
					delete cache.extrudersAvailableMaterials;
					delete cache.pamMaterials;
					commit('load', cache);
				}

				let pamMaterials;
				try {
					pamMaterials = await dispatch(`machine/download`, {
						filename: Path.pamMaterialsFile,
						showProgress: false,
						showSuccess: false,
						showError: false
					}, { root: true });
				} catch (e) {
					console.log("HoneyprintCache refresh: error downloading pam_materials.json");
				}

				if (pamMaterials) {
					commit('loadMaterials', pamMaterials);
				}
			},
			// DWC only persists UI preferences (showed macros, PID…). The jobs history
			// is owned by the external history daemon and is never written from here.
			save({ state, dispatch }) {
				if (!connector) {
					return;
				}

				try {
					const storeState = Object.assign({}, state);
					delete storeState.jobsHistory;
					// Materials are sourced from pam_materials.json, not persisted here
					delete storeState.extrudersAvailableMaterials;
					delete storeState.pamMaterials;

					const content = new Blob([JSON.stringify(storeState)]);
					dispatch(`machine/upload`, {
						filename: Path.honeyprintStoreFile,
						content,
						showProgress: false,
						showSuccess: false,
						showError: false
					}, { root: true });
				} catch (e) {
					// handled before we get here
				}
			}
		},
		// mutations functions can only take 2 parameters maximum. 
		//The first one is "state", the second one can be anything (simple variable or object containing several key, value pairs)
		mutations: {
			load: (state, content) => patch(state, content),
			loadJobsHistory: (state, jobsHistory) => {
				if (jobsHistory) {
					// Convert localized labels from older versions to locale-independent keys
					for (const filePath in jobsHistory) {
						const entries = jobsHistory[filePath];
						if (entries instanceof Array) {
							entries.forEach(entry => {
								if (entry.status in legacyStatusKeys) {
									entry.status = legacyStatusKeys[entry.status];
								}
								if (entry.type in legacyTypeKeys) {
									entry.type = legacyTypeKeys[entry.type];
								}
							});
						}
					}
				}
				state.jobsHistory = jobsHistory || {};
			},
			addFileToShowedMacro(state, filename) {
				state.showed_macros = state.showed_macros.filter(item => item !== filename);
				state.showed_macros.push(filename);
			},
			removeFileToShowedMacro(state, filename) {
				state.showed_macros = state.showed_macros.filter(item => item !== filename);
			},
			/* selectInfiniteExtrusionRate(state, data) {
				state.extrusionRate[data.index] = data.value;
				Vue.set(state.extrusionRate, data.index, data.value);
			}, */
			setZlimit(state, data) {
				state.zLimit = data;
			},
			loadMaterials(state, materials) {
				// materials : { <name>: { Cold, Extruder, Nozzle, show_material } }
				state.pamMaterials = materials || {};
				// Only expose materials explicitly flagged with show_material === true
				state.extrudersAvailableMaterials = Object.keys(state.pamMaterials)
					.filter(name => state.pamMaterials[name] && state.pamMaterials[name].show_material === true);

				// Default each extruder to the first visible material when its current
				// selection isn't part of the available list (e.g. hidden or unknown material)
				const firstMaterial = state.extrudersAvailableMaterials[0] || '';
				state.extrudersSelectedMaterials = state.extrudersSelectedMaterials.map(selected =>
					state.extrudersAvailableMaterials.indexOf(selected) === -1 ? firstMaterial : selected);
			},
			selectedExtruderMaterial(state, data) {
				// Creation of new materials is not allowed: only accept values
				// that exist in the list loaded from pam_materials.json
				if (state.extrudersAvailableMaterials.indexOf(data.newValue) == -1) {
					return;
				}

				// We have to manually do that and not use v-model on the combobox to avoid errors
				// https://stackoverflow.com/questions/46044276/vuex-do-not-mutate-vuex-store-state-outside-mutation-handlers
				state.extrudersSelectedMaterials[data.extruderIndex] = data.newValue;
			},
					selectSelectedPid(state, data) {
					// We have to manually do that and not use v-model on the combobox to avoid errors
				// https://stackoverflow.com/questions/46044276/vuex-do-not-mutate-vuex-store-state-outside-mutation-handlers
				state.selectedPid[data.extruderIndex] = data.newValue;
			},
			renameJobHistory(state, data){
				// data : oldFilePath, newFilePath
				// Changes key in jobsHistory when a gcode is renamed.
				if(data.oldFilePath in state.jobsHistory && !(data.newFilePath in state.jobsHistory)){
					Vue.set(state.jobsHistory, data.newFilePath, state.jobsHistory[data.oldFilePath]);
					Vue.delete(state.jobsHistory, data.oldFilePath);
				}
			},
			deleteJobHistory(state, filePath){
				// Deletes corresponding object in jobsHistory when a gcode is deleted to prevent data from growing indefinitely.
				if(filePath in state.jobsHistory){
					Vue.delete(state.jobsHistory, filePath);
				}
			}
		}
	}
}
