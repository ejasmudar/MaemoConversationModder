/**
 * @file MessagingWidgetsSMSConversation.js
 *
 * Javascript for messaging rendering widget's ring buffer.
 */

/*
 * This file is part of rtcom messaging ui
 *
 * Copyright (C) 2009 Nokia Corporation. All rights reserved.
 *
 * Contact: Naba Kumar <naba.kumar@nokia.com>
 *
 * This software, including documentation, is protected by copyright
 * controlled by Nokia Corporation. All rights are reserved.
 * Copying, including reproducing, storing, adapting or translating,
 * any or all of this material requires the prior written consent of
 * Nokia Corporation. This material also contains confidential
 * information which may not be disclosed to others without the prior
 * written consent of Nokia.
 */

/**
 * Globals:
 *
 * @myBatchRequested:
 *  if HISTORY_FETCHING_NOREQUEST, no batch has been requested.
 *   if HISTORY_FETCHING_DONE, history fetching done; no more request to give.
 *   if > 0, request in progress and the amount requested.
 *
 * @myBatchesAdded: Number of message batches retrieved from log.
 *
 * @myShowTimes: Display method for time stamps, set to 'inline' to show
 *               and 'none' to hide
 *
 **/

var HISTORY_BATCH_SIZE = 30;
var HISTORY_PAGE_SIZE = 15;
var HISTORY_SCREENFULL_SIZE = 8;
var HISTORY_FETCHING_DONE = -1;
var HISTORY_FETCHING_NOREQUEST = 0;

var myBatchRequested = 0;

var myShowTimes    = "inline";

var myBatchesAdded = 0;

var myMaxMessages  = -1;

var markupTemplateSelf;
var markupTemplateOther;

var messagesBuffer = new Array();
var pastPresenceAnchor = new Array();
var firstFlush = true;
var flushTimeout = 0;

var lastClickedBubble = null;

var storedWindowHeight = 340;

/**
 * MessagingWidgetsSMSConversation_alert:
 * @str Parameter to set for alert() call
 *
 * Custom, error safe alert call. Apparently with some version mismatches, the
 * alert() javascript function sometimes fails. This is to prevent alert()
 * failure to prevent rest of the script execution.
 *
 * For functionality, that actually depends on alert() call to succeed this
 * is not helpful, rather it's another way of creating a malfuction that is
 * harder to detect.
 **/
function MessagingWidgetsSMSConversation_alert(str)
{
        alert(str);
}

/**
 * MessagingWidgetsSMSConversation_init:
 *
 * Called when the page has actually been loaded.
 * Acts as a "constructor", could be used for creating the template item and
 * getting the element where we will add the children in the page.
 *
 * However, creating such template items doesn't seem so simple, we would
 * need several of them in order to be able to keep it really usable.
 **/
function MessagingWidgetsSMSConversation_init ()
{
    /* Setting onscroll handler to window */
    window.onscroll = MessagingWidgetsRenderer_onScroll;

    /* Setting onresize handler to window */
    window.onresize = MessagingWidgetsRenderer_onResize;

    /* setting body onmousedown for clearing stored message id on ui side */
    document.body.onmousedown = MessagingWidgetsRenderer_messagePressBody;

    if (!markupTemplateSelf)
    {
        markupTemplateSelf = document.getElementById("MessageContainerSelf");
        markupTemplateSelf.parentNode.removeChild(markupTemplateSelf);
        markupTemplateSelf.removeAttribute('id');
        markupTemplateOther = document.getElementById("MessageContainerOther");
        markupTemplateOther.parentNode.removeChild(markupTemplateOther);
        markupTemplateOther.removeAttribute('id');
    }
}


/**
 * MessagingWidgetsRenderer_messageClicked:
 * @event:
 * @id:
 *
 * Message area clicked
 **/
