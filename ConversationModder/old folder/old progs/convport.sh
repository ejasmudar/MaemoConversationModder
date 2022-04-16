# Conversation Portrait mode
# Author: Ejas (ejasmudar@gmail.com)
#	script to make conversation (SMS) 
#	portrait supported
# 	note: this is a dirty hack until i come up with something better
# version 2

# SMScss='MessagingWidgetsSMSConversation.css'

SMScss='/usr/share/rtcom-messaging-ui/html/MessagingWidgetsSMSConversation.css'





#this looks between bubbleself blocks
#for width: string and changes it

sed -i -e '/^div.Message *{/,/}/ s_\(^ *clear:.*;\)_/*\1*/_' -e '/^div.Message *{/,/}/ s_\(^ *display:\).*;_\1 table;_'  -e '/^div.Message *{/,/}/ s_}_  width: 100%; \n }_' $SMScss

sed -i -e '/^div.MessageOther *{/,/}/ s_\(^ *padding-left:\).*;_\1 6px;_'  $SMScss

sed -i -e '/^div.BubbleSelf.*{/,/}/ s_\(^ *display:\).*;_\1 table-cell;_' -e '/^div.BubbleSelf *{/,/}/ s_\(^ *width:.*;\)_/*\1*/_' $SMScss

sed -i -e '/^div.BubbleOther.*{/,/}/ s_\(^ *display:\).*;_\1 table-cell;_' -e '/^div.BubbleOther *{/,/}/ s_\(^ *width:.*;\)_/*\1*/_' -e '/^div.BubbleOther *{/,/}/ s_}_  margin-right:  4px; \n }_' $SMScss

sed -i -e '/^div.BubbleSpacer.*{/,/}/ s_\(^ *max-width:.*;\)_/*\1*/_' -e '/^div.BubbleSpacer *{/,/}/ s_\(^ *width:.*;\)_/*\1*/_' $SMScss

sed -i -e '/^div.BubbleSelfClicked.*{/,/}/ s_\(^ *display:\).*;_\1 table-cell;_' -e '/^div.BubbleSelfClicked *{/,/}/ s_\(^ *width:.*;\)_/*\1*/_' $SMScss

sed -i -e '/^div.BubbleOtherClicked.*{/,/}/ s_\(^ *display:\).*;_\1 table-cell;_' -e '/^div.BubbleOtherClicked *{/,/}/ s_\(^ *width:.*;\)_/*\1*/_' $SMScss

sed -i -e '/^div.Avatar.*{/,/}/ s_\(^ *display:\).*;_\1 table-cell;_' -e '/^div.Avatar.*{/,/}/ s_}_  width: 64px; \n  padding-right: 2px; \n }_'  $SMScss

echo 'Messaging Application modified for better portrait mode usage'