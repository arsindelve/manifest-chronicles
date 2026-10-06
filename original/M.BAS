


DECLARE SUB HEADER ()
DECLARE SUB TABLE5 ()
DECLARE SUB HIGHSCORE ()
DECLARE SUB PRINTHP ()
DECLARE SUB QUITTER ()
DECLARE SUB OPENING ()
DECLARE SUB STAIRS ()
DECLARE SUB DISPLAY ()
DECLARE SUB COMMAND ()
DECLARE SUB CHEST ()
DECLARE SUB MAGIC2 ()
DECLARE SUB ENCOUNTER ()
DECLARE SUB INIT ()
DECLARE SUB HINTS ()
DECLARE SUB TABLE3 ()
DECLARE SUB SAVE ()
DECLARE SUB RESTOREGAME ()
DECLARE SUB DEATH ()
DECLARE SUB POTION ()
DECLARE SUB ISA ()
DECLARE SUB GETWEAPON ()
DECLARE SUB GETARMOR ()
DECLARE SUB MAGIC ()
DECLARE SUB RUNNING ()
DECLARE SUB TABLE ()
DECLARE SUB NEWCHAR ()
DECLARE SUB DELAY2 ()
DECLARE SUB TABLE2 ()
DECLARE SUB HITSHIM ()
DECLARE SUB HEHITS ()
DECLARE SUB HITSYOU ()
DECLARE SUB YOUHIT ()
DECLARE SUB ITCASTS ()
DECLARE SUB POTIONCHANCE ()
DECLARE SUB UPLEVEL ()
DECLARE SUB HEALING ()
DECLARE SUB OVERHEAD ()
DECLARE SUB GETMAP ()

DIM SHARED r(15, 15)
DIM SHARED L(15, 15)
DIM SHARED ONE(15, 15)
DIM SHARED TWO(15, 15)
DIM SHARED MAZE(55, 55)
DIM SHARED PHRASE$(200)
DIM SHARED STAIRSD(15)
DIM SHARED STAIRSA(15)
DIM SHARED MONSTERSPELL(50)
DIM SHARED MONSTERNAME$(50)
DIM SHARED MONSTERHP(50)
DIM SHARED MONSTERXP(50)
DIM SHARED SPELLTEXT$(20)
DIM SHARED MONSTERAP(50)
DIM SHARED MONSTERWEAPON(50)
DIM SHARED MONSTERARMOR(50)
DIM SHARED AUSER$(50)
DIM SHARED WUSER$(50)
DIM SHARED ARMOR(50)
DIM SHARED ARMOR$(50)
DIM SHARED WEAPON$(50)
DIM SHARED MSPELLNAME$(20)
DIM SHARED SPELLNAME$(20)
DIM SHARED MONSTERSPEED(50)
DIM SHARED MSPELLHIGH(20)
DIM SHARED SPELLLOW(20)
DIM SHARED SPELLHIGH(20)
DIM SHARED HNAME$(11)
DIM SHARED HCOMPANION$(11)
DIM SHARED HLEVEL(11)
DIM SHARED HXP(11)
DIM SHARED SPELLREQ(20)
DIM SHARED MSPELLLOW(20)
DIM SHARED WEAPON(50)
DIM SHARED LOW(10)
DIM SHARED HIGH(10)

COMMON SHARED EX
COMMON SHARED WHY
COMMON SHARED SOUND$
COMMON SHARED WHICH
COMMON SHARED USER
COMMON SHARED DB
COMMON SHARED ENEMY
COMMON SHARED COMPANIONOB
COMMON SHARED COMPANIONDB
COMMON SHARED YOURA
COMMON SHARED YOURW
COMMON SHARED SAVEG$
COMMON SHARED RECENT
COMMON SHARED COMPANIONA
COMMON SHARED COMPANIONW
COMMON SHARED OVER$
COMMON SHARED OB
COMMON SHARED INVIS$
COMMON SHARED COMPANIONMP
COMMON SHARED LEVEL
COMMON SHARED MAP
COMMON SHARED PLAYER
COMMON SHARED DIRECTION
COMMON SHARED ENEMYHP
COMMON SHARED NAME$
COMMON SHARED COLOUR
COMMON SHARED DEAD$
COMMON SHARED COMPANION$
COMMON SHARED AP
COMMON SHARED HP
COMMON SHARED MP
COMMON SHARED XP
COMMON SHARED HPMAX
COMMON SHARED X
COMMON SHARED Y
COMMON SHARED JOB$
COMMON SHARED COMPANIONJOB$
COMMON SHARED TIMES
COMMON SHARED YES$
COMMON SHARED CHECK
COMMON SHARED COMPANIONMPMAX
COMMON SHARED MPMAX
COMMON SHARED COMPANIONAP
COMMON SHARED COMPANIONHP
COMMON SHARED COMPANIONHPMAX
COMMON SHARED PURPLEPOTION
COMMON SHARED GREYPOTION
COMMON SHARED WHITEPOTION
COMMON SHARED YELLOWPOTION
COMMON SHARED NEWCHARR$
COMMON SHARED BLUEPOTION
COMMON SHARED REDPOTION
COMMON SHARED TELEPORT$
COMMON SHARED RESTOR$
COMMON SHARED GREENPOTION

ACROSS = 11
DOWN = 11

FOR I = 1 TO 10
   FOR J = 1 TO 4
      READ ONE(J, I)
   NEXT J
   FOR J = 1 TO 4
      READ TWO(J, I)
   NEXT J

   IF I < 7 THEN
      FOR J = 1 TO 8
        READ r(J, I)
      NEXT J
      FOR J = 1 TO 8
        READ L(J, I)
      NEXT J
   END IF
NEXT I

FOR I = 10 TO 1 STEP -1
   READ LOW(I)
   READ HIGH(I)
NEXT I

CALL OPENING

SCREEN 12

IF MAP < 1 THEN
   MAP = 1
END IF

IF NEWCHARR$ = "Y" THEN
   CALL GETMAP
END IF
CALL INIT

IF (X + Y) <> 2 THEN
   ACROSS = X
   DOWN = Y
END IF

KEY$ = "TEST"
SOUND$ = "Y"
CALL TABLE3

DO UNTIL KEY$ = "Q"


 IF MAZE(ACROSS, DOWN) = 2 THEN
    CALL STAIRS
    CALL TABLE3
    KEY$ = " "
 END IF


 IF MAZE(ACROSS, DOWN) = 4 THEN
   OPEN "CHECK.TMP" FOR OUTPUT AS #2
   PRINT #2, "CHECK"
   PRINT #2, LEVEL
   PRINT #2, DB
   PRINT #2, COMPANIONOB
   PRINT #2, COMPANIONDB
   PRINT #2, YOURA
   PRINT #2, YOURW
   PRINT #2, COMPANIONA
   PRINT #2, COMPANIONW
   PRINT #2, OB
   PRINT #2, COMPANIONMP
   PRINT #2, NAME$
   PRINT #2, DEAD$
   PRINT #2, COMPANION$
   PRINT #2, AP
   PRINT #2, HP
   PRINT #2, MP
   PRINT #2, XP
   PRINT #2, HPMAX
   PRINT #2, COMPANIONMPMAX
   PRINT #2, MPMAX
   PRINT #2, COMPANIONAP
   PRINT #2, COMPANIONHP
   PRINT #2, COMPANIONHPMAX
   PRINT #2, PURPLEPOTION
   PRINT #2, GREENPOTION
   PRINT #2, WHITEPOTION
   PRINT #2, YELLOWPOTION
   PRINT #2, BLUEPOTION
   PRINT #2, REDPOTION
   PRINT #2, GREYPOTION
 
    CLOSE #2
    CHAIN "ENDGAME"
 END IF



 DO UNTIL KEY$ <> ""
   KEY$ = INKEY$
 LOOP



IF MAZE(ACROSS, DOWN) = 3 THEN
    CALL DISPLAY
    MAZE(ACROSS, DOWN) = 0
    CALL TABLE3
 END IF



 IF INVIS$ = "Yes" THEN
    CHECK = CHECK + 1
    IF CHECK = 50 THEN
       CLS
       CALL HEADER
       SCREEN 0
       PRINT "You are no longer invisible..."
       CALL DELAY2
       INVIS$ = ""
       CHECK = 0
       CALL ENCOUNTER
    END IF
 END IF


  IF TELEPORT$ <> "YES" THEN
     X = ACROSS
     Y = DOWN
  END IF

  IF INVIS$ <> "Yes" THEN
  AMBUSH = INT((RND) * 20 + 1)
  IF AMBUSH = 1 THEN
     CALL ENCOUNTER
     CALL TABLE3
     LAST = 0
  END IF
  END IF

  FOUND = INT((RND) * 600 + 1)
  IF FOUND = 1 THEN
     CALL CHEST
     CALL TABLE3
  END IF

  HP = INT(HP)
  COMPANIONHP = INT(COMPANIONHP)

     IF DEAD$ <> "U" THEN
        MP = MP + (INT((MPMAX - MP) / 20)) + 1
     END IF

     IF DEAD$ <> "C" THEN
        COMPANIONMP = COMPANIONMP + (INT((COMPANIONMPMAX - COMPANIONMP) / 20)) + 1
     END IF

 
     IF MP > MPMAX THEN MP = MP - 1
     IF COMPANIONMP > COMPANIONMPMAX THEN COMPANIONMP = COMPANIONMP - 1
 

  IF KEY$ = "4" THEN
     IF DIRECTION = 90 THEN
        DIRECTION = 0
     ELSEIF DIRECTION = 180 THEN
        DIRECTION = 90
     ELSEIF DIRECTION = 270 THEN
        DIRECTION = 180
     ELSEIF DIRECTION = 0 THEN
        DIRECTION = 270
    END IF
  END IF

  IF KEY$ = "6" THEN
     IF DIRECTION = 90 THEN
        DIRECTION = 180
     ELSEIF DIRECTION = 180 THEN
        DIRECTION = 270
     ELSEIF DIRECTION = 270 THEN
        DIRECTION = 0
     ELSEIF DIRECTION = 0 THEN
        DIRECTION = 90
     END IF
  END IF

IF KEY$ = "2" THEN
    IF MAZE((ACROSS - A), (DOWN - B)) <> 1 THEN
       ACROSS = ACROSS - A
       DOWN = DOWN - B
    END IF


ELSEIF KEY$ = "8" THEN
    IF MAZE((ACROSS + A), DOWN + B) <> 1 THEN
       ACROSS = ACROSS + A
       DOWN = DOWN + B
    END IF
END IF

IF DIRECTION = 180 THEN
   A = 1
   B = 0
ELSEIF DIRECTION = 0 THEN
   A = -1
   B = 0
ELSEIF DIRECTION = 270 THEN
   A = 0
   B = -1
ELSEIF DIRECTION = 90 THEN
   A = 0
   B = 1
END IF

  IF KEY$ = "M" OR KEY$ = "m" THEN
     EX = X
     WHY = Y
     CALL MAGIC2
     CALL TABLE3
  ELSEIF KEY$ = "D" OR KEY$ = "d" THEN
     CALL POTION
     CALL TABLE3
  ELSEIF KEY$ = "c" OR KEY$ = "C" THEN
     CALL COMMAND
     IF RESTOR$ = "Y" THEN
        CALL RESTOREGAME
        RESTOR$ = " "
     END IF
     IF SAVEG$ = "Y" THEN
        EX = X
        WHY = Y
        CALL SAVE
        SAVEG$ = " "
     END IF
     CALL TABLE3
  ELSEIF KEY$ = "s" OR KEY$ = "S" THEN
     EX = X
     WHY = Y
     CALL SAVE
     CALL TABLE3
  ELSEIF KEY$ = "r" OR KEY$ = "R" THEN
     CALL RESTOREGAME
     CALL TABLE3
  ELSEIF KEY$ = "Q" OR KEY$ = "q" THEN
     CALL QUITTER
     CALL TABLE3
  ELSEIF KEY$ = "H" OR KEY$ = "h" THEN
     CALL HINTS
     CALL TABLE3
  ELSEIF KEY$ = "e" OR KEY$ = "E" THEN
     IF SOUND$ = "N" THEN
        SOUND$ = "Y"
     ELSEIF SOUND$ = "Y" THEN
        SOUND$ = "N"
     END IF
  END IF

 IF TELEPORT$ = "YES" THEN
    DOWN = Y
    ACROSS = X
    TELEPORT$ = ""
 END IF

  DB = ARMOR(YOURA)
  OB = WEAPON(YOURW)
  COMPANIONDB = ARMOR(COMPANIONA)
  COMPANIONOB = WEAPON(COMPANIONW)


END$ = ""
I = -1

DO UNTIL I = 9

 I = I + 1
 SCREEN 12
 LINE (ONE(1, I), ONE(2, I))-(ONE(3, I), ONE(4, I)), COLOUR, BF
 IF END$ <> "END" AND I <> 0 THEN

IF MAZE(ACROSS + ((I - 1) * A), DOWN + ((I - 1) * B)) <> 1 OR I = 0 THEN
  
   ENDING = I
   C = I - 1
   D = I - 1

   LINE (TWO(1, I), TWO(2, I))-(TWO(3, I), TWO(4, I)), 0, BF

   IF I < 7 THEN
   RYN$ = ""
   IF DIRECTION = 0 THEN
       IF MAZE(ACROSS + (A * C), DOWN + 1 + (D * B)) <> 1 THEN RYN$ = "Y"
   ELSEIF DIRECTION = 180 THEN
       IF MAZE(ACROSS + (A * C), DOWN - 1 + (B * D)) <> 1 THEN RYN$ = "Y"
   ELSEIF DIRECTION = 90 THEN
       IF MAZE(ACROSS + 1 + (C * A), DOWN + (B * D)) <> 1 THEN RYN$ = "Y"
   ELSEIF DIRECTION = 270 THEN
       IF MAZE(ACROSS - 1 + (C * A), DOWN + (D * B)) <> 1 THEN RYN$ = "Y"
   END IF

   IF RYN$ = "Y" THEN

   LINE (r(1, I), r(2, I))-(r(3, I), r(4, I)), 0, BF
   LINE (r(5, I), r(6, I))-(r(7, I), r(8, I)), 0, BF

   END IF

   LYN$ = ""

   IF DIRECTION = 0 THEN
       IF MAZE((ACROSS + (C * A)), DOWN - 1 + (D * B)) <> 1 THEN LYN$ = "Y"
   ELSEIF DIRECTION = 180 THEN
       IF MAZE((ACROSS + (C * A)), DOWN + 1 + (D * B)) <> 1 THEN LYN$ = "Y"
   ELSEIF DIRECTION = 90 THEN
       IF MAZE(ACROSS - 1 - (C * A), DOWN + (B * D)) <> 1 THEN LYN$ = "Y"
   ELSEIF DIRECTION = 270 THEN
       IF MAZE(ACROSS + 1 + (C * A), DOWN + (D * B)) <> 1 THEN LYN$ = "Y"
   END IF

   IF LYN$ = "Y" THEN
      LINE (L(1, I), L(2, I))-(L(3, I), L(4, I)), 0, BF
      LINE (L(5, I), L(6, I))-(L(7, I), L(8, I)), 0, BF
   END IF
END IF
ELSE
   I = 9
END IF
END IF

LINE (1, 450)-(LOW(ENDING), HIGH(ENDING)), 0
LINE (0, 0)-(LOW(ENDING), LOW(ENDING)), 0
LINE (450, 450)-(HIGH(ENDING), HIGH(ENDING)), 0
LINE (450, 0)-(HIGH(ENDING), LOW(ENDING)), 0

LOOP

KEY$ = ""

COLOR 14
LOCATE 2, 63
PRINT "Heading ";

IF DIRECTION = 0 THEN PRINT "North   "
IF DIRECTION = 180 THEN PRINT "South   "
IF DIRECTION = 90 THEN PRINT "East   "
IF DIRECTION = 270 THEN PRINT "West   "

COLOR 15
CALL PRINTHP


IF SOUND$ = "Y" THEN
   SOUND 37, .25
   SOUND 37, .75
END IF

LOOP
END

DATA 000,000,450,450,090,090,360,360,360,090,450,100,360,360,450,350
DATA 090,090,000,100,090,360,000,350

