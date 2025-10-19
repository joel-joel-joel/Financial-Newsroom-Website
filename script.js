document.addEventListener("DOMContentLoaded", function() {
    const dateElement = document.querySelector(".date");

    // Create a new Date object
    const today = new Date();

    // Format the date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);

    // Display the date inside the .date element
    dateElement.textContent = formattedDate;
});
