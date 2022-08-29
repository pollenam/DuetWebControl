'use strict'

import { defaultMachine } from './machine'

let settingsTimer, machineSettingsTimer = {}, machineCacheTimer = {}

export function resetCacheTimer(machine) {
	if (machineCacheTimer[machine]) {
		clearTimeout(machineCacheTimer[machine]);
		machineCacheTimer[machine] = undefined;
	}
}

export function resetSettingsTimer(machine) {
	if (!machine) {
		if (settingsTimer) {
			clearTimeout(settingsTimer);
			settingsTimer = undefined;
		}
	} else if (machineSettingsTimer[machine]) {
		clearTimeout(machineSettingsTimer[machine]);
		machineSettingsTimer[machine] = undefined;
	}
}

export default function(store) {
	// Observe the mutations of the store and make sure the cache and
	// settings are saved automatically after a certain debounce delay
	store.subscribe(function(mutation, state) {
		if (!mutation.type.endsWith('/load') && !mutation.type.endsWith('/setLastHostname')) {
			const machineMatches = /^machines\/(.+)\//.exec(mutation.type);
			const machine = machineMatches ? machineMatches[1] : state.selectedMachine;
			if (machine === defaultMachine) {
				return;
			}

			if (mutation.type.startsWith('settings')) {
				// Global settings have changed
				if (settingsTimer) {
					clearTimeout(settingsTimer);
				}

				settingsTimer = setTimeout(function() {
					settingsTimer = undefined;
					store.dispatch('settings/save');
				}, store.state.settings.settingsSaveDelay);
			} else if (mutation.type.indexOf('/settings/') !== -1) {
				// Machine settings have changed
				if (machineSettingsTimer[machine]) {
					clearTimeout(machineSettingsTimer[machine]);
				}

				machineSettingsTimer[machine] = setTimeout(function() {
					machineSettingsTimer[machine] = undefined;
					if (store.state.machines[machine] !== undefined) {
						store.dispatch(`machines/${machine}/settings/save`);
					}
				}, store.state.settings.settingsSaveDelay);
			} else if (mutation.type.indexOf('/cache/') !== -1) {
				// Machine cache has changed
				if (machineCacheTimer[machine]) {
					clearTimeout(machineCacheTimer[machine]);
				}

				machineCacheTimer[machine] = setTimeout(function() {
					machineCacheTimer[machine] = undefined;
					if (store.state.machines[machine] !== undefined) {
						store.dispatch(`machines/${machine}/cache/save`);
					}
				}, store.state.settings.cacheSaveDelay);
			} else if  (mutation.type.indexOf('/honeyprint_cache/')  !== -1 ) {
				machineCacheTimer[machine] = setTimeout(function() {
						store.dispatch(`machine/honeyprint_cache/save`);
				}, store.state.settings.cacheSaveDelay);
			}
		}
	});
}
