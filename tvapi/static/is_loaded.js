
console.log("Running is_loaded.js");

const refreshIntervalSeconds = 3;

const runningBox = document.getElementById("running-box");
const queueBox = document.getElementById("queue-box");
const spinnerBox = document.getElementById("spinner-box");
const statusBox = document.getElementById("status-box");



let intervalID;

function checkLoaded() {
    console.log("Status Request URL: /teleview/api/get_status");
    $.ajax({
        type: "GET",
        url: '/teleview/api/get_running/',
        success: (response) => {
            console.log("Running response", response);
            let updateString = '<h3>Running Database Action Status</h3>';
            updateString += '<div class="mt-3"><h4> <strong>' + response['status'] + '</strong></h4>';
            updateString += '<div>status set by "<strong>' + response['task'] + '</strong>" task at <strong>' + response['timestamp'] + '</strong></div></div>';
            runningBox.innerHTML = updateString;
        },
        error: (error) => {
            console.log("Error:", error);
        }
    })
    $.ajax({
        type: "GET",
        url: '/teleview/api/get_queue/',
        success: (response) => {
            let updateString = '<h3 class="mt-5">Scheduler Queue for Database Actions</h3>';
            console.log("Get Queue response", response);
            if (response.length === 0) {
                updateString += '<div> The Scheduler <strong> Queue </strong> for Database Actions is currently  <strong> empty </strong>.</div> '
            } else {
                updateString += '<table class="table table-striped table-bordered table-hover table-sm"><thead><tr><th scope="col">Task</th><th scope="col">Timestamp</th></tr></thead><tbody>'
                for (let i=0; i < response.length; i++ ) {
                    updateString += `<tr><td>${response[i]['task']}</td><td>${response[i]['timestamp']}</td></tr>`;
                }
                updateString += '</tbody></table>'
            }
            queueBox.innerHTML = updateString;
        },
        error: (error) => {
            console.log("Error:", error);
        }
    })
    $.ajax({
        type: "GET",
        url: '/teleview/api/get_status/',
        success: (response) => {
            console.log("Status response", response);
            const statuses = response.map((singleStatus) => {
                return singleStatus['status_type'];
            });
            const percentCompletes = response.map((singleStatus) => {
                return singleStatus['percent_complete'];
            });
            const isCompleteArray = response.map((singleStatus) => {
                return singleStatus['is_complete'];
            });
            const timestampArray = response.map((singleStatus) => {
                const [timestampUTC] = singleStatus['timestamp'].toString().split(".", 1)
                const [dateString, timeString] = timestampUTC.split('T', 2)
                return dateString + " " + timeString + " UTC"

            })
            const retryCountArray = response.map((singleStatus) => {
                const retryCount = parseInt(singleStatus['retry_count']);
                if (retryCount === 0) {
                    return "";
                }
                return `, retry count: ${retryCount}`;
            })
            if (isCompleteArray.every((isComplete) => isComplete === true)) {
                if (spinnerBox) {
                    spinnerBox.innerHTML = "All processes complete";
                }
                clearInterval(intervalID);
                console.log("All processes complete, refresh deactivated.")
            }
            if (statusBox) {
                let updateString = '';
                for (let i=0; i < response.length; i++ ) {
                    updateString += `<div>${statuses[i]} is ${percentCompletes[i]}% complete at ${timestampArray[i]}${retryCountArray[i]}</div>`;
                }
                statusBox.innerHTML = updateString;
            }
        },
        error: (error) => {
            console.log("Error:", error);
        }
    })
}


checkLoaded();
// refresh the status every few seconds until all processes are complete
intervalID = setInterval(checkLoaded, 1000 * refreshIntervalSeconds);
