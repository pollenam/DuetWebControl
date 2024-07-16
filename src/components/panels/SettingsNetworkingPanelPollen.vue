<template>
  <v-card outlined>
    <v-card-title>
      {{ $t('panel.settingsPollen.networking') }}
    </v-card-title>

    <v-card-text>
    <v-form ref="form" @keyup.native.enter="submit" @submit.prevent="handleSubmit">
			<v-row dense>
				<v-col cols="9">
					<v-text-field
							type="text"
							name="ipAddressInput"
							:label="$t('panel.settingsPollen.ipAddress')"
              v-model="formIpAddress"
						></v-text-field>
        </v-col>
				<v-col cols="3">
          <v-btn
            class="mt-4"
            elevation="0"
            type="submit"
          >
            Validate
          </v-btn>
				</v-col>
			</v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
'use strict'

//const m552re = /^\s*M552(?: S\d| P(\d+\.\d+\.\d+\.\d+))+/gm;
//const m552reInner = /P(\d+\.\d+\.\d+\.\d+)/gm;
//const ipAddressInitFile = '/macros/CONFIG/IP_ADRESS_MEMORY.g';
const ipAddressPattern = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;

import { mapState, mapActions } from 'vuex'

export default {
	computed: {
		...mapState('machine/model', {
      ipAddress: state => state.global.IP_ADRESS,
    })
	},
  data() {
    return {
      formIpAddress: this.ipAddress
    }
  },
	methods: {
		...mapActions('machine', {
      machineSendCode: 'sendCode',
      getFileList: 'getFileList',
			machineDownload: 'download',
			machineUpload: 'upload'
    }),
		...mapState('machine/model', ['network']),
    async handleSubmit() {
      if (this.isValidIpAdress()){
        await this.machineSendCode(`M98 P"/macros/HONEYPRINT/UPDATE_IP_ADRESS" A"${this.formIpAddress}"`);
      }
      else{
        await this.machineSendCode(`echo "${this.formIpAddress} is not a valid ip adress."`);
      }
    },
    isValidIpAdress(){
      return ipAddressPattern.test(this.formIpAddress);
    }
  },
  mounted() {
    this.formIpAddress = this.ipAddress;
  }
}

</script>

