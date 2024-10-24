/* eslint-disable no-continue */

/**
 * Is the Link URL part of the TRUSTED_DOMAINS list
 *
 * @param {String} linkUrl
 * @param {URL[]} trustedDomains
 */
export function isTrustedDomain (linkUrl, trustedDomains) {
  const parsedURL = new URL(linkUrl);

  return trustedDomains.some(domain => parsedURL.hostname.includes(domain.hostname));
}

const TRUSTED_DOMAINS = process.env.TRUSTED_DOMAINS.split(',')
  .map(u => (u === 'localhost' ? new URL('http://localhost') : new URL(u)));

export default {
  methods: {
    handleExternalLinks () {
      if (TRUSTED_DOMAINS.length === 0) {
        return;
      }

      // only links with an href attribute
      // already handled links (.external-link/-ignore) are already filtered out
      const allUnhandledLinks = document.querySelectorAll('a[href]:not(.external-link):not(.external-link-ignore)');

      for (let i = 0; i < allUnhandledLinks.length; i += 1) {
        const link = allUnhandledLinks[i];

        // ignore links with existing link-exempt flag
        if (link.offsetParent && link.offsetParent.classList.value.indexOf('link-exempt') !== -1) {
          // attach the class to prevent another check on the next run
          link.classList.add('external-link-ignore');
          continue;
        }

        // no need to replace the link click handler when its a trusted domain
        if (isTrustedDomain(link.href, TRUSTED_DOMAINS)) {
          // attach the class to prevent another check on the next run
          link.classList.add('external-link-ignore');
          continue;
        }

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
    },
  },
};
