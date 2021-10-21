"use strict"

// UPLOAD IMAGE using a post request
// Called by the event listener that is waiting for a file to be chosen
function uploadFile() {
  
    //alert("AM ENTERING UPLOAD FILE");
    // get the file chosen by the file dialog control
    const selectedFile = document.getElementById('fileChooser').files[0];
    // store it in a FormData object
    const formData = new FormData();
    // name of field, the file itself, and its name
    formData.append('newImage',selectedFile, selectedFile.name);

    // build a browser-style HTTP request data structure
    const xhr = new XMLHttpRequest();
    // it will be a GET request, the URL will this page's URL+"/upload" 
    xhr.open("POST", "/sendUploadToAPI", true);
  
    // callback function executed when the HTTP response comes back
    xhr.onloadend = function(e) {
        // Get the server's response body
        console.log(xhr.responseText);
        window.sessionStorage.setItem("imageurl", "https://ecs162.org:3000/images/arajkumar/"+selectedFile.name);
        //alert(window.sessionStorage.getItem("imageurl"));
    }
  
    // actually send the request
    xhr.send(formData);
}



function nextData1()
{
  //("nextData");
  var type;
  var urlQuery = window.location.search; //returns ?type=found
  urlQuery = urlQuery.replace("?", ''); //chop off the ?
  //alert("nextData");

  if(urlQuery == 'type=found')
    {  
                type = "found";
    }
  else
    {
      type = "lost";
    }
  
  window.sessionStorage.setItem("title", document.getElementById("name").value);
  window.sessionStorage.setItem("category", document.getElementById("mail").value);
  window.sessionStorage.setItem("description", document.getElementById("bio").value);
  //window.sessionStorage.setItem("type", type);
  
  //alert(window.sessionStorage.getItem("title"));
}

document.getElementById("fileChooser").addEventListener("change",uploadFile);
document.getElementById("NextData1").addEventListener("click",nextData1);
