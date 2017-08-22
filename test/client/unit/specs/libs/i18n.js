import i18n from 'client/libs/i18n';
import commoni18n from 'common/script/i18n';
import Vue from 'vue';

describe('i18n plugin', () => {
  before(() => {
    Vue.use(i18n, {
      i18nData: {
        strings: {
          reportBug: 'Report a Bug',
        },
      },
    });
  });

  it('adds $t to Vue.prototype', () => {
    expect(Vue.prototype.$t).to.be.a.function;
  });

  it('$t is a proxy for common/i18n.t', () => {
    const result = (new Vue()).$t('reportBug');
    expect(result).to.equal(commoni18n.t('reportBug'));
    expect(result).to.equal('Report a Bug');
  });
});