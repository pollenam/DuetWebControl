<style lang="scss" scoped>
.heightmap-container {
	background-color: #000;
	color: #fff;
	border-radius: 8px;
	display: flex;
	height: 50%;
}

.v-data-table.heightmap-base-file-list {
  max-height: 240px;
  overflow-y: scroll;
}

.v-data-table.heightmap-offsets-table {

  .v-data-table__wrapper {
    table {
      tbody {
        tr {
          td {
            padding: 0px 8px;
            white-space: nowrap;

            .heightmap-offsets-input {
              width: 60px !important;
              padding: 4px 6px;
            }
          }
        }
      }
    }
  }
}

h1 {
	width: 100%;
	align-self: center;
}

.canvas-container {
	position: relative;
	height: 100%;
	width: 100%;
	overflow: hidden;
}

.canvas-container > :first-child {
	border-radius: 4px 0 0 4px;
}

.canvas-container > :last-child {
	border-radius: 0 4px 4px 0;
}

.canvas-container > canvas {
	position: absolute;

}

.no-cursor {
	pointer-events: none;
}

.slider {
	width: 150px;
}

input[type='number'] {
	-moz-appearance: number !important;
	width:50px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: textfield  !important;
}

input {
	background-color: #fff8e1!important;
  padding: 4px 6px;
}

</style>

