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

    link.addEventListener('click', e => {
      if (e.ctrlKey) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();

      window.externalLink(link.href);
    });
  }

  el.classList.add('markdown');
}
