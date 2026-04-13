document.querySelector('#searchByKeywordForm').addEventListener('submit', validateKeywordForm);

//insures the keyword has at least 3 characters
function validateKeywordForm() {
    let keyword = document.querySelector('input[name=keyword]').value;
    if (keyword.length < 3) {
        alert("keyword must be at least 3 characters");
        event.preventDefault(); //prevents form submission
    }
}