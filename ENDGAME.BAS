DECLARE SUB display2 ()
DECLARE SUB INIT ()
DECLARE SUB BATTLE ()
DECLARE SUB DEATH ()
DECLARE SUB MAGIC ()
DECLARE SUB POTION ()
DECLARE SUB RUNNING ()
DECLARE SUB DISPLAY ()
DECLARE SUB TABLE2 ()
DECLARE SUB YOUHIT ()
DECLARE SUB HITSYOU ()
DECLARE SUB HITSHIM ()
DECLARE SUB HEHITS ()
DECLARE SUB ITCASTS ()
DECLARE SUB DELAY2 ()
DECLARE SUB DISPLAY ()


DIM SHARED MSPELLLOW(50)
DIM SHARED PHRASE$(500)
DIM SHARED MSPELLHIGH(50)
DIM SHARED MSPELLNAME$(50)

COMMON SHARED NAME$
COMMON SHARED COMPANION$
COMMON SHARED DEAD$
COMMON SHARED DB
COMMON SHARED COMPANIONOB
COMMON SHARED COMPANIONDB
COMMON SHARED YOURA
COMMON SHARED LEVEL
COMMON SHARED YOURW
COMMON SHARED MONSTERAP
COMMON SHARED COMPANIONA
COMMON SHARED COMPANIONW
COMMON SHARED MONSTERSPELL
COMMON SHARED OB
COMMON SHARED COMPANIONMP
COMMON SHARED AP
COMMON SHARED HP
COMMON SHARED MP
COMMON SHARED XP
COMMON SHARED DAMAGE
COMMON SHARED MONSTERHP
COMMON SHARED ENEMY
COMMON SHARED HPMAX
COMMON SHARED COMPANIONMPMAX
COMMON SHARED MPMAX
COMMON SHARED COMPANIONAP
COMMON SHARED COMPANIONHP
COMMON SHARED COMPANIONHPMAX
COMMON SHARED PURPLEPOTION
COMMON SHARED GREENPOTION
COMMON SHARED WHITEPOTION
COMMON SHARED YELLOWPOTION
COMMON SHARED BLUEPOTION
COMMON SHARED REDPOTION
COMMON SHARED GREYPOTION
COMMON SHARED ENEMYHP

SCREEN 0

CLS

OPEN "CHECK.TMP" FOR INPUT AS #2
   INPUT #2, TEST$
   IF TEST$ <> "CHECK" THEN
      CLS
      COLOR 7
      PRINT CHR$(34); "The path to victory is marked with the laws of Virtue,"
      PRINT "not the commands of DOS."; CHR$(34)
      PRINT
      PRINT "     -- Lord British"
      END
   
   ELSE
   
INPUT #2, LEVEL
INPUT #2, DB
INPUT #2, COMPANIONOB
INPUT #2, COMPANIONDB
INPUT #2, YOURA
INPUT #2, YOURW
INPUT #2, COMPANIONA
INPUT #2, COMPANIONW
INPUT #2, OB
INPUT #2, COMPANIONMP
INPUT #2, NAME$
INPUT #2, DEAD$
INPUT #2, COMPANION$
INPUT #2, AP
INPUT #2, HP
INPUT #2, MP
INPUT #2, XP
INPUT #2, HPMAX
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
      
END IF
CLOSE #2

OPEN "CHECK.TMP" FOR OUTPUT AS #2
   PRINT #2, "NOPE,"
CLOSE #2

CALL DISPLAY

LEVEL = 10

ENEMY = 30
CALL INIT

MONSTERAP = 1000
MONSTERHP = 3500
MONSTERSPELL = 10

CALL BATTLE

CLOSE #2

SUB BATTLE
CLS
SCREEN 0

  COLOR 4
  ENEMYHP = MONSTERHP
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
     PRINT ENEMYHP; "/"; MONSTERHP; "       "
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
 
  IF FIRST = 0 THEN
     A = 20
     LOCATE 22, (40 - A)
     PRINT "Beldan casts Mute. You cannot use magic."
     CALL DELAY2

 FOR I = 5 TO 70
    LOCATE 22, I
    PRINT " "
 NEXT I
    
     FIRST = 1
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
   END IF


  IF KEY$ = "M" OR KEY$ = "m" THEN
     CALL MAGIC
     HITPERSON = 0
  ELSEIF KEY$ = "d" OR KEY$ = "D" THEN
     CALL POTION
     HITPERSON = 0
  ELSEIF KEY$ = "R" OR KEY$ = "r" THEN
     CALL RUNNING
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


 
 IF ENEMYHP < 1000 AND ENEMYHP > 0 THEN
    A = INT((RND) * 3) + 1
    IF A = 1 THEN
         CALL DELAY2
         COLOR 4
         HEAL = INT((RND) * 500) + 1
         A = 20
         LOCATE 22, (40 - A)
         PRINT "Beldan casts heal. He regains "; HEAL; " points."
         ENEMYHP = ENEMYHP + HEAL
         CALL DELAY2
         END IF
    END IF

 CALL ITCASTS
 
 END IF

 CALL DELAY2

 FOR I = 5 TO 70
    LOCATE 22, I
    PRINT " "
 NEXT I

