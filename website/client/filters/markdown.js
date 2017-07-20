import habiticaMarkdown from 'habitica-markdown';

export default function markdown (text) {
  return habiticaMarkdown.render(text);
}