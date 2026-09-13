/*
    (c) 2023 kanaaa224. All rights reserved.
*/

import * as utils from 'https://cdn.jsdelivr.net/gh/kanaaa224/web-common@master/web-app-sources/utils.js';

const { $, create } = utils.dom; utils.dom.extend();

export default class App {

    constructor() {
        this.initialize();
    }

    async initialize() {
        let manifest = $('link[rel="manifest"]');

        const response = await fetch(manifest.href);
        const data     = await response.json();

        manifest = data;

        const link = create('link');

        link.rel  = 'icon';
        link.href = new URL(manifest.icons[0].src, response.url).href;

        document.head.appendChild(link);

        const title = document.title = manifest.name;

        await $('body').setHTMLWithFade(`
            <main>
                <article>
                    <section>
                        <a href="http://192.168.0.10/?api_v1_custom_endpoint_url=http://192.168.0.10/api/v1/">家だよー</a>
                    </section>
                    <section>
                        <a href="https://ponzu.server-on.net">外だよー</a>
                    </section>
                </article>
            </main>
            <header>
                <h1>今どこに居ますか？</h1>
            </header>
            <footer>
                <p>© 2023 <a href="https://kanaaa224.github.io" target="_blank">kanaaa224</a>. All rights reserved.</p>
            </footer>
        `);
    }

}