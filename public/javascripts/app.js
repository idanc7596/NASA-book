(function () {

const APIKEY = 'dzkImUcH6nK33tpSUEFT42pOfskQcbuXos3b4Qeh';
const DAY = 1000 * 60 * 60 * 24; //day in milliseconds
let user = {}; //current logged-in user
let startDate = new Date();
let endDate = new Date();

document.addEventListener('DOMContentLoaded', function () {
    getUserData();
    displayImages();
    //choose a date in the date picker:
    document.getElementById('datePicker').addEventListener('submit', (ev) => {
        ev.preventDefault();
        document.getElementById('images').innerHTML = ''; //reset the images
        endDate = new Date(document.getElementById('date').value); //get the date of the last picture
        displayImages();
    });
    //click on 'load more' button to display more pictures:
    document.getElementById('moreButton').addEventListener('click', displayImages);
});


function getUserData() {
    /**
     * get the user session details.
     */
    fetch('/userSession/loggedInUser')
        .then(status)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            user = data;
            //add a welcome message in the navbar:
            document.getElementById('username').innerText = user.username;
        })
        .catch((error) => {
            showErrorModal(error);
        });
}

function displayImages() {
    /**
     * fetch 3 pictures from NASA server between end date and start date.
     */
    let url = `https://api.nasa.gov/planetary/apod?api_key=${APIKEY}`;
    startDate.setTime(endDate.getTime()-2 * DAY);
    //build the string of the get api request:
    const params = new URLSearchParams();
    params.append('start_date', startDate.toISOString().split('T')[0]);
    params.append('end_date', endDate.toISOString().split('T')[0]);

    document.getElementById('spinner').classList.remove('d-none'); //load spinner
    document.getElementById('moreButton').classList.add('d-none');
    fetch(`${url}&${params.toString()}`)
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if(parseInt(data.code) >= 400) { //error from NASA
                const error = new Error(data.msg || 'Unknown error occurred.');
                error.code = data.code;
                return Promise.reject(error);
            }
            data.reverse().forEach(image => {
                displayImageCard(image);
                //listen on the post button (to add comments) of each picture:
                [...document.getElementsByClassName('postComment')].forEach(button => {
                    button.addEventListener('submit', postComment);
                })
            })
            endDate.setTime(startDate.getTime() - DAY);
            document.getElementById('moreButton').classList.remove('d-none');
        })
        .catch((error) => {
            showErrorModal(error);
        })
        .finally(() => {
            document.getElementById('spinner').classList.add('d-none'); //hiding the load spinner
        });
}

function displayImageCard(image) {
    /**
     * build the card that contains the picture and its details and display it.
     * @param image the picture object returned from nasa server.
     */
    const imagesContainer = document.getElementById('images');
    //check if the media type is a picture or video and build the html accordingly.
    let media = '';
    if (image.media_type === 'image') {
        media = `<img src=${image.url} class="card-img-top" alt=${image.title}>`;
    } else if (image.media_type === 'video') {
        media = `<iframe height="100%" src=${image.url} class="card-img-top"></iframe>`
    }
    //build the image card that contains: the picture, the title, copyright if there is, date and explanation:
    let imageCardHTML = `<div class="col-md-6 col-lg-4 d-flex align-items-stretch mb-3">
                            <div class="card">
                                ${media}
                                <div class="card-body"> 
                                    <h5 class="card-title fw-semibold">${image.title}</h5> 
                                    <h6>${image.copyright || ''}</h6>
                                    <h6>${image.date}</h6>
                                    <a data-bs-toggle="collapse" href="#collapseExplanation${image.date}" 
                                    role="button" aria-expanded="false" aria-controls="collapseExplanation">
                                        show explanation
                                    </a>
                                    <div class="collapse" id="collapseExplanation${image.date}">
                                        <p class="card-text">${image.explanation || ''}</p>
                                    </div>
                                    <div>
                                        <form action="#" class="postComment mt-3" id="${image.date}">
                                            <input type="text" name="comment" class="form-control w-75 d-inline" 
                                            placeholder="Enter your comment..." maxlength="128" required>
                                            <button type="submit" class="btn btn-secondary mb-1">
                                                send
                                            </button>
                                        </form>
                                        <a data-bs-toggle="collapse"
                                           href="#collapseComments${image.date}" role="button" 
                                           aria-expanded="false" aria-controls="collapseComments">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" 
                                            class="bi bi-chat-left-text" viewBox="0 0 16 16">
                                                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                                                <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zM3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6zm0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                                            </svg>
                                            show comments
                                        </a>
                                        <div class="collapse mt-2" id="collapseComments${image.date}">
                                            There are no comments yet...
                                        </div>
                                        <span id="spinner${image.date}" class="spinner-border spinner-border-lg m-3 d-none" 
                                                role="status" aria-hidden="true"></span> 
                                    </div>
                                </div>
                            </div>
                         </div>`;
    imagesContainer.insertAdjacentHTML('beforeend', imageCardHTML);
}

