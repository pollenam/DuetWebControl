import { BaseConnector } from "@duet3d/connectors";
import ObjectModel, { Axis, AxisLetter, Board, Extruder, Fan, Heat, Heater, initCollection, initObject, MachineStatus, Move, Network, Plugin, Probe, Sensors, State, Tool } from "@duet3d/objectmodel";
import Vue from "vue";
import type { Module } from "vuex";

import { translateResponse } from "@/i18n";
import { isPaused, isPrinting } from "@/utils/enums";
import patch from "@/utils/patch";

import { RootState } from "..";

/**
 * Default object model used to display initial values.
 * This does not need to be reactive because it is not expected to change
 */
export const DefaultModel = initObject(ObjectModel, {
	boards: initCollection(Board, [
		{}
	]),
	fans: initCollection(Fan, [
		{}
	]),
	heat: initObject(Heat, {
		bedHeaters: [
			0
		],
		heaters: initCollection(Heater, [
			{},
			{}
		])
	}),
	move: initObject(Move, {
		axes: initCollection(Axis, [
			{
				letter: AxisLetter.X,
				homed: true,
				machinePosition: 0,
				userPosition: 0
			},
			{
				letter: AxisLetter.Y,
				homed: true,
				machinePosition: 0,
				userPosition: 0
			},
			{
				letter: AxisLetter.Z,
				homed: true,
				machinePosition: 0,
				userPosition: 0
			}
		]),
		extruders: initCollection(Extruder, [
			{}
		])
	}),
	network: initObject(Network, {
		name: 'Duet Web Control'
	}),
	sensors: initObject(Sensors, {
		probes: initCollection(Probe, [
			{}
		])
	}),
	state: initObject(State, {
		status: MachineStatus.disconnected
	}),
	tools: initCollection(Tool, [
		{
			number: 0,
			active: [0],
			standby: [0],
			heaters: [1],
			extruders: [0],
			spindle: -1,
			spindleRpm: 0
		}
	])
});

/**
 * Type of a Vuex machine model module
 */
export type MachineModel = Module<ObjectModel, RootState>;

/**
 * Generate a Vuex machine model module from a connector instance.
 * If no connector is passed, the default object model is returned 
 * @param connector Connector used by the machine module instance
 * @returns Machine model module
 */
export default function (connector: BaseConnector | null): MachineModel {
	// If a connector is given, just update the hostname and name
	const typedState = !connector ? DefaultModel : new ObjectModel();
	if (connector !== null) {
		typedState.network.hostname = connector.hostname;
		typedState.network.name = `(${connector.hostname})`;
	}

	const state = JSON.parse(JSON.stringify(!connector ? DefaultModel : new ObjectModel()));
	state.global = new Map<string, any>();
	state.plugins = new Map<string, Plugin>();
	for (const [key, value] of typedState.plugins) {
		state.plugins.set(key, JSON.parse(JSON.stringify(value)));
	}

	// Generate the Vuex module
	return {
		namespaced: true,
		state,
		getters: {
			currentTool(state) {
				if (state.state.currentTool >= 0 && state.state.currentTool < state.tools.length) {
					return state.tools[state.state.currentTool];
				}
				return null;
			},
			fractionPrinted(state) {
				if (state.job.file && state.job.filePosition !== null && state.job.file.size > 0) {
					return (state.job.filePosition as number) / (state.job.file.size as number);
				}
				return 0;
			},
			minHeaterTemperature(state) {
				let minTemp: number | null = null;
				for (const heater of state.heat.heaters) {
					if (heater !== null && heater.min > -273 && (minTemp === null || heater.min < minTemp)) {
						minTemp = heater.min;
					}
				}
				return minTemp;
			},
			maxHeaterTemperature(state) {
				let maxTemp: number | null = null;
				for (const heater of state.heat.heaters) {
					if (heater !== null && (maxTemp === null || heater.max > maxTemp)) {
						maxTemp = heater.max;
					}
				}
				return maxTemp;
			},
			jobProgress(state, getters) {
				if (isPrinting(state.state.status)) {
					if (!isPaused(state.state.status) && state.state.status !== MachineStatus.simulating && state.move.extruders.length > 0 && state.job.file !== null && state.job.file.filament.length > 0) {
						// Get the total amount of filament extruded (according to the slicer)
						let totalRawExtruded = 0;
						for (const extruder of state.move.extruders) {
							totalRawExtruded += extruder.rawPosition;
						}

						// Compute the progress according to the filamet usage
						const totalFilamentRequired = state.job.file.filament.reduce((a, b) => a + b);
						if (totalFilamentRequired > 0) {
							// Limit the maximum in case the user put extra extrusions in the start/end G-code
							return Math.min(totalRawExtruded / totalFilamentRequired, 1);
						}
					}
					return getters.fractionPrinted;
				}
				return state.job.lastFileName ? 1 : 0;
			}
		},
		mutations: {
			update(state, data: any) {
				// Check for i18n actions
				if (data.state instanceof Object) {
					if (typeof data.state.displayMessage === "string") {
						data.state.displayMessage = translateResponse(data.state.displayMessage);
					}
					if (data.state.messageBox instanceof Object) {
						if (typeof data.state.messageBox.message === "string") {
							data.state.messageBox.message = translateResponse(data.state.messageBox.message);
						}
						if (typeof data.state.messageBox.title === "string") {
							data.state.messageBox.title = translateResponse(data.state.messageBox.title);
						}
					}
				}

				// Update typed state
				typedState.update(data);

				// FIXME This solution isn't great but Vue.observable messes up our fully-typed ObjectModel class...
				// It may be necessary to upgrade to Vue 3 sooner than expected, because it does not suffer from the same limitations as Vue 2
				for (const key in data) {
					if (key === "global") {
						const clonedVariables = new Map<string, any>();
						for (const [key, value] of typedState.global) {
							clonedVariables.set(key, value);
						}
						Vue.set(state, "global", clonedVariables);
					} else if (key === "job") {
						patch(state.job, typedState.job);
						if (data.job.file && data.job.file.customInfo !== undefined) {
							const clonedCustomInfo = new Map<string, any>();
							for (const [key, value] of typedState.job.file!.customInfo) {
								clonedCustomInfo.set(key, value);
							}
							Vue.set(state.job.file!, "customInfo", data.job.file.customInfo);
						}
					} else if (key === "plugins") {
						const clonedPlugins = new Map<string, Plugin>();
						for (const [key, value] of typedState.plugins) {
							const clonedPlugin = JSON.parse(JSON.stringify(value));
							if (value !== null) {
								for (const [dataKey, dataValue] of value.data) {
									clonedPlugin.data[dataKey] = dataValue;
								}
							}
							clonedPlugins.set(key, clonedPlugin);
						}
						Vue.set(state, "plugins", clonedPlugins);
					} else if (key === "sbc" && state.sbc === null) {
						Vue.set(state, "sbc", data.sbc);
					} else {
						patch((state as any)[key], (typedState as any)[key]);
					}
				}
			}
		}
	};
}
