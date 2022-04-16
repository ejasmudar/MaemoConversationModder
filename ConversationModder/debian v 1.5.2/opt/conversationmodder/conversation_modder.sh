###Conversation modder
### Coded by Ejas Mudar
### ejasmudar@gmail.com
### Version 1.5
flag=0
while [$flag -eq 0]

	do
	choice=$(zenity  --list  --text "Chose action" --radiolist  --column "Pick" --column "Action" TRUE "Install Theme" FALSE "Install Portrait Support" FALSE "Change Own Name" FALSE "Change Colors" FALSE "Backup Theme" FALSE "Restore Theme" );
	#echo $choice

	choice=`echo "$choice"|sed 's/ //g'`
	#echo $choice

	case $choice in
	BackupTheme)

		#how to run as root?
		#sudo run-standalone.sh sh /opt/conversationmodder/conthemer_2.sh backup
		sh -c 'echo "sh /opt/conversationmodder/conthemer_2.sh backup" | root'
		;;


	RestoreTheme)
		#sudo run-standalone.sh sh /opt/conversationmodder/conthemer_2.sh restore
		sh -c 'echo "sh /opt/conversationmodder/conthemer_2.sh restore" | root'
	;;

	InstallTheme)
		file=`zenity --file-selection --height=350 --title "Choose Theme" --filename=$HOME --file-filter=*.zip`
		#sudo run-standalone.sh sh /opt/conversationmodder/conthemer_2.sh $file
	 
	file=`echo "$file"|sed 's/ /\ /g'`

		sh -c 'echo "sh /opt/conversationmodder/conthemer_2.sh '"$file"'" | root'
	;;

	InstallPortraitSupport)
		zenity --question --title="Warning" --text="This is not guaranteed to work on all themes. Do you want to continue?  (Click outside to cancel)" --ok-label="YES"
			if [ $? -eq 0 ]; then 
				#sudo run-standalone.sh sh /opt/conversationmodder/convport_2.sh
				sh -c 'echo "sh /opt/conversationmodder/convport_2.sh" | root'
			fi
		
	;;
		
	ChangeOwnName)
		#sudo run-standalone.sh sh /opt/conversationmodder/changename.sh
		sh -c 'echo "sh /opt/conversationmodder/changename.sh" | root'
		;;
	ChangeColors)
		#sudo run-standalone.sh sh /opt/conversationmodder/changecolor.sh
		sh -c 'echo "sh /opt/conversationmodder/changecolor.sh" | root'
	;;
		
	*)
		zenity --info --text="Exiting Now..."
		flag=1
		;;
		
	esac
	
done