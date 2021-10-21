"use strict"

//return to login on non - UC Davis email
function parseQueryString()
{
  var urlQuery = window.location.search; //returns ?query=notUCD
  urlQuery = urlQuery.replace("?", ''); //chop off the ?

  if(urlQuery == 'email=notUCD')
    {  
           alert(urlQuery);
           alert('use UC Davis Email');      
    }
}

window.onload=parseQueryString;


