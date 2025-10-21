document.addEventListener("DOMContentLoaded", function() {
    // --- Display current date ---
    const dateElement = document.querySelector(".date");
    if (dateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = today.toLocaleDateString('en-US', options);
    }

    // --- Top Stories Carousel ---
    const storiesContainer = document.querySelector(".top-stories");
    
    if (storiesContainer) {
        const stories = Array.from(document.querySelectorAll(".story"));
        const storiesPerView = 5;
        const totalStories = stories.length;

        // Only proceed if we have stories
        if (totalStories > 0) {
            console.log(`Found ${totalStories} stories. Starting carousel...`);

            // Duplicate stories for smooth infinite scroll
            stories.forEach(story => {
                const clone = story.cloneNode(true);
                storiesContainer.appendChild(clone);
            });

            let index = 0;
            const storyWidthPercent = 100 / storiesPerView; // 20% per story

            function slideStories() {
                index++;
                storiesContainer.style.transition = "transform 0.5s ease-in-out";
                storiesContainer.style.transform = `translateX(-${index * storyWidthPercent}%)`;

                console.log(`Sliding to index ${index}, translateX: -${index * storyWidthPercent}%`);

                // Reset without transition when reaching the duplicated end
                if (index >= totalStories) {
                    setTimeout(() => {
                        storiesContainer.style.transition = "none";
                        storiesContainer.style.transform = "translateX(0)";
                        index = 0;
                        console.log("Resetting carousel to start");
                    }, 500); // matches the transition duration
                }
            }

            // Start the carousel
            const carouselInterval = setInterval(slideStories, 3000); // Slide every 3 seconds
            console.log("Carousel started - sliding every 3 seconds");

            // Optional: Pause on hover
            const wrapper = document.querySelector(".top-stories-wrapper");
            if (wrapper) {
                wrapper.addEventListener('mouseenter', function() {
                    clearInterval(carouselInterval);
                    console.log("Carousel paused");
                });

                wrapper.addEventListener('mouseleave', function() {
                    setInterval(slideStories, 3000);
                    console.log("Carousel resumed");
                });
            }
        } else {
            console.error("No stories found in .top-stories container");
        }
    } else {
        console.error("Could not find .top-stories container");
    }
});