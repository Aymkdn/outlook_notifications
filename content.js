// inject script
var s = document.createElement('script');
s.src = chrome.runtime.getURL('injected.js');
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

// save the icon in the page to use it in notifications
var i = document.createElement('img');
i.src = chrome.runtime.getURL("icons_calendar_notification.png");
i.id  = "icons_calendar_notification";
i.style = "display:none";
(document.head || document.documentElement).appendChild(i);

// check if we have a calendar sound
chrome.storage.local.get("replace_calendar_sound")
.then(data => {
  if (data.replace_calendar_sound) {
    chrome.storage.local.get("file_calendar")
    .then(data => {
      if (data.file_calendar) {
        // save the base64 of the file into the page to have it available to the injected.js script
        const input = document.createElement("input");
        input.type = "hidden";
        input.id = "calendar_reminder_sound";
        input.value = data.file_calendar;
        document.body.appendChild(input);
      }
    })
  }
})

// check if wewant the calendar reminder notification
chrome.storage.local.get("activate_calendar_notification")
.then(async data => {
  if (data.activate_calendar_notification) {
    // check if Notification is active
    if (Notification.permission !== 'denied') {
      let permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
    }

    const input = document.createElement("input");
    input.type = "hidden";
    input.id = "activate_calendar_notification";
    input.value = "1";
    document.body.appendChild(input);
  }
})

// check if we have a new email sound
chrome.storage.local.get("replace_email_sound")
.then(data => {
  if (data.replace_email_sound) {
    chrome.storage.local.get("file_email")
    .then(data => {
      if (data.file_email) {
        // save the base64 of the file into the page to have it available to the injected.js script
        const input = document.createElement("input");
        input.type = "hidden";
        input.id = "email_reminder_sound";
        input.value = data.file_email;
        document.body.appendChild(input);
      }
    })
  }
})
