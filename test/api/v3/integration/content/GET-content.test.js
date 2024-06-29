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

  it('does not filter content for regular requests', async () => {
    const res = await requester().get('/content');
    expect(res).to.have.nested.property('backgrounds.backgrounds062014');
    expect(res).to.have.nested.property('gear.tree');
  });

  it('filters content automatically for iOS requests', async () => {
    const res = await requester(null, { 'x-client': 'habitica-ios' }).get('/content');
    expect(res).to.have.nested.property('appearances.background.beach');
    expect(res).to.not.have.nested.property('backgrounds.backgrounds062014');
    expect(res).to.not.have.property('backgroundsFlat');
    expect(res).to.not.have.nested.property('gear.tree');
  });

  it('filters content automatically for Android requests', async () => {
    const res = await requester(null, { 'x-client': 'habitica-android' }).get('/content');
    expect(res).to.not.have.nested.property('appearances.background.beach');
    expect(res).to.have.nested.property('backgrounds.backgrounds062014');
    expect(res).to.not.have.property('backgroundsFlat');
    expect(res).to.not.have.nested.property('gear.tree');
  });

  it('filters content if the request specifies a filter', async () => {
    const res = await requester().get('/content?filter=backgroundsFlat,gear.flat');
    expect(res).to.not.have.property('backgroundsFlat');
    expect(res).to.have.nested.property('gear.tree');
    expect(res).to.not.have.nested.property('gear.flat');
  });

  it('filters content if the request contains invalid filters', async () => {
    const res = await requester().get('/content?filter=backgroundsFlat,invalid');
    expect(res).to.not.have.property('backgroundsFlat');
  });
});