function MessagingWidgetsRenderer_messageClicked (event)
{
    var x = event.target;
    var idstr;

    /* Only handle clicks on message blocks, not on URIs */
    if (x.href == "" || (!x.href && !x.parentNode.href)){
    }else{
        return true;
    }

    idstr = "file://id:"+event.currentTarget.id;
    MessagingWidgetsSMSConversation_alert(idstr);

    MessagingWidgetsRenderer_clearHighlight(event.currentTarget.id);

    event.returnValue = true;
    event.cancelBubble = false;
}

function MessagingWidgetsRenderer_messagePress (event)
{
    var idstr;

    idstr = "file://pre-id:"+event.currentTarget.id;

    MessagingWidgetsSMSConversation_alert(idstr);

    /* The popup menu posted from C code seems to steal events
       and when the popup is closed, the message remains highlighted.
       Workaround: use a 2-second timeout to clear highlight.
    */
    setTimeout("MessagingWidgetsRenderer_clearHighlight()", 2000);

    event.returnValue = true;
    /* Canceling bubble so body onmousedown isn't called */
    event.cancelBubble = true;
}

/**
 * MessagingWidgetsRenderer_messagePressBubble:
 * @event: An onmousedown event
 * Highlight message bubble when pressed.
 */
function MessagingWidgetsRenderer_messagePressBubble (event)
{
    var block;

    MessagingWidgetsRenderer_clearHighlight(event.currentTarget.id);

    block = document.getElementById(event.currentTarget.id);
    if (block) {
	block.className = block.clickedClassName;
	lastClickedBubble = block;
    }

    event.returnValue = true;
    /* Canceling bubble so body onmousedown isn't called */
    event.cancelBubble = false;
}


/**
 * MessagingWidgetsRenderer_messagePressBubble:
 * @event: (Usually) an onmouseup event
 * Message bubble is not pressed any more - clear highlighting.
 */
function MessagingWidgetsRenderer_messageReleaseBubble (event)
{
    MessagingWidgetsRenderer_clearHighlight();

    event.returnValue = true;
    event.cancelBubble = false;
}


/**
 * MessagingWidgetsRenderer_clearHighlight:
 * @elem_id: (optional) Don't clear if @elem_id is currently highlighted.
 *
 * Remove highlighting from highlighted element, if any.
 */
function MessagingWidgetsRenderer_clearHighlight (/* [elem_id] */)
{
    if (lastClickedBubble) {
	if (arguments.length >= 0) {
	    var elem_id = arguments[0];
	    var elem = document.getElementById(elem_id);
	    if (elem && elem == lastClickedBubble) {
		return;
	    }
	}
	lastClickedBubble.className = lastClickedBubble.normalClassName;
	lastClickedBubble = null;
    }
}

function MessagingWidgetsRenderer_messagePressBody (event)
{
    var idstr;

    MessagingWidgetsSMSConversation_alert("file://pre-id:None");

    event.returnValue = true;
    event.cancelBubble = false;
}

function MessagingWidgetsRenderer_avatarClicked (event)
{
    MessagingWidgetsSMSConversation_alert(event.currentTarget.id);

    event.returnValue = true;
    event.cancelBubble = false;
}

/*
 * Fixes presence...
 */
function
MessagingWidgetsRenderer_fixPresence (
    self, presence_img, presence, contact_info_str, add_to_top)
{
    var presenceID = "PresenceImg" + contact_info_str;
    if (!self) {
        if (presence_img) {

            presence_img.id = presenceID;

            if (presence != null && presence != "") {
                presence_img.src = presence;
            }

            /* Find current presence anchor in document */
            var prevPresence = document.getElementById (presenceID);
            if (add_to_top) {

                /* If we are adding a history, check if presence anchor is
                 * already present in document (presumably added at bottom
                 * from pending messages) or in pastPresenceAnchor which
                 * remebers if we already created the anchor (it should
                 * not be re-created if already created when populating
                 * history).
                 */
                if (prevPresence ||
                    pastPresenceAnchor[contact_info_str] == true) {
                    /*
                     * Presence is already anchored; remove it from this item.
                     */
                    presence_img.parentNode.removeChild (presence_img);
                } else{
                    /*
                     * There is no anchor found, either in document or in
                     * previously anchored, so leave presence node intact
                     * in this item and record that anchor is already set.
                     */
                    pastPresenceAnchor[contact_info_str] = true;
                }
            } else {
                /* If we found a previous presence icon, we remove that.
                 * this one replaces the anchor
                 */
                if (prevPresence) {
                    prevPresence.parentNode.removeChild (prevPresence);
                }
            }
        }
    } else if (presence_img) {
        presence_img.parentNode.removeChild (presence_img);
    }
}