function postComment(ev) {
    /**
     * send a post request to the server, to add a comment.
     */
    ev.preventDefault();

    const imageDate = ev.target.getAttribute('id');
    toggleSpinner(imageDate);
    fetch("/api/comments", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({imageDate: imageDate,
                                   userID: user.userID,
                                   username: user.username,
                                   text: ev.target.firstElementChild.value})
    })
        .then(status)
        .then((response) => {
            return response.json();
        })
        .then(updateComments) //retrieve the updated comments from the server after the post
        .catch((error) => {
            showErrorModal(error);
        })
        .finally(() => {
            toggleSpinner(imageDate);
        });
}

function updateComments(comment) {
    /**
     * retrieve the updated comments of a given picture from the server.
     * @param comment
     */
    const imageDate = comment.imageDate;
    toggleSpinner(imageDate);
    fetch(`/api/comments/${imageDate}`)
        .then(status)
        .then((response) => {
            return response.json();
        })
        .then((comments) => {
            document.getElementById(`collapseComments${imageDate}`).innerHTML = '';
            comments.forEach((comment) => {
                addComment(comment);
            })
        })
        .catch((error) => {
            showErrorModal(error);
        })
        .finally(() => {
            toggleSpinner(imageDate);
        });
}

function addComment(comment) {
    /**
     * add the comment.
     * @param comment
     */
    const collapseComments =  document.getElementById(`collapseComments${comment.imageDate}`);
    //insert the comment HTML into the DOM:
    collapseComments.insertAdjacentHTML("beforeend",
                              `<div class="card rounded-0 border border-$gray-100" id="comment${comment.id}">
                                       <div class="card-body py-2 d-flex justify-content-between">
                                           <span>
                                           <span class="text-primary">${comment.username}</span>&nbsp;&nbsp;
                                            ${comment.text}
                                           </span>
                                       </div>
                                   </div>`);

    document.getElementById(`${comment.imageDate}`).firstElementChild.value = ''; //empty the input
    collapseComments.classList.add('show'); //display the comments collapse

    //add a delete button to a comment only if it's a comment of the logged-in user:
    if(parseInt(comment.userID) === user.userID) {
        document.querySelector(`#comment${comment.id} div`)
            .insertAdjacentHTML("beforeend", `<a class="text-danger">delete</a>`)
        document.querySelector(`#comment${comment.id} a`)
            .addEventListener('click',  () => {
                deleteComment(comment);
            })
    }
}

function deleteComment(comment) {
    /**
     * delete a comment.
     * @param comment
     */
    toggleSpinner(comment.imageDate);
    fetch("/api/comments", {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({commentID: comment.id})
    })
        .then(status)
        .then((response) => {
            return response.json();
        })
        .then((/*commentID*/) => {
            updateComments(comment); //retrieve the updated comments from the server after the post
        })
        .catch((error) => {
            showErrorModal(error);
        })
        .finally(() => {
            toggleSpinner(comment.imageDate);
        });
}

async function status(response) {
    /**
     * handle errors.
     * @param response - the server response
     */
    if (response.status >= 200 && response.status < 400) { //no errors
        return Promise.resolve(response);
    } else if(response.status === 401) { //session expired error
        location.href = '/';
        document.cookie = "sessionExpired=true;";
        return Promise.reject();
    } else {
        const error = new Error(await response.text() || response.statusText || 'Unknown error occurred.');
        error.code = response.status;
        return Promise.reject(error);
    }
}

function showErrorModal(error) {
    /**
     * show a modal with an error status code and message.
     * @param error - the error to display
     */
    const errorMessageModal = new bootstrap.Modal(document.getElementById("errorMessageModal"));
    document.getElementById('errorCode').innerHTML = `${error.code || ''}`;
    document.getElementById('errorMessage').innerHTML = `${error.message}`;
    errorMessageModal.show();
}

function toggleSpinner(imageDate) {
    /**
     * show/hide the spinner of the given image date.
     * @param imageDate - a spinner of that image date.
     */
    document.getElementById(`spinner${imageDate}`).classList.toggle('d-none');
}

})();