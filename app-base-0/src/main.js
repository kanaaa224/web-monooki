(async () => {
    const callAPI = async (endpoint = '', queries = {}, requestBody = null) => {
        const url = new URL(endpoint);

        for(const [ key, value ] of Object.entries(queries)) url.searchParams.set(key, value);

        let request = { method: 'GET' };

        if(requestBody) request = { method: 'POST', body: JSON.stringify(requestBody) };

        const response = await fetch(url.toString(), request);
        const body     = await response.json();

        if(!response.ok) throw new Error(`api-bad-status: ${response.status}`);

        return body;
    };

    const getParam = (name = '', url = window.location.href) => {
        return (new URL(url)).searchParams.get(name);
    };

    const isObject = v => v !== null && typeof v === 'object';

    const browserStorageSet = (setData = {}, sKey = window.location.pathname, session = false) => {
        if(!isObject(setData)) return false;

        setData = JSON.stringify(setData);

        session ? sessionStorage.setItem(sKey, setData) : localStorage.setItem(sKey, setData);

        return true;
    };

    const browserStorageGet = (key = '', sKey = window.location.pathname, session = false) => {
        let sData = session ? sessionStorage.getItem(sKey) : localStorage.getItem(sKey);

        if(!sData) return null;

        sData = JSON.parse(sData);

        if(!isObject(sData)) return false;

        if(key) return key in sData ? sData[key] : null;

        return sData;
    };

    class App {
        constructor() {
            document.title = 'アプリケーション';
        }
    }

    const app = new App();
})();