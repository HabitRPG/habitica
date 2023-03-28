import some from 'lodash/some';

export default {
  methods: {
    handleExternalLinks () {
      const { TRUSTED_DOMAINS } = process.env;
      const allLinks = document.getElementsByTagName('a');

      for (let i = 0; i < allLinks.length; i += 1) {
        const link = allLinks[i];

        if ((link.classList.value.indexOf('external-link') === -1)
          && link.href.slice(0, 4) === 'http'
          && !some(TRUSTED_DOMAINS.split(','), domain => link.href.indexOf(domain) === 0)) {
          link.classList.add('external-link');
          link.addEventListener('click', e => {
            if (e.ctrlKey) {
              return;
            }
            e.stopPropagation();
            e.preventDefault();

            window.externalLink(link.href);
          });
        }
      }
    },
  },
};
