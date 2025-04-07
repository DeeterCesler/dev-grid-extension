// Extension event listeners are a little different from the patterns you may have seen in DOM or
// Node.js APIs. The below event listener registration can be broken in to 4 distinct parts:
//
// * chrome      - the global namespace for Chrome's extension APIs
// * runtime     – the namespace of the specific API we want to use
// * onInstalled - the event we want to subscribe to
// * addListener - what we want to do with this event
//
// See https://developer.brave.com/docs/extensions/reference/events/ for additional details.


// TODO: make this a "thanks for downloading" page with instructions in the README.md file

// chrome.runtime.onInstalled.addListener(async () => {
//   // While we could have used `let url = "hello.html"`, using runtime.getURL is a bit more robust as
//   // it returns a full URL rather than just a path that Chrome needs to be resolved contextually at
//   // runtime.
//   let url = chrome.runtime.getURL('hello.html')

//   // Open a new tab pointing at our page's URL using JavaScript's object initializer shorthand.
//   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#new_notations_in_ecmascript_2015
//   //
//   // Many of the extension platform's APIs are asynchronous and can either take a callback argument
//   // or return a promise. Since we're inside an async function, we can await the resolution of the
//   // promise returned by the tabs.create call. See the following link for more info on async/await.
//   // https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
//   let tab = await chrome.tabs.create({ url })

//   // Finally, let's log the ID of the newly created tab using a template literal.
//   // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
//   //
//   // To view this log message, open chrome://extensions, find "Hello, World!", and click the
//   // "service worker" link in the card to open DevTools.
//   console.log(`Created tab ${tab.id}`)
// })

// Listen for when the extension is installed or updated
chrome.runtime.onInstalled.addListener(async () => {
    console.log('DevGrid extension installed');
});

// Listen for when a tab is updated
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     if (changeInfo.status === 'complete') {
//         console.log('Tab updated, attempting to inject content script');
//         // First try to inject CSS
//         chrome.tabs.insertCSS(tabId, {
//             file: 'style.css'
//         }, function() {
//             if (chrome.runtime.lastError) {
//                 console.error('Error injecting CSS:', chrome.runtime.lastError);
//             } else {
//                 console.log('CSS injected successfully');
//             }
//         });
        
//         // Then inject the content script
//         chrome.tabs.executeScript(tabId, {
//             file: 'contentScript.js'
//         }, function() {
//             if (chrome.runtime.lastError) {
//                 console.error('Error injecting content script:', chrome.runtime.lastError);
//             } else {
//                 console.log('Content script injected successfully');
//             }
//         });
//     }
// });

// Listen for when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    }).then(() => {
        console.log('Content script injected successfully');
    }).catch(error => {
        console.error('Error injecting content script:', error);
    });
});