IF ENEMYHP < 1 THEN
    CALL display2
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

SUB DEATH

CLS
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
      FOR PAUSE = 1 TO 30
      NEXT PAUSE
   NEXT J
NEXT I

CALL DELAY2

END


END SUB

SUB DELAY2
KEY$ = ""
DO UNTIL KEY$ <> ""
   KEY$ = INKEY$
LOOP
END SUB

SUB DISPLAY

CLS
SCREEN 0

FILENAME$ = "MAPTEXT.7"

OPEN FILENAME$ FOR INPUT AS #2
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

      IF MID$((NEWPHRASE$), COUNT, 1) = "€" THEN
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

SUB display2

CLS
SCREEN 0

FILENAME$ = "MAPTEXT.8"

OPEN FILENAME$ FOR INPUT AS #2
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

      IF MID$((NEWPHRASE$), COUNT, 1) = "€" THEN
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


SENT$ = "Congratulations Warrior "
COLOR 4
FOR I = 1 TO LEN(SENT$)

   
      FOR G = 1 TO 79
         IF I <> 12 THEN
            LOCATE I, G
            PRINT " ";
         END IF
      NEXT G
   
  
   FOR J = 55 TO 28 STEP -2
      LOCATE 12, J + I
      PRINT MID$(SENT$, I, 1)
      LOCATE 12, J + 1 + I
      PRINT " "
   NEXT J
NEXT I

CALL DELAY2
CLS
END




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
        IF DAMAGE < 1 THEN DAMAGE = 1
        A = INT((LEN(DAMAGE) + LEN(COMPANION$) + 16) / 2)
        LOCATE 22, (40 - A)
        PRINT COMPANION$; " hits Beldan for "; DAMAGE
        ENEMYHP = ENEMYHP - DAMAGE
     END IF




END SUB

SUB HITSHIM

 COLOR 4
 CHANCE = INT((RND) * (ENEMY + 1)) + 1
   IF CHANCE = 1 THEN
      LOCATE 22, 25
      A = INT((23 + LEN(COMPANION$)) / 2)
      LOCATE 22, (40 - A)
      PRINT "Beldan attacks "; COMPANION$; " and misses"
   ELSE
      DAMAGE = INT((RND) * (MONSTERAP)) + ENEMY
      DAMAGE = (INT(DAMAGE - DB))
      IF DAMAGE < 1 THEN DAMAGE = 1
      COMPANIONHP = COMPANIONHP - DAMAGE
      A = INT((LEN(COMPANION$) + LEN(DAMAGE) + 17) / 2)
      LOCATE 22, (40 - A)
      PRINT COMPANION$; " has taken "; DAMAGE; "damage"
   END IF


END SUB

SUB HITSYOU

COLOR 4
CHANCE = INT((RND) * (ENEMY + 1)) + 1
IF CHANCE = 1 THEN
    A = INT(35 / 2)
    LOCATE 22, (40 - A)
    PRINT "Beldan attacks but does not hit you"
 ELSE
    DAMAGE = INT((RND) * (MONSTERAP)) + ENEMY
    DAMAGE = INT(DAMAGE - DB)
    IF DAMAGE < 1 THEN DAMAGE = 1
    A = INT((LEN(DAMAGE) + 19) / 2)
    LOCATE 22, (40 - A)
    PRINT "You sustain "; DAMAGE; " damage"
    HP = HP - DAMAGE

END IF


END SUB

SUB INIT
 NUM = 11
 OPEN "MONSPELL.DAT" FOR INPUT AS #2
 DO UNTIL MSPELLNAME$(NUM) = "EOD"
    NUM = NUM - 1
    INPUT #2, MSPELLNAME$(NUM)
    INPUT #2, MSPELLLOW(NUM)
    INPUT #2, MSPELLHIGH(NUM)
 LOOP
 CLOSE #2
 CLOSE #2
 CLS


END SUB

SUB ITCASTS
  
    SPELLCHANCE = INT((RND) * 4) + 1
    IF SPELLCHANCE = 2 OR YES$ = "YES" THEN
     
       CALL DELAY2
       FOR I = 5 TO 70
        LOCATE 22, I
        PRINT " "
       NEXT I
     
       SPELL = INT((RND) * MONSTERSPELL) + 1
       DAMAGE = INT((RND) * MSPELLHIGH(SPELL)) + MSPELLLOW(SPELL)
       COMPANIONHP = COMPANIONHP - DAMAGE
       HP = HP - DAMAGE
       A = INT((LEN(MSPELLNAME$(SPELL)) + LEN(DAMAGE) + 22) / 2)
       LOCATE 22, (40 - A)
       COLOR 4
       PRINT "Beldan casts "; MSPELLNAME$(SPELL); ", "; DAMAGE; " damage."
    END IF


END SUB

