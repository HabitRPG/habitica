import habiticaMarkdown from 'habitica-markdown';

export default function markdown (el, {value, oldValue}) {
  if (value === oldValue) return;

  el.innerHTML = habiticaMarkdown.render(value);
  el.classList.add('markdown');
}