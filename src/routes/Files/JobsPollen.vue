<template>
	<v-row>
		<v-col>
			<job-file-list-pollen></job-file-list-pollen>
		</v-col>
	</v-row>
</template>

<script>
'use strict'

import { registerRoute } from '..'

export default {
	install() {
		// Register a route via Files -> Jobs
		registerRoute(this, {
			Job: {
				Jobs: {
					icon: 'mdi-play',
					caption: 'menu.files.jobs',
					path: '/Job/Jobs'
				}
			}
		});
	}
}
</script>