/**
 * MessagingWidgetsRenderer_messageNode:
 * @item:             The message.
 * @add_to_top:       Add the new message to the top of the list
 *
 * Creates a message node
 **/
function
MessagingWidgetsRenderer_messageNode (item, add_to_top)
{
    /* Top level items */
    var new_message;

    /* Avatar data */
    var avatar_img;

    /* The graphics */
    var bubble_cell;

    /* Presence icon and name area */
    var presence_img = null;
    var name_tag;

    /* Message text content */
    var message_txt;

    /* Time stamps and potential icons */
    var time_tag;
    var delivery_time_tag;
    var business_img;
    var status_img;

    var party;
    var count;

    if (!markupTemplateSelf) {
        MessagingWidgetsSMSConversation_init();
    }

    if (item.type != 0) {
        MessagingWidgetsSMSConversation_alert("Only type 0 is allowed");
        return;
    }

    if (item.self == true) {
        party = "Self";
        new_message = markupTemplateSelf.cloneNode(true);

        /* Finally, append the whole message to the document */
        new_message.id = "Message" + item.id_str;
        new_message.onmousedown = MessagingWidgetsRenderer_messagePress;

        /* Retrieve the elements to update */
        var node_tags = new_message.getElementsByTagName('*');
        for (var i = 0; i < node_tags.length; i++) {
            if (node_tags[i].hasAttribute('id')) {
                var id = node_tags[i].getAttribute('id');
                if (id == ("AvatarImg" + party))
                    avatar_img = node_tags[i];
                if (id == ("Message" + party))
                    bubble_cell = node_tags[i];
                if (id == ("MessagePresence" + party))
                    presence_img = node_tags[i];
                if (id == ("MessageSenderName" + party))
                    name_tag = node_tags[i];
                if (id == ("MessageText" + party))
                    message_txt = node_tags[i];
                if (id == ("MessageTimeStamp" + party))
                    time_tag = node_tags[i];
                if (id == ("MessageBusinessCardImg" + party))
                    business_img = node_tags[i];
                if (id == ("MessageDeliveryTimeStamp" + party))
                    delivery_time_tag = node_tags[i];
                if (id == ("MessageStatusImg" + party))
                    status_img = node_tags[i];
            }
        }

    } else {
        party = "Other";
        new_message = markupTemplateOther.cloneNode(true);

        /* Finally, append the whole message to the document */
        new_message.id = "Message" + item.id_str;
        new_message.onmousedown = MessagingWidgetsRenderer_messagePress;

        /* Retrieve the elements to update */
        var node_tags = new_message.getElementsByTagName('*');
        for (var i = 0; i < node_tags.length; i++) {
            if (node_tags[i].hasAttribute('id')) {
                var id = node_tags[i].getAttribute('id');
                if (id == ("AvatarImg" + party))
                    avatar_img = node_tags[i];
                if (id == ("Message" + party))
                    bubble_cell = node_tags[i];
                if (id == ("MessagePresence" + party))
                    presence_img = node_tags[i];
                if (id == ("MessageSenderName" + party))
                    name_tag = node_tags[i];
                if (id == ("MessageText" + party))
                    message_txt = node_tags[i];
                if (id == ("MessageTimeStamp" + party))
                    time_tag = node_tags[i];
                if (id == ("MessageBusinessCardImg" + party))
                    business_img = node_tags[i];
                if (id == ("MessageDeliveryTimeStamp" + party))
                    delivery_time_tag = node_tags[i];
                if (id == ("MessageStatusImg" + party))
                    status_img = node_tags[i];
            }
        }

        avatar_img.id = "avatar:" + item.contact_info_str;
    }
    bubble_cell.id = item.id_str;
    message_txt.id = "MessageText" + item.id_str;
    name_tag.id = "MessageSenderName" + item.id_str;
    business_img.id = "MessageBusinessCardImg" + item.id_str;
    time_tag.id = "MessageTimeStamp" + item.id_str;
    delivery_time_tag.id = "MessageDeliveryTimeStamp" + item.id_str;
    status_img.id = "MessageStatusImg" + item.id_str;
    message_txt.setAttribute("dir", item.text_dir);

    /* Creation of an avatar image */
    if (item.self == false) {
        if (item.avatar != "") {
            avatar_img.style.backgroundImage =  "url('"+item.avatar+"')";
            avatar_img.onclick = MessagingWidgetsRenderer_avatarClicked;
        }
    }

    /* The bubble content */
    bubble_cell.normalClassName = bubble_cell.className;
    bubble_cell.clickedClassName = bubble_cell.className +
	    "Clicked MessagingBubbleClickedBackgroundColor MessagingBubbleBorderColor";
    bubble_cell.onclick = MessagingWidgetsRenderer_messageClicked;
    bubble_cell.onmousedown = MessagingWidgetsRenderer_messagePressBubble;
    bubble_cell.onmouseup = MessagingWidgetsRenderer_messageReleaseBubble;

    if (item.name_str != "") {
        name_tag.textContent = item.name_str;
    }

    message_txt.innerHTML = item.message_str.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

    if (item.business_icon != "") {
        business_img.src = item.business_icon;
    }

    time_tag.style.display = myShowTimes;
    time_tag.innerHTML = item.time_str;

    delivery_time_tag.style.display = myShowTimes;
    delivery_time_tag.innerHTML = item.delivery_str;

    if (item.status_icon != "") {
        status_img.src = item.status_icon;
        status_img.style.display = "inline";
    } else {
        /* Hiding element, so it's paddings etc don't affect timestamp */
        /* placement. It gets hidden in SetTimes() also */
        status_img.src = "";
        status_img.style.display = "none";
    }

    /* FIXME: Move it somewhere appropriate */
    MessagingWidgetsRenderer_fixPresence(item.self, presence_img, item.presence,
                                         item.contact_info_str, add_to_top);

    return new_message;
}

