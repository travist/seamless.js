Beautiful, seamless iframes with seamless.js
---------------------------------------------
A __seamless iframe__ makes it so that visitors are unable to distinguish between content within the iframe and content beside the iframe. __Seamless.js__ is a JavaScript library (with no dependencies) that makes working with iframes easy by doing all the _seamless_ stuff for you automatically. Stuff like...

  * Automatically adds 'seamless' attributes to an iframe.
  * Easy communication between parent page and iframe page.
  * Auto-resizing the iframe to fit the contents of the child page.
  * Loading indicator when the child page is loading.
  * Auto failsafe to open iframe in separate window in case of error.
  * Inject CSS styles into the child pages.
  * Easily manage multiple iframes on the same page.
  * Creates a fallback for child pages that block cross-origin cookies. (Safari)
  * Allow the child page to pop out of the parent page.

Definitions
=======================
Throughout this document you will see the following definitions.  It is important that you know what they mean.

  * __Parent Page__ - The page that contains the iframe(s).
  * __Child Page__ - The page that the iframe is referencing, hence it is a child page of the parent page.

How to use:
=======================
First, you will need to include this library in both the Parent and Child pages.

## Setup ##
### Parent Page Header ###
Assuming you have this library in a _seamless_ directory, you will need to include the following in the Parent page.

```
<script src="seamless/build/seamless.parent.min.js"></script>
```

### Child Page Header ####
You will now need to include the child version in all the child pages.

```
<script src="seamless/build/seamless.child.min.js"></script>
```

## Connect ##
### Create Parent Seamless IFrame ###
You can now use the following code within the Parent Page to turn your iframes into __seamless__ iframes.

```
<script type="text/javascript">
  window.onload = function() {
    // Turns the iframe into a seamless iframe.
    window.seamless(document.getElementById('myiframe'));
  };
</script>

<iframe id="myiframe" src="childpage.html"></iframe>
```

Or, if you use **jQuery**, you can use it like so (jQuery is not required to use this library)...

```
<script type="text/javascript">
  $(function() {
    $('#myiframe').seamless();
  });
</script>
<iframe id="myiframe" src="childpage.html"></iframe>
```

You can also pass in options to the library like so...

```
window.seamless(document.getElementById('myiframe'), {
  loading: 'I am loading!!!!'
});
```

Or, using **jQuery**

```
$('#myiframe').seamless({
  loading: 'I am loading!!!!'
});
```

The following parameters are accepted.

  * __loading__ - The text to show when the child page is loading.
    * _type_: string
    * _required_: false
    * _default_: 'Loading ...'
  * __spinner__ - The url of the spinner GIF that is shown when the child page is loading.
    * _type_: string
    * _required_: false
    * _default_: 'http://www.travistidwell.com/seamless.js/src/loader.gif'
  * __showLoadingIndicator__ - Show or not the loading indicator.
    * _type_: bool
    * _required_: false
    * _default_: true
  * __onConnect__ - Called when a child iframe has finished connecting.
    * _type_: function
    * _required_: false
    * _default_: null
  * __styles__ - The styles to inject into the child page.
    * _type_: array of strings
    * _required_: false
    * _default_: []
  * __fallback__ - If the fallback functionality is enabled.
    * _type_: bool
    * _required_: false
    * _default_: true
  * __fallbackParams__ - Additional query params to attach to the fallback window when it is opened.
    * _type_: string
    * _required_: false
    * _default_: ''
  * __fallbackText__ - A message to show below the child iframe to offer assistance if they are having problems.
    * _type_: string
    * _required_: false
    * _default_: ''
  * __fallbackLinkText__ - The string to show within the 'Click here' link to open the fallback window.
    * _type_: string
    * _required_: false
    * _default_: 'Click Here'
  * __fallbackLinkAfter__ - Text to add after the __fallbackLinkText__ link.
    * _type_: string
    * _required_: false
    * _default_: ' to open in a separate window.'
  * __fallbackStyles__ - An array of string styles to add to the fallback text when something bad happens.
    * _type_: array of strings
    * _required_: false
    * _default_: ```[
      'padding: 15px',
      'border: 1px solid transparent',
      'border-radius: 4px',
      'color: #3a87ad',
      'background-color: #d9edf7',
      'border-color: #bce8f1'
    ]```
  * __fallbackLinkStyles__ - An array of string styles to add to the fallback link.
    * _type_: array of strings
    * _required_: false
    * _default_: ```[
      'display: inline-block',
      'color: #333',
      'border: 1px solid #ccc',
      'background-color: #fff',
      'padding: 5px 10px',
      'text-decoration: none',
      'font-size: 12px',
      'line-height: 1.5',
      'border-radius: 6px',
      'font-weight: 400',
      'cursor: pointer',
      '-webkit-user-select: none',
      '-moz-user-select: none',
      '-ms-user-select: none',
      'user-select: none'
    ]```
  * __fallbackLinkHoverStyles__ - An array of string styles to add to the fallback link on hover.
    * _type_: array of strings
    * _required_: false
    * _default_: ```[
      'background-color:#ebebeb',
      'border-color:#adadad'
    ]```
  * __fallbackWindowWidth__ - The width of the window that is opened up for the fallback.
    * _type_: int
    * _required_: false
    * _default_: 960
  * __fallbackWindowHeight__ - The height of the window that is opened up for the fallback.
    * _type_: int
    * _required_: false
    * _default_: 800

