
console.log("Running is_loaded.js");

const refreshIntervalSeconds = 10;
const spinnerBox = document.getElementById("spinner-box");
const statusBox = document.getElementById("status-box");

let intervalID;

function checkLoaded() {
    console.log("Status Request URL: /teleview/api/get_status");
    $.ajax({
        type: "GET",
        url: '/teleview/api/get_status',
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
                    updateString += `<div>${statuses[i]} is ${percentCompletes[i]}% complete at ${timestampArray[i]}</div>`;
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
