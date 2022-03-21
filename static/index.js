var data;
var addingName;
var addingDescription;
var adminMode = false;
var chekingOffers = false;


function html(element, pos, html) { document.getElementById(element).insertAdjacentHTML(pos, html) }

// Modal // Modal // Modal // Modal

function showModal() {
    let modal = document.getElementById("modal");
    modal.style.display = "block";
    modal.style.paddingRight = "17px";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    setTimeout(() => {  modal.setAttribute("class", "modal fade show"); }, 100);
}
function hideModal() {
    let modal = document.getElementById("modal");
    modal.setAttribute("class", "modal fade");
    modal.style.paddingRight = "auto";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0)";
    setTimeout(() => {
        modal.style.display = "none";
        if(document.getElementById("modal-body")) {document.getElementById("modal-body").remove();}
}, 100);
}
function changeModal(head, body = '') {
    document.getElementById("modal-label").innerHTML = head;
    if(body !== '') {html('modal-header', 'afterend', `
        <div class="modal-body" id="modal-body">
            ${body}
        </div>
    `);}
}

// Requests // Requests // Requests

function sendSlang() {
    if(document.getElementById('passtoforadmin').value == '5511') {
        let name = document.getElementById('name').value;
    let description = document.getElementById('description').value;
    let validation = sendValidation(name, description);
    if (validation === true) {
        let button = document.getElementById('formSubmitButton');
        button.setAttribute('disabled', true);
        button.innerHTML = 'Отправка...';
        showModal();
        let toSend = {
            name,
            description
        }
        let xhr = new XMLHttpRequest()
        xhr.open('POST', adminMode ? '/api/adminAdd' : '/api/userAdd', true)
        xhr.send(JSON.stringify(toSend))
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200) {
                button.removeAttribute('disabled')
                button.innerHTML = adminMode ? 'Добавить' : 'Отправить';
                changeModal('Что то пошло не так, попробуйте позже.');
                showModal();
            } else {
                button.removeAttribute('disabled')
                button.innerHTML = adminMode ? 'Добавить' : 'Отправить';
                changeModal(adminMode ? 'Сленг добавлен!' : 'Мы получили ваше предложение.');
                showModal();
                document.getElementById('name').value = '';
                document.getElementById('description').value = '';
                loadSlangs()
            }
        }
    } else {
        renderValidationErrors(validation)
    }
    }
}
async function loadSlangs() {
    let slangList = document.getElementById('slangList');
    if(slangList) {
        slangList.style.height = `${slangList.offsetHeight}px`;
    }
    let xhr = new XMLHttpRequest();
    xhr.open('GET', chekingOffers ? '/api/getOffers' : '/api/get', true);
    xhr.send();
    xhr.onload = function () {
        let json = xhr.response;
        data = JSON.parse(json).data;
        renderContent();
        let slangList = document.getElementById('slangList');
        slangList.style.height = `auto`;
    };
}
function deleteSlang(id) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/del', true)
    xhr.send(JSON.stringify(id))
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
        } else {
            loadSlangs()
        }
    }
}
function postSlang(id) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/postslang', true)
    xhr.send(JSON.stringify(id))
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4) return;
        if (xhr.status != 200) {
        } else {
            loadSlangs()
        }
    }
}


// Renders // Renders // Renders