DATA 100,100,350,350,143,143,307,307,307,143,350,148,307,307,350,302
DATA 143,143,100,148,143,307,100,302

DATA 150,150,300,300,170,170,280,280,280,170,300,174,280,280,300,276
DATA 170,170,148,174,170,280,148,276

DATA 175,175,275,275,185,185,265,265,265,185,275,188,265,265,275,262
DATA 185,185,174,188,185,265,174,262

DATA 189,189,261,261,195,195,254,254,254,195,261,197,254,254,261,252
DATA 195,195,185,197,195,254,185,252

DATA 198,198,251,251,202,202,247,247,247,202,251,203,247,247,251,246
DATA 202,202,195,203,202,247,195,246

DATA 204,204,245,245,207,207,242,242
DATA 208,208,241,241,210,210,239,239
DATA 211,211,238,238,212,212,237,237
DATA 213,213,236,236,214,214,235,235

DATA 214,235
DATA 212,237
DATA 210,239
DATA 207,242
DATA 202,247
DATA 195,254
DATA 185,265
DATA 170,280
DATA 143,307
DATA 090,360

SUB CHEST

CLS
CALL HEADER
SCREEN 0

Y$ = ""
COLOR 15
PRINT "There is a chest here. You discover..."
PRINT

GREEN = INT((RND) * 3) + 1
RED = INT((RND) * 2) + 1
YELLOW = INT((RND) * 2) + 1
BLUE = INT((RND) * 2) + 1
PURPLE = INT((RND) * 2) + 1
GREY = INT((RND) * 2) + 1
WHITE = INT((RND) * 2) + 1

IF GREEN = 1 THEN
   COLOR 2
   PRINT "A green potion"
   Y$ = "Y"
   GREENPOTION = GREENPOTION + 1
END IF

IF RED = 1 THEN
   COLOR 4
   PRINT "A red potion"
   Y$ = "Y"
   REDPOTION = REDPOTION + 1
END IF

IF YELLOW = 1 THEN
   COLOR 14
   PRINT "A yellow potion"
   Y$ = "Y"
   YELLOWPOTION = YELLOWPOTION + 1
END IF

IF BLUE = 1 THEN
   COLOR 9
   PRINT "A blue potion"
   Y$ = "Y"
   BLUEPOTION = BLUEPOTION + 1
END IF

IF WHITE = 1 THEN
   COLOR 15
   PRINT "A white potion"
   Y$ = "Y"
   WHITEPOTION = WHITEPOTION + 1
END IF

IF GREY = 1 THEN
   COLOR 8
   PRINT "A grey potion"
   GREYPOTION = GREYPOTION + 1
   Y$ = "Y"
END IF

IF PURPLE = 1 THEN
   COLOR 13
   PRINT "A purple potion"
   PURPLEPOTION = PURPLEPOTION + 1
   Y$ = "Y"
END IF

IF Y$ <> "Y" THEN
   PRINT "There are no potions."
END IF

CALL DELAY2

PRINT

IF JOB$ = "A Fighter" THEN
   A = INT((RND) * (YOURA)) + (YOURA - 3)
   W = INT((RND) * (YOURW)) + (YOURW - 3)
ELSE
   A = INT((RND) * (COMPANIONA + 1)) + (COMPANIONA - 2)
   W = INT((RND) * (COMPANIONW + 1)) + (COMPANIONW - 2)
END IF

IF W < 1 THEN W = 1
IF A < 1 THEN A = 1

IF A > 23 THEN
    DO UNTIL A < 23
       A = INT((RND) * 23) + 1
    LOOP
END IF
   

IF CHECK <> 1 THEN
    IF W > 26 THEN
       DO UNTIL W < 26
          W = INT((RND) * 26) + 1
       LOOP
    END IF
ELSE
   W = INT((RND) * 20) + 1
END IF

IF W = 26 THEN
   CHECK = 1
END IF



      
          COLOR 13
          PRINT "The chest contains "; ARMOR$(A); ". Want it? (y/n) "
          OKAY$ = ""
    
       DO UNTIL OKAY$ = "OK"
          KEY$ = INKEY$
          IF KEY$ = "y" OR KEY$ = "Y" THEN
             OKAY$ = "OK"
          ELSEIF KEY$ = "N" OR KEY$ = "n" THEN
             OKAY$ = "OK"
          END IF
       LOOP
    
     IF KEY$ = "Y" OR KEY$ = "y" THEN

       IF AUSER$(A) = "f" THEN
   
          IF JOB$ = "A Fighter" THEN
             YOURA = A
          ELSE
             COMPANIONA = A
          END IF
     
       ELSEIF AUSER$(A) = "m" THEN
       
          IF JOB$ = "A Magic User" THEN
              YOURA = A
          ELSE
              COMPANIONA = A
          END IF

       END IF
 
   END IF
      
      
          COLOR 13
          IF W <> 26 THEN
             PRINT "The chest contains a "; WEAPON$(W); ". Want it? (y/n)? "
          ELSE
             PRINT "The chest contains "; WEAPON$(W); ". Want it? (y/n)? "
          END IF
         
          OKAY$ = ""
   
       DO UNTIL OKAY$ = "OK"
          KEY$ = INKEY$
          IF KEY$ = "y" OR KEY$ = "Y" THEN
             OKAY$ = "OK"
          ELSEIF KEY$ = "N" OR KEY$ = "n" THEN
             OKAY$ = "OK"
          END IF
       LOOP
    

   IF KEY$ = "Y" OR KEY$ = "y" THEN

       IF WUSER$(W) = "f" THEN
  
          IF JOB$ = "A Fighter" THEN
             YOURW = W
          ELSE
             COMPANIONW = W
          END IF
    
       ELSEIF WUSER$(W) = "m" THEN
      
          IF JOB$ = "A Magic User" THEN
              YOURW = W
          ELSE
              COMPANIONW = W
        
          END IF

       END IF

   END IF

END SUB

SUB COMMAND

SCREEN 0
CLS
CALL HEADER

COLOR 9
PRINT

PRINT "(D)"
PRINT "(S)"
PRINT "(R)"
PRINT "(M)"
PRINT "(Q)"
PRINT "(H)"
PRINT "(E)"
PRINT
PRINT "Use the Arrows on the numeric key pad to move around the maze."
PRINT "When scrolling text appears, press 'U' to increase the speed and"
PRINT "Press 'D' to decrease the speed."

COLOR 15
LOCATE 2, 4
PRINT "rink"
LOCATE 3, 4
PRINT "ave"
LOCATE 4, 4
PRINT "estore"
LOCATE 5, 4
PRINT "agic"
LOCATE 6, 4
PRINT "uit"
LOCATE 7, 4
PRINT "ints on the game."
LOCATE 8, 4
PRINT "ffects, Sound. (On/Off)"

 DO UNTIL KEY$ <> ""
   KEY$ = INKEY$
 LOOP

  IF KEY$ = "M" OR KEY$ = "m" THEN
     EX = X
     WHY = Y
     CALL MAGIC2
     CALL TABLE3
  ELSEIF KEY$ = "D" OR KEY$ = "d" THEN
     CALL POTION
     CALL TABLE3
  ELSEIF KEY$ = "s" OR KEY$ = "S" THEN
     SAVEG$ = "Y"
  ELSEIF KEY$ = "r" OR KEY$ = "R" THEN
     RESTOR$ = "Y"
  ELSEIF KEY$ = "Q" OR KEY$ = "q" THEN
     CALL QUITTER
     CALL TABLE3
  ELSEIF KEY$ = "H" OR KEY$ = "h" THEN
     CALL HINTS
     CALL TABLE3
  ELSEIF KEY$ = "e" OR KEY$ = "E" THEN
     IF SOUND$ = "N" THEN
        SOUND$ = "Y"
     ELSEIF SOUND$ = "Y" THEN
        SOUND$ = "N"
     END IF
  END IF

 
END SUB

SUB DEATH
CLS
CALL HEADER
SCREEN 0
COLOR 15



PRINT "The quest has failed. You have become victims of the Catacombs of Despair."
PRINT "This will be the last entry in the Manifest Chronicles."

CALL DELAY2

SENT$ = "The End "
COLOR 4
FOR I = 1 TO LEN(SENT$)
   FOR J = 70 TO 33 STEP -2
      LOCATE 12, J + I
      PRINT MID$(SENT$, I, 1)
      LOCATE 12, J + 1 + I
      PRINT " "
      FOR PAUSE = 1 TO 1000
      NEXT PAUSE
   NEXT J
NEXT I

CALL DELAY2
CALL HIGHSCORE

END

END SUB

SUB DELAY2
  DO UNTIL KEY$ <> ""
     KEY$ = INKEY$
  LOOP
END SUB

SUB DISPLAY

CLS
SCREEN 0

CALL HEADER

IF MAP <> 4 THEN
   LAST$ = STR$(MAP)
ELSE
   RECENT = RECENT + 1
   LAST$ = STR$(RECENT + 3)
END IF


FILENAME$ = "MAPTEXT." + (RIGHT$(LAST$, 1))

OPEN FILENAME$ FOR INPUT AS #2
DO UNTIL PHRASE$(NUM) = "EOD"
   NUM = NUM + 1
   INPUT #2, PHRASE$(NUM)
LOOP

NUM = NUM - 1
LENGTH = 3250
COUNT = 1

FOR I = 1 TO NUM
 
  
   COLOR VAL(LEFT$(PHRASE$(I), 2))
   IF VAL(LEFT$(PHRASE$(I), 2)) = 0 THEN COLOR 7
   NEWPHRASE$ = (MID$(PHRASE$(I), 2, 80))
   COUNT = 1
 
 
   DO UNTIL COUNT = LEN(NEWPHRASE$)
      COUNT = COUNT + 1

      IF MID$((NEWPHRASE$), COUNT, 1) = "Ђ" THEN
         CALL DELAY2
      ELSEIF MID$((NEWPHRASE$), COUNT, 1) = "/" THEN
         PRINT ",";
      ELSE
         PRINT MID$((NEWPHRASE$), COUNT, 1);
      END IF
      KEY$ = INKEY$
      IF KEY$ = "U" OR KEY$ = "u" THEN LENGTH = LENGTH - 50
      IF KEY$ = "D" OR KEY$ = "d" THEN LENGTH = LENGTH + 50
         FOR J = 1 TO LENGTH
         NEXT J
      REM
   LOOP
   PRINT
 NEXT I

CLOSE #2
END SUB

SUB ENCOUNTER
CLS
SCREEN 0
 
  
  ENEMY = INT((RND) * (LEVEL * 3) + (LEVEL / 1.3))
  IF ENEMY < 1 THEN ENEMY = 1
  IF ENEMY > 48 THEN
    
     DO UNTIL ENEMY < 48
        ENEMY = INT((RND) * 48 + 1)
     LOOP
  END IF

  COLOR 4
  CALL ISA
  ENEMYHP = MONSTERHP(ENEMY)
  HITPERSON = 0

OVER$ = ""
TIMES = 0
DO UNTIL OVER$ = "OVER"
 
      LOCATE 22, 20
      PRINT "                                                               "
 
  IF KEY$ <> "a" AND KEY$ <> "A" THEN
     CALL TABLE2
  END IF
 
  COLOR 7
 
  IF ENEMYHP > 0 THEN
     LOCATE 13, 49
     PRINT ENEMYHP; "/"; MONSTERHP(ENEMY); "       "
  END IF

 IF DEAD$ <> "C" THEN
    IF COMPANIONHPMAX > 99 THEN
       LOCATE 14, 16
    ELSEIF COMPANIONHPMAX > 999 THEN
       LOCATE 14, 14
    ELSE
       LOCATE 14, 17
    END IF
    COLOR 14
    PRINT COMPANIONHP; "/"; COMPANIONHPMAX
 ELSE
    LOCATE 14, 18
    COLOR 4
    PRINT "Dead"
 END IF


 IF DEAD$ <> "U" THEN
    IF HPMAX > 99 THEN
       LOCATE 8, 16
    ELSEIF HPMAX > 999 THEN
       LOCATE 8, 14
    ELSE
       LOCATE 8, 17
    END IF
    COLOR 14
    PRINT HP; "/"; HPMAX
 ELSE
    COLOR 4
    LOCATE 8, 18
    PRINT "Dead"
 END IF
 
  IF KEY$ = "A" OR KEY$ = "a" THEN
     TIMES = TIMES + 1
     IF TIMES = 4 THEN
        KEY$ = "Q"
        TIMES = 1
     END IF
  ELSE
     KEY$ = ""
     DO UNTIL KEY$ <> ""
        KEY$ = INKEY$
     LOOP
  END IF
  

   IF KEY$ = "a" OR KEY$ = "A" THEN
      HITPERSON = INT((RND) * 4) + 1
      IF DEAD$ = "U" THEN
        IF HITPERSON = 3 THEN HITPERSON = 1
        IF HITPERSON = 4 THEN HITPERSON = 2
      ELSEIF DEAD$ = "C" THEN
        IF HITPERSON = 1 THEN HITPERSON = 3
        IF HITPERSON = 2 THEN HITPERSON = 4
      END IF
   ELSEIF KEY$ = "M" OR KEY$ = "m" THEN
     CALL MAGIC
     HITPERSON = 0
   ELSEIF KEY$ = "d" OR KEY$ = "D" THEN
     CALL POTION
     P = 1
     HITPERSON = 0
   ELSEIF KEY$ = "R" OR KEY$ = "r" THEN
     CALL RUNNING
     HITPERSON = 0
   ELSE
     HITPERSON = 0
   END IF
 
  DAMAGE = 0
 
  IF OVER$ <> "OVER" THEN
     IF HITPERSON = 1 THEN
         CALL HEHITS
     ELSEIF HITPERSON = 2 THEN
         CALL HITSHIM
     ELSEIF HITPERSON = 3 THEN
         CALL HITSYOU
     ELSEIF HITPERSON = 4 THEN
         CALL YOUHIT
     END IF

 DAMAGE = 0

 IF MONSTERSPELL(ENEMY) > 0 AND ENEMYHP > 0 AND KEY$ <> "Q" THEN
    CALL ITCASTS
 END IF

 END IF
            
 IF KEY$ <> "Q" AND P <> 1 THEN
    CALL DELAY2
 END IF

 P = 0

 FOR I = 5 TO 70
    LOCATE 22, I
    PRINT " "
 NEXT I

IF ENEMYHP < 1 THEN
   KEY$ = "o"
   OVER$ = "OVER"
   XP = XP + MONSTERXP(ENEMY)
   COLOR 4
   A = INT((LEN(MONSTERNAME$(ENEMY)) + 20) / 2)
   LOCATE 22, (40 - A)
   PRINT "You have killed the "; MONSTERNAME$(ENEMY);
   CALL DELAY2

   CALL POTIONCHANCE

   IF MONSTERARMOR(ENEMY) > 0 THEN CALL GETARMOR
   IF MONSTERWEAPON(ENEMY) > 0 THEN CALL GETWEAPON
 
   IF XP >= (LEVEL * 50) * (LEVEL ^ 2) THEN
      CALL UPLEVEL
   END IF

END IF
     
      IF HP < 1 AND DEAD$ <> "U" THEN
         KEY$ = "O"
         TIMES = 4
         KEY$ = "Q"
         LOCATE 22, 27
         COLOR 4
         PRINT "Oh no! You've been killed!               "
         CALL DELAY2
         IF DEAD$ = "C" THEN CALL DEATH
         DEAD$ = "U"

     ELSEIF COMPANIONHP < 1 AND DEAD$ <> "C" THEN
        KEY$ = "O"
        A = INT((LEN(COMPANION$) + 25) / 2)
        TIMES = 4
        KEY$ = "Q"
        LOCATE 22, (40 - A)
        COLOR 4
        PRINT "Oh, no! "; COMPANION$; " has been killed!         "
        CALL DELAY2
        IF DEAD$ = "U" THEN CALL DEATH
        DEAD$ = "C"

    END IF
 
  FOR I = 1 TO 80
    LOCATE 22, I
    PRINT " "
  NEXT I

  IF KEY$ = "Q" THEN
     LOCATE 22, 34
     COLOR 9
     PRINT "Attack finished"
     CALL DELAY2
  END IF

LOOP

END SUB

