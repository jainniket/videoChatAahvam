(function() {


    var urlargs = urlparams();
    var my_number = PUBNUB.$('my-number');
    var my_name = PUBNUB.$('display-text');
    var user = PUBNUB.$('user');
    my_number.number = urlargs[1];
    my_number.innerHTML = 'Hi ' + urlargs[2];
    my_name.innerHTML = 'Hi ' + urlargs[2];
    var usertype = urlargs[3];
    if(usertype=="assistant"){
        user.innerHTML = ',there are no pending calls.';
        document.getElementById("dial").style.visibility = "hidden";
    }
    else if(usertype=="customer"){
        user.innerHTML = ',how can I help you?';
        document.getElementById("dial").style.visibility = "visible";
    }
    else{

        document.getElementById("dial").style.visibility = "hidden";
    }

    function urlparams() {
        var params = {};
        if (location.href.indexOf('?') < 0) return params;
        var split1 = location.href.split('?')[1];
        var split2 = split1.split('&');
        params[0] = split2[0].split('=')[1];
        params[1] = split2[1].split('=')[1];
        params[2] = split2[2].split('=')[1];
        params[3] = split2[3].split('=')[1];
        console.log(params[0]);
        console.log(params[1]);
        console.log(params[2]);
        console.log(params[3]);
        document.getElementById("main").style.visibility = "hidden";
        document.getElementById("container-loading").style.visibility = "hidden";
        return params;
    }

    var video_out = PUBNUB.$('video-display');
    var phone = window.phone = PHONE({
        number: my_number.number, // listener
        publish_key: 'pub-c-7e8374fa-c696-4180-b7fc-0094ea59e13e',
        subscribe_key: 'sub-c-ee36f868-bd71-11e4-938c-0619f8945a4f',
        ssl: true
    });

    function connected(session) {
        document.getElementById("container-loading").style.visibility = "hidden";
        document.getElementById("container-float").style.visibility = "hidden";
        document.getElementById("main").style.visibility = "visible";
        document.getElementById("dial").style.visibility = "hidden";
        video_out.innerHTML = '';
        video_out.appendChild(session.video);

        console.log("Hi!");
    }

    
    function closingCode() {
        console.log("closed");
        phone.hangup();
        return null;
    }

    window.onunload = window.onbeforeunload = (function(){closingCode()});

    


    function ended(session) {
        //set_icon('facetime-video');
        //img_out.innerHTML = '';
        //console.log("Bye!");
        alert("The User has disconnected");
        document.getElementById("container-loading").style.visibility = "hidden";
        document.getElementById("container-float").style.visibility = "visible";
        document.getElementById("main").style.visibility = "hidden";
        if(usertype=="assistant"){
        user.innerHTML = ',there are no pending calls.';
        document.getElementById("dial").style.visibility = "hidden";
    }
    else if(usertype=="customer"){
        user.innerHTML = ',how can I help you?';
        document.getElementById("dial").style.visibility = "visible";
    }
    else{

        document.getElementById("dial").style.visibility = "hidden";
    }
    }

    function set_icon(icon) {
        video_out.innerHTML = '<span class="glyphicon glyphicon-' +
            icon + '"></span>';
    }


    function dial(number) {
        var session = phone.dial(number);
        if (!session) return;

        // Show Connecting Status
        set_icon('send');
        document.getElementById("container-float").style.visibility = "hidden";
        document.getElementById("main").style.visibility = "hidden";
        document.getElementById("container-loading").style.visibility = "visible";
        document.getElementById("dial").style.visibility = "hidden";

    }


    phone.ready(function() {

        set_icon('facetime-video');

        // Auto Call
        // if ('call' in urlargs) {
        //     var number = urlargs['call'];
        //     PUBNUB.$('number').value = number;
        //     dial(number);
        // }

        PUBNUB.bind('mousedown,touchstart', PUBNUB.$('dial'), function() {
            console.log("pressed dial");
            var number = urlargs[0];
            dial(number);
        });

        PUBNUB.bind('mousedown,touchstart', PUBNUB.$('hangup'), function() {
            console.log("pressed end");
            
            document.getElementById("container-loading").style.visibility = "hidden";
        document.getElementById("container-float").style.visibility = "visible";
        document.getElementById("main").style.visibility = "hidden";
        phone.hangup();
        //location.reload();
        });

    });

    phone.receive(function(session) {
        if (usertype === "assistant") {
            alert("Pick Call");
        }
        document.getElementById("container-loading").style.visibility = "hidden";
        document.getElementById("container-float").style.visibility = "hidden";
        document.getElementById("main").style.visibility = "visible";
        session.message(message);
        session.connected(connected);
        session.ended(ended);
    });



    var chat_in = PUBNUB.$('pubnub-chat-input');
    var chat_out = PUBNUB.$('pubnub-chat-output');

    PUBNUB.bind('keydown', chat_in, function(e) {

        if ((e.keyCode || e.charCode) !== 13) return true;
        if (!chat_in.value.replace(/\s+/g, '')) return true;

        phone.send({
            text: chat_in.value
        });
        add_chat(urlargs[2] + " (Me)", chat_in.value);
        chat_in.value = '';
    })


    function add_chat(number, text) {
        if (!text.replace(/\s+/g, '')) return true;

        var newchat = document.createElement('div');
        newchat.innerHTML = PUBNUB.supplant(
            '<strong>{number}: </strong> {message}', {
                message: safetxt(text),
                number: safetxt(number)
            });
        chat_out.appendChild(newchat, chat_out.lastChild);
        updateScroll();
    }


    function message(session, message) {
        add_chat(session.number, message.text);
    }

    function safetxt(text) {
        return ('' + text).replace(/[<>]/g, '');
    }

    function updateScroll() {
        var element = document.getElementById("pubnub-chat-output");
        element.scrollTop = element.scrollHeight;
    }

    phone.unable(function(details) {
        console.log("Alert! - Reload Page.");
        console.log(details);
        set_icon('remove');
    });

    phone.debug(function(details) {
        // console.log(details);
    });
    var hook = true;
      window.onbeforeunload = function() {
          phone.hangup();
            window.close();
      }

})();