/**
 * MessagingWidgetsRenderer_messageObject:
 * @type:             Type of the message (normal/action/notice/autoreply)
 * @time_str:         The time string to show in the screen
 * @delivery_str:     The delivery time string to possibly show in the screen
 * @name_str:         The name string to show in the screen
 * @message_str:      The actual message to show
 * @self:             TRUE if message is from self
 * @id_str:           The ID of the message for access
 * @avatar:           path(/url?) to avatar image
 * @presence:         presence icon of sender
 * @business_icon:    path to business card icon
 * @status_icon:      path to message status icon (pending/failed)
 * @contact_info_str: Additional contact information
 * @text_dir:         Text direction ("ltr" or "rtl")
 *
 * Creates a message object.
 **/
function
MessagingWidgetsRenderer_messageObject (
    type, time_str, delivery_str, name_str, message_str, self, id_str,
    avatar, presence, business_icon, status_icon, contact_info_str, text_dir)
{
    this.type = type;
    this.time_str = time_str;
    this.delivery_str = delivery_str;
    this.name_str = name_str;
    this.message_str = message_str;
    this.self = self;
    this.id_str = id_str;
    this.avatar = avatar;
    this.presence = presence;
    this.business_icon = business_icon;
    this.status_icon = status_icon;
    this.contact_info_str = contact_info_str;
    this.text_dir = text_dir;
}