SUB GETARMOR
      
       COLOR 9
       FOR I = 10 TO 70
         LOCATE 22, I
         PRINT " "
       NEXT I
       YES$ = ""


       IF AUSER$(MONSTERARMOR(ENEMY)) = "f" THEN
      
          IF JOB$ = "A Fighter" THEN
             IF MONSTERARMOR(ENEMY) > YOURA THEN YES$ = "YES"
          ELSE
             IF MONSTERARMOR(ENEMY) > COMPANIONA THEN YES$ = "YES"
          END IF
        
       ELSEIF AUSER$(MONSTERARMOR(ENEMY)) = "m" THEN
          
          IF JOB$ = "A Magic User" THEN
              IF MONSTERARMOR(ENEMY) > YOURA THEN YES$ = "YES"
          ELSE
             IF MONSTERARMOR(ENEMY) > COMPANIONA THEN YES$ = "YES"
          END IF

       END IF
         
         
      IF YES$ = "YES" THEN
         
         
          A = INT((LEN(ARMOR$(MONSTERARMOR(ENEMY))) + LEN(MONSTERNAME$(ENEMY)) + 27) / 2)
          LOCATE 22, (40 - A)
          COLOR 13
          PRINT "The "; MONSTERNAME$(ENEMY); " has "; ARMOR$(MONSTERARMOR(ENEMY)); ". Want it? (y/n)? "
          OKAY$ = ""
      
       DO UNTIL OKAY$ = "OK"
          LOCATE 22, (40 + 11 + A)
          KEY$ = INKEY$
          IF KEY$ = "y" OR KEY$ = "Y" THEN
             OKAY$ = "OK"
          ELSEIF KEY$ = "N" OR KEY$ = "n" THEN
             OKAY$ = "OK"
          END IF
       LOOP
     END IF
  
   IF KEY$ = "Y" OR KEY$ = "y" THEN

       IF AUSER$(MONSTERARMOR(ENEMY)) = "f" THEN
     
          IF JOB$ = "A Fighter" THEN
             YOURA = MONSTERARMOR(ENEMY)
          ELSE
             COMPANIONA = MONSTERARMOR(ENEMY)
          END IF
       
       ELSEIF AUSER$(MONSTERARMOR(ENEMY)) = "m" THEN
         
          IF JOB$ = "A Magic User" THEN
              YOURA = MONSTERARMOR(ENEMY)
          ELSE
              COMPANIONA = MONSTERARMOR(ENEMY)
          END IF

       END IF
   
   END IF


END SUB

SUB GETMAP
   
    SCREEN 12
    CLS
    LOCATE 14, 33
    PRINT "Loading Map...";
   
    DUMMY$ = STR$(MAP)
    FILENAME$ = "MAP." + RIGHT$(DUMMY$, 1)
   
    OPEN FILENAME$ FOR INPUT AS #2
    FOR DOWN = 1 TO 50
       IF (DOWN / 10) = INT(DOWN / 10) THEN PRINT ".";
       FOR ACROSS = 1 TO 50
         INPUT #2, MAZE(DOWN, ACROSS)
         IF MAZE(DOWN, ACROSS) = 2 THEN
            NUM = NUM + 1
            STAIRSD(NUM) = DOWN
            STAIRSA(NUM) = ACROSS
         END IF
       NEXT ACROSS
   NEXT DOWN
   CLOSE #2

A = INT((RND) * 10) + 1
FOR I = 1 TO 10
   IF A <> I THEN
      MAZE(STAIRSD(I), STAIRSA(I)) = 0
   END IF
NEXT I

IF MAP = 1 OR MAP = 2 THEN
   COLOUR = 8
ELSEIF MAP = 3 THEN
   COLOUR = 8
ELSE
   COLOUR = 4
END IF


END SUB

SUB GETWEAPON
     
       COLOR 9
       FOR I = 10 TO 70
         LOCATE 22, I
         PRINT " "
       NEXT I
       YES$ = ""


       IF WUSER$(MONSTERWEAPON(ENEMY)) = "f" THEN
     
          IF JOB$ = "A Fighter" THEN
             IF MONSTERWEAPON(ENEMY) > YOURW THEN YES$ = "YES"
          ELSE
             IF MONSTERWEAPON(ENEMY) > COMPANIONW THEN YES$ = "YES"
          END IF
       
       ELSEIF WUSER$(MONSTERWEAPON(ENEMY)) = "m" THEN
         
          IF JOB$ = "A Magic User" THEN
              IF MONSTERWEAPON(ENEMY) > YOURW THEN YES$ = "YES"
          ELSE
             IF MONSTERWEAPON(ENEMY) > COMPANIONW THEN YES$ = "YES"
          END IF

       END IF
        
        
      IF YES$ = "YES" THEN
        
        
          A = INT((LEN(WEAPON$(MONSTERWEAPON(ENEMY))) + LEN(MONSTERNAME$(ENEMY)) + 29) / 2)
          LOCATE 22, (40 - A)
          COLOR 13
          PRINT "The "; MONSTERNAME$(ENEMY); " has a "; WEAPON$(MONSTERWEAPON(ENEMY)); ". Want it? (y/n)? "
          OKAY$ = ""
     
       DO UNTIL OKAY$ = "OK"
          LOCATE 22, (40 + 11 + A)
          KEY$ = INKEY$
          IF KEY$ = "y" OR KEY$ = "Y" THEN
             OKAY$ = "OK"
          ELSEIF KEY$ = "N" OR KEY$ = "n" THEN
             OKAY$ = "OK"
          END IF
       LOOP
     END IF
 
   IF KEY$ = "Y" OR KEY$ = "y" THEN

       IF WUSER$(MONSTERWEAPON(ENEMY)) = "f" THEN
    
          IF JOB$ = "A Fighter" THEN
             YOURW = MONSTERWEAPON(ENEMY)
          ELSE
             COMPANIONW = MONSTERWEAPON(ENEMY)
          END IF
      
       ELSEIF WUSER$(MONSTERWEAPON(ENEMY)) = "m" THEN
        
          IF JOB$ = "A Magic User" THEN
              YOURW = MONSTERWEAPON(ENEMY)
          ELSE
              COMPANIONW = MONSTERWEAPON(ENEMY)
          END IF

       END IF
  
   END IF

CALL TABLE3

END SUB

SUB HEADER

X = POS(0)
Y = CSRLIN

LOCATE 25, 28
COLOR 1
PRINT "Manifest Chronicles v2.01"

LOCATE X, Y


END SUB

SUB HEALING
     CLS
     CALL HEADER
     COLOR 15
     IF DEAD$ <> "U" THEN
        PRINT "You have "; HP; "/"; HPMAX; " hit points."
     END IF
     IF DEAD$ <> "C" THEN
        PRINT COMPANION$; " has "; COMPANIONHP; "/"; COMPANIONHPMAX; " hit points"
     END IF
     PRINT
     COLOR 9
     PRINT " 10  Magic Points per hit point."
     IF DEAD$ <> "U" THEN
        PRINT ((HPMAX - HP) * 10); " Magic points to heal you fully."
     END IF
     IF DEAD$ <> "C" THEN
        PRINT ((COMPANIONHPMAX - COMPANIONHP) * 10); " Magic Points to heal "; COMPANION$; " fully."
     END IF
     PRINT
     COLOR 13
     IF DEAD$ = "" THEN
   
     DO UNTIL OKAY$ = "OKAY"
        PRINT "Heal Who? 1) You  2) "; COMPANION$;
        INPUT WHO
        IF WHO = 1 THEN OKAY$ = "OKAY"
        IF WHO = 2 THEN OKAY$ = "OKAY"
     LOOP
   
     OKAY$ = ""
     OVER$ = ""
     END IF
   
     IF DEAD$ = "U" THEN WHO = 2
     IF DEAD$ = "C" THEN WHO = 1

     OVER$ = ""
     DO UNTIL OKAY$ = "OKAY"
        INPUT "How many hit points? ", HITPOINTS
      
        IF WHO = 1 THEN
           IF HITPOINTS > (HPMAX - HP) THEN
             PRINT "You only need "; (HPMAX - HP)
           ELSEIF HITPOINTS < 0 THEN
             HITPOINTS = 0
             OKAY$ = "OKAY"
           ELSE
             OVER$ = "OVER"
           END IF

        ELSEIF WHO = 2 THEN
           IF HITPOINTS > (COMPANIONHPMAX - COMPANIONHP) THEN
              PRINT COMPANION$; " only needs "; (COMPANIONHPMAX - COMPANIONHP)
           ELSEIF HITPOINTS < 0 THEN
              HITPOINTS = 0
              OKAY$ = "OKAY"
           ELSE
             OVER$ = "OVER"
           END IF
        END IF
         
         
           IF OVER$ = "OVER" THEN
             IF USER = 1 THEN
                IF (HITPOINTS * 10) > MP THEN
                   PRINT "You don't have that many Magic Points."
                ELSE
                  
    IF SOUND$ = "Y" THEN
        FOR I = 1 TO 4
           FOR J = 37 TO 1000 STEP 65
               SOUND J, .5
           NEXT J
        NEXT I
    END IF
                  
                   PRINT HITPOINTS; " restored."
                   MP = MP - (HITPOINTS * 10)
                   IF WHO = 1 THEN
                      HP = HP + HITPOINTS
                      OKAY$ = "OKAY"
                   ELSEIF WHO = 2 THEN
                      COMPANIONHP = COMPANIONHP + HITPOINTS
                      OKAY$ = "OKAY"
                   END IF
                END IF
            ELSEIF USER = 2 THEN
               IF (HITPOINTS * 10) > COMPANIONMP THEN
                  PRINT COMPANION$; " doesn't have that many Magic Points."
               ELSE
                 
    IF SOUND$ = "Y" THEN
        FOR I = 1 TO 4
           FOR J = 37 TO 1000 STEP 65
               SOUND J, .5
           NEXT J
        NEXT I
    END IF
                 
                 
                  PRINT HITPOINTS; " restored."
                  COMPANIONMP = COMPANIONMP - (HITPOINTS * 10)
                  IF WHO = 1 THEN
                     HP = HP + HITPOINTS
                     OKAY$ = "OKAY"
                  ELSEIF WHO = 2 THEN
                     COMPANIONHP = COMPANIONHP + HITPOINTS
                     OKAY$ = "OKAY"
                  END IF
               END IF
             END IF
            END IF
         LOOP


END SUB

SUB HEHITS
 COLOR 15
     CHANCE = INT((RND) * (LEVEL + 5)) + 1
     IF CHANCE = 1 THEN
        A = INT((LEN(COMPANION$) + 19) / 2)
        LOCATE 22, (40 - A)
        PRINT COMPANION$; " swings and misses."
     ELSE
        DAMAGE = INT((RND) * (COMPANIONAP + COMPANIONOB - LEVEL)) + (LEVEL ^ 2)
        DAMAGE = (INT(DAMAGE - ARMOR(MONSTERARMOR(ENEMY))))
        IF DAMAGE < 1 THEN DAMAGE = 1
        A = INT((LEN(MONSTERNAME$(ENEMY)) + LEN(DAMAGE) + LEN(COMPANION$) + 15) / 2)
        LOCATE 22, (40 - A)
        PRINT COMPANION$; " hits the "; MONSTERNAME$(ENEMY); " for "; DAMAGE
       
        IF SOUND$ = "Y" THEN
           FOR I = 300 TO 40 STEP -5
              SOUND I, .065
           NEXT I
        END IF
       
        ENEMYHP = ENEMYHP - DAMAGE
     END IF
 


END SUB

SUB HIGHSCORE

OPEN "HIGH.DAT" FOR INPUT AS #2
   FOR I = 1 TO 10
      INPUT #2, HNAME$(I), HCOMPANION$(I), HLEVEL(I), HXP(I)
   NEXT I
CLOSE #2


YUP$ = ""
FOR I = 1 TO 10
   IF HNAME$(I) = NAME$ THEN
      YUP$ = "YUP"
      IF XP > HXP(I) THEN
         HLEVEL(I) = LEVEL
         HCOMPANION$(I) = COMPANION$
         HXP(I) = XP
         MAXX = 10
      END IF
   END IF
NEXT I

IF YUP$ <> "YUP" THEN
   HNAME$(11) = NAME$
   HCOMPANION$(11) = COMPANION$
   HLEVEL(11) = LEVEL
   HXP(11) = XP
   MAXX = 11
END IF

FOR I = MAXX TO 2 STEP -1
 
   IF HXP(I) > HXP(I - 1) THEN
  
     XPTEMP = HXP(I - 1)
     HXP(I - 1) = HXP(I)
     HXP(I) = XPTEMP

     TEMPN$ = HNAME$(I - 1)
     HNAME$(I - 1) = HNAME$(I)
     HNAME$(I) = TEMPN$

     TEMPN$ = HCOMPANION$(I - 1)
     HCOMPANION$(I - 1) = HCOMPANION$(I)
     HCOMPANION$(I) = TEMPN$

     LEVELT = HLEVEL(I - 1)
     HLEVEL(I - 1) = HLEVEL(I)
     HLEVEL(I) = LEVELT

   END IF

 NEXT I

 CALL TABLE5

 OPEN "HIGH.DAT" FOR OUTPUT AS #2
       

 FOR I = 1 TO 10
    PRINT #2, HNAME$(I), ","; HCOMPANION$(I), ","; HLEVEL(I), ","; HXP(I)
 NEXT I

 CLOSE #2
 CALL DELAY2

 COLOR 7

END SUB

SUB HINTS
   SCREEN 0
   CLS
   CALL HEADER
   COLOR 15
   LOCATE 1, 35
   PRINT "Hints Menu"
   PRINT
   PRINT "When viewing a topic, press 'U' to increase the speed, 'D' to decrease."
   COLOR 9
   PRINT "Press the letter of the topic you wish to view."
   PRINT
   PRINT "(F)";
   COLOR 15
   PRINT "ighting Battles"
   COLOR 9
   PRINT "(M)";
   COLOR 15
   PRINT "agic "
   COLOR 9
   PRINT "(S)";
   COLOR 15
   PRINT "urviving the Maze"
   COLOR 9
   PRINT "(L)";
   COLOR 15
   PRINT "ocating the Stairs"
   COLOR 9
   PRINT "(W)";
   COLOR 15
   PRINT "eapons and Armor"
   COLOR 9
   PRINT "(B)";
   COLOR 15
   PRINT "ackground "
   COLOR 9




OK$ = ""
DO UNTIL OK$ = "OK"
    KEY$ = INKEY$
    IF KEY$ = "F" OR KEY$ = "f" THEN
       OK$ = "OK"
       FILENAME$ = "HELP.1"
    ELSEIF KEY$ = "P" OR KEY$ = "p" THEN
       OK$ = "OK"
       FILENAME$ = "HELP.2"
    ELSEIF KEY$ = "M" OR KEY$ = "m" THEN
       OK$ = "OK"
       FILENAME$ = "HELP.3"
    ELSEIF KEY$ = "S" OR KEY$ = "s" THEN
       OK$ = "OK"
       FILENAME$ = "HELP.4"
    ELSEIF KEY$ = "L" OR KEY$ = "l" THEN
       OK$ = "OK"
       FILENAME$ = "HELP.5"
    ELSEIF KEY$ = "b" OR KEY$ = "B" THEN
       OK$ = "OK"
       FILENAME$ = "HELP.6"
    ELSEIF KEY$ = " " THEN
       OK$ = "OK"
       KEY$ = " "
    ELSEIF KEY$ = "W" OR KEY$ = "w" THEN
       OK$ = "OK"
       FILENAME$ = "HELP.7"
    END IF
LOOP

IF KEY$ <> " " THEN
OPEN FILENAME$ FOR INPUT AS #2
CLS

CALL HEADER

DO UNTIL PHRASE$(NUM) = "EOD"
   NUM = NUM + 1
   INPUT #2, PHRASE$(NUM)
LOOP

NUM = NUM - 1
LENGTH = 250
COUNT = 1

