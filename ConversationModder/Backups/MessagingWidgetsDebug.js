/**
 * @file MessagingWidgetsDebug.jsm
 *
 * A Debugger helper for javascripts in rtcom-messaging-ui. Define the
 * myDebug to non-zero for the debugging functions to work
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

/** Define to non-zero to debug the Javascripts */
var myDebug = 0;

/**
 * MessagingWidgetsDebug_print:
 * @param message The message to print
 *
 * Returns immediately if @myDebug is set to 0
 */
function
MessagingWidgetsDebug_print (message)
{
    if (!myDebug) return;
    if (!message) return;

    try {
        window.dump (message + "\n");
    } catch (e) {
        /* XXX: Just to be sure the debugging function doesn't cause an
         * error in JS execution
         */
    }
}
