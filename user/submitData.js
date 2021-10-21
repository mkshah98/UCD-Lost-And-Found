"use strict"

function CheckData()
{
  var date = document.getElementById("date").value;
  var time = document.getElementById("time").value
  var category = window.sessionStorage.getItem("category");
  
  if(!date && !time && !category)
    {
      alert("All fields are empty! Please fill it up.")
    }
  
  else
    {
      SubmitData();
      window.location.href = "finalscreen.html";
    }
}


function SubmitData()
{
  
  let r = Math.random().toString(36).substring(7);
  var myObj = {rowId : r.trim(), lostorfound:window.sessionStorage.getItem("type"), title:window.sessionStorage.getItem("title"), category:window.sessionStorage.getItem("category"), description: window.sessionStorage.getItem("description"), imageurl: window.sessionStorage.getItem("imageurl"), date: document.getElementById("date").value, time: document.getElementById("time").value, location:document.getElementById("search-input").value};
  

  const xhr = new XMLHttpRequest();
  // it will be a POST request, the URL will this page's URL+"/upload" 
  xhr.open("POST", "/SubmitData", true);
  xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
  xhr.onreadystatechange = function()
  {
    if(xhr.readyState===4 && xhr.status === 200)
    {
      var protocol = location.protocol;
      var slashes = protocol.concat("//");
      var host = slashes.concat(window.location.hostname);
      //var resp = host.concat("/display.html?id="+xhr.responseText);
      //alert (xhr.responseText); //responseText = randomly geneated id
      //alert(resp); //the whole url
    }
  };
  var data = JSON.stringify(myObj);
  xhr.send(data);
}

document.getElementById("SubmitData").addEventListener("click",CheckData);
