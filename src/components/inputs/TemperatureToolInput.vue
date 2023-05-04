<style lang="scss">
.temperature-tool-component {
  display: inline-block;
  text-align: right;

  input[type="number"] {
    color: rgba(44, 34, 33, 0.7);
    width: 1px;
  }
}

.temperature-row {
	margin-bottom: 0px;
	padding:0px;
}

.v-input__append-inner {
display: none !important;
}
</style>

<template>
  <div class="temperature-row w-100 d-flex align-baseline justify-space-between">
    <span class="temperature-tool-component flex-grow-1" style="font-weight: 600">{{ getHeaterValue() }}</span>
    <span class="gray--text flex-grow-0 mx-1">/</span>
    <div class="d-flex flex-column flex-grow-1">
      <v-combobox hide-details="auto" ref="input" type="number" min="-273" max="1999" step="any" class="temperature-tool-component pt-0 mt-0" :label="label" :menu-props="{ maxHeight: '50%' }"
            :value="inputValue" :search-input="inputValue" @update:search-input="change" @keyup.enter="apply" @blur="blur"
            :loading="applying" :disabled="uiFrozen || !isValid" :items="items" hide-selected>
      </v-combobox>
      <a href="javascript:void(0)" class="black--text mt-1" @click="toolHeaterClick()"><small>({{ getStatus() }})</small></a>
    </div>
		<reset-heater-fault-dialog :shown.sync="resetHeaterFault" :heater="faultyHeater"></reset-heater-fault-dialog>
	</div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'
import { AnalogSensorType, HeaterState } from '@/store/machine/modelEnums'

export default {
	computed: {
		...mapGetters(['uiFrozen', 'isConnected']),
		...mapState('machine/model', ['heat', 'sensors', 'state', 'tools']),
		...mapState('machine/settings', ['temperatures']),
		...mapState('settings', ['disableAutoComplete']),
		items() {
			if (this.disableAutoComplete) {
				return [];
			}

			const key = 'active';
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
				return (this.bedHeaterIndex >= 0 && this.bedHeaterIndex < this.heat.bedHeaters.length);
			} else if (this.chamber) {
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
			inputValue: '0',
			resetHeaterFault: false,
			faultyHeater: -1
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
		bedHeaterIndex: Number,

		chamber: Object,
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
						if (this.tool) {
              // We decided to diable standby mode. Old implementation here down
              // const currentTemps = this.tool[this.active ? 'active' : 'standby'];
              // const newTemps = currentTemps.map((temp, i) => (i === this.toolHeaterIndex) ? this.inputValue : temp, this).join(':');
              // await this.sendCode(`M568 P${this.tool.number} ${this.active ? 'S' : 'R'}${newTemps}`);

							// Set tool temps
              const currentTemps = this.tool['active'];
              const newTemps = currentTemps.map((temp, i) => (i === this.toolHeaterIndex) ? this.inputValue : temp, this).join(':');
              await this.sendCode(`M568 P${this.tool.number} S${newTemps}`);
						} else if (this.bed) {
							// Set bed temp
							await this.sendCode(`M140 P${this.bedHeaterIndex} ${this.active ? 'S' : 'R'}${this.inputValue}`);
						} else if (this.chamber) {
							// Set chamber temp
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

			if (this.tool && this.heat) {
				heater =  this.heat.heaters[this.tool.heaters[this.toolHeaterIndex]];
			} else if (this.bed) {
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

			return this.$t('generic.noValue');
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
		},
		getStatus() {
			var heater = null;
			if (this.tool && this.heat) {
				heater =  this.heat.heaters[this.tool.heaters[this.toolHeaterIndex]];
			} else if (this.bed) {
				heater = this.bed;
			} else if (this.chamber) {
				heater = this.chamber;
			}

      if (heater && heater.state)
      {
        return heater.state;
      }
      else
      {
        return this.$t('generic.noValue');
      }
		},
		toolHeaterClick() {
			if (!this.isConnected) {
				return;
			}

			var heater = this.getHeater();
			switch (heater.state) {
				case HeaterState.off:		// Off -> Active
					if(this.tool) {
						this.sendCode(`M568 P${this.tool.number} A2`);
					}
					if(this.chamber) {
						this.sendCode(`M141 P${this.chamberHeaterIndex} S${heater.active}`);
					}
					if(this.bed) {
						this.sendCode(`M140 P${this.bedHeaterIndex} S${heater.active}`);
					}
					break;

				case HeaterState.standby:	// Standby -> Off
					if(this.tool) {
					this.sendCode(`M568 P${this.tool.number} A0`);
					}
					if(this.chamber) {
						this.sendCode(`M141 P${this.chamberHeaterIndex} S-273.15`);
					}
					if(this.bed) {
						this.sendCode(`M140 P${this.bedHeaterIndex} S-273.15`);
					}
					break;

        // Disabled to disabled standby mode
				// case HeaterState.active:	// Active -> Standby
				// 	if(this.tool) {
				// 		this.sendCode(`M568 P${this.tool.number} A1`);
				// 	}
				// 	if(this.chamber) {
				// 		this.sendCode(`M141 P${this.chamberHeaterIndex} S-273.15`);
				// 	}
				// 	if(this.bed) {
				// 		this.sendCode(`M144 P${this.bedHeaterIndex}`);
				// 	}
				// 	break;

				case HeaterState.fault:		// Fault -> Ask for reset
					this.faultyHeater = this.heat.heaters.indexOf(heater);
					this.resetHeaterFault = true;
					break;
			}
		},
		getHeater(){
			var heater = null;

			if (this.tool && this.heat) {
				heater =  this.heat.heaters[this.tool.heaters[this.toolHeaterIndex]];
			} else if (this.bed) {
				heater = this.bed;
			} else if (this.chamber) {
				heater = this.chamber;
			}
			return heater;
		}
	},
	mounted() {
		this.inputElement = this.$el.querySelector('input');
		if (this.tool) {
			if (this.tool[this.active ? 'active' : 'standby'].length > 0) {
				this.actualValue = this.tool[this.active ? 'active' : 'standby'][this.toolHeaterIndex];
			}
		} else if (this.bed) {
			this.actualValue = this.bed[this.active ? 'active' : 'standby'];
		} else if (this.chamber) {
			this.actualValue = this.chamber[this.active ? 'active' : 'standby'];
		}
    if (this.actualValue == undefined || this.actualValue == null)
    {
      this.inputValue = null;
    }
    else
    {
      this.inputValue = this.actualValue.toString();
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