FOR I = 1 TO NUM

 
   COLOR VAL(LEFT$(PHRASE$(I), 2))
   IF VAL(LEFT$(PHRASE$(I), 2)) = 0 THEN COLOR 7
   NEWPHRASE$ = (MID$(PHRASE$(I), 2, 80))
   COUNT = 1


   DO UNTIL COUNT = LEN(NEWPHRASE$)
      COUNT = COUNT + 1

      IF MID$((NEWPHRASE$), COUNT, 1) = "Ђ" THEN
         CALL DELAY2
      ELSEIF MID$((NEWPHRASE$), COUNT, 1) = "/" THEN
         PRINT ",";
      ELSE
         PRINT MID$((NEWPHRASE$), COUNT, 1);
      END IF
      KEY$ = INKEY$
      IF KEY$ = "U" OR KEY$ = "u" THEN LENGTH = LENGTH - 50
      IF KEY$ = "D" OR KEY$ = "d" THEN LENGTH = LENGTH + 50
         FOR J = 1 TO LENGTH
         NEXT J
      REM
   LOOP
   PRINT
 NEXT I


CLOSE #2
END IF


END SUB

SUB HITSHIM
 COLOR 4
 CHANCE = INT((RND) * (ENEMY + 1)) + 1
   IF INVIS$ = "Yes" THEN CHANCE = 1
   IF CHANCE = 1 THEN
      LOCATE 22, 25
      A = INT((LEN(MONSTERNAME$(ENEMY)) + LEN(COMPANION$) + 24) / 2)
      LOCATE 22, (40 - A)
      PRINT "The "; MONSTERNAME$(ENEMY); " attacks "; COMPANION$; " and misses"
   ELSE
      DAMAGE = INT((RND) * (MONSTERAP(ENEMY))) + ENEMY
      DAMAGE = (INT(DAMAGE - DB))
      IF DAMAGE < 1 THEN DAMAGE = 1
      COMPANIONHP = COMPANIONHP - DAMAGE
      A = INT((LEN(COMPANION$) + LEN(DAMAGE) + 17) / 2)
      LOCATE 22, (40 - A)
      PRINT COMPANION$; " has taken "; DAMAGE; "damage"
      IF SOUND$ = "Y" THEN
         FOR I = 300 TO 40 STEP -5
            SOUND I, .065
         NEXT I
      END IF
   END IF


END SUB

SUB HITSYOU
COLOR 4
CHANCE = INT((RND) * (ENEMY + 1)) + 1
IF INVIS$ = "Yes" THEN CHANCE = 1
IF CHANCE = 1 THEN
    A = INT((LEN(MONSTERNAME$(ENEMY)) + 34) / 2)
    LOCATE 22, (40 - A)
    PRINT "The "; MONSTERNAME$(ENEMY); " attacks but does not hit you"
 ELSE
    DAMAGE = INT((RND) * (MONSTERAP(ENEMY)) + WEAPON(MONSTERWEAPON(ENEMY))) + ENEMY
    DAMAGE = INT(DAMAGE - DB)
    IF DAMAGE < 1 THEN DAMAGE = 1
    A = INT((LEN(DAMAGE) + 19) / 2)
    LOCATE 22, (40 - A)
    PRINT "You sustain "; DAMAGE; " damage"
    IF SOUND$ = "Y" THEN
       FOR I = 300 TO 40 STEP -5
         SOUND I, .065
       NEXT I
    END IF
    HP = HP - DAMAGE

END IF


END SUB

SUB INIT

  NUM = 0
  OPEN "MONSTERS.DAT" FOR INPUT AS #2
  LOCATE 14, 41
  PRINT "Monsters...   "
  DO UNTIL MONSTERNAME$(NUM) = "Eod"
     NUM = NUM + 1
     INPUT #2, MONSTERNAME$(NUM)
     INPUT #2, MONSTERSPEED(NUM)
     INPUT #2, MONSTERHP(NUM)
     INPUT #2, MONSTERAP(NUM)
     INPUT #2, MONSTERXP(NUM)
     INPUT #2, MONSTERWEAPON(NUM)
     INPUT #2, MONSTERARMOR(NUM)
     INPUT #2, MONSTERSPELL(NUM)
 LOOP

 NUM = 0

 CLOSE #2
 OPEN "WEAPONS.DAT" FOR INPUT AS #2
 LOCATE 14, 41
 PRINT "Weapons...     "
 DO UNTIL WEAPON$(NUM) = "EOD"
    NUM = NUM + 1
    INPUT #2, WEAPON$(NUM)
    INPUT #2, WEAPON(NUM)
    INPUT #2, WUSER$(NUM)
 LOOP
 WEAPON$(0) = "No Weapon"
 CLOSE #2

 NUM = 0
 OPEN "ARMOR.DAT" FOR INPUT AS #2
 LOCATE 14, 41
 PRINT "Armor...        "
 DO UNTIL ARMOR$(NUM) = "EOD"
    NUM = NUM + 1
    INPUT #2, ARMOR$(NUM)
    INPUT #2, ARMOR(NUM)
    INPUT #2, AUSER$(NUM)
 LOOP
 ARMOR$(0) = "No Armor"
 CLOSE #2
  
 NUM = 11
 OPEN "MONSPELL.DAT" FOR INPUT AS #2
 DO UNTIL MSPELLNAME$(NUM) = "EOD"
    NUM = NUM - 1
    INPUT #2, MSPELLNAME$(NUM)
    INPUT #2, MSPELLLOW(NUM)
    INPUT #2, MSPELLHIGH(NUM)
 LOOP
 CLOSE #2

 NUM = 0
 OPEN "SPELLS.DAT" FOR INPUT AS #2
 LOCATE 14, 41
 PRINT "Spells..."
 DO UNTIL SPELLNAME$(NUM) = "EOD"
    NUM = NUM + 1
    INPUT #2, SPELLNAME$(NUM)
    INPUT #2, SPELLLOW(NUM)
    INPUT #2, SPELLHIGH(NUM)
    INPUT #2, SPELLREQ(NUM)
    INPUT #2, SPELLTEXT$(NUM)
 LOOP
 CLOSE #2
 CLS

END SUB

SUB ISA

   CLS
   CALL HEADER
   COLOR 15
   PRINT "There is a "; MONSTERNAME$(ENEMY); " here. "
   PRINT
   COLOR 12
  
   LOCATE 5, (38 - (LEN(MONSTERNAME$(ENEMY)) / 2))
   COLOR 14

   PRINT MONSTERNAME$(ENEMY)
   COLOR 1
   FOR I = 15 TO 59
      LOCATE 6, I
      PRINT "Д"
   NEXT I
   LOCATE 7, 15
   COLOR 15
   PRINT "Speed: ";
   IF MONSTERSPEED(ENEMY) = 0 THEN
      LOCATE 7, (45 - (9 / 2))
      PRINT "Very Slow"
   ELSEIF MONSTERSPEED(ENEMY) = 1 THEN
      LOCATE 7, (45 - (4 / 2))
      PRINT "Slow"
   ELSEIF MONSTERSPEED(ENEMY) = 2 THEN
      LOCATE 7, (45 - (4 / 2))
      PRINT "Fast"
   ELSEIF MONSTERSPEED(ENEMY) = 3 THEN
      LOCATE 7, (45 - (9 / 2))
      PRINT "Very Fast"
   ELSEIF MONSTERSPEED(ENEMY) > 3 THEN
      LOCATE 7, (45 - (14 / 2))
      PRINT "Extremely Fast"
   END IF
   COLOR 1
   PRINT
   FOR I = 15 TO 59
      LOCATE 8, I
      PRINT "Д"
   NEXT I
   COLOR 15
   LOCATE 9, 15
   PRINT "Weapon: ";
   LOCATE 9, (45 - (LEN(WEAPON$(MONSTERWEAPON(ENEMY)))) / 2)
   PRINT WEAPON$(MONSTERWEAPON(ENEMY))
   LOCATE 10, 15
   PRINT "Armor: ";
   LOCATE 10, (45 - (LEN(ARMOR$(MONSTERARMOR(ENEMY)))) / 2)
   PRINT ARMOR$(MONSTERARMOR(ENEMY))
   PRINT
   COLOR 3
   LOCATE 12, 15
   COLOR 15
   PRINT "Endurance: ";
   IF MONSTERHP(ENEMY) > (HPMAX * 2) THEN
     LOCATE 12, (45 - (12 / 2))
     PRINT "Overwhelming"
   ELSEIF MONSTERHP(ENEMY) > (HPMAX) THEN
      LOCATE 12, (45 - (9 / 2))
      PRINT "Excellent"
   ELSEIF (MONSTERHP(ENEMY) * 3) < HPMAX THEN
      LOCATE 12, (45 - (9 / 2))
      PRINT "Very Poor"
   ELSEIF (MONSTERHP(ENEMY) * 2) < HPMAX THEN
      LOCATE 12, (45 - (4 / 2))
      PRINT "Poor"
   ELSEIF MONSTERHP(ENEMY) < HPMAX THEN
      LOCATE 12, (45 - (4 / 2))
      PRINT "Good"
   END IF
  COLOR 1
  FOR I = 15 TO 59
     LOCATE 11, I
     PRINT "Д"
  NEXT I
  LOCATE 13, 15
  COLOR 15
  PRINT "Power: ";
  IF MONSTERAP(ENEMY) > (AP * 2) THEN
     LOCATE 13, (45 - (12 / 2))
     PRINT "Overwhelming"
  ELSEIF MONSTERAP(ENEMY) > AP THEN
     LOCATE 13, (45 - (9 / 2))
     PRINT "Excellent"
  ELSEIF (MONSTERAP(ENEMY) * 3) < AP THEN
     LOCATE 13, (45 - (9 / 2))
     PRINT "Very Poor"
  ELSEIF (MONSTERAP(ENEMY) * 2) < AP THEN
     LOCATE 13, (45 - (4 / 2))
     PRINT "Poor"
  ELSEIF MONSTERAP(ENEMY) < AP THEN
     LOCATE 13, (45 - (4 / 2))
     PRINT "Good"
  END IF
  PRINT
  COLOR 1
  FOR I = 15 TO 59
     LOCATE 14, I
     PRINT "Д"
  NEXT I
  LOCATE 15, 15
  COLOR 15
  PRINT "Spell Level: ";
  LOCATE 15, 44
  PRINT MONSTERSPELL(ENEMY)
 
  COLOR 1
  FOR I = 7 TO 16
     LOCATE I, 30
     PRINT "і"
  NEXT I

 LOCATE 6, 30
 PRINT "В"
 LOCATE 8, 30
 PRINT "Е"
 LOCATE 11, 30
 PRINT "Е"
 LOCATE 14, 30
 PRINT "Е"

 
 FOR I = 15 TO 60
    LOCATE 4, I
    PRINT "Н"
 NEXT I
 
 FOR I = 15 TO 60
    LOCATE 16, I
    PRINT "Н"
 NEXT I

 FOR I = 5 TO 15
    LOCATE I, 14
    PRINT "є"
 NEXT I

 FOR I = 5 TO 15
    LOCATE I, 60
    PRINT "є"
 NEXT I

 LOCATE 4, 14
 PRINT "Й"
 LOCATE 4, 60
 PRINT "»"
 LOCATE 16, 14
 PRINT "И"
 LOCATE 16, 60
 PRINT "ј"
 LOCATE 16, 30
 PRINT "П"

 CALL DELAY2



END SUB

SUB ITCASTS
   
    SPELLCHANCE = INT((RND) * 4) + 1
   
    IF SPELLCHANCE = 2 OR YES$ = "YES" THEN
    
       CALL DELAY2

       FOR I = 5 TO 70
        LOCATE 22, I
        PRINT " "
       NEXT I
      
       SPELL = INT((RND) * MONSTERSPELL(ENEMY)) + 1
       DAMAGE = INT((RND) * MSPELLHIGH(SPELL)) + MSPELLLOW(SPELL)
       COMPANIONHP = COMPANIONHP - DAMAGE
       HP = HP - DAMAGE
       A = INT((LEN(MONSTERNAME$(ENEMY)) + LEN(MSPELLNAME$(SPELL)) + LEN(DAMAGE) + 21) / 2)
       LOCATE 22, (40 - A)
       COLOR 4
      IF SOUND$ = "Y" THEN
FOR I = 1 TO 5
   FOR J = 150 TO 40 STEP -20
      SOUND J, .25
      NEXT J
NEXT I
      END IF

      
       PRINT "The "; MONSTERNAME$(ENEMY); " casts "; MSPELLNAME$(SPELL); ", "; DAMAGE; " damage."
      
   END IF

END SUB

SUB MAGIC
   CLS
   
   LOCATE 2, 6
   COLOR 15
   PRINT "Pain Spells"
   LOCATE 2, 29
   PRINT "Elemental Spells"
   LOCATE 2, 56
   PRINT "Wrecking Spells"
   COLOR 4
   FOR I = 1 TO 5
     LOCATE I + 5, 4
     PRINT I; "- "; SPELLNAME$(I); ": ";
     PRINT SPELLREQ(I)
   NEXT I
   FOR I = 6 TO 10
     LOCATE (I - 5) + 5, 27
     PRINT I; "- "; SPELLNAME$(I); ": ";
     PRINT SPELLREQ(I)
   NEXT I
   FOR I = 11 TO 15
      LOCATE (I - 10) + 5, 54
      PRINT I; "- "; SPELLNAME$(I); ": ";
      PRINT SPELLREQ(I)
   NEXT I
  
   COLOR 9
   LOCATE 15, 25
   IF DEAD$ <> "U" THEN
      PRINT "You have "; MP; " magic points"
   END IF
   LOCATE 16, 25
   IF DEAD$ <> "C" THEN
      PRINT COMPANION$; " has "; COMPANIONMP; " magic points"
   END IF
  
   LOCATE 17, 25
   IF DEAD$ = "" THEN
   IF JOB$ = "A Magic User" THEN
      PRINT "Use your magic? (y/n)";
      USER = 1
   ELSE
      PRINT "Use "; COMPANION$; "s magic? (y/n)";
      USER = 2
   END IF
   CHOICE$ = ""
   OKAY$ = ""
  
   DO UNTIL OKAY$ = "OKAY"
      CHOICE$ = INKEY$
      IF CHOICE$ = "Y" OR CHOICE$ = "y" THEN
         OKAY$ = "OKAY"
      ELSEIF CHOICE$ = "N" OR CHOICE$ = "n" THEN
         OKAY$ = "OKAY"
      IF USER = 2 THEN
         USER = 1
      ELSE
         USER = 2
      END IF
    END IF
   LOOP
   LOCATE 16, 28
   PRINT "                                                       "
   LOCATE 17, 28
   PRINT "                                                      "
   FOR I = 1 TO 80
      LOCATE 15, I
      PRINT " "
   NEXT I
   FOR I = 1 TO 80
      LOCATE 16, I
      PRINT " "
   NEXT I
   END IF


   LOCATE 16, 28
   IF DEAD$ = "U" THEN
      USER = 2
      LOCATE 15, 28
   ELSEIF DEAD$ = "C" THEN
      USER = 1
      LOCATE 16, 28
   END IF
   PRINT "What spell? (1-15)                   "
                             
   DO UNTIL OKAY$ = "OK"
      LOCATE 16, 47
      IF DEAD$ = "U" THEN
         LOCATE 15, 47
      ELSEIF DEAD$ = "C" THEN
         LOCATE 16, 47
      END IF
      INPUT SPELLNUM
      IF SPELLNUM >= -1 AND SPELLNUM < 16 THEN
         IF USER = 1 THEN
            IF SPELLREQ(SPELLNUM) <= MP THEN
               OKAY$ = "OK"
               SPELL = SPELLNUM
            ELSE
               LOCATE 18, 20
               PRINT "You do not have sufficent Magic to cast that spell"
               CALL DELAY2
               LOCATE 18, 20
               PRINT "                                                          "
            END IF
         ELSEIF USER = 2 THEN
           IF SPELLREQ(SPELLNUM) <= COMPANIONMP THEN
              OKAY$ = "OK"
              SPELL = SPELLNUM
           ELSE
              A = INT((LEN(COMPANION$) + 49) / 2)
              LOCATE 18, (40 - A)
              PRINT COMPANION$; " does not have suffient Magic to cast that spell"
              CALL DELAY2
              LOCATE 18, 1
              PRINT "                                                                        "
           END IF
         END IF
      ELSEIF SPELLNUM = 0 THEN
         OKAY$ = "OK"
         SPELL = 0
      END IF
   LOOP


 IF SPELL > 0 THEN
   PHRASE$ = SPELLTEXT$(SPELL)
   LOCATE 17, (40 - (LEN(PHRASE$) / 2))
   PRINT PHRASE$

   DAMAGE = INT((RND) * SPELLHIGH(SPELL)) + SPELLLOW(SPELL)
  
   A = INT((LEN(DAMAGE) + 10) / 2)
   LOCATE 18, (40 - A)
   PRINT DAMAGE; " Damage"
   ENEMYHP = ENEMYHP - DAMAGE

   IF USER = 1 THEN
      MP = MP - SPELLREQ(SPELL)
   ELSEIF USER = 2 THEN
     COMPANIONMP = COMPANIONMP - SPELLREQ(SPELL)
   END IF
 END IF


 IF ENEMYHP > -1 AND DEAD$ = "" THEN

 IF MONSTERSPELL(ENEMY) > 0 AND ENEMYHP > 0 THEN
    SPELLCHANCE = INT((RND) * 2) + 1
      IF SPELLCHANCE = 2 OR YES$ = "YES" THEN
        CALL ITCASTS
      END IF

 ELSEIF ENEMYHP > -1 THEN

 HITCHANCE = INT((RND) * 5) + 1
 IF INVIS$ = "Yes" THEN HITCHANCE = 999

 IF HITCHANCE <= MONSTERSPEED(ENEMY) THEN
    HITPERSON = INT((RND) * 2) + 1
 ELSE
    HITPERSON = 0
 END IF
  
  IF HITPERSON = 1 THEN
      A = INT((LEN(MONSTERNAME$(ENEMY)) + 14 + LEN(COMPANION$)) / 2)
      LOCATE 21, (40 - A)
      PRINT "The "; MONSTERNAME$(ENEMY); " attacks "; COMPANION$
      CALL HITSHIM
  ELSEIF HITPERSON = 2 THEN
      A = INT((LEN(MONSTERNAME$(ENEMY)) + 17) / 2)
      LOCATE 21, (40 - A)
      PRINT "The "; MONSTERNAME$(ENEMY); " attacks you."
      CALL HITSYOU
  END IF

  END IF
