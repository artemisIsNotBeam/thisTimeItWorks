import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";


var loginForm = document.querySelector("#login-form");
var message = document.querySelector("#message");

var loadRequestButton = document.querySelector("#loadRequests");

var loggedIn = false;
var username = "";

var app;
var auth;
 
window.api.getConfig();
window.api.onConfigLoaded((config) => {
  console.log("Firebase config loaded:", config);
  // Initialize Firebase with the provided config
  const app = initializeApp(config);
  auth = getAuth(app);
});

loginForm.addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent default form submission

  var username = document.querySelector("#username").value;
  var password = document.querySelector("#password").value;
  var message = document.querySelector("#message");

  signInWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
      const user = userCredential.user;
      message.innerHTML = "Welcome " + user.email;
      message.style.color = "green";
      document.querySelector("#greeting").innerHTML = "Welcome " + user.email;

      loggedIn = true;
      username = user.email;
    })
    .catch((error) => {
      console.error("Login error:", error);
      message.innerHTML = "Login failed: " + error.message;
      message.style.color = "red";
    });
});


loadRequestButton.addEventListener("click", async () => {
    if (loggedIn) {
        window.api.loadRequests();
    } else {
        alert("please login");
    }
});

window.api.onRequestsLoaded(function(data) {
    console.log(data);
    const message = document.getElementById("message");

    if (data.error) {
        message.innerHTML = data.error;
        message.style.color = "red";
    } else {
        const table = document.querySelector("#requestTable");
        let tbody = table.querySelector("tbody");

        if (!tbody) {
            tbody = document.createElement("tbody");
            table.appendChild(tbody);
        }

        tbody.innerHTML = "";

        data.forEach((request, index) => {
            const collapseId = `collapse-${index}`;

            // --- Primary visible row ---
            const mainRow = document.createElement("tr");

            function createCell(content) {
                const cell = document.createElement("td");
                cell.textContent = content !== undefined && content !== null ? content : "N/A";
                return cell;
            }

            mainRow.appendChild(createCell(request.requestNumber));
            //mainRow.appendChild(createCell(request.dbPrimaryKey));
            mainRow.appendChild(createCell(request.userEmail));
            mainRow.appendChild(createCell(request.role));
            
            mainRow.appendChild(createCell(request.company));
            mainRow.appendChild(createCell(request.role));
            mainRow.appendChild(createCell(request.firebaseId));
            mainRow.appendChild(createCell(request.loggedAt));

            const collapseCell = document.createElement("td");
            collapseCell.colSpan = 2;
            collapseCell.innerHTML = `
                <button class="btn btn-sm btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                    Show Details
                </button>`;
            mainRow.appendChild(collapseCell);

            tbody.appendChild(mainRow);

            // --- Hidden collapse row ---
            const collapseRow = document.createElement("tr");
            const collapseCellFull = document.createElement("td");
            collapseCellFull.colSpan = 9;

            const decoded = request.decodedData;
            if (decoded) {
                collapseCellFull.innerHTML = `
                    <div id="${collapseId}" class="collapse">
                        <ul class="list-group list-group-flush mt-2">
                            <li class="list-group-item"><strong>Request ID:</strong> ${decoded.requestId}</li>
                            <li class="list-group-item"><strong>Function Name:</strong> ${decoded.functionName}</li>
                            <li class="list-group-item"><strong>Function Code:</strong> ${decoded.functionCode}</li>
                            <li class="list-group-item"><strong>Pages Processed:</strong> ${decoded.pagesProcessed}</li>
                            <li class="list-group-item"><strong>Documents Processed:</strong> ${decoded.documentsProcessed}</li>
                            <li class="list-group-item"><strong>Processing Time:</strong> ${decoded.processingTime}</li>
                            <li class="list-group-item"><strong>Estimated Time:</strong> ${decoded.estimatedTime}</li>
                            <li class="list-group-item"><strong>Request DateTime:</strong> ${decoded.requestDateTime}</li>
                            <li class="list-group-item"><strong>Total Size (Hex):</strong> ${decoded.totalSizeBytesHex}</li>
                            <li class="list-group-item"><strong>Error Code:</strong> ${decoded.errorCode}</li>
                            <li class="list-group-item"><strong>Warning Code:</strong> ${decoded.warningCode}</li>
                            <li class="list-group-item"><strong>Output Rows:</strong> ${decoded.outputRows}</li>
                            <li class="list-group-item"><strong>Output Tabs/Sheets:</strong> ${decoded.outputTabsSheets}</li>
                        </ul>
                    </div>`;
            } else {
                collapseCellFull.innerHTML = `<div id="${collapseId}" class="collapse">No decoded data available.</div>`;
            }

            collapseRow.appendChild(collapseCellFull);
            tbody.appendChild(collapseRow);
        });
    }
});
