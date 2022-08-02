<template>
	<div class="mb-3">
		<fff-dashboard-pollen-panel></fff-dashboard-pollen-panel>
	</div>
</template>

<script>
'use strict';

import { mapState } from 'vuex';

import { registerRoute } from '..'

export default {
    install() {
        // Register a route via Control -> Dashboard
        registerRoute(this, {
            Control: {
                Dashboard: {
                    icon: 'mdi-view-dashboard',
                    caption: 'menu.control.dashboard',
                    path: '/'
                }
            }
        });
    },

	computed: {
		...mapState('machine/model', {
			atxPower: state => state.state.atxPower,
			machineMode: state => state.state.machineMode
		})
	},
};
</script>
