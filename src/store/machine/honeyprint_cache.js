'use strict'

import { FileNotFoundError } from '@/utils/errors.js'
import patch from '@/utils/patch.js'
import Path from '@/utils/path.js'

export default function(connector) {
	return {
		namespaced: true,
		state: {
			showed_macros: [],
      extrudersAvailableMaterials: ['ABS', 'PLA', 'TPU'],
      extrudersSelectedMaterials: ['ABS', 'ABS', 'ABS', 'ABS'],
			selectedPid: ['','','','']
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
					if (!(e instanceof FileNotFoundError)) {
						throw e;
					}
				}
				//Create file if cache is empty
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
				if (state.extrudersAvailableMaterials.indexOf(data.newValue) == -1)
        {
          state.extrudersAvailableMaterials.push(data.newValue);
        }
            // We have to manually do that and not use v-model on the combobox to avoid errors
        // https://stackoverflow.com/questions/46044276/vuex-do-not-mutate-vuex-store-state-outside-mutation-handlers
        state.selectedPid[data.extruderIndex] = data.newValue;
      }
		}
	}
}