function renderValidationErrors(errors) {
    document.getElementById('nameError').innerHTML = errors.name !== undefined ? errors.name : '';
    document.getElementById('descriptionError').innerHTML = errors.description !== undefined ? errors.description : '';
}
function renderLoading() {
    clearContent()
    html("slangList", "beforeend", `
        <div>
            <img 
                style="position: relative; width: 100%;" 
                src="/static/loading.gif"
            />
        </div>
    `);
}
function renderAdder() {
    html('left-bar', 'afterbegin', `
        <div style="padding: 10px" class="myCard">
            <div class="card" style="padding: 10px">
                <h4 style="text-decoration: underline;text-decoration-style: dashed;text-decoration-color: #329C9C;">${adminMode ? 'Добавить' : 'Предложить'} сленг</h4>
                <div class="form-group">
                    <label for="name">Сленг<span style="color: red">*</span></label>
                    <input type="text" class="form-control" id="name" onInput="resetError('nameError')" placeholder="Введите сленг">
                    <small id="nameError" style="color: red"></small>
                </div>
                <div class="form-group">
                    <label for="description">Описание<span style="color: red">*</span></label>
                    <textarea type="textarea" class="form-control" id="description" onInput="resetError('descriptionError')" placeholder="Введите описание"></textarea>
                    <small id="descriptionError" style="color: red"></small>
                </div>
                <small style="text-align: end;"><span style="color: red">*</span> - обязательные поля</small>
                <button onClick="sendSlang()" class="btn btn-primary" style="float: right" id="formSubmitButton">${adminMode ? 'Добавить' : 'Отправить'}</button>
            </div>
        </div>
    `)
}
function renderSlangList() {
    document.getElementById('slangList').innerHTML = '';
    let search = document.getElementById('searchInput').value;
    let outData = search !== '' ? data.filter(item => item.name.toUpperCase().indexOf(search.toUpperCase()) !== -1) : data;
    if(outData != '') {
        outData.map((item) => {html("slangList", "beforeend", `
            <div class="col-xl-4 col-md-6 col-12" style="padding: 5px">
                <div class="card" style="overflow: hidden; height: ${adminMode ? '300px' : '250px'}; position: relative;" id="card-${item.id}">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text" id="card-${item.id}-text">${item.description.replace(/\\n/g, '<br>')}</p>
                    </div>
                </div>
            </div>
        `);
        if((adminMode) || (document.getElementById(`card-${item.id}-text`).offsetHeight > 200)) {
            html(`card-${item.id}`, 'beforeend', `
            <div class="row more" ${document.getElementById(`card-${item.id}-text`).offsetHeight > 200 ? 'style="padding-top: 0; background-color: rgba(0,0,0,0)";' : ''}>
                ${document.getElementById(`card-${item.id}-text`).offsetHeight > 200 ? 
                `<div class="col-12" style="pointer-events: all;"><a href="#" class="card-link" onClick="onClickMore('${item.name}','${item.description.replace(/\\n/g, '<br>')}')">Читать полностью...</a></div>` : ''}
                    ${ adminMode ? `
                        <div class="${chekingOffers ? 'col-xl-6 col-12' : 'col-12'}" style="margin-bottom: 15px;pointer-events: all;">
                            <button style="width: 100%" class="button-clear button-clear--red" onClick="deleteSlang('${item.id}')">
                                    <svg version="1.1" id="Слой_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 25 25" style="height: 25px;margin-top: 6px;" xml:space="preserve"><path id="path1468" fill="currentColor" d="M4,0c-0.1,0-0.3,0.1-0.4,0.2L0.2,3.6c-0.3,0.3-0.3,0.8,0,1.1L8,12.5l-7.8,7.8c-0.3,0.3-0.3,0.8,0,1.1l3.3,3.3c0.3,0.3,0.8,0.3,1.1,0l7.8-7.8l7.8,7.8c0.3,0.3,0.8,0.3,1.1,0l3.3-3.3c0.3-0.3,0.3-0.8,0-1.1L17,12.5l7.8-7.8c0.3-0.3,0.3-0.8,0-1.1l-3.3-3.3c-0.3-0.3-0.8-0.3-1.1,0L12.5,8L4.7,0.3C4.5,0,4.2,0,4,0z"/></svg>
                            </button>
                        </div>
                        ${chekingOffers ? `<div class="col-xl-6 col-12" style="margin-bottom: 15px;pointer-events: all;">
                            <button style="width: 100%" class="button-clear button-clear--green" onClick="postSlang('${item.id}')">
                                    <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 25 25" style="height: 25px;margin-top: 6px;" xml:space="preserve"><g><path fill="currentColor" d="M21.1,2L9.4,13.7L3.9,8.2L0,12.1l9.4,9.4L25,5.9L21.1,2z"/></g></svg>
                            </button>
                        </div>`
                    : ''}
                ` : ''}
            </div>
        `)};
        })
    } else {
        html("slangList", "beforeend", `<div class="container-fluid" style="font-size: 40px;color: rgba(0, 0, 0, 0.3);text-align: center;">${search !== '' ? 'По такому запросу ничего не найдено.' : 'Этот список пуст...'}</div>`)
    }
}
function renderContent() {
    clearContent()
    html("content", "afterBegin", `
        <div class="search-container" id="search">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <span class="input-group-text" id="basic-addon1">🔎</span>
              </div>
              <input id="searchInput" type="text" class="form-control" placeholder="Что хотите найти?" aria-describedby="basic-addon1" onInput="renderSlangList()">
            </div>
        </div>
    `);
    if(adminMode) {
        html("content", "afterBegin", `
            <div class="row container-fluid" style="padding: 0"  id="adminControl">
                <div class="col-md-6 col-12 category ${chekingOffers ? '' : 'category--selected'}" style="border-radius: 5px 0 0 0;" onClick="changeCategory(false)">
                    Сленги
                </div>
                <div class="col-md-6 col-12 category ${chekingOffers ? 'category--selected' : ''}" style="border-radius: 0 5px 0 0;" onClick="changeCategory(true)">
                    Предложения
                </div>
            </div>
        `);
    }
    renderSlangList();
}
function renderRoot() {
    document.getElementById('root').innerHTML = '';
    html("root", "afterbegin", `
        <div class="row">
            <div class="col-12" style="margin-bottom: 15px;">
                <div class="card myCard" style="padding: 10px; flex-direction: row;">
                    <input id="passtoforadmin" type="password" />
                    <a href="#" style="margin-left: auto;align-self: flex-end;" class="card-link" onClick="changeRole()" >${adminMode ? 'switch to user' : 'switch to admin'}</a>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-xl-3 col-12" id="left-bar" style="margin-bottom: 15px;"></div>
            <div class="col-xl-6 col-12">
                <div class="myCard" id="content">
                    <div id="slangList" class="row"></div>
                </div>
            </div>
            <div class="col-xl-3 col-12" id="right-bar"></div>
        </div>
    `);
    renderAdder();
    loadSlangs();
}

// OTHER // OTHER // OTHER

function clearContent() {
    document.getElementById("slangList").innerHTML = ""; 
    if(!document.getElementById("search")) {return ''}
    document.getElementById("search").remove();
    if(adminMode) {document.getElementById("adminControl").remove();}
}
function changeCategory(state) {
    if (chekingOffers == state) { return '' }
    chekingOffers = !chekingOffers;
    loadSlangs()
}
function resetError(str) { document.getElementById(str).innerHTML = '' }
function sendValidation(name, desc) {
    let error = {};
    // NAME
    if (name == '') { // lenght < 2 : ERROR
        error.name = 'Обязательное поле.'
    }

    // DESCRIPTION
    if (desc == '') {
        error.description = 'Обязательное поле.'
    }

    // RESULT
    if ((error.name === undefined) && (error.description === undefined)) {
        error = true;
    }
    return error
}
function changeRole() {
    if(document.getElementById('passtoforadmin').value == '5511') {
        if(adminMode) {
            chekingOffers = false;
        }
        adminMode = !adminMode;
        document.getElementById('searchInput').value = '';
        renderRoot();
    }
}
function onClickMore(name, body) {
    changeModal(name, body);
    showModal();
}

// CODE TO RUN

renderRoot();
