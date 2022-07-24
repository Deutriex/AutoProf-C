@CALL ccleaner.bat
@TASKKILL /F /IM excel.exe
@TASKKILL /F /IM mshta.exe
mshta.exe "E:\GlupeixDeutriex\AutoProf-C\main.hta"