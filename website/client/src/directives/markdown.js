import habiticaMarkdown from 'habitica-markdown';

export default function markdown (el, { value, oldValue }) {
  if (value === oldValue) return;

  if (value) {
    el.innerHTML = habiticaMarkdown.render(String(value));
  } else {
    el.innerHTML = '';
  }

  el.classList.add('markdown');
}
