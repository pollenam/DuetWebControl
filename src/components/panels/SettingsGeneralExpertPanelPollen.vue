<template>
	<v-card outlined>
		<v-card-title class="pb-0">
			{{ $t('panel.settingsExpertPollen.ExpertMode') }}
		</v-card-title>

		<v-card-text>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<div>{{ $t('panel.settingsExpertPollen.passwordDescription') }}</div>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<v-text-field
							v-model="password"
							:append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
							:type="show1 ? 'text' : 'password'"
							name="input-10-1"
							:label="$t('panel.settingsExpertPollen.password')"
							:hint="$t('panel.settingsExpertPollen.passwordHint')"
							@click:append="show1 = !show1"
							:error="error"
							@keydown.enter="submit"
						></v-text-field>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<v-btn elevation="0" @click="clickExpertModeBtn">{{ getBtnStateText() }}</v-btn>
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
		ExpertMode: {
			get() {
				return this.$store.state.settings.ExpertMode;
			},
			set(val) {
				this.$store.commit("settings/ExpertMode", val);
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
				this.$store.commit("settings/ExpertMode", true);
				this.password = "";
				this.error = false;
			} else {
				if(this.password == md5(this.name).substring(10, 20)) {
					this.$store.commit("settings/ExpertMode", true);
					this.password = "";
					this.error = false;
				} else {
					this.error = true
				}
			}
		},
		clickExpertModeBtn() {
			if(this.ExpertMode === true) {
				this.$store.commit("settings/ExpertMode", false);
			} else {
				this.submit();
			}
		},
		getBtnStateText(){
			if(this.ExpertMode) {
				return i18n.t('panel.settingsExpertPollen.disableExpertMode')
			} else {
				return i18n.t('panel.settingsExpertPollen.enableExpertMode')
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