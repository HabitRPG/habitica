import md from 'habitica-markdown';

describe('habiticaMarkdown emoji plugin', () => {
  it('renders standard emoji as Unicode', () => {
    const result = md.render(':smile:');
    expect(result).to.include('😄');
    expect(result).not.to.include('img');
  });

  it('renders thumbsup emoji as Unicode', () => {
    const result = md.render(':thumbsup:');
    expect(result).to.include('👍');
  });

  it('renders +1 emoji as Unicode', () => {
    const result = md.render(':+1:');
    expect(result).to.include('👍');
  });

  it('renders melior as an img tag', () => {
    const result = md.render(':melior:');
    expect(result).to.include('<img class="habitica-emoji"');
    expect(result).to.include('src="https://s3.amazonaws.com/habitica-assets/cdn/emoji/melior.png"');
    expect(result).to.include('alt="melior"');
  });

  it('does NOT convert emoji inside markdown links', () => {
    const result = md.render('[:smile: link](http://example.com)');
    expect(result).to.include(':smile: link');
    expect(result).not.to.include('😄');
  });

  it('converts emoji outside of links normally', () => {
    const result = md.render(':smile: [link](http://example.com)');
    expect(result).to.include('😄');
    expect(result).to.include('link');
  });

  it('leaves removed custom emoji (bowtie) as literal text', () => {
    const result = md.render(':bowtie:');
    expect(result).to.include(':bowtie:');
    expect(result).not.to.include('img');
  });

  it('leaves unknown shortcodes as literal text', () => {
    const result = md.render(':nonexistent_emoji_xyz:');
    expect(result).to.include(':nonexistent_emoji_xyz:');
  });

  it('renders new emoji not in the old dataset', () => {
    const result = md.render(':yawning_face:');
    expect(result).to.include('🥱');
  });

  it('supports unsafeHTMLRender', () => {
    const result = md.unsafeHTMLRender('<b>bold</b> :smile:');
    expect(result).to.include('<b>bold</b>');
    expect(result).to.include('😄');
  });

  it('supports renderWithMentions', () => {
    const result = md.renderWithMentions(':smile: @testuser', { userName: 'testuser' });
    expect(result).to.include('😄');
    expect(result).to.include('at-text');
    expect(result).to.include('at-highlight');
  });
});
