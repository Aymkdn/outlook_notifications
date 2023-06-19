// Initialize the form with the user's option settings
chrome.storage.local.get("replace_calendar_sound")
.then(data => {
  if (data.replace_calendar_sound) {
    let el = document.querySelector('input[name="replace_calendar_sound"]');
    if (el) el.checked=true;
  }
});
chrome.storage.local.get("activate_calendar_notification")
.then(data => {
  if (data.activate_calendar_notification) {
    let el = document.querySelector('input[name="activate_calendar_notification"]');
    if (el) el.checked=true;
  }
});
chrome.storage.local.get("replace_email_sound")
.then(data => {
  if (data.replace_email_sound) {
    let el = document.querySelector('input[name="replace_email_sound"]');
    if (el) el.checked=true;
  }
});

// convert an array buffer to a base64 string
function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Below is a function that converts a base64 string to an ArrayBuffer
function base64ToArrayBuffer(base64String) {
  const binaryString = atob(base64String);
  const arrayBuffer = new ArrayBuffer(binaryString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return arrayBuffer;
}

// manage the toggle switch buttons
const toggleSwitch = document.querySelectorAll(".switch input[type='checkbox']");
for (let el of toggleSwitch) {
  el.addEventListener("change", function() {
    // save the selection
    let option = {};
    option[el.name] = this.checked;
    chrome.storage.local.set(option);
  });
}

function loadCalendarAudio (arrayBuffer) {
  let el = document.querySelector('#file_calendar');
  if (el) {
    const audioElement = document.createElement('audio');
    audioElement.src = URL.createObjectURL(new Blob([arrayBuffer], { type: 'audio/mpeg' }));
    audioElement.controls = true;
    el.insertAdjacentElement('afterend', audioElement);
  }
}

// retrieve if we already have a stored sound for calendar reminder
chrome.storage.local.get("file_calendar")
.then(data => {
  if (data.file_calendar) {
    loadCalendarAudio(base64ToArrayBuffer(data.file_calendar));
  }
})

// when a file is loaded, locally save it
const fileCalendar = document.querySelector('#file_calendar');
if (fileCalendar) {
  fileCalendar.addEventListener("change", function() {
    const file = fileCalendar.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      let arrayBuffer = event.target.result;
      chrome.storage.local.set({"file_calendar":arrayBufferToBase64(arrayBuffer)});
      loadCalendarAudio(arrayBuffer);
    }

    reader.readAsArrayBuffer(file);
  });
}

function loadNewEmailAudio (arrayBuffer) {
  let el = document.querySelector('#file_email');
  if (el) {
    const audioElement = document.createElement('audio');
    audioElement.src = URL.createObjectURL(new Blob([arrayBuffer], { type: 'audio/mpeg' }));
    audioElement.controls = true;
    el.insertAdjacentElement('afterend', audioElement);
  }
}

// retrieve if we already have a stored sound for new email
chrome.storage.local.get("file_email")
.then(data => {
  if (data.file_email) {
    loadNewEmailAudio(base64ToArrayBuffer(data.file_email));
  }
})

// when a file is loaded, locally save it
const fileNewEmail = document.querySelector('#file_email');
if (fileNewEmail) {
  fileNewEmail.addEventListener("change", function() {
    const file = fileNewEmail.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      let arrayBuffer = event.target.result;
      chrome.storage.local.set({"file_email":arrayBufferToBase64(arrayBuffer)});
      loadNewEmailAudio(arrayBuffer);
    }

    reader.readAsArrayBuffer(file);
  });
}

// if we want to remove a sound
const deleteBtn = document.querySelectorAll(".delete");
for (let elem of deleteBtn) {
  elem.addEventListener("click", function() {
    let target = elem.dataset.target;
    let param = {};
    param["file_"+target] = "";
    chrome.storage.local.set(param);
    let el = document.querySelector('#file_'+target+' + audio');
    if (el) el.parentNode.removeChild(el);
    el = document.querySelector('#file_'+target);
    if (el) el.value="";
  });
}
