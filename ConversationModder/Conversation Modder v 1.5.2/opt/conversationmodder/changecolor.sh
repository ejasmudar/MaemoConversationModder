### Conversation- Change colors
### By Ejas Mudar
### ejasmudar@gmail.com
### Version 1.1


#SMScss='MessagingWidgetsSMSConversation.css'
#IMcss='MessagingWidgetsChatConversation.css'
SMScss='/usr/share/rtcom-messaging-ui/html/MessagingWidgetsSMSConversation.css'
IMcss='/usr/share/rtcom-messaging-ui/html/MessagingWidgetsChatConversation.css'


mode=$(zenity  --list  --title "Change Color" --text "Modify What?" --radiolist  --column "Pick" --column "Action" TRUE "SMS" FALSE "IM");
case $mode in
SMS)
css=$SMScss
;;
IM)
zenity --info --text "Not Yet Implemented"
#echo Not implemented
exit 1
;;
esac



choice=$(zenity  --list  --title "Change Color" --text "Which color to change?" --radiolist  --column "Pick" --column "Action" TRUE "Background Color" FALSE "Own Bubble Color" FALSE "Other Bubble Color" FALSE "Text Color" FALSE "Name Text Color");


#for zenity less input
# read mode
# read choice
# read input


choice=`echo "$choice"|sed 's/ //g'`

echo $choice


# read input


case $choice in
BackgroundColor)
input=$(zenity --entry --title "Change Color" --text "Please enter background color (name/hex):" --entry-text "#ffffff")

#to remove previous mentions of background color, if its there including commenting
sed -i -e '/^ *body *{/,/}/ s/.*background-color:.*;.*//' $css

#add the required code
sed -i -e '/^ *body *{/,/}/ s/}/background-color: '"$input"' ; \n}/' $css
;;

OwnBubbleColor)
#to remove previous mentions of background color, if its there including commenting
input=$(zenity --entry --title "Change Color" --text "Please enter background color (name/hex):" --entry-text "#ffffff")

sed -i -e '/^ *div.BubbleSelf {/,/}/ s/.*background-color:.*;.*//' $SMScss

#add the required code
sed -i -e '/^ *div.BubbleSelf {/,/}/ s/}/background-color: '"$input"' ; \n}/' $SMScss



sed -i -e '/^ *div.BubbleSelfClicked {/,/}/ s/.*background-color:.*;.*//' $SMScss
sed -i -e '/^ *div.BubbleSelfClicked {/,/}/ s/}/background-color: '"$input"' ; \n}/' $SMScss


;;


OtherBubbleColor)
input=$(zenity --entry --title "Change Color" --text "Please enter background color (name/hex):" --entry-text "#ffffff")

#to remove previous mentions of background color, if its there including commenting
sed -i -e '/^ *div.BubbleOther {/,/}/ s/.*background-color:.*;.*//' $SMScss

#add the required code
sed -i -e '/^ *div.BubbleOther {/,/}/ s/}/background-color: '"$input"' ; \n}/' $SMScss



sed -i -e '/^ *div.BubbleOtherClicked {/,/}/ s/.*background-color:.*;.*//' $SMScss
sed -i -e '/^ *div.BubbleOtherClicked {/,/}/ s/}/background-color: '"$input"' ; \n}/' $SMScss
;;


TextColor)
input=$(zenity --entry --title "Change Color" --text "Please enter color (name/hex):" --entry-text "#ffffff")

#to remove previous mentions of background color, if its there including commenting
sed -i -e '/^ *div.Message {/,/}/ s/ *color:.*;.*//' $SMScss

#add the required code
sed -i -e '/^ *div.Message {/,/}/ s/}/   color: '"$input"' ; \n}/' $SMScss


;;


NameTextColor)
input=$(zenity --entry --title "Change Color" --text "Please enter color (name/hex):" --entry-text "#ffffff")

#to remove previous mentions of  color, if its there including commenting
sed -i -e '/^ *span.MessageNameField {/,/}/ s/ *color:.*;.*//' $SMScss

#add the required code
sed -i -e '/^ *span.MessageNameField {/,/}/ s/}/color: '"$input"' ; \n}/' $SMScss



;;

*)
#echo Not Yet Implemented
Zenity --info --text "Error"
;;
esac        
    

zenity --info text "Operation Success"