END IF
END SUB

SUB MAGIC2
   SCREEN 0
   CLS
   CALL HEADER
   LOCATE 5, 10
   COLOR 15
   PRINT "Spells...."
   COLOR 9
   PRINT
  
   PRINT TAB(20); "0 To Quit "
   PRINT TAB(20); "1) Heal..........."
   PRINT TAB(20); "2) Location......."
   PRINT TAB(20); "3) Eagle Eye......"
   PRINT TAB(20); "4) Life..........."
   PRINT TAB(20); "5) Teleport......."

   PRINT
   COLOR 15
   IF DEAD$ <> "U" THEN
      PRINT TAB(10); "You have "; MP; " magic points."
   END IF
   IF DEAD$ <> "C" THEN
      PRINT TAB(10); COMPANION$; " has "; COMPANIONMP; " magic points."
   PRINT
   END IF

   IF DEAD$ = "" THEN
   IF JOB$ = "A Magic User" THEN
      PRINT TAB(10); "Use your magic? (y/n)";
      USER = 1
   ELSE
      PRINT TAB(10); "Use "; COMPANION$; "s magic? (y/n)";
      USER = 2
   END IF
  
   CHOICE$ = ""
   OKAY$ = ""
   DO UNTIL OKAY$ = "OKAY"
      CHOICE$ = INKEY$
      IF CHOICE$ = "Y" OR CHOICE$ = "y" THEN
         OKAY$ = "OKAY"
      ELSEIF CHOICE$ = "N" OR CHOICE$ = "n" THEN
         OKAY$ = "OKAY"
      IF USER = 2 THEN
         USER = 1
      ELSE
         USER = 2
      END IF
    END IF
   LOOP
   END IF
  COLOR 9
 
  IF DEAD$ = "U" THEN USER = 2
  IF DEAD$ = "C" THEN USER = 1
 
  PRINT
  PRINT
  LOCATE 18, 20
  PRINT TAB(10); "What spell? ";
  DO UNTIL OKAY$ = "OK"
     LOCATE 19, 20
     INPUT SPELL
     IF SPELL < 6 AND SPELL > -1 THEN
        OKAY$ = "OK"
     END IF
  LOOP

  IF SPELL = 1 THEN
     CALL HEALING
  ELSEIF SPELL = 2 THEN
     CLS
     CALL HEADER
     COLOR 15
     PRINT
     PRINT TAB(5); "0) Quit"
     PRINT TAB(5); "1) Quadrant.....50 Mp"
     PRINT TAB(5); "2) Precise....150 Mp "
     PRINT
    
     COLOR 5
     OVER$ = ""
     DO UNTIL OVER$ = "OVER"
        INPUT "What Spell "; WHICH
        IF WHICH = 1 THEN
           IF USER = 1 THEN
              IF MP >= 50 THEN
                 OVER$ = "OVER"
                
                 IF WHY >= 25 THEN
                    ACROSS$ = "east"
                 ELSEIF WHY < 25 THEN
                    ACROSS$ = "west"
                 END IF
               
                 IF EX >= 25 THEN
                    DOWN$ = "South"
                 ELSEIF EX < 25 THEN
                    DOWN$ = "North"
                 END IF
                
                 COLOR 15
   
    IF SOUND$ = "Y" THEN
        FOR I = 1 TO 4
           FOR J = 37 TO 1000 STEP 65
               SOUND J, .5
           NEXT J
        NEXT I
    END IF
                
                
                 PRINT "You are in the "; DOWN$; ACROSS$; " Quadrant."
                 MP = MP - 50
                 CALL DELAY2
             
              ELSE
                 PRINT "You do not have enough Magic Points to cast that."
              END IF
             
           ELSE
             IF COMPANIONMP >= 50 THEN
                 OVER$ = "OVER"
                 IF WHY >= 25 THEN
                    ACROSS$ = "east"
                 ELSEIF WHY < 25 THEN
                    ACROSS$ = "west"
                 END IF
                
                 IF EX >= 25 THEN
                    DOWN$ = "South"
                 ELSEIF EX < 25 THEN
                    DOWN$ = "North"
                 END IF
                 COLOR 15
   
    IF SOUND$ = "Y" THEN
        FOR I = 1 TO 4
           FOR J = 37 TO 1000 STEP 65
               SOUND J, .5
           NEXT J
        NEXT I
    END IF
                
                 PRINT "You are in the "; DOWN$; ACROSS$; " Quadrant."
                 COMPANIONMP = COMPANIONMP - 50
            
             ELSE

                PRINT COMPANION$; " does not have enough Magic Points to cast that."
             END IF
           END IF
        ELSEIF WHICH = 2 THEN
           IF USER = 1 THEN
              IF MP >= 150 THEN
                 COLOR 15
                
    IF SOUND$ = "Y" THEN
        FOR I = 1 TO 4
           FOR J = 37 TO 1000 STEP 65
               SOUND J, .5
           NEXT J
        NEXT I
    END IF

                
                 PRINT "You are "; (WHY - 10); " steps east and "; (EX - 10); " steps south of your original location."
                 OVER$ = "OVER"
                 CALL DELAY2
                 MP = MP - 150
              ELSE
                 PRINT "You don't have enough Magic Points to cast that."
                 CALL DELAY2
              END IF
           ELSEIF USER = 2 THEN
              IF COMPANIONMP >= 150 THEN
                 COLOR 15
                
    IF SOUND$ = "Y" THEN
        FOR I = 1 TO 4
           FOR J = 37 TO 1000 STEP 65
               SOUND J, .5
           NEXT J
        NEXT I
    END IF
                
                
                 PRINT "You are "; (WHY - 10); " steps east and "; (EX - 10); " steps south of your original location."
                 CALL DELAY2
                 OVER$ = "OVER"
                 COMPANIONMP = COMPANIONMP - 150
              ELSE
                 PRINT COMPANION$; " does not have enough Magic Points to cast that."
                 CALL DELAY2
             
              END IF
             CALL DELAY2
            END IF
        ELSEIF WHICH = 0 THEN
            OVER$ = "OVER"
        END IF
    LOOP

ELSEIF SPELL = 3 THEN
   CLS
   CALL HEADER
   COLOR 13
   PRINT
   PRINT "0) Quit"
   PRINT "1) 5x5..........100 MP"
   PRINT "2) 10x10........250 MP"
   PRINT "3) 20x20........500 MP"
   PRINT
   OKAY$ = ""
   DO UNTIL OKAY$ = "OK"
      COLOR 15
      INPUT "Which spell? ", WHICH
      IF WHICH = 1 THEN
         IF USER = 1 THEN
            IF MP >= 100 THEN
               CAST$ = "OK"
               OKAY$ = "OK"
            ELSE
               PRINT "You don't have enough Magic Points to cast that."
            END IF
         ELSEIF USER = 2 THEN
            IF COMPANIONMP >= 100 THEN
               CAST$ = "OK"
               OKAY$ = "OK"
            ELSE
               PRINT COMPANION$; " does not have enough Magic Points to cast that."
            END IF
         END IF
      ELSEIF WHICH = 2 THEN
         IF USER = 1 THEN
            IF MP >= 250 THEN
               CAST$ = "OK"
               OKAY$ = "OK"
            ELSE
               PRINT "You don't have enough Magic Points to cast that."
            END IF
         ELSEIF USER = 2 THEN
            IF COMPANIONMP >= 250 THEN
               CAST$ = "OK"
               OKAY$ = "OK"
            ELSE
               PRINT COMPANION$; " does not have enough Magic Points to cast that."
            END IF
         END IF
    ELSEIF WHICH = 3 THEN
        IF USER = 1 THEN
            IF MP >= 500 THEN
               CAST$ = "OK"
               OKAY$ = "OK"
            ELSE
               PRINT "You don't have enough Magic Points to cast that."
            END IF
         ELSEIF USER = 2 THEN
    IF COMPANIONMP >= 500 THEN
               CAST$ = "OK"
               OKAY$ = "OK"
            ELSE
               PRINT COMPANION$; " does not have enough Magic Points to cast that."
            END IF
         END IF
  
  
   ELSEIF WHICH = 0 THEN
       OKAY$ = "OK"
   END IF
  
   LOOP

   IF CAST$ = "OK" THEN
      CALL OVERHEAD
   END IF

 CALL DELAY2


  ELSEIF SPELL = 5 THEN
     CLS
     CALL HEADER
     OKAY$ = ""
     PRINT "500 MP to Teleport......."
     IF USER = 1 THEN
        IF MP >= 500 THEN
           OKAY$ = "OK"
           MP = MP - 500
        ELSE
           PRINT "You don't have enough Magic."
        END IF
     ELSEIF USER = 2 THEN
         IF COMPANIONMP >= 500 THEN
             OKAY$ = "OK"
             COMPANIONMP = COMPANIONMP - 500
         ELSE
            PRINT COMPANION$; " does not have enough Magic."
         END IF
     END IF

     IF OKAY$ = "OK" THEN
        OKAY$ = ""
        DO UNTIL OKAY$ = "OK"
           COLOR 15
           PRINT
           PRINT "Coordinates? "
           INPUT "Down? ", DOWN
           INPUT "Across? ", ACROSS
           IF DOWN > 0 AND DOWN < 31 AND ACROSS > 0 AND ACROSS < 31 THEN
              OKAY$ = "OK"
           ELSE
              PRINT "Invalid Coordinates"
          END IF
        LOOP
      END IF
     

      IF OKAY$ = "OK" THEN
     
    IF SOUND$ = "Y" THEN
        FOR I = 1 TO 4
           FOR J = 37 TO 1000 STEP 65
               SOUND J, .5
           NEXT J
        NEXT I
    END IF
     
      TELEPORT$ = "YES"
      X = (DOWN + 10)
      Y = (ACROSS + 10)
      IF MAZE(X, Y) = 1 THEN
         COLOR 4
         PRINT
         PRINT "You have teleported into solid rock and are unable to breathe."
         PRINT "You pass out from lack of oxygen, then die shorlty after."
         CALL DELAY2
         CALL DEATH
     END IF
     END IF

ELSEIF SPELL = 4 THEN
      CLS
      CALL HEADER
      COLOR 15
      OKAY$ = ""
      IF DEAD$ = "" THEN
         PRINT "Neither of you are dead."
      ELSE
         IF USER = 1 THEN
            IF MP > 500 THEN
               OKAY$ = "OK"
            ELSE
               PRINT "You require 500 Magic Points."
            END IF
          ELSE
            IF COMPANIONMP > 500 THEN
               OKAY$ = "OK"
            ELSE
               PRINT "This requires 500 Magic Points"
            END IF
         END IF

         IF OKAY$ = "OK" THEN
         IF USER = 2 THEN COMPANIONMP = COMPANIONMP - 500
         IF USER = 1 THEN MP = MP - 500
        
         IF DEAD$ = "U" THEN
            DEAD$ = ""
            HP = 1
           
    IF SOUND$ = "Y" THEN
        FOR I = 1 TO 4
           FOR J = 37 TO 1000 STEP 65
               SOUND J, .5
           NEXT J
        NEXT I
    END IF
           
            PRINT "You have been revived."
         ELSE
           DEAD$ = ""
           COMPANIONHP = 1
          
    IF SOUND$ = "Y" THEN
        FOR I = 1 TO 4
           FOR J = 37 TO 1000 STEP 65
               SOUND J, .5
           NEXT J
        NEXT I
    END IF
          
           PRINT COMPANION$; " has been revived."
          END IF
      END IF
    END IF
 END IF



CALL DELAY2
END SUB

SUB NEWCHAR


SCREEN 0
OKAY$ = ""
DO UNTIL OKAY$ = "OK"
   CLS
   CALL HEADER
   LOCATE 11, 20
   COLOR 15

   INPUT "What is your name? ", NAME$
   IF LEN(NAME$) > 9 THEN
      PRINT TAB(20); "Please make your character name less than 10 characters."
      CALL DELAY2
   ELSEIF LEN(NAME$) < 1 THEN
      PRINT TAB(20); "Please enter something."
      CALL DELAY2
 
   ELSE
          
      COLOR 9
      LOCATE 13, 20
      PRINT "Type (?) if you don't understand."
      LOCATE 12, 20
     
      INPUT "What is your companion's name? ", COMPANION$
      IF LEN(COMPANION$) > 9 THEN
         PRINT TAB(20); "Please make your character name less than 10 characters."
         CALL DELAY2
      ELSEIF LEN(COMPANION$) < 1 THEN
         PRINT TAB(20); "Please enter something.                         "
         CALL DELAY2
      ELSEIF COMPANION$ = NAME$ THEN
         PRINT TAB(20); "Wouldn't that be a bit confusing?                "
         CALL DELAY2
      ELSEIF COMPANION$ = "?" THEN
         LOCATE 15, 20
         COLOR 15
         PRINT "You will venture through the Catacombs with a friend."
         PRINT TAB(20); "He or she will fight along side you. Please type a"
         PRINT TAB(20); "name for this person."
         CALL DELAY2
      ELSE
         OKAY$ = "OK"
      END IF
  END IF
LOOP
                  
