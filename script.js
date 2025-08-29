// Smooth form submission
const form = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    formMessage.textContent = "Thank you! Your message has been sent.";
    formMessage.style.color = "green";
    form.reset();
});
