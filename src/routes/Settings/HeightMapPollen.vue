<template>
	<v-row>
		<v-col>
			<heightmap-pollen></heightmap-pollen>
		</v-col>
	</v-row></template>

<script>
'use strict'

import { registerRoute } from '..'

export default {
	install() {
		// Register a route via Settings -> General
		registerRoute(this, {
			Settings: {
				HeightMap: {
					icon: 'mdi-grid',
					caption: 'plugins.heightmap.menuCaption',
					path: '/HeightMap'
				}
			}
		});
	}
}
</script>
