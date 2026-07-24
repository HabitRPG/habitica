import { NotificationMixins } from './notifications';

export const CopyToClipboardMixin = {
  mixins: [NotificationMixins],
  methods: {
    async mixinCopyToClipboard (valueToCopy, notificationToShow = null) {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(valueToCopy);
      } else {
        // fallback if clipboard API does not exist
        const copyText = document.createElement('textarea');
        copyText.value = valueToCopy;
        document.body.appendChild(copyText);
        copyText.select();
        document.execCommand('copy');
        document.body.removeChild(copyText);
      }
      if (notificationToShow) {
        this.text(notificationToShow);
      }
    },
  },
};

export default CopyToClipboardMixin;
