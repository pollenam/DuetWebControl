<style lang="scss">
.v-card.v-card--console-drawer-pollen {
  position: fixed;
  right: 0px;
  bottom: 0px;
  width: 300px;
  height: 48px;
  z-index: 999;

  background: no-repeat center center fixed !important;
  background-image: linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)),
                    url('../../assets/honeyprint-sx2-background.jpg') !important;
  background-size: cover !important;

  -webkit-transition: width 150ms;
          transition: width 150ms;

  .v-card__text {
    height: 0px;
    padding-top: 0px;
    padding-bottom: 0px;

    -webkit-transition: height 150ms;
            transition: height 150ms;
  }

  &.v-card--console-drawer-pollen--expanded {
    width: 60%;
    height: auto;

    .v-card__text {
      height: calc(80vh - 48px);
      padding-top: 16px;
      padding-bottom: 16px;
    }
  }

  .v-data-table__wrapper {
    max-height: calc(80vh - 180px);
    overflow-y: scroll;
  }
}
</style>
<template>
	<v-card elevation="0" class="v-card--console-drawer-pollen hidden-md-and-down" :class="{ 'v-card--console-drawer-pollen--expanded': expanded }" v-if="isEnabled">
		<v-card-title class="v-card__title--dense" @click="toggleExpanded">
			<v-icon small class="mr-2">mdi-code-tags</v-icon> {{ $t('menu.control.console') }}
		</v-card-title>

		<v-card-text>
      <v-row :dense="$vuetify.breakpoint.mobile">
        <v-col cols="12" class="pt-1">
          <code-input solo></code-input>
        </v-col>
        <v-col cols="12">
          <event-list></event-list>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
'use strict'

export default {
	computed: {
    isEnabled() {
			const currentRoute = this.$route;
      return !currentRoute.path.match(/Console$/);
    }
	},
	data() {
		return {
			expanded: false
		}
	},
	methods: {
    toggleExpanded() {
      this.expanded = !this.expanded;
    }
	},
	mounted() {
		this.hostname = this.passwordRequired ? location.host : this.lastHostname;
		this.shown = this.connectDialogShown;
	},
	watch: {
		connectDialogShown(to) { this.shown = to; },
		lastHostname(to) {
			// Update the hostname
			this.hostname = to;
		}
	}
}
</script>