### Connect Child Page to Parent Page ###
Within the Child Page, you will need to now add the following code to connect the Child Page to the parent page.

```
<script type="text/javascript">

  // Connect to the parent page.
  window.seamless.connect();
</script>
```

You can also pass in parameters to this like so...

```
window.seamless.connect({
  container: 'div.content'
});
```

The following parameters are accepted.

  * __url__ - The url of the parent page to connect to.
    * _type_: string
    * _required_: false
    * _default_: ''
  * __container__ - The container for the main content on the page which determines the height of the page.
    * _type_: string
    * _required_: false
    * _default_: 'body'
  * __update__ - The milliseconds that an update is created from the child to the parent.
    * _type_: int
    * _required_: false
    * _default_: 200
  * __allowStyleInjection__ - If this page should allow injected styles.
    * _type_: bool
    * _required_: false
    * _default_: false
  * __requireCookies__ - If the child page requires cookies (See [Child iFrame Cookie Problem](https://github.com/travist/seamless.js#child-iframe-cookie-problem) section)
    * _type_: bool
    * _required_: false
    * _default_: false
  * __cookieFallbackMsg__ - The message to show if the cookie test fails.
    * _type_: string
    * _required_: false
    * _default_: 'Your browser requires this page to be opened in a separate window.'
  * __cookieFallbackLinkMsg__ - The text to place inside the link to have them open a new window if the cookie test fails.
    * _type_: string
    * _required_: false
    * _default_: 'Click Here'
  * __cookieFallbackAfterMsg__ - The text to place after the link when the cookie test fails.
    * _type_: string
    * _required_: false
    * _default_: ' to open in a separate window.'
  * __onUpdate__ - Callback that is called when an update is triggered to the parent.
    * _type_: function
    * _required_: false
    * _default_: null
  * __onConnect__ - Called when the parent connects to this iframe.
    * _type_: function
    * _required_: false
    * _default_: null



## Communicate ##
Another big part of this library is that it enables communication to both the Child and Parent pages.  This is done
through the __send__ and __receive__ commands.

### Communicate to the Child page from the Parent page. ###
To communicate to the child page from the parent page, you simply need to store the jQuery object that you create. You
can then use it to send and receive events to the child, like so.

```
var child = window.seamless(document.getElementById('myiframe'));

// Send a message
child.send({
  myparam: 'This is anything you want it to be...'
});

// Receive a message
child.receive(function(data, event) {

  // Print out the data that was received.
  console.log(data);
});
```

### Communicate to the Parent page from the Child page. ###
Inversely, you can easily communicate to the parent page from the child page like so...

```
var parent = window.seamless.connect();

// Send a message
parent.send({
  myparam: 'This is anything you want it to be...'
});

// Receive a message
parent.receive(function(data, event) {

  // Print out the data that was received.
  console.log(data);
});
```

### Send Responses ###
The last way to communicate is through a 'send' response, where you can receive a response
from a send command.  To do this, you simply need to pass along an object to the __send__ method
with two parameters, _data_ to contain the data, and _success_ to be called when the resonse has
been made.  Then, within a __receive__ command, you simply return the data you wish to send as
the response.  The code below shows this best...

#### Parent Page ####
```
var child = window.seamless(document.getElementById('myiframe'));

child.send({
  data: {
    mydata: 'This is a message'
  },
  success: function(data) {

    // 'data' is what was returned from the child 'receive' function.
    console.log(data);
  }
});
```

#### Child Page ####
```
var parent = window.seamless.connect();

// Receive a message
parent.receive(function(data, event) {

  // Print out the data that was received.
  console.log(data);

  // Now return something for the response.
  return {
    myresponse: "I'm listening..."
  };
});
```

### Using with jQuery ###
You can also use this library with jQuery where you can call the ```seamless``` method on the
iframe jQuery element like so.

```
$('#myiframe').seamless();
```

Also, within the child page, you can refer to the seamless class like so.

```
$.seamless
```

### Child iFrame Cookie Problem ###
Some browsers (Safari) have an issue where by default they do not allow cookies within the
child iframe if it is a cross-origin domain within the child iframe.  This library solves this
problem by creating a fallback text to prompt the user to open up the child iframe in a separate
window.  Although this is not ideal, it is also not malicious where it is performing actions
without the user knowing and prompts them to actually open up the separate window.

This is only necessary if the child iframe requires cookies, so for that reason, this is not
a default option.  To turn this on, add the following parameter to the child iframe.

```
window.seamless.options.requireCookies = true;
```
