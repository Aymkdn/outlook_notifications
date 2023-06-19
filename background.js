/*// Listen for the user's MP3 file selection
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("onMessage => ", request)
  if (request.action === "convertMP3ToArrayBuffer") {
    // Convert the selected MP3 file to ArrayBuffer
    // You can use the FileReader API to accomplish this task
    // Example code:
    var fileReader = new FileReader();
    fileReader.onload = function (event) {
      var arrayBuffer = event.target.result;
      sendResponse({ arrayBuffer });
    };
    fileReader.readAsArrayBuffer(request.file);
    return true; // Enable sendResponse asynchronously
  }
});

// store the sound files
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`Store ${key}`);
  }
});
*/

chrome.notifications.create({
  type: 'basic',
  title: 'Notification Title',
  message: 'Notification Body',
  silent:true,
  buttons: [
    { title: 'Button 1' },
    { title: 'Button 2' }
  ],
  iconUrl:"https://i.ibb.co/mCPYJdM/icons-calendar-notification.png"
});
