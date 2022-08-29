<style>
.temperature-tool-component {
	width: 50px;
  display: inline-block;
}

.temperature-row {
	margin-bottom: 10px;
	padding:0px;
}
</style>

<template>
  <div class="temperature-row">
    <span class="temperature-tool-component">{{ getHeaterValue() }}</span>
    <span class="gray--text mx-2">/</span>
    <v-combobox hide-details="auto" ref="input" type="number" min="-273" max="1999" step="any" class="temperature-tool-component pt-0 mt-0" :label="label" :menu-props="{ maxHeight: '50%' }"
          :value="inputValue" :search-input="inputValue" @update:search-input="change" @keyup.enter="apply" @blur="blur"
          :loading="applying" :disabled="uiFrozen || !isValid" :items="items" hide-selected>
    </v-combobox>
  </div>
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

      console.log('this.temperature', this.temperatures);

			const key = this.active ? 'active' : 'standby';
			if (this.toolHeater) {
				return this.temperatures.tool[key];
			}
			if (this.bedHeater) {
				return this.temperatures.bed[key];
			}
			if (this.chamberHeater) {
				return this.temperatures.chamber;
			}

			console.warn('[tool-input] Failed to retrieve temperature presets');
			return [];
		},
		isValid() {
			if (this.toolHeater) {
				if (this.toolHeaterIndex >= 0 && this.toolHeaterIndex < this.toolHeater.heaters.length) {
					const heater = this.toolHeater.heaters[this.toolHeaterIndex];
					return (heater >= 0 && heater < this.heat.heaters.length && this.heat.heaters[heater] !== null);
				}
			} else if (this.bedHeater) {
				return (this.bedHeaterIndex >= 0 && this.bedHeaterIndex < this.heat.bedHeaters.length);
			} else if (this.chamberHeater) {
				return (this.chamberHeaterIndex >= 0 && this.chamberHeaterIndex < this.heat.chamberHeaters.length);
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

		toolHeater: Object,
		toolHeaterIndex: Number,

		bedHeater: Object,
		bedHeaterIndex: Number,

		chamberHeater: Object,
		chamberHeaterIndex: Number
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
						if (this.toolHeater) {
							// Set tool temps
							const currentTemps = this.toolHeater[this.active ? 'active' : 'standby'];
							const newTemps = currentTemps.map((temp, i) => (i === this.toolHeaterIndex) ? this.inputValue : temp, this).join(':');
							await this.sendCode(`M568 P${this.toolHeater.number} ${this.active ? 'S' : 'R'}${newTemps}`);
						} else if (this.bedHeater) {
							// Set bedHeater temp
							await this.sendCode(`M140 P${this.bedHeaterIndex} ${this.active ? 'S' : 'R'}${this.inputValue}`);
						} else if (this.chamberHeater) {
							// Set chamberHeater temp
							await this.sendCode(`M141 P${this.chamberHeaterIndex} ${this.active ? 'S' : 'R'}${this.inputValue}`);
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
			if (this.toolHeater){
				heater = this.toolHeater;
			} else if (this.bedHeater){
				heater = this.bedHeater;
			} else if (this.chamberHeater) {
				heater = this.chamberHeater;
			}

      console.log('heater', heater);

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
		if (this.toolHeater) {
			if (this.toolHeater[this.active ? 'active' : 'standby'].length > 0) {
				this.actualValue = this.toolHeater[this.active ? 'active' : 'standby'][this.toolHeaterIndex];
				this.inputValue = this.toolHeater[this.active ? 'active' : 'standby'][this.toolHeaterIndex].toString();
			}
		} else if (this.bedHeater) {
			this.actualValue = this.bedHeater[this.active ? 'active' : 'standby'];
			this.inputValue = this.bedHeater[this.active ? 'active' : 'standby'].toString();
		} else if (this.chamberHeater) {
			this.actualValue = this.chamberHeater[this.active ? 'active' : 'standby'];
			this.inputValue = this.chamberHeater[this.active ? 'active' : 'standby'].toString();
		}
	},
	watch: {
		'toolHeater.active'(to) {
			const val = (to instanceof Array && this.toolHeaterIndex >= 0 && this.toolHeaterIndex < to.length) ? to[this.toolHeaterIndex] : to;
			if (this.active && this.isNumber(val) && this.actualValue !== val) {
				this.actualValue = val;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = val.toString();
				}
			}
		},
		'toolHeater.standby'(to) {
			const val = (to instanceof Array && this.toolHeaterIndex >= 0 && this.toolHeaterIndex < to.length) ? to[this.toolHeaterIndex] : to;
			if (this.standby && this.isNumber(val) && this.actualValue !== val) {
				this.actualValue = val;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = val.toString();
				}
			}
		},
		'bedHeater.active'(to) {
			if (this.active && this.isNumber(to) && this.actualValue !== to) {
				this.actualValue = to;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = to.toString();
				}
			}
		},
		'bedHeater.standby'(to) {
			if (this.standby && this.isNumber(to) && this.actualValue !== to) {
				this.actualValue = to;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = to.toString();
				}
			}
		},
		'chamberHeater.active'(to) {
			if (this.active && this.isNumber(to) && this.actualValue !== to) {
				this.actualValue = to;
				if (document.activeElement !== this.inputElement) {
					this.inputValue = to.toString();
				}
			}
		},
		'chamberHeater.standby'(to) {
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
