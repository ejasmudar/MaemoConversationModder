#Conversation themer

#folder='/newfolder/'
folder='/usr/share/rtcom-messaging-ui/html/'
backupfolder=${folder}'bkup/'

# echo $backupfolder

case $1 in
backup)



if [ ! -d $backupfolder ]; then
	mkdir $backupfolder
	cp -i ${folder}* $backupfolder
	echo "Backup successful"
else
	echo "Backup already exists"
	echo "Do you want to continue? Y/N?"
	read input
	if [ "$input" = "Y" -o "$input" = "y" ]; then 
		cp ${folder}* $backupfolder
		echo "Backup successful"]
	else
		echo "Exiting without Backing up"
	fi
fi
;;

restore)
if [ -d $backupfolder ]; then
	cp ${backupfolder}* $folder
	echo "Restored original N900 convcersation themes"
else
	echo "No backup found :-("
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
	echo "Successfully Installed Theme : "$1
else
	echo "Sorry, some error has occured. Maybe file does not exist?"
fi	
	;;
esac
