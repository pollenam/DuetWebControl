<template>
	<v-card outlined>
		<v-card-title class="pb-0">
			Legacy mode
		</v-card-title>

		<v-card-text>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<div>Enter the admin password for the machine to enable legacy mode (all DWC defaut screen)</div>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<v-text-field
							v-model="password"
							:append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
							:type="show1 ? 'text' : 'password'"
							name="input-10-1"
							label="Password"
							hint="Password to activate legacy mode"
							@click:append="show1 = !show1"
							:error="error"
							@keydown.enter="submit"
						></v-text-field>
				</v-col>
			</v-row>
			<v-row :dense="$vuetify.breakpoint.mobile">
				<v-col cols="12" sm="12">
					<v-btn @click="disableLegacyMode" :disabled="!legacyMode">Disable legacy mode</v-btn>
				</v-col>
			</v-row>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'


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
		...mapGetters(['uiFrozen'])
	},
	methods: {
		...mapActions('settings', ['reset']),
		...mapMutations('settings', ['update']),
		submit() {
			if(this.password == "SuperPassword") {
				this.$store.commit("settings/legacyMode", true);
				this.password = "";
				this.error = false;
			} else {
				this.error = true
			}
		},
		disableLegacyMode() {
			this.$store.commit("settings/legacyMode", false);
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
