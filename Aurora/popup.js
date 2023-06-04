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

// chrome.storage.local.set({ topics: ["test"] }, function () {
//     console.log("Value is set to " + ["test"]);
//     });

async function addTopic() {
    const topic = document.getElementById("topic").value;
    const topicsList = await getTopics();

    // Check if topic exists. If not, add the topic to the list of topics and set it in local storage
    if (!topicsList.includes(topic)) {
        topicsList.push(topic);
        chrome.storage.local.set({ topics: topicsList }, function () {
            console.log("Value is set to " + topicsList);
        });
        main()
    }

    

    console.log(topicsList);
}

async function main() {
  let topics = await getTopics();

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
      <path d="M5.5 5.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5v-1zm1-1v-1a1.5 1.5 0 0 1 3 0v1h-3zm-2 1a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-11z"/>
      <path d="M2.5 5.5h11v9h-11v-9zm1 1v7h9v-7h-9z"/>
      <title>Delete</title>
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

main();

document.getElementById("addTopic").addEventListener("click", function () {
    addTopic();
    }
);
