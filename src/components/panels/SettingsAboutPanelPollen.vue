<template>
	<v-card outlined>
		<v-card-title>
			<span>Pollen Web Control {{ version }}-{{ pollenVersion }}</span>
		</v-card-title>

		<v-card-text class="pt-0">
			{{ $t('panel.settingsAbout.developedBy') }} <a href="https://www.pollen.am" target="_blank">Pollen AM</a>.
			<br>
			{{ $t('panel.settingsAbout.licensedUnder') }} <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GNU General Public License v3</a>
			<br>
			<a href="https://pollenam.zendesk.com" target="_blank">{{ $t('panel.settingsAbout.support') }}</a>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { version, pollenVersion } from '../../../package.json'

export default {
	data() {
		return {
			version,
			pollenVersion
		}
	}
}
</script>
