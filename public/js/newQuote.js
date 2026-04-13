document.querySelector('#quoteInput').addEventListener('submit', validateQuoteForm);

//insures the keyword has at least 3 characters
function validateQuoteForm() {
    let quote = document.querySelector('input[name=quoteInput]').value;
    if (keyword.length < 5) {
        alert("keyword must be at least 5 characters");
        event.preventDefault(); //prevents form submission
    }
}