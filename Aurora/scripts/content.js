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

async function getCensorState () {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get(['censorState'], function(result) {
          if (result.censorState != undefined)
          {

          
          if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
          } else {
              resolve(result.censorState);
          }
      }
      else {
          chrome.storage.local.set({ censorState: false }, function () {
              console.log("Value default set to " + false);
            }
            );
            resolve(false);
          }
      });
  });
}

async function getIntensity() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['intensity'], function(result) {
      if (result.intensity != undefined){
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.intensity);
      }}
      else {
        // Set the default intensity to 10
        chrome.storage.local.set({ intensity: 10 }, function () {
          console.log("Value is set to " + 10);
        }
        );
        resolve(10);
        
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
      let intensity = await getIntensity();

      for (const word of similarWords) {
        // Check if the word is not the topic itself
        if (word.word.toLowerCase() !== topic.toLowerCase()) {
          // Check if the word exists in the page text
          if (new RegExp(`\\b${word.word}\\b`, 'i').test(pageText)) {
            console.log(`Subtopic found: ${word.word}`);
            // You can perform further actions here based on the topic found
            count++;
            // console.log(count)
            if (count >= intensity) {

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

      // censor

      let censorState = await getCensorState();

      for (const topic of foundTopics) {
        // Get the censor state

      console.log("Found topics", foundTopics);
  
      if (censorState == true) {
        console.log("Censoring");
        // Censor the topic
        let regex = new RegExp(`\\b${topic}`, 'gi');
        // Censor the topic with the same number of asterisks as the length of the topic
        document.body.innerHTML = document.body.innerHTML.replace(regex, "*".repeat(topic.length));
  
        // Censor the similar words according to the intensity
        let similarWords = await getSimilarWords(topic);
        let intensity = await getIntensity();
  
        similarWords = similarWords.slice(0, intensity-1);
        
        console.log(similarWords);
  
        for (const word of similarWords) {
  
          // Check if the word is not the topic itself
          if (word.word.toLowerCase() !== topic.toLowerCase()) {
            // Check if the word exists in the page text
            if (new RegExp(`\\b${word.word}\\b`, 'i').test(pageText)) {
              // Censor the word
              const regex = new RegExp(`\\b${word.word}\\b`, 'gi');
              // Censor the word with the same number of asterisks as the length of the word
              document.body.innerHTML = document.body.innerHTML.replace(regex, "*".repeat(word.word.length));
            }
          }
        }
      }
  
    }


      // Create the custom alert element
      
      const alertElement = document.createElement("div");
      alertElement.classList.add("malert", "malert-warning", "malert-dismissible", "mfade", "mshow", "mtext-center", "mborder");
      alertElement.setAttribute("role", "malert");
      alertElement.innerHTML = `
        <strong>WARNING!</strong> Trigger topics found: <strong>${foundTopics.join(", ")}</strong>. Click to dismiss.

      
      `;
      alertElement.addEventListener("click", function() {
        alertElement.remove();
      });

      
      // Add the custom alert element to the page
      document.body.insertBefore(alertElement, document.body.firstChild);

      // Create a <style> element
const styleElement = document.createElement("style");

// Add CSS rules to the <style> element
styleElement.textContent = `
.btn-close {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: 0.5;
  transition: opacity 0.15s ease-in-out;
  padding: 0;
  border: 0;
  background-color: transparent;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.cross-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 2px;
  background-color: #000;
  transform-origin: center;
}

.cross-icon:before,
.cross-icon:after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #000;
  transform-origin: center;
}

.cross-icon:before {
  transform: rotate(45deg);
}

.cross-icon:after {
  transform: rotate(-45deg);
}

.btn-close:hover {
  opacity: 0.75;
}
  .malert {
    position: relative;
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
  }

  .malert-warning {
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeeba;
  }

  .malert-dismissible {
    padding-right: 4.5rem;
  }

  .mfade {
    transition: opacity 0.15s linear;
  }

  .mshow {
    display: block !important;
    opacity: 1;
  }

  .mtext-center {
    text-align: center !important;
  }

  .mborder {
    border: 1px solid #dee2e6 !important;
  }
`;

// Append the <style> element to the <head> section
document.head.appendChild(styleElement);

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