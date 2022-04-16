/**
 * @file MessagingWidgetsSingleSMS.js
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
var myShowTimes = "inline";
var markupTemplateSelf;
var markupTemplateOther;


/**
 * MessagingWidgetsSingleSMS_init:
 *
 **/
function MessagingWidgetsSingleSMS_init ()
{
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

function MessagingWidgetsRenderer_avatarClicked (event)
{
    alert(event.currentTarget.id);

    event.returnValue = true;
    event.cancelBubble = false;
}

/**
 * MessagingWidgetsRenderer_addMessage:
 *
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
 * @status_text:      message status text (delivered/on the way/delivery failed)
 * @contact_info_str: Additional contact information
 * @add_to_top:       unused in single SMS view
 * @text_dir:         Text direction ("ltr" or "rtl")
 *
 * Adds messages to the message area.
 * Note that unlike other views, message status is indicated as text,
 * not as an icon. 
 **/
function
MessagingWidgetsRenderer_addMessage (
    type, time_str, delivery_str, name_str, message_str, self, id_str, 
    avatar, presence, business_icon, status_text, contact_info_str, add_to_top,
    text_dir)
{
    /* Top level items */
    var new_message;

    /* Avatar data */
    var avatar_img;
    var avatar_img_border;

    /* The graphics */
    var bubble_cell;

    /* Presence icon and name area */
    var presence_img;
    var presence_box;
    var name_tag;

    /* Message text content */
    var message_txt;

    /* Time stamps and potential icons */
    var time_tag;
    var delivery_time_tag;
    var business_img;
    var status_span;

    var party;
    var count;

    if (!markupTemplateSelf)
    {
        markupTemplateSelf = document.getElementById("MessageContainerSelf");
        markupTemplateSelf.parentNode.removeChild(markupTemplateSelf);
        markupTemplateSelf.removeAttribute('id');
        markupTemplateOther = document.getElementById("MessageContainerOther");
        markupTemplateOther.parentNode.removeChild(markupTemplateOther);
        markupTemplateOther.removeAttribute('id');
    }

    if (type != 0) {
        alert("Only type 0 is allowed");
        return;
    }

    if (self == true) {
        party = "Self";
        new_message = markupTemplateSelf.cloneNode(true);

        /* Finally, append the whole message to the document */
        new_message.id = "Message" + id_str;
        document.getElementById("MessagingArea").appendChild (new_message);

        /* Retrieve the elements to update */
        bubble_cell = document.getElementById ("Message" + party);
        name_tag = document.getElementById ("MessageSenderName" + party);
        business_img = document.getElementById ("MessageBusinessCardImg" + party);
        message_txt = document.getElementById ("MessageText" + party);
        time_tag = document.getElementById ("MessageTimeStamp" + party);
        delivery_time_tag = document.getElementById ("MessageDeliveryTimeStamp" + party);
        status_span = document.getElementById ("MessageStatus" + party);

    } else {
        party = "Other";
        new_message = markupTemplateOther.cloneNode(true);

        /* Finally, append the whole message to the document */
        new_message.id = "Message" + id_str;
        document.getElementById("MessagingArea").appendChild (new_message);

        /* Retrieve the elements to update */
        avatar_img = document.getElementById ("AvatarImg" + party);
        avatar_img_border = document.getElementById ("AvatarImgBorder" + party);
        bubble_cell = document.getElementById ("Message" + party);
        presence_img = document.getElementById ("MessagePresence" + party);
        presence_box = document.getElementById ("MessagePresenceBox" + party);
        name_tag = document.getElementById ("MessageSenderName" + party);
        business_img = document.getElementById ("MessageBusinessCardImg" + party);
        message_txt = document.getElementById ("MessageText" + party);
        time_tag = document.getElementById ("MessageTimeStamp" + party);
        delivery_time_tag = document.getElementById ("MessageDeliveryTimeStamp" + party);
        status_span = document.getElementById ("MessageStatus" + party);

        avatar_img_border.id = "avatar:" + contact_info_str;
        presence_img.id = "PresenceImg" + contact_info_str;
        presence_box.id = "PresenceBox" + contact_info_str;

    }
    bubble_cell.id = id_str;
    message_txt.id = "MessageText" + id_str;
    name_tag.id = "MessageSenderName" + id_str;
    business_img.id = "MessageBusinessCardImg" + id_str;
    time_tag.id = "MessageTimeStamp" + id_str;
    delivery_time_tag.id = "MessageDeliveryTimeStamp" + id_str;
    status_span.id = "MessageStatus" + id_str;
    message_txt.setAttribute("dir", text_dir);

    /* Creation of an avatar image */
    if (self == false) {
	if  (avatar != "") {
	    avatar_img.src = avatar;
	}
        avatar_img_border.onclick = MessagingWidgetsRenderer_avatarClicked;
    }

    if (self == false) {
	if (presence != "") {
	    presence_img.src = presence;
	    presence_box.style.display = "inline-block";
	}
	else {
	    presence_box.style.display = "none";
	}
    }

    message_str=message_str.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    
    name_tag.textContent = name_str;
    message_txt.innerHTML = message_str;

    if (business_icon != "") {
        business_img.src = business_icon;
    }

    time_str=time_str.replace(/\|/,"");
    delivery_str=delivery_str.replace(/\|/,"");

    time_tag.style.display = myShowTimes;
    time_tag.textContent = time_str;

    delivery_time_tag.style.display = myShowTimes;

    if(delivery_str != "") {
        delivery_time_tag.textContent = "| "+delivery_str;
    }

    if (status_text != "") {
        status_span.textContent = status_text;
    }

    /* Show the new message */
    new_message.style.display = "block";

    /* scroll message area to the top */
    window.scrollTo(0,0);

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
        alert("MessagingWidgetsRenderer_showDeliveryTimes: Illegal parameter: "+ visibility);
        return;
    }

    myShowTimes = visibility;

    times = document.getElementsByTagName("span");
    if (times == null) {
        return;

    }

    for (i = 0; i < times.length; i++) {
        if (times[i].className == "MessageDeliveryTimeStamp") {
            times[i].style.display = myShowTimes;
        }
    }

    return;
}