OKAY$ = ""
DO UNTIL OKAY$ = "OK"

  CLS
  CALL HEADER
  SCREEN 0
  COLOR 7
  PRINT "Are you a......"
  COLOR 8
  PRINT
  PRINT
  PRINT TAB(25); "Й";
  FOR I = 26 TO 53
     PRINT TAB(I); "Н";
  NEXT I
  PRINT TAB(I); "»";
  COLOR 8
  PRINT TAB(25); "є";
  COLOR 7
  PRINT TAB(27); "1) North Garkonen.......";
  COLOR 8
  PRINT TAB(54); "є"
  PRINT TAB(25); "є";
  COLOR 4
  PRINT TAB(27); "2) South Garkonen.......";
  COLOR 8
  PRINT TAB(54); "є"
  PRINT TAB(25); "є";
  COLOR 9
  PRINT TAB(27); "3) North Carrion........";
  COLOR 8
  PRINT TAB(54); "є"
  PRINT TAB(25); "є";
  COLOR 7
  PRINT TAB(27); "4) South Carrion........";
  COLOR 8
  PRINT TAB(54); "є"
  PRINT TAB(25); "є";
  COLOR 9
  PRINT TAB(27); "?) What are all these?";
  COLOR 8
  PRINT TAB(54); "є";
 
  PRINT TAB(25); "И";
 
  FOR I = 26 TO 53
     PRINT "Н";
  NEXT I
  PRINT TAB(I); "ј"
  
 
   PRINT
   PRINT
   COLOR 7
   PRINT "Type (1), (2), (3), (4) or (?) ";
   INPUT CHOICE1$
   IF CHOICE1$ = "1" THEN
      OKAY$ = "OK"
      RACE$ = "A North Garkonen"
   ELSEIF CHOICE1$ = "2" THEN
      RACE$ = "A South Garkonen"
      OKAY$ = "OK"
   ELSEIF CHOICE1$ = "3" THEN
      RACE$ = "A North Carrion"
      OKAY$ = "OK"
   ELSEIF CHOICE1$ = "4" THEN
      RACE$ = "A South Carrion"
      OKAY$ = "OK"
 
   ELSEIF CHOICE1$ = "?" THEN
     CLS
     COLOR 9
     PRINT "North Garkonen's are very intelligent creatures that excel at magic."
     PRINT "They are weak and make poor fighters"
     PRINT
     COLOR 7
     PRINT "The South Garkonen posseses average strength and intelligence."
     PRINT "He will make a good magic user or a fighter."
     PRINT
     COLOR 9
     PRINT "North Carrion's are short, strong and stocky. They are not great magicians"
     PRINT "They are much better fighters."
     PRINT
     COLOR 7
     PRINT "The South Carrion is a very dumb creature that excels on the field"
     PRINT "of battle. They make terrible magicans, though, because they"
     PRINT "have no concept of what magic is."
     PRINT
     COLOR 8
     CALL DELAY2
   END IF
LOOP

OKAY$ = ""
DO UNTIL OKAY$ = "OK"

  CLS
  SCREEN 0

   LOCATE 12, 20
   COLOR 7
   PRINT "Will you be a ";
   COLOR 4
   PRINT "Magic User ";
 
   COLOR 7
   PRINT "or a ";

   COLOR 4
   PRINT "Fighter?"
   LOCATE 14, 28

   COLOR 8
   PRINT "Type (1), (2) or (?) ";
   INPUT CHOICE2$
   IF CHOICE2$ = "1" THEN
      OKAY$ = "OK"
      JOB$ = "A Magic User"
   ELSEIF CHOICE2$ = "2" THEN
      OKAY$ = "OK"
      JOB$ = "A Fighter"
   ELSEIF CHOICE2$ = "?" THEN
      CLS
      COLOR 9
      PRINT "You have the choice of being either a magic user or a fighter."
      PRINT "A magic user will have the abilty to use powerful spells, but"
      PRINT "won't be able to carry the heavy weapons that the fighter can,"
      PRINT "and will not fight as well. Whatever you decide to be, your"
      PRINT "partner will be the other."
      PRINT
      COLOR 8
      CALL DELAY2
   END IF
LOOP

DO UNTIL CHOICEYES$ = "YES"

A = INT((RND) * 5 + 1)
CLS

IF CHOICE2$ = "1" THEN
   COMPANIONJOB$ = "A Fighter"
ELSEIF CHOICE2$ = "2" THEN
   COMPANIONJOB$ = "A Magic User"
END IF

COMPANIONRACE$ = "A South Garkonen"

IF RACE$ = "A South Garkonen" THEN
   INTELPOS = 10
   STRENGTHPOS = 2
ELSEIF RACE$ = "A North Garkonen" THEN
   INTELPOS = 6
   STRENGTHPOS = 6
ELSEIF RACE$ = "A North Carrion" THEN
   INTELPOS = 4
   STRENGTHPOS = 8
ELSEIF RACE$ = "A South Carrion" THEN
   INTELPOS = 1
   STRENGTHPOS = 11
END IF

AP = INT((RND) * (STRENGTHPOS * 10)) + 30
HP = INT((RND) * (STRENGTHPOS * 15)) + 70
INTEL = INT((RND) * (INTELPOS * 7)) + 1

IF AP > 99 THEN AP = 99
IF HP > 99 THEN HP = 99

COMPANIONAP = INT((RND) * (6 * 10)) + 30
COMPANIONHP = INT((RND) * (6 * 15)) + 50
COMPANIONINTEL = INT((RND) * (6 * 7)) + 1

IF COMPANIONAP > 99 THEN COMPANIONAP = 99
IF COMPANIONHP > 99 THEN COMPANIONHP = 99


IF COMPANIONJOB$ = "A Fighter" THEN
   COMPANIONMP = INTELPOS
ELSEIF COMPANIONJOB$ = "A Magic User" THEN
   COMPANIONMP = (COMPANIONINTEL * 5)
END IF


IF JOB$ = "A Fighter" THEN
   MP = INTELPOS
ELSEIF JOB$ = "A Magic User" THEN
   MP = (INTEL * 5)
END IF

IF MP > 99 THEN MP = 99
IF COMPANIONMP > 99 THEN COMPANIONMP = 99
CALL TABLE

COLOR 14
IF LEN(NAME$) < 3 THEN
   LOCATE 5, 29
ELSE
   LOCATE 5, 26
END IF
PRINT NAME$

COLOR 15
IF LEN(COMPANION$) < 3 THEN
   LOCATE 5, 49
ELSEIF LEN(COMPANION$) < 6 THEN
   LOCATE 5, 48
ELSE
   LOCATE 5, 46
END IF
PRINT COMPANION$

COLOR 14
LOCATE 8, 21
  PRINT RACE$
LOCATE 9, 21
  PRINT "Job: "; JOB$


COLOR 15
LOCATE 8, 42
  PRINT COMPANIONRACE$
LOCATE 9, 42
  PRINT "Job: "; COMPANIONJOB$

COLOR 14
LOCATE 11, 21
  PRINT "Attack Points.."; AP
LOCATE 12, 21
  PRINT "Hit Points....."; HP
LOCATE 13, 21
  PRINT "Intelligence..."; INTEL
LOCATE 14, 21
  PRINT "Magic Points..."; MP



COLOR 15
LOCATE 11, 42
  PRINT "Attack Points.."; COMPANIONAP
LOCATE 12, 42
  PRINT "Hit Points....."; COMPANIONHP
LOCATE 13, 42
  PRINT "Intelligence..."; COMPANIONINTEL
LOCATE 14, 42
  PRINT "Magic Points..."; COMPANIONMP

 OKAY$ = ""
 DO UNTIL OKAY$ = "OK"
    LOCATE 20, 14
    INPUT "Are you happy with these characters? (y/n) "; CHOICE$
    IF CHOICE$ = "y" OR CHOICE$ = "Y" THEN
       OKAY$ = "OK"
       CHOICEYES$ = "YES"
    ELSEIF CHOICE$ = "n" OR CHOICE$ = "N" THEN
       CHOICEYES$ = "NO"
       OKAY$ = "OK"
    END IF
 LOOP
LOOP

 LEVEL = 1
 MPMAX = MP
 HPMAX = HP
 
 COMPANIONHPMAX = COMPANIONHP
 COMPANIONMPMAX = COMPANIONMP
 NEWCHARR$ = "Y"

CLS

COLOR 15

PRINT TAB(34); "Instructions:"
FOR I = 1 TO 5
   PRINT
NEXT I

COLOR 9
PRINT "  THIS IS VERY IMPORTANT! - Inside the maze, use the arrows on the"
PRINT "  numeric keypad, not the group of four arrows beside them. Because of "
PRINT "  this, please ensure now that NUM LOCK has been selected ON."
PRINT
PRINT "  At any time during the game, except during a battle, press 'C' for"
PRINT "  a list of commands, and 'Q' to quit."
PRINT
PRINT "  If there is a pause during the game, especially after a battle, keep"
PRINT "  pressing 'ENTER' and the game will continue."
PRINT
PRINT "                                         Enjoy the game"
PRINT "                                          (Be Careful!)"
PRINT "  "
COLOR 15
PRINT "Press any key to continue..."

CALL DELAY2
         
END SUB

SUB OPENING
CLS
SCREEN 0
SENT$ = "Catacombs of Despair II"
COLOR 15
FOR I = 1 TO LEN(SENT$)
   FOR J = 2 TO 10
      LOCATE J, (I + 27)
      PRINT MID$(SENT$, I, 1)
      LOCATE (J - 1), (I + 27)
      PRINT " "
      FOR PAUSE = 1 TO 2150
      NEXT PAUSE
   NEXT J
NEXT I

SCREEN 0
SENT$ = "The Manifest Chronicles "
COLOR 9
FOR I = 1 TO LEN(SENT$)
   FOR J = 22 TO 12 STEP -2
      LOCATE J, (I + 27)
      PRINT MID$(SENT$, I, 1)
      LOCATE (J + 1), (I + 27)
      PRINT " "
      FOR PAUSE = 1 TO 2150
      NEXT PAUSE
   NEXT J
NEXT I

FOR I = 13 TO 22
   FOR J = 20 TO 70
      LOCATE I, J
      PRINT " "
   NEXT
NEXT I

COLOR 15
PRINT TAB(30); " Version 2.01 1994 "

DO UNTIL KEY$ <> ""
   KEY$ = INKEY$
   DUMMY = RND
LOOP

CLS
PRINT
COLOR 15
PRINT "Will you (R)estore a previous quest, or (S)tart a new one? (r/s) "
OK$ = ""
DO UNTIL OK$ = "OK"
   INPUT CHOICE$
   IF CHOICE$ = "R" OR CHOICE$ = "r" THEN
      OK$ = "OK"
      RESTOR$ = "YES"
      CALL RESTOREGAME
      CALL GETMAP
      RESTOR$ = ""
   ELSEIF CHOICE$ = "S" OR CHOICE$ = "s" THEN
      OK$ = "OK"
      CALL NEWCHAR
   END IF
LOOP


END SUB

SUB OVERHEAD
      CLS
      COLOR 8
      LOCATE 10, 1
   IF WHICH = 1 THEN
      LENGHT = 3
      AMOUNT = 100
      LOCATE 10, 1
      TTAB = 30
   ELSEIF WHICH = 2 THEN
      LENGHT = 6
      AMOUNT = 250
      LOCATE 8, 1
      TTAB = 22
   ELSEIF WHICH = 3 THEN
      LENGHT = 9
      AMOUNT = 500
      LOCATE 3, 1
      TTAB = 11
   END IF

         ACROSS = EX
         DOWN = WHY
         FOR EX = (ACROSS - LENGHT) TO (ACROSS + LENGHT)
           PRINT TAB(TTAB); " ";
           FOR WHY = (DOWN - LENGHT) TO (DOWN + LENGHT)
              IF EX = ACROSS AND WHY = DOWN THEN
                 COLOR 14
                 PRINT " к ";
                 COLOR 8
              ELSEIF MAZE(EX, WHY) = 2 THEN
                 COLOR 6
                 PRINT " р ";
                 COLOR 8
              ELSEIF MAZE(EX, WHY) = 1 THEN
                PRINT "ЫЫЫ";
              ELSE
                PRINT "   ";
              END IF
           NEXT WHY
           PRINT
         NEXT EX
     
      IF USER = 1 THEN
         MP = MP - AMOUNT
      ELSE
         COMPANIONMP = COMPANIONMP - AMOUNT
      END IF


END SUB

SUB POTION

CLS
SCREEN 0

IF WHITEPOTION > 0 THEN
   COLOR 15
   PRINT " White x "; WHITEPOTION
   
END IF
IF GREYPOTION > 0 THEN
   COLOR 8
   PRINT "  Grey x "; GREYPOTION
   
END IF
IF PURPLEPOTION > 0 THEN
   COLOR 13
   PRINT "Purple x "; PURPLEPOTION
  
END IF
IF BLUEPOTION > 0 THEN
   COLOR 9
   PRINT "  Blue x "; BLUEPOTION
   
END IF
IF YELLOWPOTION > 0 THEN
   COLOR 14
   PRINT "Yellow x "; YELLOWPOTION

END IF
IF REDPOTION > 0 THEN
   COLOR 4
   PRINT "   Red x "; REDPOTION

END IF
IF GREENPOTION > 0 THEN
   COLOR 10
   PRINT " Green x "; GREENPOTION
END IF

PRINT
COLOR 15
PRINT "Type the colour of the potion you want to drink";


INPUT CHOICE$
IF CHOICE$ = "WHITE" OR CHOICE$ = "White" OR CHOICE$ = "white" THEN
   IF WHITEPOTION < 1 THEN
      PRINT "You do not have a white potion."
   ELSE
      WHITEPOTION = WHITEPOTION - 1
      COLOR 15
      IF DEAD$ = "" THEN
      PRINT "Who? 1) You"
      PRINT "     2) "; COMPANION$
      OK$ = ""
      DO UNTIL OK$ = "OK"
         KEY$ = INKEY$
         IF KEY$ = "1" THEN OK$ = "OK"
         IF KEY$ = "2" THEN OK$ = "OK"
      LOOP
      END IF
     
      IF DEAD$ = "U" THEN KEY$ = "2"
      IF DEAD$ = "C" THEN KEY$ = "1"
     
      IF KEY$ = "1" THEN
         IF HP = HPMAX THEN
            PRINT "You drink the white potion. Nothing happens"
         ELSE
            HEAL = INT((HPMAX - HP) * .15)
            
            HP = HP + HEAL
            IF HP > HPMAX THEN HP = HPMAX
            PRINT "You feel much better."

         END IF
      ELSEIF KEY$ = "2" THEN
         IF COMPANIONHP = COMPANIONHPMAX THEN
            PRINT COMPANION$; " drinks the white potion. Nothing happens"
         ELSE
            HEAL = INT((COMPANIONHPMAX - COMPANIONHP) * .15)
            COMPANIONHP = COMPANIONHP + HEAL
            IF COMPANIONHP > COMPANIONHPMAX THEN COMPANIONHP = COMPANIONHPMAX
            PRINT COMPANION$; " feels much better."
         END IF
      END IF
    END IF


ELSEIF CHOICE$ = "GREY" OR CHOICE$ = "Grey" OR CHOICE$ = "grey" THEN
   IF GREYPOTION < 1 THEN
      PRINT "You do not have a grey potion."
   ELSE
      GREYPOTION = GREYPOTION - 1
      COLOR 8
      IF DEAD$ = "" THEN
      PRINT "Who? 1) You"
      PRINT "     2) "; COMPANION$
      OK$ = ""
      DO UNTIL OK$ = "OK"
         KEY$ = INKEY$
         IF KEY$ = "1" THEN OK$ = "OK"
         IF KEY$ = "2" THEN OK$ = "OK"
      LOOP
      END IF
     
      IF DEAD$ = "U" THEN KEY$ = "2"
      IF DEAD$ = "C" THEN KEY$ = "1"


      IF KEY$ = "1" THEN
         IF HP = HPMAX THEN
            PRINT "You drink the grey potion. Nothing happens"
         ELSE
            HEAL = INT((HPMAX - HP) * .25)
            
            HP = HP + HEAL
            IF HP > HPMAX THEN HP = HPMAX
            PRINT "You feel much better."
            
         END IF
      ELSEIF KEY$ = "2" THEN
         IF COMPANIONHP = COMPANIONHPMAX THEN
            PRINT COMPANION$; " drinks the grey potion. Nothing happens"
            
         ELSE
            HEAL = INT((COMPANIONHPMAX - COMPANIONHP) * .25)
            
            COMPANIONHP = COMPANIONHP + HEAL
            IF COMPANIONHP > COMPANIONHPMAX THEN COMPANIONHP = COMPANIONHPMAX
            PRINT COMPANION$; " feels much better."
            
         END IF
       END IF
      END IF

