
<template>
	<v-card>
		<v-card-title class="pb-1">
			<v-col>
				High Temperature
			</v-col>
		</v-card-title>

		<v-card-text class="pt-0">
			<v-row dense>
				<v-col class="d-flex flex-column">
					<strong>
						Room
					</strong>
					<span>
            XX / <tool-input style="display: inline-block;" :tool="tool" :tool-heater-index="toolHeaterIndex" active></tool-input>
					</span>
				</v-col>

				<v-col class="d-flex flex-column">
					<strong>
						Radiant
					</strong>
					<span>
						XX / <tool-input style="display: inline-block;"  :tool="tool" :tool-heater-index="toolHeaterIndex" active></tool-input>
					</span>
				</v-col>

			</v-row>


		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

export default {
	computed: {
	},
	mounted() {
	},
	watch: {
	}
}
</script>
