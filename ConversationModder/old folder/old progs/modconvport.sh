# Conversation Portrait mode
# Author: Ejas (ejasmudar@gmail.com)
#	script to make conversation (SMS) 
#	portrait supported
# 	note: this is a dirty hack until i come up with something better
# version 2

# SMScss='MessagingWidgetsSMSConversation.css'

SMScss='/usr/share/rtcom-messaging-ui/html/MessagingWidgetsSMSConversation.css'



fn_editfile()
{
filename=$1
startreg=$2
endreg=$3
findreg=$4
replreg=$5

sed -i "_${startreg}_,_${endreg)_ s_${findreg}_${replreg}_" $filename

}

fn_editfile "$SMScss" "^div.Message.*{" "}" "\(^ *clear:.*;\)" "/*\1*/"
fn_editfile "$SMScss" "^div.Message.*{" "}" "\(^ *display:\).*;" "\1 table;"
fn_editfile "$SMScss" "^div.Message.*{" "}" "}" "  width: 100%; \n }"


fn_editfile "$SMScss" "^div.MessageOther.*{" "}" "\(^ *padding-left:\).*;" "\1 6px;"

fn_editfile "$SMScss" "^div.BubbleSelf.*{" "}" "\(^ *display:\).*;" "\1 table-cell;"
fn_editfile "$SMScss" "^div.BubbleSelf.*{" "}" "\(^ *width:.*;\)" "/*\1*/"


fn_editfile "$SMScss" "^^div.BubbleOther.*{" "}" "\(^ *display:\).*;" "\1 table-cell;"
fn_editfile "$SMScss" "^^div.BubbleOther.*{" "}" "\(^ *display:\).*;" "\1 table-cell;"




sed -i -e  '/^div.BubbleOther *{/,/}/ s_\(^ *width:.*;\)_/*\1*/_' -e '/^div.BubbleOther *{/,/}/ s_}_  margin-right:  4px; \n }_' $SMScss

sed -i -e '/^div.BubbleSpacer.*{/,/}/ s_\(^ *max-width:.*;\)_/*\1*/_' -e '/^div.BubbleSpacer *{/,/}/ s_\(^ *width:.*;\)_/*\1*/_' $SMScss

sed -i -e '/^div.BubbleSelfClicked.*{/,/}/ s_\(^ *display:\).*;_\1 table-cell;_' -e '/^div.BubbleSelfClicked *{/,/}/ s_\(^ *width:.*;\)_/*\1*/_' $SMScss

sed -i -e '/^div.BubbleOtherClicked.*{/,/}/ s_\(^ *display:\).*;_\1 table-cell;_' -e '/^div.BubbleOtherClicked *{/,/}/ s_\(^ *width:.*;\)_/*\1*/_' $SMScss

sed -i -e '/^div.Avatar.*{/,/}/ s_\(^ *display:\).*;_\1 table-cell;_' -e '/^div.Avatar.*{/,/}/ s_}_  width: 64px; \n  padding-right: 2px; \n }_'  $SMScss

echo 'Messaging Application modified for better portrait mode usage'