ELSEIF CHOICE$ = "PURPLE" OR CHOICE$ = "Purple" OR CHOICE$ = "purple" THEN
   IF PURPLEPOTION < 1 THEN
      PRINT "You do not have a purple potion."
   ELSE
      PURPLEPOTION = PURPLEPOTION - 1
      COLOR 13
      IF DEAD$ = "" THEN
      PRINT "Who? 1) You"
      PRINT "     2) "; COMPANION$
      OK$ = ""
      DO UNTIL OK$ = "OK"
         KEY$ = INKEY$
         IF KEY$ = "1" THEN OK$ = "OK"
         IF KEY$ = "2" THEN OK$ = "OK"
      LOOP
      END IF

      IF DEAD$ = "U" THEN KEY$ = "2"
      IF DEAD$ = "C" THEN KEY$ = "1"


      IF KEY$ = "1" THEN
         IF HP = HPMAX THEN
            PRINT "You drink the purple potion. Nothing happens"
         ELSE
            HEAL = INT((HPMAX - HP) * .5)
            
            HP = HP + HEAL
            IF HP > HPMAX THEN HP = HPMAX
            PRINT "You feel much better."
          END IF
      ELSEIF KEY$ = "2" THEN
         IF COMPANIONHP = COMPANIONHPMAX THEN
            PRINT COMPANION$; " drinks the purple potion. Nothing happens"
         ELSE
            HEAL = INT((COMPANIONHPMAX - COMPANIONHP) * .5)
            
            COMPANIONHP = COMPANIONHP + HEAL
            IF COMPANIONHP > COMPANIONHPMAX THEN COMPANIONHP = COMPANIONHPMAX
            PRINT COMPANION$; " feels much better."
           
         END IF
      END IF
   END IF




ELSEIF CHOICE$ = "BLUE" OR CHOICE$ = "Blue" OR CHOICE$ = "blue" THEN
   IF BLUEPOTION < 1 THEN
      PRINT "You do not have a blue potion."
   ELSE
      BLUEPOTION = BLUEPOTION - 1
      COLOR 9
      IF DEAD$ = "" THEN
      PRINT "Who? 1) You"
      PRINT "     2) "; COMPANION$
      OK$ = ""
      DO UNTIL OK$ = "OK"
         KEY$ = INKEY$
         IF KEY$ = "1" THEN OK$ = "OK"
         IF KEY$ = "2" THEN OK$ = "OK"
      LOOP
      END IF

      IF DEAD$ = "C" THEN KEY$ = "1"
      IF DEAD$ = "U" THEN KEY$ = "2"
     
     
      IF KEY$ = "1" THEN
            MPPLUS = INT((RND) * 450) + 1
            MP = MP + MPPLUS
            PRINT "You feel much more powerful and much more intelligent."
            
      ELSEIF KEY$ = "2" THEN
            MPPLUS = INT((RND) * 450) + 1
            COMPANIONMP = COMPANIONMP + MPPLUS
            PRINT COMPANION$; " feels much more powerful and much more intelligent."
          
         END IF
      END IF
  


ELSEIF CHOICE$ = "red" OR CHOICE$ = "Red" OR CHOICE$ = "RED" THEN
   IF REDPOTION < 1 THEN
      PRINT "You do not have a red potion."
   ELSE
      REDPOTION = REDPOTION - 1
      COLOR 4
      IF DEAD$ = "" THEN
         PRINT "Who? 1) You"
         PRINT "     2) "; COMPANION$
         OK$ = ""
      DO UNTIL OK$ = "OK"
         KEY$ = INKEY$
         IF KEY$ = "1" THEN OK$ = "OK"
         IF KEY$ = "2" THEN OK$ = "OK"
      LOOP
      END IF
     
      IF DEAD$ = "U" THEN KEY$ = "2"
      IF DEAD$ = "C" THEN KEY$ = "1"

      IF KEY$ = "1" THEN
            HEAL = -(INT(HP / 1.25))
            HP = HP + HEAL
            PRINT "You suddenly feel very weak."
            
         
      ELSEIF KEY$ = "2" THEN
           HEAL = -(INT(COMPANIONHP / 1.25))
            COMPANIONHP = COMPANIONHP + HEAL
            PRINT COMPANION$; " suddenly feels very weak."
           
         END IF
       END IF
      
ELSEIF CHOICE$ = "yellow" OR CHOICE$ = "Yellow" OR CHOICE$ = "YELLOW" THEN
      IF YELLOWPOTION < 1 THEN
         PRINT "You do not have a yellow potion."
      ELSE
      YELLOWPOTION = YELLOWPOTION - 1
      COLOR 14
      IF DEAD$ = "" THEN
         PRINT "Who? 1) You"
         PRINT "     2) "; COMPANION$
      
      OK$ = ""
      
      DO UNTIL OK$ = "OK"
         KEY$ = INKEY$
         IF KEY$ = "1" THEN OK$ = "OK"
         IF KEY$ = "2" THEN OK$ = "OK"
      LOOP
      END IF
     
      INVIS$ = "Yes"
      PRINT "You and your companion are invisible."

  END IF

 
 
  ELSEIF CHOICE$ = "green" OR CHOICE$ = "Green" OR CHOICE$ = "GREEN" THEN
     IF GREENPOTION < 1 THEN
        PRINT "You do not have a green potion."
     ELSE
      COLOR 10
      GREENPOTION = GREENPOTION - 1
      PRINT "Who? 1) You"
      PRINT "     2) "; COMPANION$
      OK$ = ""
      DO UNTIL OK$ = "OK"
         KEY$ = INKEY$
         IF KEY$ = "1" THEN OK$ = "OK"
         IF KEY$ = "2" THEN OK$ = "OK"
      LOOP
      IF KEY$ = "1" THEN
         IF DEAD$ = "U" THEN
            DEAD$ = ""
            HP = 1
            PRINT "You have been revived."
         ELSE
            PRINT "Nothing Happens."
         END IF
      ELSEIF KEY$ = "2" THEN
          IF DEAD$ = "C" THEN
             DEAD$ = ""
             COMPANIONHP = 1
             PRINT COMPANION$; " has been restored."
          ELSE
             PRINT "Nothing Happens"
          END IF
      END IF
     END IF
  

  ELSEIF CHOICE$ = "" THEN
     PRINT

  ELSE
     PRINT "There is no such potion."

END IF
CALL DELAY2
END SUB

SUB POTIONCHANCE

GREEN = INT((RND) * 100) + 1
RED = INT((RND) * 30) + 1
YELLOW = INT((RND) * 25) + 1
BLUE = INT((RND) * 30) + 1
PURPLE = INT((RND) * 20) + 1
GREY = INT((RND) * 10) + 1
WHITE = INT((RND) * 5) + 1

IF GREEN = 1 THEN
   COLOR 10
   LOCATE 22, (40 - (LEN(MONSTERNAME$(ENEMY)) + 23) / 2)
   PRINT "The "; MONSTERNAME$(ENEMY); " has a green potion"
  CALL DELAY2
  FOR I = 1 TO 80
    LOCATE 22, I
    PRINT " "
  NEXT I

  
   GREENPOTION = GREENPOTION + 1
END IF
IF RED = 1 THEN
   COLOR 4
   LOCATE 22, (40 - (LEN(MONSTERNAME$(ENEMY)) + 21) / 2)
   PRINT "The "; MONSTERNAME$(ENEMY); " has a red potion"
   CALL DELAY2
  FOR I = 1 TO 80
    LOCATE 22, I
    PRINT " "
  NEXT I

  
   REDPOTION = REDPOTION + 1
END IF
IF YELLOW = 1 THEN
   COLOR 14
   LOCATE 22, (40 - (LEN(MONSTERNAME$(ENEMY)) + 24) / 2)
   PRINT "The "; MONSTERNAME$(ENEMY); " has a yellow potion"
  CALL DELAY2
  FOR I = 1 TO 80
    LOCATE 22, I
    PRINT " "
  NEXT I

  
   YELLOWPOTION = YELLOWPOTION + 1
END IF
IF BLUE = 1 THEN
   COLOR 9
   LOCATE 22, (40 - (LEN(MONSTERNAME$(ENEMY)) + 22) / 2)
   PRINT "The "; MONSTERNAME$(ENEMY); " has a blue potion"
  CALL DELAY2
  FOR I = 1 TO 80
    LOCATE 22, I
    PRINT " "
  NEXT I

  
   BLUEPOTION = BLUEPOTION + 1
END IF
IF WHITE = 1 THEN
   COLOR 15
   LOCATE 22, (40 - (LEN(MONSTERNAME$(ENEMY)) + 23) / 2)
   PRINT "The "; MONSTERNAME$(ENEMY); " has a white potion"
   WHITEPOTION = WHITEPOTION + 1
   CALL DELAY2
  FOR I = 1 TO 80
    LOCATE 22, I
    PRINT " "
  NEXT I

  
   WHITEPOTION = WHITEPOTION + 1
END IF
IF GREY = 1 THEN
   COLOR 8
   LOCATE 22, (40 - (LEN(MONSTERNAME$(ENEMY)) + 21) / 2)
   PRINT "The "; MONSTERNAME$(ENEMY); " has a grey potion"
   GREYPOTION = GREYPOTION + 1
  CALL DELAY2
  FOR I = 1 TO 80
    LOCATE 22, I
    PRINT " "
  NEXT I

  
END IF
IF PURPLE = 1 THEN
   COLOR 13
   LOCATE 22, (40 - (LEN(MONSTERNAME$(ENEMY)) + 24) / 2)
   PRINT "The "; MONSTERNAME$(ENEMY); " has a purple potion"
   PURPLEPOTION = PURPLEPOTION + 1
  CALL DELAY2
  FOR I = 1 TO 80
    LOCATE 22, I
    PRINT " "
  NEXT I

  
END IF

END SUB

SUB PRINTHP

IF HP < (HPMAX * .35) THEN
   COLOR 4
ELSE
   COLOR 15
END IF

LOCATE 9, (73 - (LEN(HP) + LEN(HPMAX) + 1) / 2)
IF HPMAX > 999 THEN LOCATE 9, (73 - (LEN(HP) + LEN(HPMAX) + 4) / 2)
IF DEAD$ = "U" THEN
   LOCATE 9, 71
   PRINT "Dead"
ELSE
   PRINT HP; "/"; HPMAX
END IF


IF MP < (MPMAX * .25) THEN
   COLOR 4
ELSE
   COLOR 15
END IF

LOCATE 8, (73 - (LEN(MP) + LEN(MPMAX) + 1) / 2)
IF MPMAX > 999 THEN LOCATE 8, (73 - (LEN(MP) + LEN(MPMAX) + 4) / 2)
PRINT MP; "/"; MPMAX



IF COMPANIONMP < (COMPANIONMPMAX * .35) THEN
   COLOR 4
ELSE
   COLOR 15
END IF

LOCATE 20, (73 - (LEN(COMPANIONMP) + LEN(COMPANIONMPMAX) + 1) / 2)
IF COMPANIONMPMAX > 999 THEN LOCATE 20, (73 - (LEN(COMPANIONMP) + LEN(COMPANIONMPMAX) + 4) / 2)
PRINT COMPANIONMP; "/"; COMPANIONMPMAX

IF COMPANIONHP < (COMPANIONHPMAX * .25) THEN
   COLOR 4
ELSE
   COLOR 15
END IF

LOCATE 21, (73 - (LEN(COMPANIONHP) + LEN(COMPANIONHPMAX) + 1) / 2)
IF COMPANIONHPMAX > 999 THEN LOCATE 21, (73 - (LEN(COMPANIONHP) + LEN(COMPANIONHPMAX) + 4) / 2)
IF DEAD$ = "C" THEN
   LOCATE 21, 71
   PRINT "Dead"
ELSE
   PRINT COMPANIONHP; "/"; COMPANIONHPMAX
END IF


END SUB

SUB QUITTER

CLS
SCREEN 0

COLOR 15
PRINT "Are you sure you want to quit? (y/n)"
OK$ = ""
DO UNTIL OK$ = "OK"
   KEY$ = INKEY$
   IF KEY$ = "Y" OR KEY$ = "y" THEN OK$ = "OK"
   IF KEY$ = "N" OR KEY$ = "n" THEN OK$ = "OK"
LOOP

IF KEY$ = "Y" OR KEY$ = "y" THEN
   CALL HIGHSCORE
  
   END
END IF
END SUB

SUB RESTOREGAME
CLS
SCREEN 0

CALL HEADER

COLOR 9
FILES "*.SAV"
PRINT
COLOR 15
PRINT "What savegame do you want to restore? (DO NOT ADD .SAV)"
DO UNTIL OKAY$ = "OK"
   INPUT FILE$
   IF LEN(FILE$) < 9 AND LEN(FILE$) > 0 THEN
        OKAY$ = "OK"
     ELSEIF FILE$ = "" THEN
        OKAY$ = "OK"
     ELSE
        PRINT "The filename must be less than 9 letters."
     END IF
LOOP

IF LEN(FILE$) > 0 THEN
 
  FILENAME$ = FILE$ + ".SAV"
  OPEN FILENAME$ FOR INPUT AS #2

INPUT #2, DB
INPUT #2, COMPANIONOB
INPUT #2, COMPANIONDB
INPUT #2, YOURA
INPUT #2, LASTPRINT
INPUT #2, YOURW
INPUT #2, COMPANIONA
INPUT #2, COMPANIONW
INPUT #2, OB
INPUT #2, INVIS$
INPUT #2, COMPANIONMP
INPUT #2, LEVEL
INPUT #2, MAP
INPUT #2, PLAYER
INPUT #2, DIRECTION
INPUT #2, NAME$
INPUT #2, DEAD$
INPUT #2, COMPANION$
INPUT #2, AP
INPUT #2, HP
INPUT #2, MP
INPUT #2, XP
INPUT #2, HPMAX
INPUT #2, X
INPUT #2, Y
INPUT #2, JOB$
INPUT #2, COMPANIONMPMAX
INPUT #2, MPMAX
INPUT #2, COMPANIONAP
INPUT #2, COMPANIONHP
INPUT #2, COMPANIONHPMAX
INPUT #2, PURPLEPOTION
INPUT #2, GREENPOTION
INPUT #2, WHITEPOTION
INPUT #2, YELLOWPOTION
INPUT #2, BLUEPOTION
INPUT #2, REDPOTION
INPUT #2, GREYPOTION
       
TELEPORT$ = "YES"

CLOSE #2

IF RESTOR$ <> "YES" THEN
  CALL GETMAP
END IF

END IF

IF FILE$ = "" AND NAME$ = "" THEN
   CALL NEWCHAR
END IF

END SUB

SUB RUNNING
   A = INT((RND) * 10) + 1
   IF INVIS$ = "Yes" OR DEAD$ <> "" THEN A = 99999
   IF A > MONSTERSPEED(ENEMY) THEN
      L = INT((LEN(MONSTERNAME$(ENEMY)) + 21) / 2)
      LOCATE 22, (40 - L)
      PRINT "You have escaped the "; MONSTERNAME$(ENEMY)
      OVER$ = "OVER"
   ELSE
      LOCATE 22, 25
      L = INT((LEN(MONSTERNAME$(ENEMY)) + 22) / 2)
      LOCATE 22, (40 - L)
      PRINT "You cannot escape the "; MONSTERNAME$(ENEMY)
      CALL DELAY2
      FOR I = 1 TO 70
         LOCATE 22, I
         PRINT " "
      NEXT I

 IF INVIS$ <> "Yes" AND DEAD$ = "" THEN
 IF MONSTERSPELL(ENEMY) > 0 AND ENEMYHP > 0 THEN
     CALL ITCASTS
 ELSE

   HITCHANCE = INT((RND) * 5) + 1
   IF DEAD$ <> "" THEN HITCHANCE = 999

    IF HITCHANCE <= MONSTERSPEED(ENEMY) THEN
       HITPERSON = INT((RND) * 2) + 1
    ELSE
       HITPERSON = 0
    END IF
 
   IF HITPERSON = 2 THEN
      CALL HITSHIM
   ELSEIF HITPERSON = 1 THEN
      CALL HITSYOU
   END IF


  END IF
 END IF
END IF

END SUB

SUB SAVE
CLS
SCREEN 0
CALL HEADER
COLOR 13


PRINT "Type in the filename you wish to use. Do not add an extension."
PRINT "An extension of .SAV will be added."
PRINT

COLOR 15
 DO UNTIL OKAY$ = "OK"
   INPUT FILE$
   IF LEN(FILE$) > 0 AND LEN(FILE$) < 9 THEN
      OKAY$ = "OK"
   ELSE
      PRINT "The filename should be less at least one character and less than eight."
   END IF
LOOP

FILENAME$ = FILE$ + ".SAV"

OPEN FILENAME$ FOR OUTPUT AS #2

