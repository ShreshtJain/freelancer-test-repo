let isSplitInitialized = false;

function showPreview(row) {
const id = row.dataset.id;
const rightPane = document.getElementById("right-pane");
const iframe = document.getElementById("pdf-viewer-frame");

// Load the PDF blob
fetch(`/voucher-reception/${id}`)
  .then(response => {
    if (!response.ok) throw new Error("PDF not found");
    return response.blob();
  })
  .then(blob => {
    const blobUrl = URL.createObjectURL(blob);

    iframe.src = `/assets/pdfjs/template/viewer.html?file=${encodeURIComponent(blobUrl)}`;
  })
  .catch((error) => {
    console.error("Failed to load PDF:", error);
  });

    // Show right pane and init splitter if needed
    if (rightPane.style.display === "none") {
        rightPane.style.display = "block";

        if (!isSplitInitialized) {
            Split(['#left-pane', '#right-pane'], {
                sizes: [60, 40],
                minSize: 200,
                gutterSize: 15,
                cursor: 'col-resize'
            });
            isSplitInitialized = true;
        }
    }
}

let selectedRow = null;

// Event delegation for row clicks
document.body.addEventListener('click', (event) => {
    const row = event.target.closest('.r-voucher-reception-table tbody tr');
    if (row) {
        // Deselect previous
        if (selectedRow) selectedRow.classList.remove('selected');

        // Select new
        row.classList.add('selected');
        selectedRow = row;

        // Show PDF preview
        showPreview(row);
    }
});

// Handle close button click
document.body.addEventListener('click', (event) => {
    const closeButton = event.target.closest('#close-pane-button');
    if (closeButton) {
        const rightPane = document.getElementById("right-pane");
        const iframe = document.getElementById("pdf-viewer-frame");

        rightPane.style.display = "none";
        iframe.removeAttribute('src');

        if (selectedRow) selectedRow.classList.remove('selected');
        selectedRow = null;
    }
});

// Handle HTMX content replacement
document.body.addEventListener('htmx:afterSwap', (event) => {
    if (event.target.id === 'tableContent') {
        const rightPane = document.getElementById("right-pane");
        const iframe = document.getElementById("pdf-viewer-frame");

        rightPane.style.display = "none";
        iframe.removeAttribute('src');

        if (selectedRow) selectedRow.classList.remove('selected');
        selectedRow = null;

        isSplitInitialized=false;
    }
});


