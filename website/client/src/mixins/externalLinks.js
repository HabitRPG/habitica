import some from 'lodash/some';

export default {
  data () {
    return {
      trustedDomains: [
        'https://habitica.com',
        'http://localhost',
        'https://tools.habitica.com',
        'https://translate.habitica.com',
      ],
    };
  },
  methods: {
    handleExternalLinks () {
      const allLinks = document.getElementsByTagName('a');

      for (let i = 0; i < allLinks.length; i += 1) {
        const link = allLinks[i];

        if ((link.classList.value.indexOf('external-link') === -1)
          && link.href.slice(0, 4) === 'http'
          && !some(this.trustedDomains, domain => link.href.indexOf(domain) === 0)) {
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
