(() => {
  const dialog = document.getElementById('screenshot-viewer');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('.viewer-image');
  const viewport = dialog.querySelector('.viewer-viewport');
  const output = dialog.querySelector('output');
  const zoomOut = dialog.querySelector('[data-viewer="out"]');
  const zoomIn = dialog.querySelector('[data-viewer="in"]');
  let scale = 1;
  let sourceWidth = 1;
  let sourceHeight = 1;
  let opener;
  const setScale = (value, centered = true) => {
    const next = Math.max(.1, Math.min(3, value));
    const ratio = next / scale;
    const x = (viewport.scrollLeft + viewport.clientWidth / 2) * ratio - viewport.clientWidth / 2;
    const y = (viewport.scrollTop + viewport.clientHeight / 2) * ratio - viewport.clientHeight / 2;
    scale = next;
    image.style.width = `${sourceWidth * scale}px`;
    output.value = `${Math.round(scale * 100)} %`;
    zoomOut.disabled = scale <= .1;
    zoomIn.disabled = scale >= 3;
    if (centered) { viewport.scrollLeft = x; viewport.scrollTop = y; }
  };
  document.querySelectorAll('.screenshot-link').forEach(link => {
    const sourceImage = link.querySelector('img');
    const positionOutline = () => {
      if (!sourceImage.complete) return;
      const outline = link.querySelector('.screenshot-outline');
      if (!outline) return;
      const imageRect = sourceImage.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      outline.style.left = (imageRect.left - linkRect.left) + 'px';
      outline.style.top = (imageRect.top - linkRect.top) + 'px';
      outline.style.width = imageRect.width + 'px';
      outline.style.height = imageRect.height + 'px';
    };
    sourceImage.addEventListener('load', positionOutline);
    if (typeof ResizeObserver === 'function') new ResizeObserver(positionOutline).observe(sourceImage);
    else window.addEventListener('resize', positionOutline);
    positionOutline();
    link.addEventListener('click', event => {
      const source = link.querySelector('img');
      if (!source.complete || !source.naturalWidth || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      image.src = source.currentSrc || source.src;
      image.alt = source.alt;
      image.style.setProperty('object-view-box', getComputedStyle(source).getPropertyValue('object-view-box'));
      sourceWidth = source.naturalWidth;
      const sourceRect = source.getBoundingClientRect();
      sourceHeight = sourceRect.height / sourceRect.width * sourceWidth;
      dialog.querySelector('#screenshot-viewer-title').textContent = source.alt || 'Screenshot';
      dialog.showModal();
      document.documentElement.classList.add('image-viewer-open');
      setScale(1, false);
      viewport.scrollTo(0, 0);
    });
  });
  zoomOut.addEventListener('click', () => setScale(scale / 1.25));
  zoomIn.addEventListener('click', () => setScale(scale * 1.25));
  dialog.querySelector('[data-viewer="fit"]').addEventListener('click', () => {
    setScale((viewport.clientWidth - 32) / sourceWidth, false);
    viewport.scrollTo(0, 0);
  });
  dialog.querySelector('[data-viewer="fit-page"]').addEventListener('click', () => {
    setScale(Math.min((viewport.clientWidth - 32) / sourceWidth, (viewport.clientHeight - 32) / sourceHeight), false);
    viewport.scrollTo(0, 0);
  });
  dialog.querySelector('[data-viewer="close"]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('image-viewer-open');
    image.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
})();