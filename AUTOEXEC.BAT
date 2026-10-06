@ECHO OFF
SET PROMPT=$p-$g
SET TEMP=C:\TEMP
SET SOUND=c:\VIBRA16
SET MIDI=SYNTH:1 MAP:E
SET BLASTER=A220 I5 D1 H5 P330 T6
SET PATH=C:\win31;C:\nwclient;C:\lwp\bin;c:\belfry;C:\dos;c:\scan

LH mouse
c:\vibra16\mixerset /ma:200 /cd:200 /vo:200
c:\vibra16\diagnose /s
goto %config%

:XMS    
        LH C:\DOS\doskey
        LH C:\DOS\mscdex /d:mscd001 /M:6  /v
        C:\dos\CDBLITZ.EXE 1500
        c:\scan\scan c: d: e: /boot /nomem /lock
        goto skip
:EMS        
        LH C:\DOS\mscdex /d:mscd001 /M:6  /v
        c:\scan\scan c: d: e: /boot /nomem /lock
        goto SKIP
:LONG
        LH C:\DOS\doskey
        LH C:\DOS\mscdex /d:mscd001 /M:6  /v
        C:\dos\CDBLITZ.EXE 1500
        c:\scan\scan c: d: e: /lock /all       
        C:\DOS\scandisk c: /autofix /nosave /nosummary
        C:\DOS\scandisk d: /autofix /nosave /nosummary
        C:\DOS\scandisk e: /autofix /nosave /nosummary
        del c:\*.log
        del d:\*.log
        c:\dos\defrag c: /ss 
:SKIP
        cls
        ver

