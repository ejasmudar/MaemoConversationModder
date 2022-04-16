#Conversation themer
#version2
#folder='/newfolder/'
folder='/usr/share/rtcom-messaging-ui/html/'
backupfolder=${folder}'bkup/'

# echo $backupfolder

case $1 in
backup)



if [ ! -d $backupfolder ]; then
	mkdir $backupfolder
	cp -i ${folder}* $backupfolder
	zenity --info --text="Backup successful"
else
	zenity --question --text="Backup already exists. Do you want to continue?  (Click outside to cancel)" --ok-label="YES"
	if [ $? -eq 0 ]; then 
		cp ${folder}* $backupfolder
		zenity --info --text="Backup successful"
	else
		zenity --info --text="Exiting without Backing up"
	fi
fi
;;

restore)
if [ -d $backupfolder ]; then
	cp ${backupfolder}* $folder
	zenity --info --text="Restored original N900 convcersation themes"
else
	zenity --info --text="No backup found :-("
fi
;;


help)
echo ""
echo "=========Convthemer Help========="

echo "Available commands: backup restore "
echo "To install theme, use the format: sh themer.sh theme-zip-file-name"
;;

*)
unzip -qoC $1 -d $folder
# if [ $? -ne 0 ] ; then echo "not a local account" ; fi
if [ $? -eq 0 ]; then 
	zenity --info --text="Successfully Installed Theme : "$1
else
	zenity --info --text="Sorry, some error has occured. Maybe file does not exist?"
fi	
	;;
esac
