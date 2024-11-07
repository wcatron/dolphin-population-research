// index.js

function openModal(element) {
    const photosJson = element.getAttribute('data-photos');
    const photos = JSON.parse(photosJson);
    const carouselIndicators = document.getElementById('carouselIndicators');
    const carouselInner = document.getElementById('carouselInner');

    // Clear existing carousel items
    carouselIndicators.innerHTML = '';
    carouselInner.innerHTML = '';

    // Populate carousel with images
    photos.forEach((photo, index) => {
        // Indicators
        const indicator = document.createElement('li');
        indicator.setAttribute('data-target', '#imageCarousel');
        indicator.setAttribute('data-slide-to', index.toString());
        if (index === 0) {
            indicator.classList.add('active');
        }
        carouselIndicators.appendChild(indicator);

        // Carousel items
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (index === 0) {
            carouselItem.classList.add('active');
        }

        const img = document.createElement('img');
        img.classList.add('d-block', 'w-100');
        img.src = photo;
        carouselItem.appendChild(img);

        carouselInner.appendChild(carouselItem);
    });

    // Initialize the carousel without animation
    $('#imageCarousel').carousel({
        interval: false,
        ride: false,
        keyboard: true,
        pause: true,
        wrap: true
    });

    // Show the modal
    $('#imageModal').modal('show');
}

function sortTable(n) {
    const table = document.getElementById("dolphinTable");
    let rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    switching = true;
    dir = "asc"; 

    while (switching) {
        switching = false;
        rows = table.rows;
        // Loop through all table rows except the header
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            let cmp = x.innerText.localeCompare(y.innerText, undefined, { numeric: true });
            if (dir === "asc") {
                if (cmp > 0) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === "desc") {
                if (cmp < 0) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            // Swap rows
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            // If no switching has been done AND the direction is "asc",
            // set the direction to "desc" and run the loop again.
            if (switchcount === 0 && dir === "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

function search() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toUpperCase();
    const table = document.getElementById("dolphinTable");
    const cards = document.getElementById("dolphinCards");
    const tr = table.getElementsByTagName("tr");
    const cardDivs = cards.getElementsByClassName("card");

    // Filter table rows
    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName("td")[0]; // Name column
        if (td) {
            const txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }

    // Filter cards
    for (let i = 0; i < cardDivs.length; i++) {
        const card = cardDivs[i];
        const cardTitle = card.getElementsByClassName("card-title")[0];
        if (cardTitle) {
            const txtValue = cardTitle.textContent || cardTitle.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        }
    }
}
