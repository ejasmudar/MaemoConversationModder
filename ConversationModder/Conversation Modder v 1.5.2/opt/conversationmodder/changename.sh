### Conversation- Change own name
### By Ejas Mudar
### ejasmudar@gmail.com
### Version 1
# SMSjs='MessagingWidgetsSMSConversation.js'

SMSjs='/usr/share/rtcom-messaging-ui/html/MessagingWidgetsSMSConversation.js'

input=$(zenity --entry --title "Change Own Name" --text "Please enter replacement text:" --entry-text "Me")

# read input


sed -i -e '/if (item.name_str .*item.self) {/,/}/ s/.*//' $SMSjs



lineno=`sed -n '/if (item.name_str != "") {/ =' $SMSjs `

c=0
a=3
c=$(($a+$lineno))
#echo $c


sed -i -e ''"$c"' a\if (item.name_str != \"\" \&\& item.self) { \
          name_tag.textContent = \"'"$input"'\";    }'  $SMSjs

        
zenity --info --text "Successfully changed name!"

    
