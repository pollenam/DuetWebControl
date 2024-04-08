<style lang="scss">

</style>

<template>
	<v-card :elevation="0">
		<v-card-title class="v-card__title--dense">
			<v-icon class="mr-2">mdi-engine-outline</v-icon>
			Motors Panel
			<v-spacer></v-spacer>
			<v-btn class="mx-0" @click="echoMotors" elevation="0" :disabled="uiFrozen">
				<v-icon class="mr-1">mdi-engine-outline</v-icon> Echo motors
			</v-btn>
		</v-card-title>
	  	<v-card-text>
			<div v-for="motor in motors" :key="motor">
				<!-- {{ motor.letter }} -->
				TEST
				<!-- <v-badge :color="getStatusColor(motor.status[0], motor.status[1], motor.status[2])">
					{{ motor.status.join(', ') }}
				</v-badge> -->
			</div>
	  	</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapActions, mapState, mapGetters } from 'vuex'

export default {
	computed: {
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapState('machine/model', ['move'], {
			xReady: state => state.global.RDY_X,
			aReady: state => state.global.RDY_A,
			bReady: state => state.global.RDY_B,
			dReady: state => state.global.RDY_D,
			yReady: state => state.global.RDY_Y,
			cReady: state => state.global.RDY_C,
			ed1sDriversReady: state => state.global.RDY_ED1S,
			ed1sAlarm: state => state.global.ALARM_ED1S,
			zReady: state => state.global.RDY_Z,
		}),
		motors(){
			return this.motorsList;
		},
	},
	data() {
		return {
			// motorsList: ['X', 'A', 'B', 'D', 'Y1', 'Y2', 'C1', 'C2', 'Z1', 'Z2', 'Z3', 'Z4'],
			motorsList: [
				{ letter: 'X', status: [this.xReady, !this.xReady, this.xReady] },
				{ letter: 'A', status: [this.aReady, !this.aReady, this.aReady] },
				{ letter: 'B', status: [this.bReady, !this.bReady, this.bReady] },
				{ letter: 'D', status: [this.dReady, !this.dReady, this.dReady] },
				{ letter: 'Y1', status: [this.yReady[0], !this.yReady[0], this.yReady[0]] },
				{ letter: 'Y2', status: [this.yReady[1], !this.yReady[1], this.yReady[1]] },
				{ letter: 'C1', status: [this.cReady[0], !this.cReady[0], this.cReady[0]] },
				{ letter: 'C2', status: [this.cReady[1], !this.cReady[1], this.cReady[1]] },
				{ letter: 'Z1', status: [this.ed1sDriversReady[0], this.ed1sAlarm, this.zReady[0]] },
				{ letter: 'Z2', status: [this.ed1sDriversReady[1], this.ed1sAlarm, this.zReady[1]] },
				{ letter: 'Z3', status: [this.ed1sDriversReady[2], this.ed1sAlarm, this.zReady[2]] },
				{ letter: 'Z4', status: [this.ed1sDriversReady[3], this.ed1sAlarm, this.zReady[3]] }
			],
		}
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		async echoMotors(){
			await this.sendCode(`echo "motor list length : ${this.motorsList.length}"`);
			for (let i = 0; i < this.motorsList.length; i++) {
				await this.sendCode(`echo "motor ${this.motorsList[i]} : ${this.motorsList[i]}"`);
			}
		},
		isMotorDeclared(letter) {
			return this.move.axes.some(axes => axes.some(el => el.letter === letter));
		},
		getStatusColor(isDriveOn, hasError, isServoOn) {
			if (hasError) {
				return 'red';
			} else if (isServoOn) {
				return 'green';
			} else if (isDriveOn) {
				return 'orange';
			} else {
				return 'grey';
			}
		},
	}
}
</script>