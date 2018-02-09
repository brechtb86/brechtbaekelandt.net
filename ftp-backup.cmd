echo off
set username=%1
set password=%2
set root=%3
shift
shift
shift
wget -m --ftp-user=%username% --ftp-password=%password% ftp://ftp-eu.site4now.net/brechtbaekelandt/wwwroot/images/blog/ -P %root%/wwwroot/images/blog/
wget -m --ftp-user=%username% --ftp-password=%password% ftp://ftp-eu.site4now.net/brechtbaekelandt/wwwroot/attachments/blog/ -P %root%/wwwroot/attachments/blog/