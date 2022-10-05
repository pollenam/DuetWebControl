<template>
	<v-row>
		<v-col>
			<macro-file-list-pollen></macro-file-list-pollen>
		</v-col>
	</v-row>
</template>

<script>
'use strict'

import { registerRoute } from '..'

export default {
	install() {
		// Register a route via Settings -> Macros
		registerRoute(this, {
			Settings: {
				Automation: {
					icon: 'mdi-file-cog-outline',
					caption: 'list.macro.pollenTitle',
					path: '/Settings/Automation'
				}
			}
		});
	}
}
</script>
