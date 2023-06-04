async function getSimilarWords(word) {
  // Define the URL to get the similar words
  const url = `https://api.datamuse.com/words?ml=${word}`;

  console.log(url);

  // Send a GET request to the URL
  const response = await fetch(url);
  const data = await response.json();

  // Return the list of similar words
  // console.log(data);
  return data;
}

async function getTopics() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['topics'], function(result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.topics);
      }
    });
  });
}

// This function checks if the webpage contains specific topics
async function checkTopics() {

  let foundTopics = [];
  let topics = await getTopics();

  console.log("Checking topics");

  if (topics != undefined) {

  // Get all the text content within the webpage
  const pageText = document.body.innerText.toLowerCase();

  // Check if any of the topics exist in the page text
  for (const topic of topics) {
    if (new RegExp(`\\b${topic}\\b`, 'i').test(pageText)) {
      console.log(`Topic found: ${topic}`);
      foundTopics.push(topic);
      // You can perform further actions here based on the topic found
    }

    else {

      // Get the similar words for the topic
      const similarWords = await getSimilarWords(topic);
      
      // console.log(similarWords)

        // Check if any three different of the similar words exist in the page text
      let count = 0;
      for (const word of similarWords) {
        // Check if the word is not the topic itself
        if (word.word.toLowerCase() !== topic.toLowerCase()) {
          // Check if the word exists in the page text
          if (new RegExp(`\\b${word.word}\\b`, 'i').test(pageText)) {
            console.log(`Subtopic found: ${word.word}`);
            // You can perform further actions here based on the topic found
            count++;
            if (count === 10) {
              console.log(`Topic found: ${topic}`);
              foundTopics.push(topic);
              break;
            }
          }
        }
      }
    }
  }

    // Send an alert to the user if any topics are found
    if (foundTopics.length > 0) {
      alert(`WARNING: Trigger topics found: ${foundTopics.join(", ")}`);
    }

  }
  else {
    console.log("No topics found");
  }
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === "Hello from popup.js") {
    // Handle the message received from popup.js
    console.log(request.message);
  }
});


// Execute the function when the webpage finishes loading
window.addEventListener("load", checkTopics);