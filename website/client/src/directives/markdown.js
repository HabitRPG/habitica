import habiticaMarkdown from 'habitica-markdown';

export default function markdown (el, { value, oldValue }) {
  if (value === oldValue) return;

  if (value) {
    el.innerHTML = habiticaMarkdown.render(String(value));
  } else {
    el.innerHTML = '';
  }
  // This is a hack, but it's one idea for how we might do things
  el.innerHTML = el.innerHTML.replace('href="h', 'href="/external?link=h');

  el.classList.add('markdown');
}
