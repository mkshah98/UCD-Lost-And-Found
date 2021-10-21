# UCD-Lost-And-Found

### Google Passport Example
This app is a building block for using Google's OAuth 2.0 login protocol, with the Node Passport module.

### Getting set up and running
You will need to create a project on Google Cloud Services, and enable this project to do OAuth 2.0 login. As part of this process you will:

Give Google the URLs of this app, and of an intermediate route which it will use in the login process

Get a client ID and secret (these are like the API keys), and add them in the .env file. See the detailed instructions.

You also have to edit server.js to send Google the redirect address with your app's name in it. Look for where it says "CHANGE THE FOLLOWING LINE".

Files in the user/ directory are protected and available only to users who are logged in.

Files in /public are available to the whole world, as usual.

### Authorship
Based on Jared Hanson's passport-google-oauth20 exmaple.

Original Glitch App Made by Fog Creek mission-control-login

Remixed and modified by Nina Amenta for ECS 162

<-------------------------------->

### Team Members:

Tanvi Chandra Manan Shah

Comments From The Team To The Grader :

The SQL seems to be very picky when searching the database - especially because of the date and time. Please do check the log if nothing shows up on the results page; if we receive a non - empty response it should definitely show up on the page. If nothing shows up that means the SQL did not find a match and the log will show that it returned an empty string. In other words, screen 9 and screen 10 has been implemented so that only matches show up; if there are no matches nothing will show up at all.

Did not use Bootstrap although started with it, but got to know it wasn't allowed. So the classes names might suggest Bootstrap was used, but it wasn't. Might have left some Bootstrap like looking things here and there by mistake, but they don't do anything. Thank you.

In maps part you can drag and drop the pin and the location will be shown in the text area above.

If the html pages don't show up because of errors or something, please check them out using - https://tartan-bow-radiator.glitch.me/user/screen9.html - and to view other screens just change the screen number to whichever screen.
