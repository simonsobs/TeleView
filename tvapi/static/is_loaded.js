console.log("Running is_loaded.js");

const spinnerBox = document.getElementById("spinner-box");
const statusBox = document.getElementById("status-box");

$.ajax({
    type: "GET",
    url: '/api/get_status',
    success: (response) => {
        console.log("Status response", response);
    },
    error: (error) => {
        console.log("Error:", error);
    }
})