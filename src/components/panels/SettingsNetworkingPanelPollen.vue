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

const m552re = /^\s*M552(?: S\d| P(\d+\.\d+\.\d+\.\d+))+/gm;
const m552reInner = /P(\d+\.\d+\.\d+\.\d+)/gm;
const sysConfigFilename = '/sys/config.g';

import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      formIpAddress: null
    }
  },
	computed: {
		...mapState('machine/honeyprint_cache', {
      ipAddress: state => state.ipAddress,
    })
	},
	methods: {
		...mapActions('machine', {
      machineSendCode: 'sendCode',
      getFileList: 'getFileList',
			machineDownload: 'download',
			machineUpload: 'upload'
    }),
		...mapState('machine/model', ['network']),
    handleSubmit() {
      this.setCurrentIpAddress(this.formIpAddress);
    },
    loadConfigIpAddress() {
      const resultPromise = new Promise((resolve, reject) => {
        var lastMatch = null;
        this.machineDownload({ filename: sysConfigFilename, type: 'text', showSuccess: false })
        .then((fileContent) => {
          for (const match of fileContent.matchAll(m552re)) {
            if (lastMatch == null || lastMatch.index < match.index)
            {
            lastMatch = match;
            }
          }

          if (lastMatch == null)
          {
            reject(fileContent);
          }
          else
          {
            const execResult = m552reInner.exec(lastMatch[0]);
            const foundIpAddress = execResult && execResult[1] || null;

            resolve({ lastMatch: lastMatch, foundIpAddress: foundIpAddress });
          }
        },
        () => { reject(null); });
      });

      return resultPromise;
    },
    setCurrentIpAddress() {
      const newM552Command = `M552 S1 P${this.formIpAddress}`;
      this.loadConfigIpAddress()
      .then(
        (data) => {
          var lastMatch = data.lastMatch;
          var newInput =
            `${lastMatch.input.substring(0, lastMatch.index)}${newM552Command}${lastMatch.input.substring(lastMatch.index + lastMatch[0].length, lastMatch.input.length)}`;

          this.machineUpload({ filename: sysConfigFilename, content: newInput })
        },
        (fileContent) => {
          if (fileContent != null)
          {
            var newInput = `${fileContent}\n${newM552Command}`;
            this.machineUpload({ filename: sysConfigFilename, content: newInput })
          }
        }
      );

      this.machineSendCode(newM552Command);
    }
	},
  mounted() {
    this.loadConfigIpAddress()
    .then(
      (data) => {
        // var lastMatch = data.lastMatch;
        var foundIpAddress = data.foundIpAddress;
        this.formIpAddress = foundIpAddress;
      },
      () => {
        this.formIpAddress = '0.0.0.0';
      }
    );
  }
}

</script>

