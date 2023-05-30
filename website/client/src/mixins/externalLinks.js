import some from 'lodash/some';

export default {
  methods: {
    handleExternalLinks () {
      const { TRUSTED_DOMAINS } = process.env;
      const allLinks = document.getElementsByTagName('a');

      for (let i = 0; i < allLinks.length; i += 1) {
        const link = allLinks[i];
        let domainIndex = link.href.indexOf('www');
        if (domainIndex !== -1 && domainIndex < 9) {
          domainIndex += 4;
        } else {
          domainIndex = link.href.indexOf('//') + 2;
        }

        if ((link.classList.value.indexOf('external-link') === -1)
          && (!link.offsetParent || link.offsetParent.classList.value.indexOf('link-exempt') === -1)
          && domainIndex !== 1
          && !some(TRUSTED_DOMAINS.split(','), domain => link.href.indexOf(domain) === domainIndex)) {
          link.classList.add('external-link');
          link.addEventListener('click', e => {
            if (e.ctrlKey || e.metaKey) {
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
