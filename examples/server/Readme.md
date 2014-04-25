This is a test server to test cookies.

Usage
=======
You will need to have node.js installed on your computer to run this server.

To get this working, simply type the following in your terminal in this directory.

  npm install

Next you can run the server by typing.

  sudo node app.js

You can then then test cross-origin cookies by editing your /etc/hosts file and providing
the following.

  127.0.0.1   test.local

You should then be able to test this by opening 'cookie.parent.html' in the examples folder.