PRINT #2, DB
PRINT #2, COMPANIONOB
PRINT #2, COMPANIONDB
PRINT #2, YOURA
PRINT #2, LASTPRINT
PRINT #2, YOURW
PRINT #2, COMPANIONA
PRINT #2, COMPANIONW
PRINT #2, OB
PRINT #2, INVIS$
PRINT #2, COMPANIONMP
PRINT #2, LEVEL
PRINT #2, MAP
PRINT #2, PLAYER
PRINT #2, DIRECTION
PRINT #2, NAME$
PRINT #2, DEAD$
PRINT #2, COMPANION$
PRINT #2, AP
PRINT #2, HP
PRINT #2, MP
PRINT #2, XP
PRINT #2, HPMAX
PRINT #2, EX
PRINT #2, WHY
PRINT #2, JOB$
PRINT #2, COMPANIONMPMAX
PRINT #2, MPMAX
PRINT #2, COMPANIONAP
PRINT #2, COMPANIONHP
PRINT #2, COMPANIONHPMAX
PRINT #2, PURPLEPOTION
PRINT #2, GREENPOTION
PRINT #2, WHITEPOTION
PRINT #2, YELLOWPOTION
PRINT #2, BLUEPOTION
PRINT #2, REDPOTION
PRINT #2, GREYPOTION

COLOR 9
PRINT
PRINT "Finished Saving....."


CLOSE #2

END SUB

SUB STAIRS
   CLS
   SCREEN 0
   COLOR 9
   PRINT "There are a set of stairs leading down. Decend? (y/n) "
   OK$ = ""
   DO UNTIL OK$ = "OK"
      KEY$ = INKEY$
      IF KEY$ = "y" OR KEY$ = "Y" THEN
         OK$ = "OK"
      ELSEIF KEY$ = "n" OR KEY$ = "N" THEN
         OK$ = "OK"
      END IF
   LOOP
  
   IF KEY$ = "Y" OR KEY$ = "y" THEN
      X = 11
      Y = 11
      TELEPORT$ = "YES"
      MAP = MAP + 1
      CALL GETMAP
   ELSE
     TELEPORT$ = "YES"
     IF MAZE((X - 1), Y) = 0 THEN
        X = X - 1
     ELSEIF MAZE((X + 1), Y) = 0 THEN
        X = X + 1
     ELSEIF MAZE(X, (Y - 1)) = 0 THEN
        Y = Y - 1
     ELSEIF MAZE(X, (Y + 1)) = 0 THEN
        Y = Y + 1
     END IF
   END IF
END SUB

SUB TABLE

COLOR 1

FOR I = 5 TO 15
   LOCATE I, 40
   PRINT "і"
NEXT I

FOR I = 20 TO 60
    LOCATE 6, I
    PRINT "Д"
NEXT I

LOCATE 6, 40
PRINT "Е"

LOCATE 4, 19
PRINT "Й"

FOR I = 20 TO 60
   LOCATE 4, I
   PRINT "Н"
NEXT I

LOCATE 4, 40
PRINT "С"

LOCATE 4, 61
PRINT "»"

FOR I = 5 TO 15
   LOCATE I, 19
   PRINT "є"
NEXT I

FOR I = 5 TO 15
   LOCATE I, 61
   PRINT "є"
NEXT I

LOCATE 6, 19
 PRINT "З"

LOCATE 6, 61
PRINT "¶"

LOCATE 15, 19
PRINT "И"

LOCATE 15, 61
PRINT "ј"

LOCATE

FOR I = 20 TO 60
   LOCATE 15, I
   PRINT "Н"
NEXT I

LOCATE 15, 40
PRINT "П"

END SUB

SUB TABLE2
 
  CLS
  COLOR 14
  LOCATE 5, 10
  PRINT "Ъ"
  FOR I = 11 TO 30
     LOCATE 5, I
     PRINT "Д"
  NEXT I
  LOCATE 5, 30
  PRINT "ї"
  FOR I = 6 TO 10
     LOCATE I, 10
     PRINT "і"
  NEXT I
  LOCATE 10, 10
  PRINT "А"
  FOR I = 11 TO 30
     LOCATE 10, I
     PRINT "Д"
  NEXT I
  LOCATE 10, 30
  PRINT "Щ"
  FOR I = 6 TO 9
      LOCATE I, 30
      PRINT "і"
  NEXT I
  PRINT
  

 COLOR 15

 LOCATE 7, INT(21 - (LEN(NAME$)) / 2)
 PRINT NAME$

 COLOR 14
 IF DEAD$ <> "U" THEN
    IF HPMAX > 99 THEN
       LOCATE 8, 16
    ELSEIF HPMAX > 999 THEN
       LOCATE 8, 14
    ELSE
       LOCATE 8, 17
    END IF
    PRINT HP; "/"; HPMAX
 ELSE
    COLOR 4
    LOCATE 8, 18
    PRINT "Dead"
 END IF
 
 
  COLOR 15
  LOCATE 11, 10
  PRINT "Ъ"
  FOR I = 11 TO 30
     LOCATE 11, I
     PRINT "Д"
  NEXT I
  LOCATE 11, 30
  PRINT "ї"
  FOR I = 12 TO 16
     LOCATE I, 10
     PRINT "і"
  NEXT I
  LOCATE 16, 10
  PRINT "А"
  FOR I = 11 TO 30
     LOCATE 16, I
     PRINT "Д"
  NEXT I
  LOCATE 16, 30
  PRINT "Щ"
  FOR I = 12 TO 15
      LOCATE I, 30
      PRINT "і"
  NEXT I
 PRINT


 COLOR 15
 LOCATE 13, INT(21 - (LEN(COMPANION$)) / 2)
 PRINT COMPANION$

 COLOR 14
 IF DEAD$ <> "C" THEN
    IF COMPANIONHPMAX > 99 THEN
       LOCATE 14, 16
    ELSEIF COMPANIONHPMAX > 999 THEN
       LOCATE 14, 14
    ELSE
       LOCATE 14, 17
    END IF
    PRINT COMPANIONHP; "/"; COMPANIONHPMAX
 ELSE
    LOCATE 14, 18
    COLOR 4
    PRINT "Dead"
 END IF
 

  COLOR 4
  LOCATE 5, 40
  PRINT "Й"
  FOR I = 41 TO 70
     LOCATE 5, I
     PRINT "Н"
  NEXT I
  LOCATE 5, 70
  PRINT "»"
  FOR I = 6 TO 15
     LOCATE I, 40
     PRINT "є"
  NEXT I
  LOCATE 16, 40
  PRINT "И"
  FOR I = 41 TO 70
     LOCATE 16, I
     PRINT "Н"
  NEXT I
  LOCATE 16, 70
  PRINT "ј"
  FOR I = 6 TO 15
      LOCATE I, 70
      PRINT "є"
  NEXT I
  PRINT


  LOCATE 8, INT(55 - (LEN(MONSTERNAME$(ENEMY)) / 2))
  COLOR 7
  PRINT MONSTERNAME$(ENEMY)

  LOCATE 10, 44
  PRINT "Weapon: "; WEAPON$(MONSTERWEAPON(ENEMY))
  LOCATE 11, 44
  PRINT "Armor:  "; ARMOR$(MONSTERARMOR(ENEMY))

  LOCATE 13, 49
  PRINT ENEMYHP; "/"; MONSTERHP(ENEMY); "        "
  PRINT
  PRINT


  COLOR 1
  LOCATE 18, 10
  PRINT "Й "
  FOR I = 11 TO 69
     LOCATE 18, I
     PRINT "Н"
  NEXT I
  LOCATE 20, 10
  PRINT "И"
  FOR I = 11 TO 69
    LOCATE 20, I
    PRINT "Н"
  NEXT I
  FOR I = 19 TO 19
     LOCATE I, 10
     PRINT "є"
  NEXT I
  FOR I = 19 TO 19
     LOCATE I, 70
     PRINT "є"
  NEXT I
  LOCATE 20, 70
  PRINT "ј"
  LOCATE 18, 70
  PRINT "»"
  

  COLOR 4
  LOCATE 19, 16
  PRINT "(A)ttack"

  COLOR 14
  LOCATE 19, 30
  PRINT "(M)agic"

  COLOR 10
  LOCATE 19, 44
  PRINT "(R)un"

  COLOR 9
  LOCATE 19, 57
  PRINT "(D)rink"


END SUB

SUB TABLE3

SCREEN 12

COLOR 14
LOCATE 2, 63
PRINT "Heading ";

IF DIRECTION = 0 THEN PRINT "North   "
IF DIRECTION = 180 THEN PRINT "South   "
IF DIRECTION = 90 THEN PRINT "East   "
IF DIRECTION = 270 THEN PRINT "West   "


COLOR 1
FOR I = 59 TO 79
   LOCATE 4, I
   PRINT "Н"
NEXT I

FOR I = 59 TO 79
   LOCATE 14, I
   PRINT "Н"
NEXT I

LOCATE 5, (70 - (LEN(NAME$)) / 2)
COLOR 15
PRINT NAME$
COLOR 1

FOR I = 5 TO 13
   LOCATE I, 58
   PRINT "є"
NEXT I

FOR I = 5 TO 13
   LOCATE I, 80
   PRINT "є"
NEXT I

LOCATE 4, 58
PRINT "Й"
LOCATE 14, 58
PRINT "И"
LOCATE 4, 80
PRINT "»"
LOCATE 14, 80
PRINT "ј"



FOR I = 59 TO 64
   LOCATE 11, I
   PRINT "Д"
NEXT I

FOR I = 66 TO 79
   LOCATE 11, I
   PRINT "Д"
NEXT I

COLOR 15
LOCATE 12, (70 - (LEN(ARMOR$(YOURA)) / 2))
PRINT ARMOR$(YOURA)
LOCATE 13, (70 - (LEN(WEAPON$(YOURW)) / 2))
PRINT WEAPON$(YOURW)
COLOR 1

FOR I = 7 TO 10
  LOCATE I, 65
  PRINT "і"
NEXT I

COLOR 15
LOCATE 8, 59
PRINT "Magic"
LOCATE 9, 59
PRINT "Health"

CALL PRINTHP
COLOR 1

FOR I = 59 TO 64
   LOCATE 6, I
   PRINT "Д"
NEXT I

FOR I = 66 TO 79
   LOCATE 6, I
   PRINT "Д"
NEXT I

LOCATE 6, 65
PRINT "В"
LOCATE 11, 65
PRINT "Б"


COLOR 1
FOR I = 59 TO 79
   LOCATE 16, I
   PRINT "Н"
NEXT I

FOR I = 59 TO 79
   LOCATE 26, I
   PRINT "Н"
NEXT I

LOCATE 17, (70 - (LEN(COMPANION$)) / 2)
COLOR 15
PRINT COMPANION$
COLOR 1

FOR I = 17 TO 25
   LOCATE I, 58
   PRINT "є"
NEXT I

FOR I = 17 TO 25
   LOCATE I, 80
   PRINT "є"
NEXT I

LOCATE 16, 58
PRINT "Й"
LOCATE 26, 58
PRINT "И"
LOCATE 16, 80
PRINT "»"
LOCATE 26, 80
PRINT "ј"



FOR I = 59 TO 64
   LOCATE 23, I
   PRINT "Д"
NEXT I

FOR I = 66 TO 79
   LOCATE 23, I
   PRINT "Д"
NEXT I

COLOR 15
LOCATE 24, (70 - (LEN(ARMOR$(COMPANIONA)) / 2))
PRINT ARMOR$(COMPANIONA)
LOCATE 25, (70 - (LEN(WEAPON$(COMPANIONW)) / 2))
PRINT WEAPON$(COMPANIONW)
COLOR 1

FOR I = 19 TO 22
  LOCATE I, 65
  PRINT "і"
NEXT I

COLOR 15
LOCATE 20, 59
PRINT "Magic"
LOCATE 21, 59
PRINT "Health"

COLOR 1

FOR I = 59 TO 64
   LOCATE 18, I
   PRINT "Д"
NEXT I

FOR I = 66 TO 79
   LOCATE 18, I
   PRINT "Д"
NEXT I

LOCATE 18, 65
PRINT "В"
LOCATE 23, 65
PRINT "Б"


LOCATE 15, (70 - (LEN(LEVEL) + 4) / 2)
COLOR 14
PRINT "Level "; LEVEL
A = (LEVEL * 50) * (LEVEL ^ 2) - XP
LOCATE 27, (68 - (LEN(A) + 13) / 2)
PRINT A; "to next level"

LOCATE 28, 61
COLOR 9
PRINT "(C) For Commands"

END SUB

SUB TABLE5

CLS
COLOR 9


LOCATE 4, 19
PRINT "Й"

FOR I = 20 TO 60
   LOCATE 4, I
   PRINT "Н"
NEXT I

COLOR 15
LOCATE 3, 35
PRINT "High Scores"

COLOR 14
LOCATE 5, 20
PRINT "Name", "Companion", "Level   "; "Experience"
COLOR 9


FOR I = 20 TO 60
   LOCATE 6, I
   PRINT "Д"
NEXT I

LOCATE 6, 19
PRINT "З"

LOCATE 6, 61
PRINT "¶"


LOCATE 4, 61
PRINT "»"

FOR I = 5 TO 17
   LOCATE I, 19
   PRINT "є"
NEXT I

FOR I = 5 TO 17
   LOCATE I, 61
   PRINT "є"
NEXT I


LOCATE 17, 19
PRINT "И"

LOCATE 17, 61
PRINT "ј"

LOCATE

FOR I = 20 TO 60
   LOCATE 17, I
   PRINT "Н"
NEXT I

FOR I = 1 TO 10
   IF HLEVEL(I) > 0 THEN
  
      COLOR 15
      LOCATE (I + 6), 20
      PRINT HNAME$(I)
      LOCATE (I + 6), 30
      PRINT HCOMPANION$(I)
      LOCATE (I + 6), 44
      PRINT HLEVEL(I)
      LOCATE (I + 6), 51
      PRINT HXP(I)
   END IF

NEXT I


END SUB

SUB UPLEVEL
  
   FOR I = 5 TO 70
     LOCATE 22, I
     PRINT " "
   NEXT I

      COLOR 14
      LOCATE 22, 25
      PRINT "You have gained a level.......          "
      CALL DELAY2
      HPMAX = (INT(HPMAX * 1.25))
      IF HPMAX > 9999 THEN HPMAX = 9999
      AP = (INT(AP * 1.15))
      INTEL = (INT(INTEL * 1.25))
      MPMAX = (INT(MPMAX * 1.3))
      IF MPMAX > 999 THEN MPMAX = 999
      COMPANIONHPMAX = (INT(COMPANIONHPMAX * 1.25))
      IF COMPANIONHPMAX > 9999 THEN COMPANIONHPMAX = 9999
      COMPANIONAP = (INT(COMPANIONAP * 1.15))
      COMPANIONINTEL = (INT(COMPANIONINTEL * 1.25))
      COMPANIONMPMAX = (INT(COMPANIONMPMAX * 1.3))
      IF COMPANIONMPMAX > 999 THEN COMPANIONMPMAX = 999
      LEVEL = LEVEL + 1
      IF DEAD$ <> "U" THEN
         HP = HPMAX
      END IF
      IF DEAD$ <> "C" THEN
        COMPANIONHP = COMPANIONHPMAX
   END IF

CALL TABLE3

END SUB

SUB YOUHIT
 COLOR 14
   CHANCE = INT((RND) * (LEVEL + 5)) + 1
   IF CHANCE = 1 THEN
      A = INT(26 / 2)
      LOCATE 22, (40 - A)
      PRINT "You have swung and missed."
   ELSE
      DAMAGE = INT((RND) * (AP + OB - LEVEL)) + (LEVEL ^ 2)
      DAMAGE = DAMAGE - ARMOR(MONSTERARMOR(ENEMY))
      IF DAMAGE < 1 THEN DAMAGE = 1
      A = INT((LEN(MONSTERNAME$(ENEMY)) + LEN(DAMAGE) + 25) / 2)
      LOCATE 22, (40 - A)
      PRINT "You hit the "; MONSTERNAME$(ENEMY); " for "; DAMAGE; " damage."
      IF SOUND$ = "Y" THEN
         FOR I = 300 TO 40 STEP -5
            SOUND I, .065
         NEXT I
      END IF
      ENEMYHP = ENEMYHP - DAMAGE
  END IF


END SUB

