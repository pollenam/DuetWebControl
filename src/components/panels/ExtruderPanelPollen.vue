<style scoped>

.center-label {
	text-align: center;
}

</style>
<template>
	<v-card elevation="0">
		<v-card-title class="v-card__title--dense justify-space-between">
      <v-icon class="mr-1">mdi-water-outline</v-icon>
			{{ $t('panel.extruderPollen.title') }} {{ extruderNumber }}
			<v-spacer></v-spacer>
			TODO SELECTED BUTTONS
		</v-card-title>

		<v-card-text class="d-flex flex-column v-card__text--with-rows-highlighted">
			<v-row class="flex-column row--highlighted">
        <div class="flex-column">
					<div class="center-label">XX tr/min</div>
					<percentage-input></percentage-input>
        </div>
        <v-row class="px-0 py-0" dense>
          <v-col cols="6">
            <code-btn block color="primary" code="TODO" tile>
              Extrude <v-icon class="mr-1">mdi-arrow-down-bold</v-icon>
            </code-btn>
          </v-col>
          <v-col cols="6">
            <code-btn block color="primary" code="TODO" tile>
              Retract <v-icon class="mr-1">mdi-arrow-up-bold</v-icon>
            </code-btn>
          </v-col>
        </v-row>
        <v-row class="px-0 py-0" dense>
          <v-col cols="3">
            Mixer
          </v-col>
          <v-col cols="9">
           <percentage-input></percentage-input>
          </v-col>
        </v-row>
			</v-row>
			<v-row>
        <v-col cols="3">
          Feeder
        </v-col>
        <v-col cols="9">
         XX / <tool-input style="display: inline-block;"  active></tool-input>
        </v-col>
			</v-row>
			<v-row class="row--highlighted justify-space-between align-center">
        <v-col cols="3">
          Screw
        </v-col>
        <v-col cols="9">
         XX / <tool-input style="display: inline-block;"  active></tool-input>
        </v-col>
			</v-row>
			<v-row class="justify-space-between align-center">
        <v-col cols="3">
          Nozzle
        </v-col>
        <v-col cols="9">
         XX / <tool-input style="display: inline-block;"  active></tool-input>
        </v-col>
			</v-row>
			<v-row class="row--highlighted align-center">
				Extrusion Factor <percentage-input></percentage-input>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default {
  props: {
    extruderNumber: {
      type: Number,
      required: true
    }
  },
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['move']),
		...mapState('machine/settings', ['displayedExtruders']),
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/settings', ['toggleExtruderVisibility']),
	}
}
</script>
