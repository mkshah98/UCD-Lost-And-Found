"use strict"


function SearchFindResults()
{
  
  window.sessionStorage.setItem("FromDate", document.getElementById("FromDate").value);
  window.sessionStorage.setItem("FromTime", document.getElementById("FromTime").value);
  window.sessionStorage.setItem("ToDate", document.getElementById("ToDate").value);
  window.sessionStorage.setItem("ToTime", document.getElementById("ToTime").value);
  window.sessionStorage.setItem("SearchCategory", document.getElementById("SearchCategory").value);
  window.sessionStorage.setItem("SearchLocation", document.getElementById("search-input").value);
  
  //alert(window.sessionStorage.getItem("type"));
  if(window.sessionStorage.getItem("type")=="found")
  {
    window.location.href = "screen9.html";
  }
  else
  {
      window.location.href = "screen10.html";
  }
  
  //window.location.href = "screen9.html";
  //alert(window.sessionStorage.getItem("type"));
}

document.getElementById("SearchFindResults").addEventListener("click",SearchFindResults);
