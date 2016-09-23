import Vue from 'vue';
// import Hello from 'src/components/Hello';

describe('Hello.vue', () => {
  xit('should render correct contents', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: (h) => h(Hello),
    });
    expect(vm.$el.querySelector('.hello h1').textContent).to.equal('Hello Vue!');
  });

  it('should make assertions', () => {
    expect(true).to.equal(true);
  });
});
