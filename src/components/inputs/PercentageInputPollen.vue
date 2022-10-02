<style scoped>
.slider {
	margin-top: 40px;
}
</style>

<template>
	<v-row dense align="end">
		<v-col cols="auto" class="grey--text text--darken--1 py-0">
			<v-btn x-small icon :disabled="disabled || innerValue <= min" @click="applyStep(-step)" @mousedown="mouseDown(false)" @mouseup="mouseUp(false)" @mouseleave="mouseUp(false)" @touchstart="mouseDown(false)" @touchend="mouseUp(false)" class="ml-0">
				<v-icon>mdi-minus</v-icon>
			</v-btn>
		</v-col>

		<v-col v-if="numericInputs" class="py-0">
			<v-combobox ref="input" type="number" :min="min" :max="max" step="any" :disabled="disabled" class="mx-2 mt-2" append-outer-icon="mdi-percent"
						:items="items" hide-selected :menu-props="{ maxHeight: '50%' }"
						:value="innerValue" @update:search-input="updateValue" @keyup.enter="apply">
			</v-combobox>
			<v-btn class="mr-1" color="primary" :disabled="!canApply" @click="apply">
				<v-icon class="mr-2">mdi-check</v-icon>
				{{ $t('input.set') }}
			</v-btn>
		</v-col>
		<v-col class="py-0" v-else>
			<v-slider :value="innerValue" @change="$emit('input', $event)" :min="min" :max="max" :step="step" :disabled="disabled" hide-details :thumb-label="thumbLabel" class="slider"></v-slider>
		</v-col>

		<v-col cols="auto" class="grey--text text--darken--1 py-0">
			<v-btn x-small icon :disabled="disabled || innerValue >= max" @click="applyStep(step)" @mousedown="mouseDown(true)" @mouseup="mouseUp(true)" @mouseleave="mouseUp(true)" @touchstart="mouseDown(true)" @touchend="mouseUp(true)" class="mr-0">
				<v-icon>mdi-plus</v-icon>
			</v-btn>
		</v-col>
	</v-row>
</template>

<script>
'use strict'

import { mapState } from 'vuex'
import { isNumber } from "@/utils/numbers";

const debounceTime = 500
const changeTime = 300, changeInterval = 150

export default {
	props: {
		value: {
			type: Number,
			required: true
		},
		thumb: {
			type: Boolean,
			required: false,
			default: true
		},
		min: {
			type: Number,
			default: 0
		},
		max: {
			type: Number,
			default: 100
		},
		step: {
			type: Number,
			default: 5
		},
		disabled: Boolean
	},
	computed: {
		...mapState('settings', ['numericInputs']),
		canApply() {
			if (this.disabled || this.innerValue === this.value || this.debounceTimer || this.decreaseTimer || this.increaseTimer) {
				return false;
			}
			const inputValue = parseFloat(this.innerValue);
			return isNumber(inputValue) && inputValue >= this.min && inputValue <= this.max;
		},
		items() {
			if (this.disableAutoComplete || !this.step) {
				return [];
			}

			const result = [];
			if (isNumber(this.min) && isNumber(this.max)) {
				for (let value = this.min; value <= this.max; value += this.step) {
					result.push(value);
				}
			} else {
				for (let i = 5; i >= 1; i--) {
					const lowerValue = this.value - this.step * i;
					if (lowerValue >= this.min) {
						result.push(lowerValue);
					}
				}
				for (let i = 1; i <= 5; i++) {
					const higherValue = this.value + this.step * i;
					if (higherValue > this.max) {
						break;
					}
					result.push(higherValue);
				}
			}
			return result;
		},
		thumbLabel() {
			if(this.thumb === true){
				return "always";
			} else {
				return true;
			}
		}
	},
	data() {
		return {
			innerValue: this.value,
			debounceTimer: undefined,
			decreaseTimer: undefined,
			increaseTimer: undefined
		}
	},
	methods: {
		apply() {
			this.$refs.input.isMenuActive = false;			// FIXME There must be a better solution than this
			if (this.canApply) {
				this.$emit('input', this.innerValue);
			}
		},
		updateValue(val) {
			this.innerValue = parseFloat(val);
		},

		applyStep(diff) {
			if (this.debounceTimer) {
				clearTimeout(this.debounceTimer);
			}
			this.innerValue = Math.min(this.max, Math.max(this.min, Math.round(((this.innerValue + diff) * 10)) / 10));
			this.debounceTimer = setTimeout(this.debounce, debounceTime);
		},
		debounce() {
			this.$emit('input', this.innerValue);
			this.debounceTimer = undefined;
		},
		mouseDown(increment) {
			if (increment) {
				this.increaseTimer = setTimeout(this.increase, changeTime);
			} else {
				this.decreaseTimer = setTimeout(this.decrease, changeTime);
			}
		},
		mouseUp(increment) {
			if (increment && this.increaseTimer) {
				clearTimeout(this.increaseTimer);
				this.increaseTimer = undefined;
			} else if (this.decreaseTimer) {
				clearTimeout(this.decreaseTimer);
				this.decreaseTimer = undefined;
			}
		},

		decrease() {
			this.applyStep(-this.step);
			this.decreaseTimer = setTimeout(this.decrease, changeInterval);
		},
		increase() {
			this.applyStep(this.step);
			this.increaseTimer = setTimeout(this.increase, changeInterval);
		}
	},
	watch: {
		value(to) {
			const newValue = Math.round(to * 10) / 10;
			if (this.innerValue !== newValue) {
				this.innerValue = newValue;
			}
		}
	}
}
</script>
