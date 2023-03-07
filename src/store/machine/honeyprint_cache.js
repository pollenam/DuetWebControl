'use strict'

// import { FileNotFoundError } from '@/utils/errors.js'
import patch from '@/utils/patch.js'
import Path from '@/utils/path.js'
import Vue from 'vue'

export default function(connector) {
	return {
		namespaced: true,
		state: {
			showed_macros: [],
      extrudersAvailableMaterials: ['ABS', 'PLA', 'TPU'],
      extrudersSelectedMaterials: ['ABS', 'ABS', 'ABS', 'ABS'],
			selectedPid: ['','','',''],
			lastPrintedJob: [],
			infiniteExtrusionRate: [1.2, 1.2, 1.2, 1.2],
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
		mutations: {
			load: (state, content) => patch(state, content),
			addFileToShowedMacro(state, filename) {
				state.showed_macros = state.showed_macros.filter(item => item !== filename);
				state.showed_macros.push(filename);
			},
			removeFileToShowedMacro(state, filename) {
				state.showed_macros = state.showed_macros.filter(item => item !== filename);
			},
			selectInfiniteExtrusionRate(state, data) {
				state.infiniteExtrusionRate[data.index] = data.value;
				Vue.set(state.infiniteExtrusionRate, data.index, data.value);
			},
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
			addLastPrintedJobDate(state, filename){

				var alreadyPrinted = false;
				state.lastPrintedJob.forEach(element => {
					if(element.name  === filename) {
						element.date =  Date.now();
						alreadyPrinted = true;
					}
				});

				if (alreadyPrinted === false) {
					state.lastPrintedJob.push({name: filename, date: Date.now()});
				}
			}
		}
	}
}
