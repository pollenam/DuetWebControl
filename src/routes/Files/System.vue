<template>
	<v-row>
		<v-col>
			<system-file-list></system-file-list>
		</v-col>
	</v-row>
</template>

<script>
'use strict'

import { registerRoute } from '..'
import store from '@/store'

export default {
	install() {
		// Register a route via Files -> System
		registerRoute(this, {
			Files: {
				System: {
					icon: 'mdi-cog',
					caption: 'menu.files.system',
					path: '/legacy/Files/System',
					condition: () => store.state.settings.legacyMode == true
				}
			}
		});
	}
}
</script>
