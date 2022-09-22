<template>
	<v-card outlined>
		<v-card-title class="pb-0">
			{{ $t('panel.settingsPollen.legacyMode') }}
		</v-card-title>

		<v-card-text>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<div> {{ $t('panel.settingsPollen.passwordDescription') }}</div>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<v-text-field
							v-model="password"
							:append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
							:type="show1 ? 'text' : 'password'"
							name="input-10-1"
							:label="$t('panel.settingsPollen.password')"
							:hint="$t('panel.settingsPollen.passwordHint')"
							@click:append="show1 = !show1"
							:error="error"
							@keydown.enter="submit"
						></v-text-field>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<v-btn @click="clickLegacyModeBtn">{{ getBtnStateText() }}</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import i18n from '../../i18n'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
var md5 = require("md5");

export default {
	computed: {
		legacyMode: {
			get() {
				return this.$store.state.settings.legacyMode;
			},
			set(val) {
				this.$store.commit("settings/legacyMode", val);
			}
		},
		...mapState(['settings']),
		...mapGetters(['uiFrozen']),
		...mapState({
			name: state => state.machine.model.network.name,
		})
	},
	methods: {
		...mapActions('settings', ['reset']),
		...mapMutations('settings', ['update']),
		submit() {
			if(process.env.NODE_ENV === 'development') {
				this.$store.commit("settings/legacyMode", true);
				this.password = "";
				this.error = false;
			} else {
				if(this.password == md5(this.name).substring(0, 10)) {
					this.$store.commit("settings/legacyMode", true);
					this.password = "";
					this.error = false;
				} else {
					this.error = true
				}
			}
		},
		clickLegacyModeBtn() {
			if(this.legacyMode === true) {
				this.$store.commit("settings/legacyMode", false);
			} else {
				this.submit();
			}
		},
		getBtnStateText(){
			if(this.legacyMode) {
				return i18n.t('panel.settingsPollen.disableLegacyMode')
			} else {
				return i18n.t('panel.settingsPollen.enableLegacyMode')
			}
		}
	},
	data() {
		return {
			password: "",
			show1: false,
			error: false
		}
	},
}
</script>
