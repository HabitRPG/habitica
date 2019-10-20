import {
  requester,
  translate as t,
} from '../../../../helpers/api-integration/v3';
import i18n from '../../../../../website/common/script/i18n';

describe('GET /content', () => {
  it('returns content (and does not require authentication)', async () => {
    const res = await requester().get('/content');
    expect(res).to.have.nested.property('backgrounds.backgrounds062014.beach');
    expect(res.backgrounds.backgrounds062014.beach.text).to.equal(t('backgroundBeachText'));
  });

  it('returns content not in English', async () => {
    const res = await requester().get('/content?language=de');
    expect(res).to.have.nested.property('backgrounds.backgrounds062014.beach');
    expect(res.backgrounds.backgrounds062014.beach.text).to.equal(i18n.t('backgroundBeachText', 'de'));
  });

  it('falls back to English if the desired language is not found', async () => {
    const res = await requester().get('/content?language=wrong');
    expect(res).to.have.nested.property('backgrounds.backgrounds062014.beach');
    expect(res.backgrounds.backgrounds062014.beach.text).to.equal(t('backgroundBeachText'));
  });
});