/*
 * Flushes the given amount of messages from the buffer to renderer
 */
function
MessagingWidgetsRenderer_flushBuffer (amount)
{
    if (messagesBuffer.length > 0) {
        if (amount < 0)
            amount = messagesBuffer.length;
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < amount; i++) {
            if (messagesBuffer.length <= 0)
                break;

            var item = messagesBuffer.shift();
            new_message = MessagingWidgetsRenderer_messageNode (item, true);

            if (fragment.childNodes.length > 0)
                fragment.insertBefore(new_message, fragment.firstChild);
            else
                fragment.appendChild(new_message);
        }

        /* Restore scroll position */
        var savedScrollPos =
            document.body.scrollHeight - window.pageYOffset;
        document.body.insertBefore(fragment, document.body.firstChild);
        window.sizeToContent();
        window.scrollTo(0, (document.body.scrollHeight - savedScrollPos));
    }
}

/* Scroll event handler to potentially add more past history */
function
MessagingWidgetsRenderer_onScroll ()
{
    MessagingWidgetsRenderer_clearHighlight();

    /* Buffer flushing if there isn't already one running. */
    if (window.pageYOffset < 100 && messagesBuffer.length > 0) {

        /* Add a page of messages (about 4 screen-full) to renderer */
        MessagingWidgetsRenderer_flushBuffer(HISTORY_PAGE_SIZE);
    }

    /* If we run out of messages in buffer and history hasn't finished,
     * request for more
     */
    if (messagesBuffer.length == 0 &&
        myBatchRequested == HISTORY_FETCHING_NOREQUEST &&
        myBatchesAdded > 0)
    {
        myBatchRequested = HISTORY_BATCH_SIZE;
        alert("history-request:" + HISTORY_BATCH_SIZE);
    }
}

/* When conversation view editor expands/shrinks, scroll accordingly to */
/* keep the the bottom position of the screen fixed. */
function
MessagingWidgetsRenderer_onResize (event)
{
    if (Math.abs(storedWindowHeight - window.innerHeight) != 0) {
        window.scrollBy(0, storedWindowHeight - window.innerHeight);
        storedWindowHeight = window.innerHeight;
    }
}

/**
 * MessagingWidgetsRenderer_addMessage:
 * @type:             Type of the message (normal/action/notice/autoreply)
 * @time_str:         The time string to show in the screen
 * @delivery_str:     The delivery time string to possibly show in the screen
 * @name_str:         The name string to show in the screen
 * @message_str:      The actual message to show
 * @self:             TRUE if message is from self
 * @id_str:           The ID of the message for access
 * @avatar:           path(/url?) to avatar image
 * @presence:         presence icon of sender
 * @business_icon:    path to business card icon
 * @status_icon:      path to message status icon (pending/failed)
 * @contact_info_str: Additional contact information
 * @add_to_top:       Add the new message to the top of the list
 * @text_dir:         Text direction ("ltr" or "rtl")
 *
 * Queues messages to buffer and triggers flush schedule. Also forces
 * an immediate flush if there are 8 messages already in buffer for
 * the first time. It's a screenful of messages shown to the user in
 * first opportunity.
 **/
