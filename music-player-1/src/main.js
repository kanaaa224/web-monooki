const { createApp, ref, onMounted, nextTick, reactive } = Vue;
const { createVuetify, useTheme, useDisplay } = Vuetify;

(async () => {
    let api_default_endpoint_url = API_ENDPOINTS_URLS[0];

    const callAPI = async (endpoint = api_default_endpoint_url, queries = {}, requestBody = null) => {
        const url = new URL(endpoint);

        for(const [ key, value ] of Object.entries(queries)) url.searchParams.set(key, value);

        let request = { method: 'GET' };

        if(requestBody) request = { method: 'POST', body: JSON.stringify(requestBody) };

        const response = await fetch(url.toString(), request);
        const body     = await response.json();

        if(!response.ok) throw new Error(`api-bad-status: ${response.status}`);

        return body;
    };

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const app = createApp({
        setup() {
            const theme   = useTheme();
            const display = useDisplay();

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            const developer = ref({});

            const player = reactive(new AudioStreaming());

            const currentTime = ref(0);
            const duration    = ref(0);

            let interval = 0;

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            const dialog_settings_visible = ref(false);

            const dialog_settings = () => {
                if(!dialog_settings_visible.value) {
                    dialog_settings_visible.value = true;

                    return;
                }
            };

            const dialog_equalizer_visible = ref(false);

            const dialog_equalizer = () => {
                dialog_equalizer_visible.value = true;
            };

            const dialog_sfs_visible        = ref(false);
            const dialog_sfs_select_value_1 = ref(null);

            const dialog_sfs = () => {
                dialog_sfs_visible.value = true;
            };

            const dialog_load_url_visible = ref(false);
            const dialog_load_url_value   = ref('');

            const dialog_load_url = async () => {
                if(!dialog_load_url_visible.value) {
                    dialog_load_url_visible.value = true;

                    return;
                }

                if(!dialog_load_url_value.value) return;

                try {
                    duration.value = await player.loadURL(dialog_load_url_value.value);
                } catch(e) {
                    console.log(e);
                }

                if(!interval) {
                    interval = setInterval(() => {
                        currentTime.value = player.getCurrentTime();
                    }, 100);
                }

                dialog_load_url_visible.value = false;
            };

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            const container_visible = ref(false);

            onMounted(async () => {
                document.title = APP_NAME;

                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                    theme.global.name.value = e.matches ? 'dark' : 'light';
                });

                try {
                    developer.value = await callAPI();
                } catch(e) {
                    console.error(e);
                }

                ((l) => (l.href = developer.value.avatar_url, document.head.appendChild(l)))(document.querySelector("link[rel='icon']")             || Object.assign(document.createElement("link"), { rel: "icon" }));
                ((l) => (l.href = developer.value.avatar_url, document.head.appendChild(l)))(document.querySelector("link[rel='apple-touch-icon']") || Object.assign(document.createElement("link"), { rel: "apple-touch-icon" }));

                container_visible.value = true;
            });

            const formatTime = (seconds) => {
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);

                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            };

            const onFileSelected = async (file) => {
                if(!file) return;

                try {
                    duration.value = await player.loadFile(file);
                } catch(e) {
                    console.log(e);
                }

                if(!interval) {
                    interval = setInterval(() => {
                        currentTime.value = player.getCurrentTime();
                    }, 100);
                }
            };

            return {
                theme,
                display,

                developer,
                player,
                currentTime,
                duration,

                dialog_settings_visible,
                dialog_settings,
                dialog_equalizer_visible,
                dialog_equalizer,
                dialog_sfs_visible,
                dialog_sfs_select_value_1,
                dialog_sfs,
                dialog_load_url_visible,
                dialog_load_url_value,
                dialog_load_url,

                container_visible,

                formatTime,
                onFileSelected
            }
        },
        template: `
            <v-app style="padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);">
                <v-dialog
                    v-model="dialog_settings_visible"
                    transition="dialog-bottom-transition"
                    fullscreen
                >
                    <v-card style="padding-top: env(safe-area-inset-top);">
                        <v-toolbar>
                            <v-toolbar-title>設定</v-toolbar-title>
                            <v-toolbar-items>
                                <v-btn
                                    icon="mdi-close"
                                    @click="dialog_settings_visible = false"
                                />
                            </v-toolbar-items>
                        </v-toolbar>
                        <v-list lines="two">
                            <v-list-subheader title="アプリケーション" />
                            <v-list-item
                                title="バージョン"
                                subtitle="v1.0"
                            />
                            <v-divider />
                            <v-list-item
                                class="text-center"
                                subtitle="© 2025 kanaaa224. All rights reserved."
                                href="https://kanaaa224.github.io/"
                                target="_blank"
                                rel="noopener"
                            />
                        </v-list>
                    </v-card>
                </v-dialog>
                <v-dialog
                    v-model="dialog_equalizer_visible"
                    max-width="900"
                >
                    <v-card
                        prepend-icon="mdi-tune-vertical"
                        title="イコライザー"
                        text=""
                    >
                        <v-card-text>
                            <v-row dense>
                                <v-col
                                    v-for="(band, index) in player.equalizer.bands"
                                    :key="band.frequency"
                                    cols="6"
                                    sm="4"
                                    md="3"
                                >
                                    <v-slider
                                        :model-value="band.gain"
                                        @update:model-value="player.equalizer.setBandGain(index, $event)"
                                        :min="-12"
                                        :max="12"
                                        step="0.5"
                                        vertical
                                        hide-details
                                    />
                                    <div class="text-center text-caption mt-1">
                                        {{ band.frequency }} Hz<br>
                                        {{ band.gain.toFixed(1) }} dB
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn
                                variant="plain"
                                text="Close"
                                @click="dialog_equalizer_visible = false"
                                :disabled="dialog_equalizer_loading"
                            />
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog
                    v-model="dialog_load_url_visible"
                    max-width="600"
                >
                    <v-card
                        prepend-icon="mdi-surround-sound"
                        title="URLからストリーム"
                        text=""
                    >
                        <v-card-text>
                            <v-text-field
                                ref="dialog_load_url_ref"
                                v-model="dialog_load_url_value"
                                label="URL"
                                required
                                :rules="dialog_load_url_rules"
                                :loading="dialog_load_url_loading"
                                :disabled="dialog_load_url_loading"
                            />
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />
                            <v-btn
                                variant="plain"
                                text="Close"
                                @click="dialog_load_url_visible = false"
                                :disabled="dialog_load_url_loading"
                            />
                            <v-btn
                                variant="tonal"
                                text="Load"
                                color="primary"
                                @click="dialog_load_url()"
                                :disabled="dialog_load_url_loading"
                            />
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-dialog
                    v-model="dialog_sfs_visible"
                    max-width="600"
                >
                    <v-card
                        prepend-icon="mdi-surround-sound"
                        title="音場 シミュレーター"
                        text=""
                    >
                        <v-card-text>
                            <v-select
                                v-model="dialog_sfs_select_value_1"
                                :items="Object.keys(player.soundField.presets)"
                                label="プリセット"
                                @update:model-value="player.soundField.applyPreset($event)"
                            />
                        </v-card-text>
                        <v-card-actions>
                            <v-btn
                                variant="plain"
                                text="Close"
                                @click="dialog_sfs_visible = false"
                                :disabled="dialog_sfs_loading"
                            />
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-main>
                    <v-fade-transition mode="out-in">
                        <v-container v-if="container_visible">
                            <v-card class="card-shadow pa-2 mt-10" elevation="0" rounded="lg">
                                <v-card-text>
                                    <v-file-input label="音声ファイル" @update:model-value="onFileSelected" />
                                    <div class="d-flex" style="gap: 1rem; overflow: auto hidden;">
                                        <v-btn
                                            color="secondary"
                                            @click="dialog_load_url()"
                                        ><v-icon icon="mdi-link" /></v-btn>
                                        <v-btn
                                            color="secondary"
                                            @click="dialog_equalizer()"
                                            :disabled="!player.isLoaded"
                                        ><v-icon icon="mdi-tune-vertical" /></v-btn>
                                        <v-btn
                                            color="secondary"
                                            @click="player.isPlaying ? player.pause() : player.play()"
                                            :disabled="!player.isLoaded"
                                        ><v-icon :icon="player.isPlaying ? 'mdi-pause' : 'mdi-play'" /></v-btn>
                                        <v-btn
                                            color="secondary"
                                            @click="player.stop()"
                                            :disabled="!player.isLoaded"
                                        ><v-icon icon="mdi-stop" /></v-btn>
                                        <v-btn
                                            color="secondary"
                                            @click="dialog_sfs()"
                                            :disabled="!player.isLoaded"
                                        ><v-icon icon="mdi-surround-sound" /></v-btn>
                                        <div class="d-flex align-center justify-space-between w-100">
                                            <span>{{ formatTime(currentTime) }}</span>
                                            <v-slider
                                                class="mx-6"
                                                :model-value="currentTime"
                                                @update:model-value="player.seekTo($event);"
                                                :max="duration"
                                                :disabled="!player.isLoaded"
                                                step="0.01"
                                                hide-details
                                                thumb-size="0"
                                                style="flex: 1; min-width: 5rem;"
                                            />
                                            <span>{{ formatTime(duration) }}</span>
                                        </div>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-container>
                    </v-fade-transition>
                    <v-fade-transition mode="out-in">
                        <div
                            v-if="container_visible"
                            class="d-flex flex-column"
                            style="position: fixed; top: 2rem; right: 2rem; z-index: 999;"
                        >
                            <v-btn
                                icon
                                variant="plain"
                                @click="dialog_settings()"
                            ><v-icon icon="mdi-cog" /></v-btn>
                            <v-btn
                                icon
                                variant="plain"
                                @click="theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'"
                            ><v-icon :icon="theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny'" /></v-btn>
                        </div>
                    </v-fade-transition>
                </v-main>
                <v-footer class="justify-center pa-2" style="margin-bottom: env(safe-area-inset-bottom); opacity: 0.25; background-color: transparent;" app>
                    <span class="text-body-2">
                        © 2025 <a
                            style="color: inherit;"
                            href="https://kanaaa224.github.io/"
                            target="_blank"
                            rel="noopener"
                        >kanaaa224</a>. All rights reserved.
                    </span>
                </v-footer>
            </v-app>
        `
    });

    const vuetify = createVuetify({
        theme: {
            defaultTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
            themes: {
                light: {
                    dark: false,
                    colors: {
                        background: '#fff',
                        surface:    '#fff',
                        primary:    '#2196f3',
                        secondary:  '#444',
                        error:      '#c23131'
                    }
                },
                dark: {
                    dark: true,
                    colors: {
                        background: '#222',
                        surface:    '#292929',
                        primary:    '#2196f3',
                        secondary:  '#eee',
                        error:      '#c23131'
                    }
                }
            }
        }
    });

    app.use(vuetify).mount('#app');
})();