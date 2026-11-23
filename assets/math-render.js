// Self-hosted typesetting for editable DokuWiki text and the teaching widgets.
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('main');
  if (!root || typeof renderMathInElement !== 'function') return;
  renderMathInElement(root, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '\\[', right: '\\]', display: true},
      {left: '\\(', right: '\\)', display: false}
    ],
    output: 'htmlAndMathml',
    throwOnError: false,
    trust: false,
    strict: 'warn',
    ignoredClasses: ['archive-content'],
    maxExpand: 1000
  });
});
