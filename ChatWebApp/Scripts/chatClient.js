var socket;
$(document).ready(function () {

    //TODO: Enter your Speech API Key here
    var speechApiKey = "5489cc2130e84e5cbea152252c8fef8c";


    var sessionId = "";
    var isListening = false;


    if (!Modernizr.websockets) {
        alert("This browser doesn't support HTML5 Web Sockets!");
        return;
    }


    $("#btnJoin").click(function () {
        var uname = $("#username").val();

        if (uname.length > 0) {
            $("#joinChatPanel").fadeOut();
            $("#chatPanel").fadeIn();
            $("#divHistory").empty();

            openConnection();
        }
        else {
            alert('Please enter a username');
        }
    });

    $("#txtMsg").on("keyup", function (event) {
        if (event.keyCode === 13) {
            $("#btnSend").click();
        }
    });

    $("#btnListen").click(function () {
        if (!isListening) {
            if (!recognizer) {
                Setup();
            }
            console.log("Starting up speech recognition SDK");
            RecognizerStart(SDK, recognizer);
            btnListen.disabled = true;
            console.log("Listening for speech...");
            isListening = true;
        }
    });

    $("#btnSend").click(function () {
        console.info(socket.readyState);
        if (socket.readyState === WebSocket.OPEN) {
            sendChatMessage();
        }
        else {
            $("#divHistory").append('<h3>The underlying connection is closed.</h3>');
        }
    });

    $("#btnLeave").click(function () {
        //disconnect from the chat
        socket.close();

        $("#chatPanel").fadeOut();
        $("#joinChatPanel").fadeIn();
        $("#divHistory").empty();
    });


    function openConnection() {
        //Connnect websocket over SSL if host webpage loaded over SSL
        var socketProtocol = location.protocol === "https:" ? "wss:" : "ws:";
        socket = new WebSocket(socketProtocol + "//" + location.host + "/ws");

        socket.addEventListener("open", function (evt) {
            $("#divHistory").append('Connected to the chat service...');
            joinChatSession();
        }, false);

        socket.addEventListener("close", function (evt) {
            $("#divHistory").append('Connection to the chat service was closed. ' + evt.reason);
        }, false);

        socket.addEventListener("message", function (evt) {
            receiveChatMessage(evt.data);
        }, false);

        socket.addEventListener("error", function (evt) {
            alert(JSON.stringify(evt));
            alert('Error : ' + evt.message);
        }, false);
    }

    var username = "";

    function joinChatSession() {

        $("#chat-room").text($("#listChatRooms").children(':selected').text());
        sessionId = $("#listChatRooms").val();
        username = $("#username").val();

        var msg = {
            sessionId: sessionId,
            username: username,
            type: "join"
        };

        socket.send(JSON.stringify(msg));
    }

    function sendChatMessage() {

        var username = $("#username").val();
        var messageText = $("#txtMsg").val();

        if (messageText.length > 0) {

            var msg = {
                message: messageText,
                sessionId: sessionId,
                username: username,
                type: "chat"
            };

            socket.send(JSON.stringify(msg));

            $("#txtMsg").val('');
        }
    }

    function receiveChatMessage(jsonMessage) {
        var chatMessage = JSON.parse(jsonMessage);

        if (chatMessage.type === "ack") {
            // capture the dynamic session id
            sessionId = chatMessage.sessionId;
        }
        else {
            var chatHistory = $(".chat");
            var htmlChatBubble = "", createDate, initial;
            com.contoso.concierge.addUserIfNeeded(chatMessage.username);
            createDate = new Date(chatMessage.createDate);
            initial = chatMessage.username.substring(0, chatMessage.username.length > 1 ? 2 : 1).toUpperCase();

            if (chatMessage.username !== username) {
                htmlChatBubble = '<li class="chatBubbleOtherUser left clearfix"><span class="chat-img pull-left">';
                htmlChatBubble += '<img src="https://placehold.it/50/' + com.contoso.concierge.getAvatarColor(chatMessage.username) + '/fff&text=' + initial + '" alt="' + chatMessage.username + '" class="img-circle" /></span>';
                htmlChatBubble += '<div class="chat-body clearfix"><div class="header">';
                htmlChatBubble += '<strong class="primary-font">' + chatMessage.username + '</strong><small class="pull-right text-muted">';
                htmlChatBubble += '<span class="glyphicon glyphicon-time"></span>&nbsp;' + createDate.toLocaleTimeString() + '</small></div>';
            }
            else {
                htmlChatBubble = '<li class="chatBubbleMe right clearfix"><span class="chat-img pull-right">';
                htmlChatBubble += '<img src="https://placehold.it/50/e5e5e5/fff&text=' + initial + '" alt="' + chatMessage.username + '" class="img-circle" /></span>';
                htmlChatBubble += '<div class="chat-body clearfix"><div class="header"><small class="text-muted">';
                htmlChatBubble += '<span class="glyphicon glyphicon-time"></span>&nbsp;' + createDate.toLocaleTimeString() + '</small>';
                htmlChatBubble += '<strong class="pull-right primary-font">' + chatMessage.username + '</strong></div>';
            }

            if (chatMessage.score) {
                if (chatMessage.score >= 0.5) {
                    htmlChatBubble += '<p><span class="glyphicon glyphicon-thumbs-up"></span>&nbsp;';
                }
                else {
                    htmlChatBubble += '<p><span class="glyphicon glyphicon-thumbs-down"></span>&nbsp;';
                }
            }
            else {
                htmlChatBubble += '<p>';
            }

            htmlChatBubble += chatMessage.message + '</p>';
            htmlChatBubble += '</div></li>';

            chatHistory.append(htmlChatBubble);
        }
    }



    // ********************** Speech SDK Script **************************

    // On doument load resolve the SDK dependecy
    function Initialize(onComplete) {
        require(["Speech.Browser.Sdk"], function (SDK) {
            onComplete(SDK);
        });
    }

    // Setup the recongizer
    function RecognizerSetup(SDK, recognitionMode, language, format, subscriptionKey) {
        var recognizerConfig = new SDK.RecognizerConfig(
            new SDK.SpeechConfig(
                new SDK.Context(
                    new SDK.OS(navigator.userAgent, "Browser", null),
                    new SDK.Device("SpeechSample", "SpeechSample", "1.0.00000"))),
            recognitionMode, // SDK.RecognitionMode.Interactive  (Options - Interactive/Conversation/Dictation>)
            language, // Supported laguages are specific to each recognition mode. Refer to docs.
            format); // SDK.SpeechResultFormat.Simple (Options - Simple/Detailed)

        // Alternatively use SDK.CognitiveTokenAuthentication(fetchCallback, fetchOnExpiryCallback) for token auth
        var authentication = new SDK.CognitiveSubscriptionKeyAuthentication(subscriptionKey);

        return SDK.CreateRecognizer(recognizerConfig, authentication);
    }

    // Start the recognition
    function RecognizerStart(SDK, recognizer) {
        recognizer.Recognize((event) => {
                switch (event.Name) {
                case "RecognitionTriggeredEvent":
                    UpdateStatus("Initializing");
                    break;
                case "ListeningStartedEvent":
                    UpdateStatus("Listening");
                    break;
                case "RecognitionStartedEvent":
                    UpdateStatus("Listening_Recognizing");
                    break;
                case "SpeechStartDetectedEvent":
                    UpdateStatus("Listening_DetectedSpeech_Recognizing");
                    console.log(JSON.stringify(event.Result)); // check console for other information in result
                    break;
                case "SpeechHypothesisEvent":
                    UpdateChatMessageText(event.Result.Text);
                    console.log(JSON.stringify(event.Result)); // check console for other information in result
                    break;
                case "SpeechEndDetectedEvent":
                    OnSpeechEndDetected();
                    UpdateStatus("Processing_Adding_Final_Touches");
                    console.log(JSON.stringify(event.Result)); // check console for other information in result
                    break;
                case "SpeechSimplePhraseEvent":
                    break;
                case "SpeechDetailedPhraseEvent":
                    break;
                case "RecognitionEndedEvent":
                    OnComplete();
                    UpdateStatus("Idle");
                    console.log(JSON.stringify(event)); // Debug information
                    break;
                }
            })
            .On(() => {
                    // The request succeeded. Nothing to do here.
                },
                (error) => {
                    console.error(error);
                });
    }

    // Stop the Recognition.
    function RecognizerStop(SDK, recognizer) {
        // recognizer.AudioSource.Detach(audioNodeId) can be also used here. (audioNodeId is part of ListeningStartedEvent)
        recognizer.AudioSource.TurnOff();
    }

    var SDK;
    var recognizer;

    Initialize(function (speechSdk) {
        SDK = speechSdk;
        $("#btnListen").button('toggle');
    });

    function Setup() {
        console.log('Setting up speech recognition');
        recognizer = RecognizerSetup(SDK, SDK.RecognitionMode.Interactive, "en-US", SDK.SpeechResultFormat.Simple, speechApiKey);
    }

    function UpdateStatus(status) {
        console.log(status);
    }

    function UpdateChatMessageText(text) {
        $("#txtMsg").val(text);
    }

    function OnSpeechEndDetected() {
        isListening = false;
        RecognizerStop(SDK, recognizer);
        console.log("End of speech detected.");
    }

    function OnComplete() {
        $("#btnListen").attr('disabled', false);
        $("#btnSend").click();   
    }
});