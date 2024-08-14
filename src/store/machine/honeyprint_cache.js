'use strict'

// import { FileNotFoundError } from '@/utils/errors.js'
import patch from '@/utils/patch.js'
import Path from '@/utils/path.js'
import Vue from 'vue'
import i18n from '@/i18n'

export default function(connector) {
	return {
		namespaced: true,
		state: {
			showed_macros: [],
      		extrudersAvailableMaterials: ['ABS', 'PLA', 'TPU'],
      		extrudersSelectedMaterials: ['ABS', 'ABS', 'ABS', 'ABS'],
			selectedPid: ['','','',''],
			jobsHistory: {}, // Used to store jobs history. For each job launched, contains : printDate, lastModified, duration, status, type
			extrusionRate: [5, 5, 5, 5],
			zLimit: true
    },
		actions: {
			async load({ commit, dispatch }) {
				if (!connector) {
					return;
				}

				let cache;
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
					commit('load', cache);
				}

				// setTimeout(() => {
				//   console.log("reloading");
				//   load(commit, dispatch);
				// }, 5000)
			},
			save({ state, dispatch }) {
				if (!connector) {
					return;
				}

				try {
					const content = new Blob([JSON.stringify(state)]);
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
			selectedExtruderMaterial(state, data) {
				if (state.extrudersAvailableMaterials.indexOf(data.newValue) == -1)
				{
				state.extrudersAvailableMaterials.push(data.newValue);
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
					state.jobsHistory[data.newFilePath] = state.jobsHistory[data.oldFilePath];
					Vue.delete(state.jobsHistory, data.oldFilePath);
				}
			},
			deleteJobHistory(state, filePath){
				// Deletes corresponding object in jobsHistory when a gcode is deleted to prevent data from growing indefinitely.
				if(filePath in state.jobsHistory){
					Vue.delete(state.jobsHistory, filePath);
				}
			},
			addJobHistory(state, data){
				// printDetails : printDate, lastModified, duration, success, type (print or simulation)
				// Adds a key to JobsHistory if it doesn't already exist. Adds an object (a new row) corresponding to the job data.
				if(data.filePath == null || data.filePath === undefined || data.filePath.trim().length === 0){
					return;
				}

				if(!(data.filePath in state.jobsHistory)){
					state.jobsHistory[data.filePath] = [];
				}
				state.jobsHistory[data.filePath].push(data.printDetails);
			},
			updateHistory(state, data){
				// printDetails : printDate, lastModified, duration, success, type (print or simulation)
				// Updates the object of a given file corresponding to the last job launched for this file.
				// Can only update duration and status since the rest of the data has no reason to change.
				if(data.filePath == null || data.filePath === undefined || data.filePath.trim().length === 0){
					return;
				}

				if(!(data.filePath in state.jobsHistory)){
					state.jobsHistory[data.filePath] = [];
				}
				else{
					const jobHistory = state.jobsHistory[data.filePath];
					const itemToUpdate = jobHistory[jobHistory.length - 1]; // get last element of array
					const newStatus = itemToUpdate.status == i18n.t('list.jobs.status.ongoing') ? data.status : itemToUpdate.status; // only change the status if it was 'Ongoing' (default)
					const printDetails = {
						'printDate': itemToUpdate.printDate, 
						'lastModified': itemToUpdate.lastModified,
						'duration': data.duration === undefined ? itemToUpdate.duration : data.duration,
						'status': data.status === undefined ? itemToUpdate.status : newStatus,
						'type': itemToUpdate.type
					}
					state.jobsHistory[data.filePath][jobHistory.length - 1] = printDetails;
				}				
			}
		}
	}
}
