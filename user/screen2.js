"use strict"

//let msg = document.getElementById("cookieMessage");
//msg.textContent = msg.textContent + decodeURIComponent(document.cookie);


function FoundUpdateType()
{
  window.sessionStorage.setItem("type", "found");
  //alert(window.sessionStorage.getItem("type"));
}

function LostUpdateType()
{
  window.sessionStorage.setItem("type", "lost");
}

document.getElementById("Found").addEventListener("click",FoundUpdateType);
document.getElementById("Lost").addEventListener("click",LostUpdateType);
