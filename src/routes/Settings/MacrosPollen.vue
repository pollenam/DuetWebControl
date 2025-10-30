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
import store from '@/store'
export default {
	install() {
		// Register a route via Settings -> Macros
		registerRoute(this, {
			Settings: {
				Automation: {
					icon: 'mdi-file-cog-outline',
					caption: 'list.macro.pollenTitle',
					path: '/Expert/Settings/Automation',
					condition: () => store.state.settings.ExpertMode == true
				}
			}
		});
	}
}
</script>