/**
 * MessagingWidgetsRenderer_setTimes:
 *
 * @id_str:           id of the message (ignored in case of single SMS view)
 * @time_str:         message time stamp
 * @delivery_str:     message delivery time stamp
 * @status_text:      message status text
 *
 * Set if delivery time stamps should be visible
 **/
function MessagingWidgetsRenderer_setTimes (id_str, time_str, delivery_str, 
    status_text)
{
    var msg;

    time_str=time_str.replace(/\|/,"");
    delivery_str=delivery_str.replace(/\|/,"");

    status_span = document.getElementById("MessageStatus"+id_str);
    if (status_span != null) {
        status_span.textContent = status_text;
    }
    document.getElementById("MessageTimeStamp"+id_str).textContent = time_str;
    if(delivery_str != "") {
       document.getElementById("MessageDeliveryTimeStamp"+id_str).textContent =
           "| "+delivery_str;
    }

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
    var presenceBox = document.getElementById ("PresenceBox" + contact_info);
    if (presenceImg != null) {
        presenceImg.src = presence;
	presenceBox.style.display = "inline-block";
    }
    else {
	presenceBox.style.display = "inline-block";
    }
}

/**
 * MessagingWidgetsRenderer_setCSS:
 *
 * @file:              Path of theme CSS file
 *
 * Sets the theme CSS file to the current page.
 *
 **/
function MessagingWidgetsRenderer_setCSS (file)
{
    document.getElementById("ThemeCSSLink").href = file;
    MessagingWidgetsSMSConversation_alert("set: "+file+" as theme CSS file.");

    return;
}
