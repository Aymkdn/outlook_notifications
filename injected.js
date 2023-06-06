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

async function myCalendarReminderSound () {
  let t = await new Response(base64ToArrayBuffer(reminder), {
    status: 200, // Set the desired status code
    headers: { 'Content-Type': 'audio/mpeg' } // Set the desired content type
  });
  let i = await t.arrayBuffer();
  let r = new AudioContext();
  return r.decodeAudioData(i);
}

// transform the current date to a specific format (e.g. "2023-06-05T15:00:00+02:00")
function getNowDate () {
  const date = new Date();
  const dateString = date.toISOString().split('T')[0];
  const timeString = date.toLocaleTimeString('en', { hour12: false });
  const timeZoneOffset = date.getTimezoneOffset();
  const timeZoneOffsetString = `${Math.abs(timeZoneOffset / 60).toString().padStart(2, '0')}:${(timeZoneOffset % 60).toString().padStart(2, '0')}`;
  const fullDateString = `${dateString}T${timeString}${timeZoneOffset >= 0 ? '-' : '+'}${timeZoneOffsetString}`;
  return fullDateString;
}

// return the URL found in a string
function getURI (str) {
  const matches = str.match(/(https?:\/\/[^\s]+)/);
  return (matches && matches.length > 0 ? matches[0] : "");
}

// get the link to the local resource
let el = document.querySelector('#icons_calendar_notification');
const iconCalendarNotif = (el ? el.src : "");

let calendarReminderSoundCache;
let calendarReminderNotificationCache;
let newEmailSoundCache;

// overwrite fetch
const { fetch: origFetch } = window;
window.fetch = async (...args) => {
  const response = await origFetch(...args);
  let uri = args[0]
  if (typeof uri === "string") {
    // get the reminder details
    if (uri.includes("service.svc?action=GetReminders")) {
      if (!calendarReminderNotificationCache) {
        let el = document.querySelector("#activate_calendar_notification");
        if (el) {
          calendarReminderNotificationCache = true;
        }
      }
      if (calendarReminderNotificationCache) {
        //console.log('GetReminders => ', args);
        response
        .clone()
        .json() // maybe json(), text(), blob()
        .then(data => {
          //console.log('Data => ', data);
          let now = getNowDate().slice(0 ,16);
          if (data && data.Body && Array.isArray(data.Body.Reminders) && Notification.permission === "granted") {
            notifInQueue = [];
            data.Body.Reminders.forEach(reminder => {
              // check the reminder time
              // e.g. ReminderTime:"2023-06-05T15:00:00+02:00"
              if (reminder.ReminderTime && reminder.ReminderTime.slice(0,16) === now) {
                // show a desktop notification
                console.log("[Web Outlook Custom Notifications] Show our own notification.", JSON.stringify(notifInQueue));
                let notification = new Notification(reminder.Subject, {
                  body:`Starts at ${new Intl.DateTimeFormat(navigator.userLanguage || navigator.language, {hour: "numeric", minute: "numeric"}).format(new Date(reminder.StartDate))}`,
                  icon:iconCalendarNotif,
                  silent:true
                });
                // if we have a link
                let link = reminder.JoinOnlineMeetingUrl || getURI(reminder.Location);
                if (link) {
                  notification.addEventListener('click', () => {
                    window.open(link);
                  });
                }
              }
            })
          }
        })
        .catch(err => console.error(err));
      }
    } else if (uri.endsWith("/resources/sounds/notifications/reminder.mp3")) {
      // Replace sound?
      if (!calendarReminderSoundCache) {
        let el = document.querySelector("#calendar_reminder_sound");
        if (el && el.value) {
          calendarReminderSoundCache = base64ToArrayBuffer(el.value);
        }
      }
      if (calendarReminderSoundCache) {
        console.log("[Web Outlook Custom Notifications] Play our own calendar reminder sound.");
        // send our own sound
        return new Response(calendarReminderSoundCache, {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg' }
        });
      }
    } else if (uri.endsWith("/resources/sounds/notifications/newmail.mp3")) {
      if (!newEmailSoundCache) {
        let el = document.querySelector("#email_reminder_sound");
        if (el && el.value) {
          newEmailSoundCache = base64ToArrayBuffer(el.value);
        }
      }
      if (newEmailSoundCache) {
        console.log("[Web Outlook Custom Notifications] Play our own new email sound.");
        // send our own sound
        return new Response(newEmailSoundCache, {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg' }
        });
      }
    }
  }
  return response;
};
