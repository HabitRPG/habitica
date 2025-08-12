import faq from '../../../../website/common/script/content/faq';
import common from '../../../../website/common';
import { localizeContentData } from '../../../../website/server/libs/content';

const { i18n } = common;

describe('localizeContentData', () => {
  it('Should take a an object with localization identifiers and '
    + 'return an object with actual translations in English', () => {
    const faqInEnglish = localizeContentData(faq, 'en');

    expect(faqInEnglish).to.have.property('stillNeedHelp');
    expect(faqInEnglish.stillNeedHelp.ios).to.equal(i18n.t('iosFaqStillNeedHelp', 'en'));
  });
  it('Should take an object with localization identifiers and '
    + 'return an object with actual translations in German', () => {
    const faqInEnglish = localizeContentData(faq, 'de');

    expect(faqInEnglish).to.have.property('stillNeedHelp');
    expect(faqInEnglish.stillNeedHelp.ios).to.equal(i18n.t('iosFaqStillNeedHelp', 'de'));
  });
});
