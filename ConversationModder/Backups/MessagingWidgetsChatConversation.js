/**
 * @file MessagingWidgetsChatConversation.js
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
 * @myShowTimes: Display method for time stamps, set to 'inline' to show
 *               and 'none' to hide
 *
 **/

var HISTORY_BATCH_SIZE = 30;
var HISTORY_PAGE_SIZE = 15;
var HISTORY_SCREENFULL_SIZE = 6;
var HISTORY_FETCHING_DONE = -1;
var HISTORY_FETCHING_NOREQUEST = 0;

/* if HISTORY_FETCHING_NOREQUEST, no batch has been requested.
 * if HISTORY_FETCHING_DONE, history fetching done; no more request to give.
 * if > 0, request in progress and the amount requested.
 */
var myBatchRequested = 0;

var myShowTimes    = "inline";

var myMaxMessages  = -1;

var markupTemplateSelf;
var markupTemplateOther;
var markupTemplateNotice;
var markupTemplateAction;
var markupTemplateAutoReply;

var fakeid = 1;

var messagesBuffer = new Array();
var pastPresenceAnchor = new Array();
var firstFlush = true;
var flushTimeout = 0;

var storedWindowHeight = 340;

/**
 * MessagingWidgetsChatConversation_init:
 *
 * Called when the page has actually been loaded.
 * Acts as a "constructor", could be used for creating the template item and
 * getting the element where we will add the children in the page.
 *
 * However, creating such template items doesn't seem so simple, we would
 * need several of them in order to be able to keep it really usable.
 **/
function MessagingWidgetsChatConversation_init ()
{
    /* Setting onscroll handler to window */
    window.onscroll = MessagingWidgetsRenderer_onScroll;

    /* Setting onresize handler to window */
    window.onresize = MessagingWidgetsRenderer_onResize;

    if (!markupTemplateSelf)
    {
        markupTemplateSelf = document.getElementById("MessageContainerSelf");
        markupTemplateSelf.parentNode.removeChild(markupTemplateSelf);
        markupTemplateSelf.removeAttribute('id');

        markupTemplateOther = document.getElementById("MessageContainerOther");
        markupTemplateOther.parentNode.removeChild(markupTemplateOther);
        markupTemplateOther.removeAttribute('id');

        markupTemplateNotice = document.getElementById("MessageContainerNotice");
        markupTemplateNotice.parentNode.removeChild(markupTemplateNotice);
        markupTemplateNotice.removeAttribute('id');

        markupTemplateAction = document.getElementById(
            "MessageContainerAction");
        markupTemplateAction.parentNode.removeChild(
            markupTemplateAction);
        markupTemplateAction.removeAttribute('id');

        markupTemplateAutoReply = document.getElementById("MessageContainerAutoReply");
        markupTemplateAutoReply.parentNode.removeChild(markupTemplateAutoReply);
        markupTemplateAutoReply.removeAttribute('id');
    }
}

function MessagingWidgetsRenderer_avatarBorderClicked (event)
{
    alert(event.currentTarget.id);

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
    var presenceID;

    if (!presence_img) return;

    presenceID = "PresenceImg" + contact_info_str;

    if (!self) {
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
    } else if (presence_img) {
        presence_img.parentNode.removeChild (presence_img);
    }
}

/**
 * MessagingWidgetsRenderer_messagePress:
 * @event:             The message.
 *
 * Handles onMousePress event and emits the event upwards to C-code via alert()
 **/
