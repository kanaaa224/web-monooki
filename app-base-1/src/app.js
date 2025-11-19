import * as consts from './consts.js';
import * as api    from './api.js';
import * as utils  from './utils.js';

import * as Vue     from 'vue';
import * as Vuetify from 'vuetify';

const app = Vue.createApp({
    setup() {
        const theme   = Vuetify.useTheme();
        const display = Vuetify.useDisplay();

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const dialog_settings_visible = Vue.ref(false);

        const dialog_settings = () => {
            if(!dialog_settings_visible.value) {
                dialog_settings_visible.value = true;

                return;
            }
        };

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        const container_visible = Vue.ref(false);

        Vue.onMounted(async () => {
            document.title = consts.app.name;

            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                theme.global.name.value = e.matches ? 'dark' : 'light';
            });

            try {
                await api.main.connect();
            } catch(e) {
                console.error(e);
            }

            container_visible.value = true;
        });

        return {
            consts,
            api,

            theme,
            display,

            dialog_settings_visible,
            dialog_settings,

            container_visible
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
                            :subtitle="consts.app.version"
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
            <v-main>
                <v-fade-transition mode="out-in">
                    <v-container v-if="container_visible"></v-container>
                </v-fade-transition>
                <v-fade-transition mode="out-in">
                    <div
                        v-if="container_visible"
                        class="d-flex flex-column"
                        style="position: fixed; z-index: 999;"
                        :style="display.xs.value ? 'top: 1rem; right: 1rem;' : 'top: 2rem; right: 2rem;'"
                    >
                        <v-btn
                            icon
                            variant="plain"
                            :size="display.xs.value ? 'small' : 'default'"
                            @click="dialog_settings()"
                        ><v-icon icon="mdi-cog" /></v-btn>
                        <v-btn
                            icon
                            variant="plain"
                            :size="display.xs.value ? 'small' : 'default'"
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

const vuetify = Vuetify.createVuetify({
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

app.use(vuetify);

export default app;