function
MessagingWidgetsRenderer_addMessage (
    type, time_str, delivery_str, name_str, message_str, self, id_str,
    avatar, presence, business_icon, status_icon, contact_info_str, add_to_top,
    text_dir)
{
    var item =
        new MessagingWidgetsRenderer_messageObject (type, time_str,
                                                    delivery_str,
                                                    name_str, message_str,
                                                    self, id_str, avatar,
                                                    presence, business_icon,
                                                    status_icon,
                                                    contact_info_str,
                                                    text_dir);

    if (add_to_top) {
        /* Queue the top (history) message in buffer. */
        messagesBuffer[messagesBuffer.length] = item;

        /* Force flush if there's already screenful of messages to show for
         * the first time.
         */
        if (firstFlush == true &&
            messagesBuffer.length >= HISTORY_SCREENFULL_SIZE)
        {
            firstFlush = false;
            MessagingWidgetsRenderer_flushBuffer(HISTORY_SCREENFULL_SIZE);
      }
    } else {
        /* If the message is bottom, add it directly without queuing. */
        var new_message =
            MessagingWidgetsRenderer_messageNode (item, false);

        document.body.appendChild (new_message);

        window.sizeToContent();

        /* scrolling to new message, if the view is close to bottom, or */
        /* sent by self. If not, we don't scroll */
        if (document.body.scrollHeight - window.pageYOffset < 640 || self) {
            new_message.scrollIntoView (false);
        }
    }
}

/**
 * MessagingWidgetsRenderer_batchAdded:
 * @messages_fetched: Number of messages fetched from log. Note that all
 *                    fetched messages are not necessarily added to the view.
 *
 * History batch has been added to renderer
 **/
function MessagingWidgetsRenderer_batchAdded (messages_fetched)
{
    myBatchesAdded++;

    /* Force flush if there hasn't been anything shown yet.
     * This happens because the first batch was smaller than
     * HISTORY_SCREENFULL_SIZE.
     */
    if (firstFlush == true && messagesBuffer.length >= 0) {
        firstFlush = false;
        MessagingWidgetsRenderer_flushBuffer(-1);
    }

    /* If there was no request made, then it's the first batch pushed.
     * The subsequent batch is requested after a delay of 1s to allow
     * first screenfull to be rendered properly.
     */
    if (myBatchRequested == HISTORY_FETCHING_NOREQUEST) {
        if (flushTimeout != 0)
            clearTimeout(flushTimeout);
        flushTimeout = setTimeout("MessagingWidgetsRenderer_onScroll();",
                                  1000);
    } else if (myBatchRequested > 0) {
        /* If there was a request, check if we got everything.
         * If fetched messages is the amount requested, we could
         * continue fetching more, otherwise there is no more history
         * to fetch.
         */
        if (messages_fetched < myBatchRequested) {
            myBatchRequested = HISTORY_FETCHING_DONE; /* No more history */
        } else {
            myBatchRequested = HISTORY_FETCHING_NOREQUEST; /* Batch delivered */
        }

        /* Check if anything needs to be rendered at this scroll position */
        MessagingWidgetsRenderer_onScroll();
    }
}

/**
 * MessagingWidgetsRenderer_deleteMessage:
 *
 * @id_str:         The ID of the message to delete
 *
 * Removes a message from the message area
 **/
function MessagingWidgetsRenderer_deleteMessage (id_str)
{
    var txt;
    var node = null;

    MessagingWidgetsSMSConversation_alert(
        "MessagingWidgetsRenderer_deleteMessage("+id_str+") called.");

    txt = "Message"+id_str;
    node = document.getElementById(txt);

    if (node == null) {
        MessagingWidgetsSMSConversation_alert (
            "No messages with id: " + id_str);
        return;
    }

    try {
        document.body.removeChild (node);
        window.scrollBy (0,0);
    } catch (e) {
        MessagingWidgetsSMSConversation_alert (
            "Message " + index + " removal failed: " + e);
    }

    return;
}

/**
 * MessagingWidgetsRenderer_showDeliveryTimes:
 *
 * @visibility: Set to 'inline' to show delivery time stamps. Set to
 *              'none' not to show them.
 *
 * Set if delivery time stamps should be visible
 **/
function MessagingWidgetsRenderer_showDeliveryTimes (visibility)
{
    var times;

    if (visibility != "inline" && visibility != "none") {
        MessagingWidgetsSMSConversation_alert(
         "MessagingWidgetsRenderer_showDeliveryTimes: Illegal parameter: " +
         visibility);
        return;
    }

    myShowTimes = visibility;

    times = document.getElementsByTagName("span");
    if (times == null) {
        return;

    }

    for (i = 0; i < times.length; i++) {
        if (times[i].className.indexOf ("MessageDeliveryTimeStamp") != -1) {
            times[i].style.display = myShowTimes;
        }
    }

    return;
}