SUB MAGIC
 
  A = 11
  LOCATE 22, (40 - A)
  PRINT "You cannot cast Magic"
 
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
            MPPLUS = INT((RND) * 250) + 1
            MP = MP + MPPLUS
            PRINT "You feel much more powerful and much more intelligent."
           
      ELSEIF KEY$ = "2" THEN
            MPPLUS = INT((RND) * 250) + 1
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
      PRINT "Beldan says, 'You pathetic fool, I can still see you!'"
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

SUB RUNNING
  
   COLOR 14
   A = 12
   LOCATE 22, (40 - A)
   PRINT "You cannot escape Beldan"
   CALL DELAY2

END SUB

SUB TABLE2

  CLS
  COLOR 14
  LOCATE 5, 10
  PRINT "Ú"
  FOR I = 11 TO 30
     LOCATE 5, I
     PRINT "Ä"
  NEXT I
  LOCATE 5, 30
  PRINT "¿"
  FOR I = 6 TO 10
     LOCATE I, 10
     PRINT "³"
  NEXT I
  LOCATE 10, 10
  PRINT "À"
  FOR I = 11 TO 30
     LOCATE 10, I
     PRINT "Ä"
  NEXT I
  LOCATE 10, 30
  PRINT "Ù"
  FOR I = 6 TO 9
      LOCATE I, 30
      PRINT "³"
  NEXT I
  PRINT
 

 COLOR 15

 LOCATE 7, INT(21 - (LEN(NAME$)) / 2)
 PRINT NAME$

 COLOR 14
 IF HP > 0 THEN
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
  PRINT "Ú"
  FOR I = 11 TO 30
     LOCATE 11, I
     PRINT "Ä"
  NEXT I
  LOCATE 11, 30
  PRINT "¿"
  FOR I = 12 TO 16
     LOCATE I, 10
     PRINT "³"
  NEXT I
  LOCATE 16, 10
  PRINT "À"
  FOR I = 11 TO 30
     LOCATE 16, I
     PRINT "Ä"
  NEXT I
  LOCATE 16, 30
  PRINT "Ù"
  FOR I = 12 TO 15
      LOCATE I, 30
      PRINT "³"
  NEXT I
 PRINT


 COLOR 15
 LOCATE 13, INT(21 - (LEN(COMPANION$)) / 2)
 PRINT COMPANION$

 COLOR 14
 IF COMPANIONHP > 0 THEN
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
  PRINT "É"
  FOR I = 41 TO 70
     LOCATE 5, I
     PRINT "Í"
  NEXT I
  LOCATE 5, 70
  PRINT "»"
  FOR I = 6 TO 15
     LOCATE I, 40
     PRINT "º"
  NEXT I
  LOCATE 16, 40
  PRINT "È"
  FOR I = 41 TO 70
     LOCATE 16, I
     PRINT "Í"
  NEXT I
  LOCATE 16, 70
  PRINT "¼"
  FOR I = 6 TO 15
      LOCATE I, 70
      PRINT "º"
  NEXT I
  PRINT

  MONSTERNAME$ = "Beldan"
  LOCATE 8, INT(55 - (LEN(MONSTERNAME$)) / 2)
  COLOR 7
  PRINT MONSTERNAME$

  LOCATE 10, 44
 

  MONSTERWEAPON$ = "Satan's Blade"
  MONSTERARMOR$ = "Demon Armor"
  PRINT "Weapon: "; MONSTERWEAPON$
  LOCATE 11, 44
  PRINT "Armor:  "; MONSTERARMOR$

  LOCATE 13, 49
  PRINT ENEMYHP; "/"; MONSTERHP; "        "
  PRINT
  PRINT


  COLOR 1
  LOCATE 18, 10
  PRINT "É "
  FOR I = 11 TO 69
     LOCATE 18, I
     PRINT "Í"
  NEXT I
  LOCATE 20, 10
  PRINT "È"
  FOR I = 11 TO 69
    LOCATE 20, I
    PRINT "Í"
  NEXT I
  FOR I = 19 TO 19
     LOCATE I, 10
     PRINT "º"
  NEXT I
  FOR I = 19 TO 19
     LOCATE I, 70
     PRINT "º"
  NEXT I
  LOCATE 20, 70
  PRINT "¼"
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

SUB YOUHIT
 COLOR 14
   CHANCE = INT((RND) * (LEVEL + 5)) + 1
   IF CHANCE = 1 THEN
      A = INT(26 / 2)
      LOCATE 22, (40 - A)
      PRINT "You have swung and missed."
   ELSE
      DAMAGE = INT((RND) * (AP + OB - LEVEL)) + (LEVEL ^ 2)
      IF DAMAGE < 1 THEN DAMAGE = 1
      A = INT((LEN(DAMAGE) + 26) / 2)
      LOCATE 22, (40 - A)
      PRINT "You hit Beldan for "; DAMAGE; " damage."
      ENEMYHP = ENEMYHP - DAMAGE
  END IF

END SUB

