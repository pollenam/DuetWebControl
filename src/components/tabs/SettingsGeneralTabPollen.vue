<template>
	<v-row class="pa-3" :dense="$vuetify.breakpoint.mobile">
		<v-col cols="12" md="4" lg="4">
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<settings-electronics-pollen-panel></settings-electronics-pollen-panel>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<settings-about-pollen-panel></settings-about-pollen-panel>
				</v-col>
			</v-row>
		</v-col>

		<v-col cols="12" md="8">
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12">
					<settings-general-pollen-panel></settings-general-pollen-panel>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12">
					<settings-apperance-pollen-panel></settings-apperance-pollen-panel>
				</v-col>
			</v-row>
		</v-col>
	</v-row>
</template>

<script>
'use strict'

import { registerSettingTab } from '@/routes'

export default {
	install() {
		// Register a settings tab on the General settings page
		registerSettingTab(true, 'settings-general-tab-pollen', this, 'tabs.generalSettings.caption');
	}
}
</script>
