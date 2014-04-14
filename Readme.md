Beautiful, seamless iframes with seamless.js
---------------------------------------------
A __seamless iframe__ makes it so that visitors are unable to distinguish between content within the iframe and content beside the iframe. __Seamless.js__ is a jQuery library that makes working with iframes easy by doing all the _seamless_ stuff for you automatically. Stuff like...

  * Automatically adds 'seamless' attributes to an iframe.
  * Easy communication between parent page and iframe page.
  * Auto-resizing the iframe to fit the contents of the child page.
  * Loading indicator when the child page is loading.
  * Auto failsafe to open iframe in separate window in case of error.
  * Inject CSS styles into the child pages.
  * Easily manage multiple iframes on the same page.
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
  $(function() {

    // Turns the iframe into a seamless iframe.
    $('#myiframe').seamless();
  });
</script>
```

You can also pass in options to this jQuery library like so...

```
$('#myiframe').seamless({
  loading: 'I am loading!!!!'
});
```

The following parameters are accepted.

  * __loading__ - (string) The text to show when the child page is loading.
  * __spinner__ - (string) The url of the spinner GIF that is shown when the child page is loading.
  * __styles__ - (array of strings) The styles to inject into the child page.
  * __fallback__ - (boolean) If the fallback functionality is enabled.  Default true.
  * __fallbackParams__ - (string) Additional query params to attach to the fallback window when it is opened.
  * __fallbackText__ - (string) A message to show below the child iframe to offer assistance if they are having problems.
  * __fallbackLinkText__ - (string) The string to show within the 'Click here' link to open the fallback window.
  * __fallbackLinkAfter__ - (string) Text to add after the __fallbackLinkText__ link.
  * __fallbackStyles__ - (array) An array of string styles to add to the fallback text when something bad happens.

### Connect Child Page to Parent Page ###
Within the Child Page, you will need to now add the following code to connect the Child Page to the parent page.

```
<script type="text/javascript">

  // Connect to the parent page.
  $.seamless.connect({
    url: 'index.html'
  });
</script>
```

You can also pass in parameters to this like so...

```
$.seamless.connect({
  url: 'index.html',
  container: 'div.content'
});
```

The following parameters are accepted.

  * __url__ - REQUIRED (string) The url of the parent page to connect to.
  * __container__ - (string) The container for the main content on the page which determines the height of the page.
  * __update__ - (int) The milliseconds that an update is created from the child to the parent.
  * __allowStyleInjection__ - (bool) If this page should allow injected styles.


## Communicate ##
Another big part of this library is that it enables communication to both the Child and Parent pages.  This is done
through the __send__ and __receive__ commands.

### Communicate to the Child page from the Parent page. ###
To communicate to the child page from the parent page, you simply need to store the jQuery object that you create. You
can then use it to send and receive events to the child, like so.

```
var child = $('#myiframe').seamless();

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
var parent = $.seamless.connect({
  url: 'index.html'
});

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
with two parameters, _data_ to contain the data, and _complete_ to be called when the resonse has
been made.  Then, within a __receive__ command, you simply return the data you wish to send as
the response.  The code below shows this best...

#### Parent Page ####
```
var child = $('#myiframe').seamless();

child.send({
  data: {
    mydata: 'This is a message'
  },
  complete: function(data) {

    // 'data' is what was returned from the child 'receive' function.
    console.log(data);
  }
});
```

#### Child Page ####
```
var parent = $.seamless.connect({
  url: 'index.html'
});

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
