const { createApp, ref, onMounted, nextTick, reactive } = Vue;
const { createVuetify, useTheme } = Vuetify;

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

const app = createApp({
    setup() {
        const logging = (d = '') => {
            console.log(`[ ${(new Date()).toISOString()} ] ${d}`);
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const callAPI = async (uri = '', queries = '', requestBody = null, endpoint = API_ENDPOINTS[0]) => {
            uri = `${endpoint}${uri}`;

            if(queries) uri += /\?/.test(uri) ? `&${queries}` : `?${queries}`;

            let request = { method: 'GET' };

            if(requestBody) request = { method: 'POST', body: JSON.stringify(requestBody) };

            const response = await fetch(uri, request);
            const data     = await response.json();

            if(!response.ok) throw new Error(`api-bad-status: ${response.status}`);

            return data;
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const snackbar_visible = ref(false);
        const snackbar_message = ref('');
        const snackbar_color   = ref('');
        const snackbar_time    = ref(5000);

        const snackbar = (message = null, color = null, time = null) => {
            if(!snackbar_visible.value) {
                snackbar_message.value = message ?? snackbar_message.value;
                snackbar_color.value   = color   ?? snackbar_color.value;
                snackbar_time.value    = time    ?? snackbar_time.value;
                snackbar_visible.value = true;
            }
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const dialog_loading_visible = ref(false);
        const dialog_loading_title   = ref('');
        const dialog_loading_icon    = ref('');

        const dialog_loading = (title = null, icon = null) => {
            if(!dialog_loading_visible.value) {
                dialog_loading_title.value   = title ?? dialog_loading_title.value;
                dialog_loading_icon.value    = icon  ?? dialog_loading_icon.value;
                dialog_loading_visible.value = true;
            }
        };

        const dialog_settings_visible = ref(false);

        const dialog_settings = () => {
            dialog_settings_visible.value = true;
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
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const container_visible = ref(false);
        const developer         = ref({});

        const onLoad = async () => {
            developer.value = await callAPI();

            ((l) => (l.href = developer.value.avatar_url, document.head.appendChild(l)))(document.querySelector("link[rel='icon']")             || Object.assign(document.createElement("link"), { rel: "icon" }));
            ((l) => (l.href = developer.value.avatar_url, document.head.appendChild(l)))(document.querySelector("link[rel='apple-touch-icon']") || Object.assign(document.createElement("link"), { rel: "apple-touch-icon" }));

            container_visible.value = true;
        };

        const player = reactive(new AudioStreaming());

        const currentTime = ref(0);
        const duration    = ref(0);

        const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);

            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        let interval = 0;

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

        const theme = useTheme();

        onMounted(() => {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                theme.global.name.value = e.matches ? 'dark' : 'light';
            });

            window.addEventListener('load', onLoad);
        });

        const APP_VERSION = 'v1.0';
        const APP_NAME    = 'アプリ';

        document.title = APP_NAME;

        return {
            theme,

            APP_VERSION,
            APP_NAME,

            snackbar_visible,
            snackbar_message,
            snackbar_color,
            snackbar_time,
            snackbar,

            dialog_loading_visible,
            dialog_loading_title,
            dialog_loading_icon,
            dialog_loading,
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

            developer,

            container_visible,

            player,
            currentTime,
            duration,
            formatTime,
            onFileSelected
        }
    },

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    template: `
        <v-app>
            <v-snackbar
                v-model="snackbar_visible"
                :timeout="snackbar_time"
                :color="snackbar_color"
            >{{ snackbar_message }}</v-snackbar>
            <v-dialog
                v-model="dialog_loading_visible"
                max-width="320"
                persistent
            >
                <v-list
                    class="py-2"
                    color="primary"
                    elevation="12"
                    rounded="lg"
                >
                    <v-list-item
                        :prepend-icon="dialog_loading_icon"
                        :title="dialog_loading_title"
                    >
                        <template v-slot:prepend>
                            <div class="pe-4">
                                <v-icon color="primary" size="x-large"></v-icon>
                            </div>
                        </template>
                        <template v-slot:append>
                            <v-progress-circular
                                indeterminate="disable-shrink"
                                size="16"
                                width="2"
                            ></v-progress-circular>
                        </template>
                    </v-list-item>
                </v-list>
            </v-dialog>
            <v-dialog
                v-model="dialog_settings_visible"
                transition="dialog-bottom-transition"
                fullscreen
            >
                <v-card>
                    <v-toolbar>
                        <v-toolbar-items>
                            <v-btn
                                icon="mdi-close"
                                @click="dialog_settings_visible = false"
                            ></v-btn>
                        </v-toolbar-items>
                        <v-toolbar-title>設定</v-toolbar-title>
                    </v-toolbar>
                    <v-list lines="two">
                        <v-list-subheader>アプリケーション</v-list-subheader>
                        <v-list-item
                            title="バージョン"
                            :subtitle="APP_VERSION"
                        ></v-list-item>
                        <v-divider></v-divider>
                        <v-list-item
                            class="text-center"
                            subtitle="© 2025 kanaaa224. All rights reserved."
                            link
                            href="https://kanaaa224.github.io/"
                            target="_blank"
                            rel="noopener"
                        ></v-list-item>
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
                                ></v-slider>
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
                        ></v-btn>
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
                        ></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                            variant="plain"
                            text="Close"
                            @click="dialog_load_url_visible = false"
                            :disabled="dialog_load_url_loading"
                        ></v-btn>
                        <v-btn
                            variant="tonal"
                            text="Load"
                            color="primary"
                            @click="dialog_load_url()"
                            :disabled="dialog_load_url_loading"
                        ></v-btn>
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
                        ></v-select>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn
                            variant="plain"
                            text="Close"
                            @click="dialog_sfs_visible = false"
                            :disabled="dialog_sfs_loading"
                        ></v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-main>
                <transition name="fade">
                    <v-container v-if="container_visible">
                        <v-card class="card-shadow pa-2 mt-10" elevation="0" rounded="lg">
                            <v-card-text>
                                <v-file-input label="音声ファイル" @update:model-value="onFileSelected"></v-file-input>
                                <div class="d-flex" style="gap: 1rem; overflow: auto hidden;">
                                    <v-btn
                                        color="secondary"
                                        @click="dialog_load_url()"
                                    ><v-icon>mdi-link</v-icon></v-btn>
                                    <v-btn
                                        color="secondary"
                                        @click="dialog_equalizer()"
                                        :disabled="!player.isLoaded"
                                    ><v-icon>mdi-tune-vertical</v-icon></v-btn>
                                    <v-btn
                                        color="secondary"
                                        @click="player.isPlaying ? player.pause() : player.play()"
                                        :disabled="!player.isLoaded"
                                    ><v-icon>{{ player.isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon></v-btn>
                                    <v-btn
                                        color="secondary"
                                        @click="player.stop()"
                                        :disabled="!player.isLoaded"
                                    ><v-icon>mdi-stop</v-icon></v-btn>
                                    <v-btn
                                        color="secondary"
                                        @click="dialog_sfs()"
                                        :disabled="!player.isLoaded"
                                    ><v-icon>mdi-surround-sound</v-icon></v-btn>
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
                                            style="flex: 1; min-width: 5rem;"
                                        ></v-slider>
                                        <span>{{ formatTime(duration) }}</span>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-container>
                </transition>
                <transition name="fade">
                    <div
                        class="d-flex flex-column"
                        style="position: fixed; top: 2rem; right: 2rem; z-index: 999;"
                    >
                        <v-btn
                            v-if="container_visible"
                            icon
                            variant="plain"
                            @click="dialog_settings()"
                        ><v-icon>mdi-cog</v-icon></v-btn>
                        <v-btn
                            v-if="container_visible"
                            icon
                            variant="plain"
                            @click="theme.global.name.value = theme.global.name.value === 'dark' ? 'light' : 'dark'"
                        ><v-icon>{{ theme.global.name.value === 'dark' ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon></v-btn>
                    </div>
                </transition>
            </v-main>
            <v-footer
                app
                class="justify-center pa-2"
                style="opacity: 0.25; background-color: transparent;"
            >
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

app.use(vuetify).mount('#app');