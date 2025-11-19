import * as consts from './consts.js';
import * as api    from './api.js';
import * as utils  from './utils.js';

export default class App {
    constructor() {
        document.title = consts.app.name;

        (async () => {
            try {
                await api.main.connect();
            } catch(e) {
                console.error(e);
            }
        })();
    }
}