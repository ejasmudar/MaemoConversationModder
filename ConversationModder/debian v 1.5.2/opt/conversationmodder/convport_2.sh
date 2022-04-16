# Conversation Portrait mode
# Author: Ejas (ejasmudar@gmail.com)
#	script to make conversation (SMS) 
#	portrait supported
# 	note: this is a dirty hack until i come up with something better
# version 2

###############################
#Filenames: Donot change. For testing purposes only

# SMScss='MessagingWidgetsSMSConversation.css'
# IMcss='MessagingWidgetsChatConversation.css'
SMScss='/usr/share/rtcom-messaging-ui/html/MessagingWidgetsSMSConversation.css'
IMcss='/usr/share/rtcom-messaging-ui/html/MessagingWidgetsChatConversation.css'



# -e '/^div.Message *{/,/}/ s_\(.*:.*;\).*\n *\1__g'


###    SMS BLOCK    #####

sed -i -e '/^div.Message *{/,/}/ s_\(^ *clear:.*;\)_/*\1*/_' -e '/^div.Message *{/,/}/ s_^.*display:.*_  display: table;_'   -e '/^div.Message *{/,/}/ s_^ *width:.*;__' -e '/^div.Message *{/,/}/ s_}_  width: 100%; \n}_'  $SMScss

sed -i -e '/^div.Message.Other *{/,/}/ s_^ *padding-left:.*__' -e '/^div.Message.Other *{/,/}/ s_}_  padding-left: 6px; \n}_'  $SMScss

sed -i  -e '/^div.BubbleSelf *{/,/}/ s_^ *display:.*__'  -e '/^div.BubbleSelf *{/,/}/ s_\(^ *width:.*\)_/*\1 */_' -e  '/^div.BubbleSelf *{/,/}/ s_}_  display: table-cell;\n}_' $SMScss

sed -i -e '/^div.BubbleOther *{/,/}/ s_^ *display:.*;_  display: table-cell;_' -e '/^div.BubbleOther *{/,/}/ s_\(^ *width:.*;\)_/* \1*/_' -e '/^div.BubbleOther *{/,/}/ s_ *margin-right.*__' -e '/^div.BubbleOther *{/,/}/ s_}_  margin-right:  4px; \n }_' $SMScss

sed -i -e '/^div.BubbleSpacer *{/,/}/ s_\(^ *max-width:.*\)_/* \1 */_' -e '/^div.BubbleSpacer *{/,/}/ s_\(^ *width:.*\)_/* \1 */_' $SMScss

sed -i -e '/^div.BubbleSelfClicked *{/,/}/ s_^ *display:.*;__' -e '/^div.BubbleSelfClicked *{/,/}/ s_\(^ *width:.*;\)_/* \1 */_' -e '/^div.BubbleSelfClicked *{/,/}/ s_}_  display: table-cell;  \n }_' $SMScss

sed -i -e '/^div.BubbleOtherClicked *{/,/}/ s_^ *display:.*_ display: table-cell;_' -e '/^div.BubbleOtherClicked *{/,/}/ s_\(^ *width:.*;\)_/* \1 */_' $SMScss

sed -i -e '/^div.Avatar *{/,/}/ s_^ *display:.*_  display: table-cell;_' -e  '/^div.Avatar *{/,/}/ s_^ *width:__' -e  '/^div.Avatar *{/,/}/ s_ *padding-right:__' -e '/^div.Avatar *{/,/}/ s_}_  width: 64px; \n  padding-right: 2px; \n }_'  $SMScss



####  IM Block ####


sed -i   '/^div.Bubble *{/,/}/ s_\(^ *width:.*\)_/* \1 */ _'  $IMcss

sed -i   '/^div.InnerBubble *{/,/}/ s_\(^ *width:.*\)_/* \1 */ _'  $IMcss

sed -i -e '/^div.Message *{/,/}/ s_^ *display:.*__' -e  '/^div.Message *{/,/}/ s_^ *width:__' -e  '/^div.Message *{/,/}/ s_}_  width: 100%; \n  display: table; \n }_'  $IMcss

sed -i -e '/^img.MessageAvatar *{/,/}/ s_^ *height:.*__' -e  '/^img.MessageAvatar.*{/,/}/ s_ *width:.*__' -e  '/^img.MessageAvatar *{/,/}/ s_}_ ^ width: 64px; \n  height: 64px; \n }_'  $IMcss

sed -i -e '/^div.MessageAvatarBorder *{/,/}/ s_^ *height:.*__' -e  '/^div.MessageAvatarBorder *{/,/}/ s_^ *width:.*__' -e  '/^div.MessageAvatarBorder *{/,/}/ s_}_  width: 64px; \n  height: 64px; \n }_'  $IMcss

sed -i -e '/^span.MessageRight *{/,/}/ s_^ *float:.*__' -e  '/^span.MessageRight *{/,/}/ s_^ *display:.*__' -e  '/^span.MessageRight *{/,/}/ s_}_  display:table-cell; \n }_'  $IMcss




zenity --info --text 'Messaging Application modified for better portrait mode usage'
