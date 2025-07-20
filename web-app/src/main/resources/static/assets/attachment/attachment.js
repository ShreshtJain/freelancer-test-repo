// Setting worker src for PDF.js latest version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/build/pdf.worker.min.js';


(function () {
  let currentPageIndex = 0;
  let pageMode = 1;
  let cursorIndex = Math.floor(currentPageIndex / pageMode);
  let pdfInstance = null;
  let totalPagesCount = 0;
  let currentZoom = 1;

  const viewport = document.querySelector('#viewport');

  window.initPDFViewer = function (pdfURL) {
    pdfjsLib.getDocument(pdfURL).promise.then((pdf) => {
      pdfInstance = pdf;
      totalPagesCount = pdf.numPages;
      initPager();
      initPageMode();
      render();
    });
  };

//document.querySelector('#zoom-in').addEventListener('click', () => {
//  currentZoom += 0.1;
//  render(); // Instead of updateZoom()
//});
//
//document.querySelector('#zoom-out').addEventListener('click', () => {
//  currentZoom = Math.max(0.1, currentZoom - 0.1);
//  render(); // Instead of updateZoom()
//});

  function onPagerButtonsClick(event) {
    const action = event.target.getAttribute('data-pager');
    if (action === 'prev') {
      if (currentPageIndex === 0) {
        return;
      }
      currentPageIndex -= pageMode;
      if (currentPageIndex < 0) {
        currentPageIndex = 0;
      }
      render();
    }
    if (action === 'next') {
      if (currentPageIndex === totalPagesCount - 1) {
        return;
      }
      currentPageIndex += pageMode;
      if (currentPageIndex > totalPagesCount - 1) {
        currentPageIndex = totalPagesCount - 1;
      }
      render();
    }
  }

  function initPager() {
    const pager = document.querySelector('#pager');
    pager.addEventListener('click', onPagerButtonsClick);
  }

  function onPageModeChange(event) {
    pageMode = Number(event.target.value);
    render();
  }

  function initPageMode() {
    const input = document.querySelector('#page-mode input');
    input.setAttribute('max', totalPagesCount);
    input.addEventListener('change', onPageModeChange);
  }

function render() {
  cursorIndex = Math.floor(currentPageIndex / pageMode);
  const startPageIndex = cursorIndex * pageMode;
  const endPageIndex =
    startPageIndex + pageMode < totalPagesCount
      ? startPageIndex + pageMode - 1
      : totalPagesCount - 1;

  const renderPagesPromises = [];
  for (let i = startPageIndex; i <= endPageIndex; i++) {
    renderPagesPromises.push(pdfInstance.getPage(i + 1));
  }

  Promise.all(renderPagesPromises).then((pages) => {
    const pagesHTML = pages
      .map((_, i) => {
        const pageNum = startPageIndex + i + 1;
        return `
<div style="
  width: ${pageMode > 1 ? '50%' : '100%'};
  text-align: center;
  padding: 1rem;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 6px;
  max-width: 100%;
  overflow: hidden;
">
  <canvas style="max-width: 100%; height: auto;"></canvas>
  <div style="margin-top: 10px; font-size: 14px; color: #555;">Page ${pageNum}</div>
</div>

        `;
      })
      .join('');

    viewport.innerHTML = pagesHTML;
    pages.forEach((page, index) => renderPage(page, index));
  });

}

  function renderPage(page, pageIndex) {
    let pdfViewport = page.getViewport({ scale: currentZoom });

    const container = viewport.children[pageIndex]; // Correctly map the page to its container.
    if (!container) {
      console.error('Container not found for page ' + pageIndex);
      return;
    }

    const canvas = container.querySelector('canvas');
    const context = canvas.getContext('2d');

    // Scale canvas to fit container width.
    pdfViewport = page.getViewport({
      scale: container.offsetWidth / pdfViewport.width,
    });

    canvas.height = pdfViewport.height;
    canvas.width = pdfViewport.width;

    page.render({
      canvasContext: context,
      viewport: pdfViewport,
    });
  }
})();

// Dynamically get PDF ID from the DOM
const viewerEl = document.getElementById('app');
const pdfId = viewerEl?.dataset.id;
const url = `/attachment/pdf/content/${pdfId}`;
initPDFViewer(url);