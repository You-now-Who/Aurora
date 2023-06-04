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


async function addTopic() {
    const topic = document.getElementById("topic").value;
    const topicsList = await getTopics();

    // Check if topic exists. If not, add the topic to the list of topics and set it in local storage
    if (!topicsList.includes(topic) && topic !== "") {
        topicsList.push(topic);
        // Remove the lists from currTopics
        const list = document.getElementById("currTopics");
        list.innerHTML = "";
        chrome.storage.local.set({ topics: topicsList }, function () {
            console.log("Value is set to " + topicsList);  
        });
        main()
    }

    console.log(topicsList);
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


async function main() {
  let topics = await getTopics();

  let censorState = await getCensorState();
  let censorButton = document.getElementById("censorSwitch");

  console.log("censorState", censorState)
  if (censorState) {
    console.log("censorState is true");
    censorButton.checked = true;
  }
    else {
        censorButton.checked = false;
    }


  const rangeInput = document.getElementById("customRange1");
  const rangeValue = document.getElementById("rangeValue");

  rangeInput.value = await getIntensity();
  rangeValue.textContent = rangeInput.value;

rangeInput.addEventListener("input", function() {
  rangeValue.textContent = rangeInput.value;
});


  console.log("main topics", topics);

  if (topics === undefined) {
    topics = [];

  }

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { message: "Hello from popup.js" });
  });


  for (const topic of topics) {
  const li = document.createElement("li");
  li.textContent = topic;
  li.classList.add("list-group-item");

  // Create a delete button with an SVG icon
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn", "btn-danger", "btn-sm", "ms-2");
  deleteButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
</svg>

  `;

  // Add a click event listener to the delete button
  deleteButton.addEventListener("click", () => {
    // Remove the topic from the list
    const index = topics.indexOf(topic);
    if (index > -1) {
      topics.splice(index, 1);
    }

    // Update the local storage with the new topics list
    chrome.storage.local.set({ topics: topics }, () => {
      // Remove the list item from the DOM
      li.remove();
    });
  });

  // Append the delete button to the list item
  li.appendChild(deleteButton);

  // Append the list item to the list
  document.getElementById("currTopics").appendChild(li);
}
}

document.getElementById("addTopic").addEventListener("click", function () {
    addTopic();
    }
);

document.getElementById("saveIntensity").addEventListener("click", function () {
    const intensity = document.getElementById("customRange1").value;
    chrome.storage.local.set({ "intensity": intensity }, function () {
        console.log("Value is set to " + intensity);
        });
        }
    );

// When the censor switch is clicked, change the censor state in local storage
document.getElementById("censorSwitch").addEventListener("click", function () {
    chrome.storage.local.get(['censorState'], function(result) {
        if (result.censorState != undefined){
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                chrome.storage.local.set({ censorState: !result.censorState }, function () {
                    console.log("Value is set to " + !result.censorState);
                    });
            }}
        else {
            chrome.storage.local.set({ censorState: true }, function () {
                console.log("Value is set by default to " + true);
                }
                );
        }
    });
    }
);


main();