function MessagingWidgetsRenderer_messagePress (event)
{
    var idstr;

    idstr = "file://pre-id:"+event.currentTarget.id;

    alert(idstr);

    event.returnValue = true;
    /* Canceling bubble so body onmousedown isn't called */
    event.cancelBubble = true;

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
    var new_message_template;

    /* Avatar data */
    var avatar_img;
    var avatar_img_border;

    /* The graphics */
    var bubble_cell;

    /* Presence icon and name area */
    var presence_img;
    var name_tag;

    /* Message text content */
    var message_txt;

    /* Time stamps and potential icons */
    var time_tag;
    var delivery_time_tag;
    var business_img;

    var type_name;
    var count;

    if (!markupTemplateSelf) {
        MessagingWidgetsChatConversation_init ();
    }

    if (item.type == 2) {
        new_message_template = markupTemplateNotice;
        type_name = "Notice";
    } else if (item.type == 1) {
        new_message_template = markupTemplateAction;
        type_name = "Action";
    } else if (item.type == 3) {
        new_message_template = markupTemplateAutoReply;
        type_name = "AutoReply";
    } else {
        if (item.self) {
            new_message_template = markupTemplateSelf;
            type_name = "Self";
        } else {
          new_message_template = markupTemplateOther;
          type_name = "Other";
        }
    }

    new_message = new_message_template.cloneNode(true);

    if (item.id_str == null || item.id_str == "") {
        item.id_str = "GeneratedId_" + fakeid++;
    }

    new_message.id = "Message" + item.id_str;
    new_message.onmousedown = MessagingWidgetsRenderer_messagePress;

    /* Retrieve the elements to update */
    var node_tags = new_message.getElementsByTagName('*');
    for (var i = 0; i < node_tags.length; i++) {
        if (node_tags[i].hasAttribute('id')) {
            var id = node_tags[i].getAttribute('id');
            if (id == ("AvatarImg" + type_name))
                avatar_img = node_tags[i];
            if (id == ("AvatarImgBorder" + type_name))
                avatar_img_border = node_tags[i];
            if (id == ("Message" + type_name))
                bubble_cell = node_tags[i];
            if (id == ("MessagePresence" + type_name))
                presence_img = node_tags[i];
            if (id == ("MessageSenderName" + type_name))
                name_tag = node_tags[i];
            if (id == ("MessageText" + type_name))
                message_txt = node_tags[i];
            if (id == ("MessageTimeStamp" + type_name))
                time_tag = node_tags[i];
        }
    }

    /* Setting sender's name color */
    if (item.type == 1) {
        if (item.self) {
            name_tag.className += " AccentColor2";
        } else {
            name_tag.className += " AccentColor1";
        }
    }

    bubble_cell.id = item.id_str;
    message_txt.id = "MessageText" + item.id_str;

    if (avatar_img)        avatar_img.id   = "avatar:" + item.contact_info_str;
    if (avatar_img_border) avatar_img_border.id = "avatar:" + item.contact_info_str;
    if (name_tag)          name_tag.id     = "MessageSenderName" + item.id_str;
    if (time_tag)          time_tag.id     = "MessageTimeStamp" + item.id_str;

    /* Creation of an avatar image */
    if (avatar_img) {
        avatar_img.src = item.avatar;
    }
    if (avatar_img_border) {
        avatar_img_border.onclick =
            MessagingWidgetsRenderer_avatarBorderClicked;
    }

    if (item.name_str != "" && name_tag) {
        name_tag.innerHTML = item.name_str;
    }

    message_txt.innerHTML = item.message_str.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    message_txt.setAttribute("dir", item.text_dir);

    if (time_tag) {
        time_tag.style.display = myShowTimes;
        time_tag.innerHTML = item.time_str;
    }


    /* Show the new message */
    new_message.style.display = "block";

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
            new_message =
                MessagingWidgetsRenderer_messageNode (item, true);

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
MessagingWidgetsRenderer_onScroll (event)
{
    /* Buffer flushing if there isn't already one running. */
    if (window.pageYOffset < 100 && messagesBuffer.length > 0) {

        /* Add a page of messages (about 4 screen-full) to renderer */
        MessagingWidgetsRenderer_flushBuffer(HISTORY_PAGE_SIZE);
    }

    /* If we run out of messages in buffer and history hasn't finished,
     * request for more
     */
    if (messagesBuffer.length == 0 &&
        myBatchRequested == HISTORY_FETCHING_NOREQUEST) {
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
 * an immediate flush if there are 5 messages already in buffer for
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
            messagesBuffer.length >= HISTORY_SCREENFULL_SIZE) {
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
 * @messages_fetched:	Number of messages fetched from log
 *
 * History batch has been added to renderer
 **/
function MessagingWidgetsRenderer_batchAdded (messages_fetched)
{
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
         * If received messages is the amount requested, we could
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
 * @id_str:         The ID of the message to delete
 *
 * Removes a message from the message area
 **/
function MessagingWidgetsRenderer_deleteMessage (id_str)
{
    var txt;
    var node = null;

    MessagingWidgetsDebug_print (
        "MessagingWidgetsRenderer_deleteMessage("+id_str+") called.");

    txt = "Message"+id_str;
    node = document.getElementById(txt);

    if (node == null) {
        MessagingWidgetsDebug_print ("No messages with id: " + id_str);
        return;
    }

    try {
        document.body.removeChild (node);
        window.scrollBy (0,0);
    } catch (e) {
        MessagingWidgetsDebug_print (
            "Message " + index + " removal failed: " + e);
    }

    return;
}

/**
 * MessagingWidgetsRenderer_showDeliveryTimes:
 * @visibility: Set to 'inline' to show delivery time stamps. Set to
 *              'none' not to show them.
 *
 * Set if delivery time stamps should be visible
 **/
function MessagingWidgetsRenderer_showDeliveryTimes (visibility)
{
    var times;

    if (visibility != "inline" && visibility != "none") {
        MessagingWidgetsDebug_print(
            "MessagingWidgetsRenderer_showDeliveryTimes: Illegal parameter: "
            + visibility);
        return;
    }

    myShowTimes = visibility;

    times = document.getElementsByTagName("span");
    if (times == null) {
        return;

    }

    MessagingWidgetsDebug_print("span elements: "+times.length);
    for (i = 0; i < times.length; i++) {
        if (times[i].className.indexOf ("MessageDeliveryTimeStamp") != -1) {
            times[i].style.display = myShowTimes;
        }
    }

    return;
}

/**
 * MessagingWidgetsRenderer_setTimes:
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
 * @file:              Path of theme CSS file
 *
 * Sets the system theme CSS file to the current page.
 *
 **/
function MessagingWidgetsRenderer_setCSS (file)
{
    document.getElementById("ThemeCSSLink").href = file;
    return;
}

/**
 * MessagingWidgetsRenderer_setTheme:
 * @theme:              Theme name to set
 *
 * Sets the user theme.
 *
 **/
function MessagingWidgetsRenderer_setTheme (theme)
{
    if (!theme || theme == '')
        document.getElementById("ThemeCSSLinkUser").href = "";
    else
        document.getElementById("ThemeCSSLinkUser").href = theme + "/theme.css";
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