<template>
	<v-col cols="12">
    <v-row dense>
      <v-col cols="12" lg="8">
				<v-card elevation="0" class="h-100 d-flex flex-column">
          <v-card-title class="v-card__title--dense">
						<v-icon class="mr-2">mdi-dots-grid</v-icon>
						{{ $t('plugins.heightmap.listTitle') }}
						<v-spacer></v-spacer>
						<v-icon @click="refresh" class="ml-2">mdi-refresh</v-icon>
					</v-card-title>


					<v-data-table v-model="innerValue" v-bind="$props"
						:items="files" item-key="name" :headers="defaultHeaders" disable-pagination hide-default-footer :mobile-breakpoint="0"
						class="base-file-list heightmap-base-file-list elevation-0" :class="{ 'empty-table-fix' : !files.length }"
						:sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
						>

						<template #no-data>
							<slot name="no-data">
								<v-alert :value="true" type="info" class="text-left ma-0" @contextmenu.prevent="">
									{{ $t('list.baseFileList.noFiles') }}
								</v-alert>
							</slot>
						</template>

						<template #item="props">
							<tr :data-filename="(props.item.isDirectory ? '*' : '') + props.item.name"
								:class="props.item.name === appliedFile? 'amber lighten-3': props.item.name === selectedFile ? 'amber lighten-5': ''"
								@click="onItemClick(props)"
								tabindex="0">
								<td v-for="header in defaultHeaders" :key="header.value" :class="header.cellClass">
									<template v-if="header.value === 'name'">
										<div class="d-inline-flex align-center">
											<slot :name="`${props.item.isDirectory ? 'folder' : 'file'}.${props.item.name}`" :item="props.item">
												<slot :name="props.item.isDirectory ? 'folder' : 'file'" :item="props.item">
													{{ props.item.name }}
												</slot>
											</slot>
										</div>
									</template>
									<template v-else-if="header.unit === 'bytes'">
										{{ (props.item[header.value] !== null) ? $displaySize(props.item[header.value]) : '' }}
									</template>
									<template v-else-if="header.unit === 'date'">
										{{ props.item.lastModified ? props.item.lastModified.toLocaleString() : $t('generic.noValue') }}
									</template>
									<template v-else-if="header.unit === 'time'">
										{{ displayTimeValue(props.item, header.value) }}
									</template>
									<template v-else-if="header.unit === 'boolean'">
										<template v-if="props.item.name !== appliedFile">
											<v-btn elevation="0" :disabled="!canCompensate" @click.stop.prevent="selectHeightMap(props.item)"> {{ $t('plugins.heightmap.apply') }}</v-btn>
											<v-btn elevation="0" @click.stop.prevent="removeHeightMap(props.item)">
                        <v-icon>mdi-trash-can-outline</v-icon>
                      </v-btn>
											<v-btn elevation="0" @click.stop.prevent="openHeightMap(props.item)">
                        <v-icon>mdi-file-document-edit</v-icon>
                      </v-btn>
										</template>
										<template v-if="props.item.name === appliedFile">
											{{ $t('plugins.heightmap.selected') }}
										</template>
									</template>
									<template v-else>
										{{ displayLoadingValue(props.item, header.value, header.precision, header.unit) }}
									</template>
								</td>
							</tr>
						</template>
					</v-data-table>
					<file-edit-dialog :shown.sync="editDialog.shown" :filename="editDialog.filename" v-model="editDialog.content" @editComplete="$emit('fileEdited', $event)"></file-edit-dialog>
		  
		  <v-spacer></v-spacer>
          <v-card-actions class="flex-wrap">
            <v-btn class="mr-3" elevation="0" @click="createNewHeightMap()" :disabled="uiFrozen || !canCompensate"> {{ $t('plugins.heightmap.create') }}</v-btn>
            <span class="mx-1">
            <label :title="$t('plugins.heightmap.tooltipSpacing')" for="count" class="pollen-attr-header">S.Spacing</label>
            <input name="count" class="mx-1" ref="input" step="any" :placeholder="default_spacing" v-model.number="s_spacing" type="number" />
            </span>
            <span class="mx-1">
            <label :title="$t('plugins.heightmap.tooltipRepeat')" for="repeat" class="pollen-attr-header">S.Repeat</label><input name="repeat" class="mx-1" ref="input" step="any" :placeholder="default_repeat" min="1" max="31" v-model.number="s_repeat" type="number" />
            </span>
            <span class="mx-1">
				<label :title="$t('plugins.heightmap.tooltipXRange')" for="x_range" class="pollen-attr-header">S.X_Range</label><v-range-slider name="x_range" class="mx-1 slider" v-model="s_x_range" step="1" min=0 max=780 thumb-label dense></v-range-slider>
            <!-- <label :title="$t('plugins.heightmap.tooltipRadius')" for="radius" class="pollen-attr-header">S.Radius</label><input name="radius" class="mx-1" ref="input" step="any" :placeholder="default_radius" :min="radiusMin" :max="radiusMax" v-model.number="s_radius" type="number" /> -->
            </span>
			<span class="mx-1">
				<label :title="$t('plugins.heightmap.tooltipYRange')" for="y_range" class="pollen-attr-header">S.Y_Range</label><v-range-slider name="y_range" class="mx-1 slider" v-model="s_y_range" step="1" min=0 max=780 thumb-label dense></v-range-slider>
			</span>
			<v-spacer></v-spacer>
			<v-btn elevation="0" :disabled="uiFrozen || !canCompensate" @click="restoreSettingsFactoryDefault()">{{ $t('plugins.heightmap.defaultFactorySettings') }}</v-btn>
          </v-card-actions>
				</v-card>
		</v-col>
		<v-col cols="12" lg="4">
				<v-card elevation="0" class="h-100">
          <v-card-title class="v-card__title--dense">
            <v-icon class="mr-2">mdi-arrow-all</v-icon>
						{{ $t('plugins.heightmap.offsetParameters') }}
            <v-spacer></v-spacer>
						<v-icon @click="refreshOffsets()" class="ml-2">mdi-refresh</v-icon>
					</v-card-title>
					<v-card-text>
            <v-simple-table class="v-data-table--no-bg heightmap-offsets-table">
              <tbody>
                <tr>
                  <th class="px-0 font-size-0875 pollen-attr-header">T1</th>
                  <td>
                    <label for="T1X">X</label>
                    <input name="T1X" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t1x" type="number" />
                  </td>
                  <td>
                    <label for="T1Y">Y</label>
                    <input name="T1Y" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t1y" type="number" />
                  </td>
                  <td>
                    <label for="T1Z">Z</label>
                    <input name="T1Z" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t1z" type="number" />
                  </td>
                </tr>
                <tr v-if="tools[2] !== null">
                  <th class="px-0 font-size-0875 pollen-attr-header">T2</th>
                  <td>
												<label for="T2X">X</label><input name="T2X" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t2x" type="number" />
                  </td>
                  <td>
												<label for="T2Y">Y</label><input name="T2Y" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t2y" type="number" />
                  </td>
                  <td>
												<label for="T2Z">Z</label><input name="T2Z" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t2z" type="number" />
                  </td>
                </tr>
                <tr v-if="tools[3] !== null">
                  <th class="px-0 font-size-0875 pollen-attr-header">T3</th>
                  <td>
												<label for="T3X">X</label><input name="T3X" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t3x" type="number" />
                  </td>
                  <td>
												<label for="T3Y">Y</label><input name="T3Y" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t3y" type="number" />
                  </td>
                  <td>
												<label for="T3Z">Z</label><input name="T3Z" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t3z" type="number" />
                  </td>
                </tr>
                <tr v-if="tools[4] !== null">
                  <th class="px-0 font-size-0875 pollen-attr-header">T4</th>
                  <td>
												<label for="T4X">X</label><input name="T4X" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t4x" type="number" />
                  </td>
                  <td>
												<label for="T4Y">Y</label><input name="T4Y" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t4y" type="number" />
                  </td>
                  <td>
												<label for="T4Z">Z</label><input name="T4Z" class="ml-2 mr-1 heightmap-offsets-input" ref="input" step="0.01" v-model.number="t4z" type="number" />
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
					</v-card-text>
					<v-card-actions class="flex-wrap">
						<v-btn elevation="0" :disabled="uiFrozen" @click="restoreDefault()">{{ $t('plugins.heightmap.default') }}</v-btn>
						<v-btn elevation="0" :disabled="uiFrozen" @click="saveParameters()"> {{ $t('plugins.heightmap.save') }}</v-btn>
					</v-card-actions>
				</v-card>
		</v-col>
	</v-row>
	<v-row dense>
		<v-col class="flex-grow-1" cols="12" lg="9">
			<div class="heightmap-container" ref="container" v-resize="resize">
				<!-- h1 v-show="!ready" class="text-center">
					{{ loading ? $t('generic.loading') : (errorMessage ? errorMessage : $t('plugins.heightmap.notAvailable')) }}
				</h1-->

				<div class="canvas-container">
					<!-- v-show="ready" -->
					<canvas @mousemove="canvasMouseMove" ref="canvas"></canvas>
					<canvas class="legend" ref="legend" width="80"></canvas>
				</div>
			</div>
		</v-col>

		<v-col cols="12" sm="6" lg="3">
			<v-card class="h-100" elevation="0" tile>
				<v-card-title class="v-card__title--dense">
					<v-icon class="mr-2">mdi-eye</v-icon>
					{{ $t('plugins.heightmap.display') }}
				</v-card-title>
				<v-card-text class="d-flex flex-column">
					<div class="d-flex flex-column mt-1">
						{{ $t('plugins.heightmap.colorScheme') }}
						<v-btn-toggle class="mt-1" v-model="colorScheme">
							<v-btn class="flex-grow-1" value="terrain">{{ $t('plugins.heightmap.terrain') }}</v-btn>
							<v-btn class="flex-grow-1" value="heat">{{ $t('plugins.heightmap.heat') }}</v-btn>
						</v-btn-toggle>
					</div>

					<!-- deviation coloring -->
					<div class="d-flex flex-column mt-1">
						{{ $t('plugins.heightmap.range') }}
						<v-btn-toggle class="mt-1" v-model="deviationColoring">
							<v-btn class="flex-grow-1" value="fixed">{{ $t('plugins.heightmap.fixed') }}</v-btn>
							<v-btn class="flex-grow-1" value="deviation">{{ $t('plugins.heightmap.deviation') }}</v-btn>
						</v-btn-toggle>
					</div>
					<v-switch :disabled="uiFrozen || loading || !ready" :label="$t('plugins.heightmap.invertZ')" v-model="invertZ"></v-switch>

					<v-btn elevation="0" :disabled="uiFrozen || loading || !ready" @click="topView" class="ml-0 mt-3">
						<v-icon class="mr-1" small>mdi-format-vertical-align-bottom</v-icon>
						{{ $t('plugins.heightmap.topView') }}
					</v-btn>
					<v-btn elevation="0" :disabled="uiFrozen || loading || !ready" @click="resetView" class="ml-0 mt-3">
						<v-icon class="mr-1" small>mdi-camera</v-icon>
						{{ $t('plugins.heightmap.resetView') }}
					</v-btn>
				</v-card-text>
			</v-card>
		</v-col>

		<v-tooltip :position-x="tooltip.x" :position-y="tooltip.y" absolute top v-model="tooltip.shown">
			<span class="no-cursor">
				{{ xLabel }}: {{ $display(tooltip.coord.x, 1, 'mm') }}
				<br />
				{{ yLabel }}: {{ $display(tooltip.coord.y, 1, 'mm') }}
				<br />
				Z: {{ $display(tooltip.coord.z, 3, 'mm') }}
			</span>
		</v-tooltip>
  <v-col cols="12" sm="6" lg="12">
  <v-card class="h-100" :elevation="0">
    <v-card-title class="v-card__title--dense">
      <v-icon class="mr-2">mdi-information</v-icon>
      {{ $t('plugins.heightmap.statistics') }}
    </v-card-title>
    <v-card-text>
      <v-row dense class="row--separated-cols flex-md-row flex-column">
        <v-col class="d-flex flex-column justify-center text-center">
          <span class="pollen-attr-header">{{ $t('plugins.heightmap.numPointsHeader') }}</span>
          {{ $display(numPoints, 0) }}
        </v-col>
        <v-col class="d-flex flex-column justify-center text-center" v-if="radius > 0">
          <span class="pollen-attr-header">{{ $t('plugins.heightmap.radiusHeader') }}</span>
          {{ $display(radius, 0, 'mm') }}
        </v-col>
        <v-col class="d-flex flex-column justify-center text-center">
          <span class="pollen-attr-header">{{ $t('plugins.heightmap.areaHeader') }}</span>
          {{ $display(area / 100, 1, 'cm²') }}
        </v-col>
        <v-col class="d-flex flex-column justify-center text-center">
          <span class="pollen-attr-header">{{ $t('plugins.heightmap.maxDeviationsHeader') }}</span>
          {{ $display(minDiff, 3) }}
          {{ $display(maxDiff, 3, 'mm') }}
        </v-col>
        <v-col class="d-flex flex-column justify-center text-center">
          <span class="pollen-attr-header">{{ $t('plugins.heightmap.meanErrorHeader') }}</span>
          {{ $display(meanError, 3, 'mm') }}
        </v-col>
        <v-col class="d-flex flex-column justify-center text-center">
          <span class="pollen-attr-header">{{ $t('plugins.heightmap.rmsErrorHeader') }}</span>
          {{ $display(rmsError, 3, 'mm') }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  </v-col>
  </v-row>
	</v-col>
</template>

<script>
'use strict';

import {mapState, mapGetters, mapActions} from 'vuex';
import HeightMapViewer from './3dbjs';
import {setPluginData, PluginDataType} from '../../store';
import CSV from '../../utils/csv.js';
import Events from '../../utils/events.js';
import Path from '../../utils/path.js';
import {KinematicsName, StatusType} from '../../store/machine/modelEnums';

import i18n from '../../i18n'

let heightMapViewer;
const default_x = 13.31;
const default_y = 8.89;
const default_z = -10;
const factory_default_spacing = 25;
const factory_default_repeat = 4;
const factory_default_x_range = [0, 780];
const factory_default_y_range = [0, 780];

export default {
	computed: {
		...mapState(['selectedMachine']),
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapState('machine/cache', {
			pluginCache: (state) => state.plugins.HeightMap

		}),
		...mapState('machine/model', ['state']),
		...mapState('machine/model', {
			heightmapFile: (state) => state.move.compensation.file,
			systemDirectory: (state) => state.directories.system,
			axes: (state) => state.move.axes,
			kinematicsName: (state) => state.move.kinematics.name,
			tools: state => state.tools,
			extruders: state => state.global.APP_EXTRUDERS,
			appliedFile: state => state.global.heightmap_file_name,
			default_spacing: state => state.global.DEFAULT_S_SPACING,
			default_repeat: state => state.global.DEFAULT_S_REPEAT,
			default_x_range: state => state.global.DEFAULT_S_X_RANGE,
			default_y_range: state => state.global.DEFAULT_S_Y_RANGE,
			isCompensating: state => state.global.COMPENSATING_SEQUENCE_RUNNING
		}),
		...mapState('settings', ['language']),
		defaultHeaders() {
			return [
				{
					text: i18n.t('list.baseFileList.fileName'),
					value: 'name'
				},
				{
					text: i18n.t('list.baseFileList.lastModified'),
					value: 'lastModified',
					unit: 'date'
				},
				{
					text: i18n.t('list.baseFileList.assign'),
					value: 'assign',
					unit: 'boolean'
				}
			];
		},
		canHome() {
			return !this.uiFrozen && (
				this.state.status !== StatusType.pausing &&
				this.state.status !== StatusType.processing &&
				this.state.status !== StatusType.resuming
			);
		},
		canCompensate() {
			return this.isCompensating === 0 && this.canHome
		},
		colorScheme: {
			get() {
				return this.pluginCache.colorScheme;
				// return "terrain";
			},
			set(value) {
				setPluginData('HeightMap', PluginDataType.machineCache, 'colorScheme', value);
			},
		},
		deviationColoring: {
			get() {
				return this.pluginCache.deviationColoring;
				// return "fixed";
			},
			set(value) {
				setPluginData('HeightMap', PluginDataType.machineCache, 'deviationColoring', value);
			},
		},
		invertZ: {
			get() {
				return this.pluginCache.invertZ;
				// return false;
			},
			set(value) {
				setPluginData('HeightMap', PluginDataType.machineCache, 'invertZ', value);
			},
		},
		isDelta() {
			return this.kinematicsName === KinematicsName.delta || this.kinematicsName === KinematicsName.rotaryDelta;
		},
		bedAxesValues() {
			return this.axes.map((d) => {
				return { letter: d.letter, min: d.min, max: d.max };
			});
		},
	},
	data() {
		return {
			files: [],
			selectedFile: null,

			isActive: true,
			ready: false,
			loading: false,
			errorMessage: null,

			tooltip: {
				coord: {
					x: 0,
					y: 0,
					z: 0,
				},
				x: undefined,
				y: undefined,
				shown: false,
			},
			xLabel: 'X',
			yLabel: 'Y',
			numPoints: undefined, // points excluding NaN
			area: undefined,
			radius: undefined,
			minDiff: undefined,
			maxDiff: undefined,
			meanError: undefined,
			rmsError: undefined,

			heightmapPoints: undefined,
			probeRadius: undefined,
			innerValue: [],
			editDialog: {
				shown: false,
				filename: '',
				content: ''
			},
			sortBy: 'lastModified',
			sortDesc: false,
			s_spacing: this.default_spacing,
			s_repeat: this.default_repeat,
			s_x_range: this.default_x_range,
			s_y_range: this.default_y_range,
			t1x: default_x,
			t1y: -default_y,
			t1z: default_z,
			t2x: -default_x,
			t2y: -default_y,
			t2z: default_z,
			t3x: -default_x,
			t3y: default_y,
			t3z: default_z,
			t4x: default_x,
			t4y: default_y,
			t4z: default_z,
		};
	},
	methods: {
		...mapActions('machine', ['download', 'upload', 'getFileList', 'sendCode', 'delete', 'sendCode']),
		onItemClick(props) {
			this.selectedFile = props.item.name;
		},
		async removeHeightMap(item) {
			await this.delete(Path.combine(this.systemDirectory, item.name));
			this.refresh();
		},
		async createNewHeightMap() {
			await this.sendCode('M991'); // stops infinite extrusion

			var today = new Date();
			var dd = String(today.getDate()).padStart(2, '0');
			var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
			var yyyy = today.getFullYear();
			var hh = today.getHours();
			var minutes = today.getMinutes();
			var ss = today.getSeconds();

			today = mm + '-' + dd + '-' + yyyy + '-' + hh + '-' + minutes + '-' + ss;

			var spacing = this.s_spacing;
			var repeat = this.s_repeat;
			var x_range = this.s_x_range;
			var y_range = this.s_y_range;

			if (typeof spacing !== "number"){
				spacing = this.default_spacing;
			}
			if (typeof repeat !== "number"){
				repeat = this.default_repeat;
			}
			if (!Array.isArray(x_range) || x_range.length != 2 || x_range.some(item => typeof item !== 'number' || isNaN(item))){
				x_range = this.default_x_range;
			}
			if (!Array.isArray(y_range) || y_range.length != 2 || y_range.some(item => typeof item !== 'number' || isNaN(item))){
				y_range = this.default_y_range;
			}

			await this.sendCode(`M98 P"/macros/HONEYPRINT/Compensation_Start" H"heightmap-${today}.csv" S${spacing} R${repeat} X{${x_range[0]},${x_range[1]}} Y{${y_range[0]},${y_range[1]}}`);
		},
		async restoreSettingsFactoryDefault(){
			await this.sendCode(`M98 P"/macros/HONEYPRINT/Set_Heightmap_Settings_Default" S${factory_default_spacing} R${factory_default_repeat} X{${factory_default_x_range[0]},${factory_default_x_range[1]}} Y{${factory_default_y_range[0]},${factory_default_y_range[1]}}`);
		},
		async saveParameters(){
			if (this.tools[1] !== null) {
				await this.sendCode(`M98 P"/macros/HONEYPRINT/Tool_Offset_Save" T1 X${this.t1x} Y${this.t1y} Z${this.t1z}`);
			}
			if (this.tools[2] !== null) {
				await this.sendCode(`M98 P"/macros/HONEYPRINT/Tool_Offset_Save" T2 X${this.t2x} Y${this.t2y} Z${this.t2z}`);
			}
			if (this.tools[3] !== null) {
				await this.sendCode(`M98 P"/macros/HONEYPRINT/Tool_Offset_Save" T3 X${this.t3x} Y${this.t3y} Z${this.t3z}`);
			}
			if (this.tools[4] !== null) {
				await this.sendCode(`M98 P"/macros/HONEYPRINT/Tool_Offset_Save" T4 X${this.t4x} Y${this.t4y} Z${this.t4z}`);
			}
			this.refreshOffsets();
		},
		async restoreDefault() {
			await this.sendCode(`M98 P"/macros/HONEYPRINT/Tool_Offset_Restore_Defaults"`);
			this.refreshOffsets();
		},
		async openHeightMap(item) {
			const currentHeightmap = await this.download({
				filename: Path.combine(this.systemDirectory, item.name),
				type: 'text',
				showProgress: false,
				showSuccess: false,
				showError: false,
			});

			this.editDialog.filename =  Path.combine(this.systemDirectory, item.name);
			this.editDialog.shown = true;
			this.editDialog.content = currentHeightmap;
		},
		async selectHeightMap(item) {
			this.sendCode(`echo >"/sys/app_memory_heightmap_file.g" "global heightmap_file_name = ""${item.name}"""`);
			this.sendCode(`set global.heightmap_file_name = "${item.name}"`); // Update the filename in the variable so that it updates the selected file in the list
				//Download existing heighmap file
			/*const currentHeightmap = await this.download({
				filename: Path.combine(this.systemDirectory, Path.heightmapFile),
				type: 'text',
				showProgress: false,
				showSuccess: false,
				showError: false,
			});

			const targetHeightmap = await this.download({
				filename: Path.combine(this.systemDirectory, item.name),
				type: 'text',
				showProgress: false,
				showSuccess: false,
				showError: false,
			});

			var today = new Date();
			var dd = String(today.getDate()).padStart(2, '0');
			var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
			var yyyy = today.getFullYear();
			var hh = today.getHours();
			var minutes = today.getMinutes();
			var ss = today.getSeconds();

			today = mm + '-' + dd + '-' + yyyy + '-' + hh + '-' + minutes + '-' + ss;

			//Backup old heightMap
			await this.upload({
				filename: Path.combine(this.systemDirectory, 'heightmap' + '_' +  today + '.csv'),
				content: currentHeightmap,
				type: 'text',
				showProgress: false,
				showSuccess: false,
				showError: false,
			});

			//Set new heightMap
			await this.upload({
				filename: Path.combine(this.systemDirectory, Path.heightmapFile),
				content: targetHeightmap,
				type: 'text',
				showProgress: false,
				showSuccess: false,
				showError: false,
			});*/

			this.selectedFile = null;

			await this.sendCode({
						code: `G29 S1 P"/sys/${item.name}"`, // Load the newly applied heightmap file
						log: true
			});

			this.refresh();
		},
		resize() {
			if (!this.isActive) {
				return;
			}

			// Resize canvas elements
			const width = Math.max(this.$refs.container.offsetWidth - 80, 0);
			let height;
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					height = width;
					break;
				case 'sm':
					height = (width * 3) / 8;
					break;
				case 'xl':
					height = (width * 10) / 18;
					break;
				default:
					height = (width * 9) / 16;
					break;
			}

			this.$refs.container.style.height = `${height}px`;
			this.$refs.legend.style.left = `${width}px`;
			this.$refs.legend.height = height;
			this.$refs.canvas.width = width;
			this.$refs.canvas.height = height;

			if (heightMapViewer) {
				heightMapViewer.resize();
				// Redraw the legend and return the canvas size
				heightMapViewer.drawLegend(this.$refs.legend, this.colorScheme, this.invertZ, this.xLabel, this.yLabel);
			}

			return { width, height };
		},
		showCSV(csvData) {
			// Load the CSV. The first line is a comment that can be removed
			const csv = new CSV(csvData.substring(csvData.indexOf('\n') + 1));
			this.xLabel = csv.get('axis0') || 'X';
			this.yLabel = csv.get('axis1') || 'Y';
			let radius = parseFloat(csv.get('radius'));
			if (radius <= 0) {
				radius = undefined;
			}
			let xMin = parseFloat(csv.get('min0'));
			if (isNaN(xMin)) {
				xMin = parseFloat(csv.get('xmin'));
			}
			let yMin = parseFloat(csv.get('min1'));
			if (isNaN(yMin)) {
				yMin = parseFloat(csv.get('ymin'));
			}
			let xSpacing = parseFloat(csv.get('spacing0'));
			if (isNaN(xSpacing)) {
				xSpacing = parseFloat(csv.get('xspacing'));
			}
			if (isNaN(xSpacing)) {
				xSpacing = parseFloat(csv.get('spacing'));
			}
			let ySpacing = parseFloat(csv.get('spacing1'));
			if (isNaN(ySpacing)) {
				ySpacing = parseFloat(csv.get('yspacing'));
			}
			if (isNaN(ySpacing)) {
				ySpacing = parseFloat(csv.get('spacing'));
			}

			// Convert each point to a vector
			const points = [];
			for (let y = 1; y < csv.content.length; y++) {
				const xpoints = [];
				for (let x = 0; x < csv.content[y].length; x++) {
					const value = csv.content[y][x].trim();
					xpoints.push([xMin + x * xSpacing, yMin + (y - 1) * ySpacing, value === '0' ? NaN : parseFloat(value)]);
				}
				points.push(xpoints);
			}

			this.heightmapPoints = points;
			// Display height map and redraw legend
			this.showHeightMap(points, radius);
		},
		showHeightMap(points, probeRadius) {
			// Generate stats
			let xMin, xMax, yMin, yMax;

			this.radius = probeRadius;
			this.numPoints = 0;
			this.minDiff = undefined;
			this.maxDiff = undefined;
			this.meanError = 0;
			this.rmsError = 0;

			for (let i = 0; i < points.length; i++)
				for (let j = 0; j < points[i].length; j++) {
					const z = points[i][j][2];
					if (!isNaN(z)) {
						const x = points[i][j][0];
						const y = points[i][j][1];
						if (xMin === undefined || xMin > x) {
							xMin = x;
						}
						if (xMax === undefined || xMax < x) {
							xMax = x;
						}
						if (yMin === undefined || yMin > y) {
							yMin = y;
						}
						if (yMax === undefined || yMax < y) {
							yMax = y;
						}

						this.numPoints++;
						this.meanError += z;
						this.rmsError += z * z;
						if (this.minDiff === undefined || this.minDiff > z) {
							this.minDiff = z;
						}
						if (this.maxDiff === undefined || this.maxDiff < z) {
							this.maxDiff = z;
						}
					}
				}

			this.area = probeRadius ? probeRadius * probeRadius * Math.PI : Math.abs((xMax - xMin) * (yMax - yMin));
			this.rmsError = Math.sqrt(this.rmsError * this.numPoints - this.meanError * this.meanError) / this.numPoints;
			this.meanError = this.meanError / this.numPoints;
			heightMapViewer.renderHeightMap(points, this.invertZ, this.colorScheme, this.deviationColoring);
			heightMapViewer.drawLegend(this.$refs.legend, this.colorScheme, this.invertZ, this.xLabel, this.yLabel);
		},
		canvasMouseMove(e) {
			this.tooltip.x = e.clientX;
			this.tooltip.y = e.clientY;
		},
		topView() {
			heightMapViewer.topView();
		},
		resetView(){
			heightMapViewer.resetCamera();
		},
		refreshOffsets() {
			this.t1x = this.tools[1].offsets[0];
			this.t1y = this.tools[1].offsets[1];
			this.t1z = this.tools[1].offsets[2];

			if(this.tools[2] !== null) {
				this.t2x = this.tools[2].offsets[0];
				this.t2y = this.tools[2].offsets[1];
				this.t2z = this.tools[2].offsets[2];
			}

			if(this.tools[3] !== null) {
				this.t3x = this.tools[3].offsets[0];
				this.t3y = this.tools[3].offsets[1];
				this.t3z = this.tools[3].offsets[2];
			}

			if(this.tools[4] !== null) {
				this.t4x = this.tools[4].offsets[0];
				this.t4y = this.tools[4].offsets[1];
				this.t4z = this.tools[4].offsets[2];
			}
		},
		async refresh() {
			if (!this.isConnected) {
				this.ready = false;
				this.errorMessage = null;
				this.selectedFile = null;
				this.files = [];
				return;
			}

			if (this.loading) {
				// Don't do multiple actions at once
				return;
			}

			this.loading = true;
			try {
				const files = await this.getFileList(this.systemDirectory);
				this.files = files
					.filter(file => !file.isDirectory && file.name !== Path.filamentsFile && file.name.endsWith('.csv'));
			} finally {
				this.loading = false;
			}
			if (this.files.indexOf(this.selectedFile) === -1) {
				if (this.heightmapFile && this.files.indexOf(Path.extractFileName(this.heightmapFile)) !== -1) {
					this.selectedFile = Path.extractFileName(this.heightmapFile);
				} else if (this.files.indexOf(Path.heightmapFile) !== -1) {
					this.selectedFile = Path.heightmapFile;
				} else {
					this.selectedFile = null;
				}
			}
			this.loading = false;
		},
		async getHeightMap() {
			if (this.loading) {
				// Don't attempt to load more than one file at once...
				return;
			}

			this.ready = false;
			this.loading = true;
			try {
				if (this.selectedFile) {
					const heightmap = await this.download({
						filename: Path.combine(this.systemDirectory, this.selectedFile),
						type: 'text',
						showProgress: false,
						showSuccess: false,
						showError: false,
					});
					this.showCSV(heightmap);
				} else {
					this.errorMessage = null;
				}
			} catch (e) {
				console.warn(e);
				this.errorMessage = e.message;
			}
			this.loading = false;
			this.ready = true;
		},

		async testMesh() {
			const csvData =
				'RepRapFirmware height map file v1\nxmin,xmax,ymin,ymax,radius,spacing,xnum,ynum\n-140.00,140.10,-140.00,140.10,150.00,20.00,15,15\n0,0,0,0,0,-0.139,-0.188,-0.139,-0.202,-0.224,0,0,0,0,0\n0,0,0,-0.058,-0.066,-0.109,-0.141,-0.129,-0.186,-0.198,-0.191,-0.176,0,0,0\n0,0,0.013,-0.008,-0.053,-0.071,-0.087,-0.113,-0.162,-0.190,-0.199,-0.267,-0.237,0,0\n0,0.124,0.076,0.025,-0.026,-0.054,-0.078,-0.137,-0.127,-0.165,-0.201,-0.189,-0.227,-0.226,0\n0,0.198,0.120,0.047,0.089,-0.074,-0.097,-0.153,-0.188,-0.477,-0.190,-0.199,-0.237,-0.211,0\n0.312,0.229,0.198,0.098,0.097,0.004,-0.089,-0.516,-0.150,-0.209,-0.197,-0.183,-0.216,-0.296,-0.250\n0.287,0.263,0.292,0.100,0.190,0.015,-0.102,-0.039,-0.125,-0.149,-0.137,-0.198,-0.188,-0.220,-0.192\n0.378,0.289,0.328,0.172,0.133,0.078,-0.086,0.134,-0.100,-0.150,-0.176,-0.234,-0.187,-0.199,-0.221\n0.360,0.291,0.260,0.185,0.111,0.108,0.024,0.073,-0.024,-0.116,-0.187,-0.252,-0.201,-0.215,-0.187\n0.447,0.397,0.336,0.276,0.180,0.164,0.073,-0.050,-0.049,-0.109,-0.151,-0.172,-0.211,-0.175,-0.161\n0,0.337,0.289,0.227,0.179,0.127,0.086,0.034,-0.039,-0.060,-0.113,-0.108,-0.171,-0.153,0\n0,0.478,0.397,0.374,0.270,0.141,0.085,0.074,0.037,-0.048,-0.080,-0.187,-0.126,-0.175,0\n0,0,0.373,0.364,0.265,0.161,0.139,0.212,0.040,0.046,-0.008,-0.149,-0.115,0,0\n0,0,0,0.346,0.295,0.273,0.148,0.136,0.084,0.024,-0.055,-0.078,0,0,0\n0,0,0,0,0,0.240,0.178,0.084,0.090,0.004,0,0,0,0,0';
			this.showCSV(csvData);
		},
		async testBedCompensation(numPoints) {
			let testPoints;
			switch (numPoints) {
				case 3:
					testPoints = [
						[15.0, 15.0, 0.123],
						[15.0, 195.0, -0.243],
						[215.0, 105.0, 0.034],
					];
					break;
				case 4:
					testPoints = [
						[15.0, 15.0, 0.015],
						[15.0, 185.0, -0.193],
						[175.0, 185.0, 0.156],
						[175.0, 15.0, 0.105],
					];
					break;
				case 5:
					testPoints = [
						[15.0, 15.0, 0.007],
						[15.0, 185.0, -0.121],
						[175.0, 185.0, -0.019],
						[175.0, 15.0, 0.193],
						[95.0, 100.0, 0.05],
					];
					break;
				default:
					throw new Error('Bad number of probe points, only one of 3/4/5 is supported');
			}
			this.showHeightMap(testPoints);
		},

		filesOrDirectoriesChanged({machine, files}) {
			if (machine === this.selectedMachine) {
				if (this.selectedFile && files.indexOf(Path.combine(this.systemDirectory, this.selectedFile)) >= 0) {
					// Current heightmap has been changed, reload it and then refresh the list
					this.getHeightMap(this.selectedFile).then(this.refresh);
				} else if (files.some((file) => file.endsWith('.csv')) && Path.filesAffectDirectory(files, this.systemDirectory)) {
					// CSV file or directory has been changed
					this.refresh();
				}
			}
		},
		buildBed() {
			if (this.axes) {
				for (var axesIdx in this.axes) {
					let axes = this.axes[axesIdx];
					if ('XYZ'.includes(axes.letter)) {
						var letter = axes.letter.toLowerCase();
						heightMapViewer.buildVolume[letter].min = axes.min;
						heightMapViewer.buildVolume[letter].max = axes.max;
					}
				}
				heightMapViewer.renderBed();
				heightMapViewer.resetCamera();
			}
		},
	},
	activated() {
		this.isActive = true;
		this.resize();
	},
	deactivate() {
		this.isActive = false;
	},
	async mounted() {
		const size = this.resize();
		if (size.height <= 0) {
			size.height = 1;
		}

		heightMapViewer = new HeightMapViewer(this.$refs.canvas);

		if (this.isDelta) {
			heightMapViewer.isDelta = this.isDelta;
		}
		await heightMapViewer.init();
		this.buildBed();

		heightMapViewer.labelCallback = (metadata) => {
			if (metadata) {
				this.tooltip.coord.x = metadata.x;
				this.tooltip.coord.y = metadata.y;
				this.tooltip.coord.z = metadata.z;
				this.tooltip.shown = true;
			} else {
				this.tooltip.shown = false;
			}
		};

		// Set current heightmap
		if (this.isConnected) {
			this.refresh();
			this.refreshOffsets();
		}

		// Keep track of file changes
		this.$root.$on(Events.filesOrDirectoriesChanged, this.filesOrDirectoriesChanged);

		// Kill the wheel on the canvas
		this.$refs.canvas.addEventListener('wheel', evt => evt.preventDefault());

		// Trigger resize event once more to avoid rendering glitches
		setTimeout(this.resize.bind(this), 250);
		this.ready = true;
	},
	beforeDestroy() {
		// No longer keep track of file changes
		this.$root.$off(Events.filesOrDirectoriesChanged, this.filesOrDirectoriesChanged);
		heightMapViewer.destroy();
	},
	displayLoadingValue(item, prop, precision, unit = '') {
		if (item.isDirectory) {
			return '';
		}
		if (!item[prop]) {
			return this.$t((item[prop] === undefined) ? 'generic.loading' : 'generic.noValue');
		}

		let displayValue;
		if (item[prop] instanceof Array) {
			if (!item[prop].length) {
				return this.$t('generic.noValue');
			}
			displayValue = item[prop].reduce((a, b) => a + b);
		} else {
			displayValue = item[prop];
		}

		if (precision !== undefined) {
			displayValue = displayValue.toFixed(precision);
		}
		return `${displayValue} ${unit}`;
	},
	displayTimeValue(item, prop) {
		if (item.isDirectory) {
			return '';
		}
		return (item[prop] !== null) ? this.$displayTime(item[prop]) : this.$t('generic.noValue');
	},
	watch: {
		colorScheme() {
			if (this.heightmapPoints) {
				this.showHeightMap(this.heightmapPoints, this.probeRadius);
			}
		},
		deviationColoring() {
			if (this.heightmapPoints) {
				this.showHeightMap(this.heightmapPoints, this.probeRadius);
			}
		},
		files() {
			this.$nextTick(this.resize);
		},
		invertZ() {
			if (this.heightmapPoints) {
				this.showHeightMap(this.heightmapPoints, this.probeRadius);
			}
		},
		isConnected() {
			this.refresh();
			this.refreshOffsets();
		},
		heightmapFile(to) {
			if (to) {
				const that = this;
				this.refresh().then(async function () {
					const fileName = Path.extractFileName(to);
					if (that.selectedFile === fileName) {
						await that.getHeightMap();
					} else {
						that.selectedFile = fileName;
					}
				});
			}
		},
		selectedFile() {
			this.getHeightMap();
		},
		systemDirectory() {
			this.refresh();
		},
		language() {
			if (heightMapViewer) {
				heightMapViewer.drawLegend(this.$refs.legend, this.colorScheme);
			}
		},
		bedAxesValues: {
			deep: true,
			handler() {
				this.buildBed();
			},
		},
		isDelta(to) {
			if (heightMapViewer) {
				heightMapViewer.isDelta = to;
				if (this.heightmapPoints) {
					this.showHeightMap(this.heightmapPoints, this.probeRadius);
				}
			}
		}
	},
};
</script>
