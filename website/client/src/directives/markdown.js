import habiticaMarkdown from 'habitica-markdown';

export default function markdown (el, { value, oldValue }) {
  if (value === oldValue) return;

  if (value) {
    el.innerHTML = habiticaMarkdown.render(String(value));
  } else {
    el.innerHTML = '';
  }

  const allLinks = el.getElementsByTagName('a');

  for (let i = 0; i < allLinks.length; i += 1) {
    const link = allLinks[i];

    // todo middleclick or ctrl+click to open it in a new tab
    // todo? should a normal click leave the current page or also open it in a new tab?
    // ... hopefully this wont create memory leaks
    link.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();

      window.externalLink(link.href);
    });
  }

  el.classList.add('markdown');
}
