import habiticaMarkdown from 'habitica-markdown';

export default function markdown (el, {value, oldValue}) {
  if (value === oldValue) return;

  if (value || value === '') {
    el.innerHTML = habiticaMarkdown.render(String(value));
  }
  el.classList.add('markdown');
}