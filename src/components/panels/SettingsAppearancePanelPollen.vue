<template>
	<v-card outlined>
		<v-card-title>{{ $t('panel.settingsAppearance.caption') }}</v-card-title>

		<v-card-text class="d-flex flex-column">
			<v-select :items="languages" :label="$t('panel.settingsAppearance.language')" :return-object="false" hide-details item-text="language" item-value="code" v-model="language"></v-select>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict';

import { mapState, mapMutations } from 'vuex'

export default {
	computed: {
		...mapState(['settings']),
		language: {
			get() { return this.settings.language; },
			set(value) { this.update({language: value}); }
		},
		languages() {
			const result = [];
			for (let key in this.$i18n.messages) {
				result.push({code: key, language: this.$i18n.messages[key].language});
			}
			return result;
		}
	},
	methods: mapMutations('settings', ['update']),
};
</script>
