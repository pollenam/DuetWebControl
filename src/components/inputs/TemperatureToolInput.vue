<style>
.temperature-tool-input {
	max-width: 100px;
}

.temperature-row {
	margin-bottom: 10px;
	padding:0px;
}

</style>
<template>
		<v-col cols="12">
			<v-row class="temperature-row align-center justify-center flex-nowrap ">
				<div class="text-body-1 mr-2">{{ getHeaterValue() }} <span class="text-h6">/</span> </div>
				<v-combobox hide-details="'auto'" ref="input" type="number" min="-273" max="1999" step="any" class="temperature-tool-input pt-0 mt-0" :label="label" :menu-props="{ maxHeight: '50%' }"
							:value="inputValue" :search-input="inputValue" @update:search-input="change" @keyup.enter="apply" @blur="blur"
							:loading="applying" :disabled="uiFrozen || !isValid" :items="items" hide-selected>
				</v-combobox>
			</v-row>
		</v-col>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'
import { AnalogSensorType } from '@/store/machine/modelEnums'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['heat', 'state', 'tools']),
		...mapState('machine/settings', ['temperatures']),
		...mapState('settings', ['disableAutoComplete']),
		...mapState('machine/model', { //TODO REMOVE HERE FOR EXAMPLES
			boards: state => state.boards
		}),
		items() {
			if (this.disableAutoComplete) {
				return [];
			}

			const key = this.active ? 'active' : 'standby';
			if (this.tool) {
				return this.temperatures.tool[key];
			}
			if (this.bed) {
				return this.temperatures.bed[key];
			}
			if (this.chamber) {
				return this.temperatures.chamber;
			}

			console.warn('[tool-input] Failed to retrieve temperature presets');
			return [];
		},
		isValid() {
			if (this.tool) {
				if (this.toolHeaterIndex >= 0 && this.toolHeaterIndex < this.tool.heaters.length) {
					const heater = this.tool.heaters[this.toolHeaterIndex];
					return (heater >= 0 && heater < this.heat.heaters.length && this.heat.heaters[heater] !== null);
				}
			} else if (this.bed) {
				return (this.bedIndex >= 0 && this.bedIndex < this.heat.bedHeaters.length);
			} else if (this.chamber) {
				return (this.chamberIndex >= 0 && this.chamberIndex < this.heat.chamberHeaters.length);
			}
			return false;
		}
	},
	data() {
		return {
			applying: false,
			blurTimer: null,
			inputElement: null,
			actualValue: 0,
			inputValue: '0'
		}
	},
	props: {
		label: String,

		controlTools: Boolean,
		controlBeds: Boolean,
		controlChambers: Boolean,

		active: Boolean,
		standby: Boolean,

		tool: Object,
		toolHeaterIndex: Number,

		bed: Object,
		bedIndex: Number,

		chamber: Object,
		chamberIndex: Number
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		async apply() {
			this.$refs.input.isMenuActive = false;			// FIXME There must be a better solution than this

			const value = parseFloat(this.inputValue);
			if (!this.isNumber(value)) {
				this.$makeNotification('warning', this.$t('error.enterValidNumber'));
				return;
			}

			if (!this.applying) {
				this.applying = true;
				try {
					if (this.inputValue >= -273.15 && this.inputValue <= 1999) {
						if (this.tool) {
							// Set tool temps
							const currentTemps = this.tool[this.active ? 'active' : 'standby'];
							const newTemps = currentTemps.map((temp, i) => (i === this.toolHeaterIndex) ? this.inputValue : temp, this).join(':');
							await this.sendCode(`M568 P${this.tool.number} ${this.active ? 'S' : 'R'}${newTemps}`);
						} else if (this.bed) {
							// Set bed temp
							await this.sendCode(`M140 P${this.bedIndex} ${this.active ? 'S' : 'R'}${this.inputValue}`);
						} else if (this.chamber) {
							// Set chamber temp
							await this.sendCode(`M141 P${this.chamberIndex} ${this.active ? 'S' : 'R'}${this.inputValue}`);
						} else {
							console.warn('[tool-input] Invalid target for tool-input');
						}
					}
				} catch (e) {
					// should be handled before we get here
					console.warn(e);
				}
				this.applying = false;
			}
		},
		blur() {
			if (window.oskOpen) {
				if (!this.blurTimer) {
					// Do not update the input value before a potentially installed on-screen keyboard is hidden.
					// This work-around is necessary because the input field loses focus every time a button is pressed
					this.blurTimer = setTimeout(this.checkAfterBlur.bind(this), 500);
				}
			} else {
				this.inputValue = this.actualValue.toString();
			}
		},
		checkAfterBlur() {
			this.blurTimer = null;
			this.blur();
		},
		async change(value) {
			// Note that value is of type String when a user enters a value and then leaves it without confirming...
			if (typeof value === 'number') {
				this.inputValue = value.toString();
				await this.apply();
			} else {
				this.inputValue = value;
			}
		},
		getHeaterValue() {
			var heater = null;
			if (this.tool){
				heater = this.tool;
			} else if (this.bed){
				heater = this.bed;
			} else if (this.chamber) {
				heater = this.chamber;
			}

			if (heater && heater.sensor >= 0 && heater.sensor < this.sensors.analog.length) {
				const sensor = this.sensors.analog[heater.sensor];
				if (sensor) {
					return this.formatSensorValue(sensor);
				}
			}

			if(this.boards[0].mcuTemp) {
				return this.$display(this.boards[0].mcuTemp.current, 1, '°C') //TODO to remove here for tests purposes
			} else {
				return this.$t('generic.noValue');
			}
		},
		formatSensorValue(sensor) {
			if (sensor.name) {
				const matches = /(.*)\[(.*)\]$/.exec(sensor.name);
				if (matches) {
					return this.$display(sensor.lastReading, 1, matches[2]);
				}
			}
			const unit = (sensor.type === AnalogSensorType.dhtHumidity) ? '%RH' : '°C';
			return this.$display(sensor.lastReading, 1, unit);
		}
	},
	mounted() {
		this.inputElement = this.$el.querySelector('input');
		if (this.tool) {
			if (this.tool[this.active ? 'active' : 'standby'].length > 0) {
				this.actualValue = this.tool[this.active ? 'active' : 'standby'][this.toolHeaterIndex];
				this.inputValue = this.tool[this.active ? 'active' : 'standby'][this.toolHeaterIndex].toString();
			}
		} else if (this.bed) {
			this.actualValue = this.bed[this.active ? 'active' : 'standby'];
			this.inputValue = this.bed[this.active ? 'active' : 'standby'].toString();
		} else if (this.chamber) {
			this.actualValue = this.chamber[this.active ? 'active' : 'standby'];
			this.inputValue = this.chamber[this.active ? 'active' : 'standby'].toString();
		}
	},
	watch: {
		'tool.active'(to) {
			const val = (to instanceof Array && this.toolHeaterIndex >= 0 && this.toolHeaterIndex < to.length) ? to[this.toolHeaterIndex] : to;
			if (this.active && this.isNumber(val) && this.actualValue !== val) {
				this.actualValue = val;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = val.toString();
				}
			}
		},
		'tool.standby'(to) {
			const val = (to instanceof Array && this.toolHeaterIndex >= 0 && this.toolHeaterIndex < to.length) ? to[this.toolHeaterIndex] : to;
			if (this.standby && this.isNumber(val) && this.actualValue !== val) {
				this.actualValue = val;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = val.toString();
				}
			}
		},
		'bed.active'(to) {
			if (this.active && this.isNumber(to) && this.actualValue !== to) {
				this.actualValue = to;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = to.toString();
				}
			}
		},
		'bed.standby'(to) {
			if (this.standby && this.isNumber(to) && this.actualValue !== to) {
				this.actualValue = to;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = to.toString();
				}
			}
		},
		'chamber.active'(to) {
			if (this.active && this.isNumber(to) && this.actualValue !== to) {
				this.actualValue = to;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = to.toString();
				}
			}
		},
		'chamber.standby'(to) {
			if (this.standby && this.isNumber(to) && this.actualValue != to) {
				this.actualValue = to;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = to.toString();
				}
			}
		}
	}
}
</script>