/**
 * MessagingWidgetsRenderer_setTimes:
 *
 * @id_str:           id of the message
 * @time_str:         message time stamp
 * @delivery_str:     message delivery time stamp
 * @status_icon:      path+name of a status icon (pending/failed)
 *
 * Set time stamps and status icon
 **/
function MessagingWidgetsRenderer_setTimes (id_str, time_str, delivery_str,
    status_icon)
{
    var icon;

    // Weird new browser behaviour here. Looks like if the src of the status
    // icon is set to not valid icon value, the browser keeps displaying the old
    // valid icon. Only when you put to the src a valid icon does it change.
    // Worked around this by hiding the image altogether if the icon is set
    // to "".

    icon = document.getElementById("MessageStatusImg"+id_str);
    if (icon != null) {
        icon.src = status_icon;

        if (status_icon == "") {
            icon.style.display = "none";
        } else {
            icon.style.display = "inline";
        }
    }

    document.getElementById("MessageTimeStamp"+id_str).innerHTML = time_str;
    document.getElementById("MessageDeliveryTimeStamp"+id_str).innerHTML =
        delivery_str;

    return;
}

/**
 * MessagingWidgetsRenderer_setPresence:
 * @contact_info: The contact info for presence icon
 * @presence:     Presence icon path
 *
 * Sets the presence icon of @contact_info to @presence
 **/
function MessagingWidgetsRenderer_setPresence (contact_info, presence)
{
    var presenceImg = document.getElementById ("PresenceImg" + contact_info);
    if (presenceImg != null) {
        presenceImg.src = presence;
    } else {
        /* Find in buffer */
        for (var i = 0; i < messagesBuffer.length; i++) {
            if (messagesBuffer[i].contact_info_str == contact_info) {
                messagesBuffer[i].presence = presence;
                break;
            }
        }
    }
}

/**
 * MessagingWidgetsRenderer_setMaxMessages:
 *
 * @max:              maximum number of messages
 *
 * Sets the maximum number of messages (default is 50)
 **/
function MessagingWidgetsRenderer_setMaxMessages (max)
{
    var count;

    myMaxMessages = max;

    count = document.body.childNodes.count;

    if (count >= myMaxMessages) {
        var i;

        for (i = count - myMaxMessages + 1; i > 0; i--) {
            document.body.removeChild (document.body.firstChild);
        }
    }

    return;
}

/**
 * MessagingWidgetsRenderer_setCSS:
 *
 * @file:              Path of theme CSS file
 *
 * Sets the theme CSS file to the current page.
 *
 * FIXME: Should use the .styleSheets property of the document
 **/
function MessagingWidgetsRenderer_setCSS (file)
{
    document.getElementById("ThemeCSSLink").href = file;
    MessagingWidgetsSMSConversation_alert("set: "+file+" as theme CSS file.");

    return;
}

/**
 * MessagingWidgetsRenderer_addBatch:
 *
 * @messages:             Array of messages to add
 *
 * Adds several messages to view
 *
 **/
function MessagingWidgetsRenderer_addBatch (messages)
{
    var len = messages.length;
    var i;

    // starting from 1, because of the extra ',' at the beginning due to
    // performance optimizations
    for(i=1; i<len; i++) {
        // Calling addMessage for each batched call. Converting strings
        // representing bool/int parameters

        MessagingWidgetsRenderer_addMessage(Number(messages[i][0]),
             messages[i][1], messages[i][2], messages[i][3], messages[i][4],
             (messages[i][5] === 'true'), messages[i][6], messages[i][7],
             messages[i][8], messages[i][9], messages[i][10], messages[i][11],
             (messages[i][12]) === 'true', messages[i][13]);
    }

    return;
}

