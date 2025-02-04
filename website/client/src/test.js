import translations from 'virtual:translations';

let urlParams = new URLSearchParams(window.location.search);
let language = urlParams.get('lang');
window['habitica-i18n'] = {
    language,
    strings: translations[language],
};
