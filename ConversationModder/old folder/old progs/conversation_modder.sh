###Conversation modder
### Coded by Ejas Mudar
### ejasmudar@gmail.com
### Version 1.2

choice=$(zenity  --list  --text "Chose action" --radiolist  --column "Pick" --column "Action" TRUE "Install Theme" FALSE "Install Portrait Support" FALSE "Change Own Name" FALSE "Change Colors" FALSE "Backup Theme" FALSE "Restore Theme" );
#echo $choice

choice=`echo "$choice"|sed 's/ //g'`
#echo $choice

case $choice in
BackupTheme)

	#sudo /usr/bin/run-standalone.sh conthemer_2.sh backup
	#how to run as root?
	sudo run-standalone.sh sh conthemer_2.sh backup
	;;


RestoreTheme)
	sudo run-standalone.sh sh conthemer_2.sh restore
;;

InstallTheme)
	file=`zenity --file-selection --filename=$HOME --file-filter=*.zip`
	sudo run-standalone.sh sh conthemer_2.sh $file
;;

InstallPortraitSupport)
	zenity --question --text="This is not guaranteed to work on all themes. Do you want to continue?  (Click outside to cancel)" --ok-label="YES"
		if [ $? -eq 0 ]; then 
			sudo run-standalone.sh sh convport_2.sh
		fi
	
;;
	
ChangeOwnName)
	sudo run-standalone.sh sh changename.sh
	;;
ChangeColors)
	sudo run-standalone.sh sh changecolor.sh
;;
	
*)
	zenity --info --text="Error"
;;
	
esac