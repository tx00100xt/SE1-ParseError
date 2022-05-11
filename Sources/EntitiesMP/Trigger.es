/* Copyright (c) 2002-2012 Croteam Ltd. 
This program is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as published by
the Free Software Foundation


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */

205
%{
#include "EntitiesMP/StdH/StdH.h"
extern INDEX ent_bReportBrokenChains;
%}

class CTrigger: CRationalEntity {
name      "Trigger";
thumbnail "Thumbnails\\Trigger.tbn";
features  "HasName", "IsTargetable";

properties:

  1 CTString m_strName              "Name" 'N' = "Trigger",         // class name

  3 CEntityPointer m_penTarget1     "Target 01" 'T' COLOR(C_RED|0xFF),                 // send event to entity
  4 CEntityPointer m_penTarget2     "Target 02" 'Y' COLOR(C_RED|0xFF),
  5 CEntityPointer m_penTarget3     "Target 03" 'U' COLOR(C_RED|0xFF),
  6 CEntityPointer m_penTarget4     "Target 04" 'I' COLOR(C_RED|0xFF),
  7 CEntityPointer m_penTarget5     "Target 05" 'O' COLOR(C_RED|0xFF),
 20 CEntityPointer m_penTarget6     "Target 06" COLOR(C_RED|0xFF),
 21 CEntityPointer m_penTarget7     "Target 07" COLOR(C_RED|0xFF),
 22 CEntityPointer m_penTarget8     "Target 08" COLOR(C_RED|0xFF),
 23 CEntityPointer m_penTarget9     "Target 09" COLOR(C_RED|0xFF),
 24 CEntityPointer m_penTarget10    "Target 10" COLOR(C_RED|0xFF),
  8 enum EventEType m_eetEvent1     "Event type Target 01" 'G' = EET_TRIGGER,  // type of event to send
  9 enum EventEType m_eetEvent2     "Event type Target 02" 'H' = EET_TRIGGER,
 10 enum EventEType m_eetEvent3     "Event type Target 03" 'J' = EET_TRIGGER,
 11 enum EventEType m_eetEvent4     "Event type Target 04" 'K' = EET_TRIGGER,
 12 enum EventEType m_eetEvent5     "Event type Target 05" 'L' = EET_TRIGGER,
 50 enum EventEType m_eetEvent6     "Event type Target 06" = EET_TRIGGER,
 51 enum EventEType m_eetEvent7     "Event type Target 07" = EET_TRIGGER,
 52 enum EventEType m_eetEvent8     "Event type Target 08" = EET_TRIGGER,
 53 enum EventEType m_eetEvent9     "Event type Target 09" = EET_TRIGGER,
 54 enum EventEType m_eetEvent10    "Event type Target 10" = EET_TRIGGER,
 13 CTStringTrans m_strMessage      "Message" 'M' = "",     // message
 14 FLOAT m_fMessageTime            "Message time" = 3.0f,  // how long is message on screen
 15 enum MessageSound m_mssMessageSound "Message sound" = MSS_NONE, // message sound
 16 FLOAT m_fScore                  "Score" 'S' = 0.0f,

 30 FLOAT m_fWaitTime             "Wait" 'W' = 0.0f,          // wait before send events
 31 BOOL m_bAutoStart             "Auto start" 'A' = FALSE,   // trigger auto starts
 32 INDEX m_iCount                "Count" 'C' = 1,            // count before send events
 33 BOOL m_bUseCount              "Count use" = FALSE,        // use count to send events
 34 BOOL m_bReuseCount            "Count reuse" = FALSE,      // reuse counter after reaching 0
 35 BOOL m_bTellCount             "Count tell" = FALSE,       // tell remaining count to player
 36 BOOL m_bActive                "Active" 'V' = TRUE,        // starts in active/inactive state
 37 RANGE m_fSendRange            "Send Range" 'R' = 1.0f,    // for sending event in range
 38 enum EventEType m_eetRange    "Event type Range" = EET_IGNORE,  // type of event to send in range
 
 40 INDEX m_iCountTmp = 0,          // use count value to determine when to send events
 41 CEntityPointer m_penCaused,     // who touched it last time
 42 INDEX m_ctMaxTrigs            "Max trigs" 'X' = -1, // how many times could trig
 
 // Parse Error chit
 101 INDEX m_iCounter = 0,
 102 FLOAT fX = 0.0f,
 103 FLOAT fY = 0.0f,
 104 FLOAT fZ = 0.0f,
 105 CTString strLevelName = "",
 106 BOOL m_bTriggerTweak1 = FALSE,
 107 BOOL m_bTriggerTweak2 = FALSE,
 108 BOOL m_bTriggerTweak3 = FALSE,
 109 BOOL m_bTriggerTweak4 = FALSE,
 110 BOOL m_bTriggerTweak5 = FALSE,
 111 BOOL m_bTriggerTweak6 = FALSE,
 112 BOOL m_bTriggerTweak7 = FALSE,
 113 BOOL m_bTriggerTweak8 = FALSE,
 114 BOOL m_bTriggerTweak9 = FALSE,
 115 BOOL m_bTriggerTweak10 = FALSE,

components:

  1 model   MODEL_MARKER     "Models\\Editor\\Trigger.mdl",
  2 texture TEXTURE_MARKER   "Models\\Editor\\Camera.tex"


functions: 
  
  /*void Precache(void)
  {
    SetSpawnFlags(0x0005000f);
  }*/

  // get target 1 (there is no property 'm_penTarget')
  CEntity *GetTarget(void) const
  { 
    return m_penTarget1;
  }

  void SendRangeEventBox(CEntity *penSender, EventEType eetEventType, FLOAT3D vOrigin, FLOAT3D vOffset, INDEX iEntityType)
  {
    FLOAT fXMin = vOrigin(1);
    FLOAT fYMin = vOrigin(2);
    FLOAT fZMin = vOrigin(3);
    FLOAT fXMax = vOffset(1);
    FLOAT fYMax = vOffset(2);
    FLOAT fZMax = vOffset(3);
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if ( (IsOfClass(pen, "Trigger") && iEntityType==0)        
        || (IsOfClass(pen, "Enemy Spawner") && iEntityType==1) ) {
			  CPlacement3D pl;
			  pl.pl_PositionVector = pen->GetPlacement().pl_PositionVector;
			  FLOAT X = pl.pl_PositionVector(1);
			  FLOAT Z = pl.pl_PositionVector(3);
        FLOAT Y = pl.pl_PositionVector(2);
        if (X>fXMin && X<fXMax  && Y>fYMin && Y<fYMax && Z>fZMin && Z<fZMax) {
          //CPrintF("Event Sent to: %s\n", pen->GetName());
          pen->SendEvent(ETrigger());
        }
      } 
    }}
  }

  void SendRangeEventSphere(CEntity *penSender, EventEType eetEventType, FLOAT3D vOrigin, FLOAT fRange, INDEX iEntityType)
  {
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if ( (IsOfClass(pen, "Trigger") && iEntityType==0)        
        || (IsOfClass(pen, "Enemy Spawner") && iEntityType==1) ) {
			  CPlacement3D pl;
			  pl.pl_PositionVector = pen->GetPlacement().pl_PositionVector;
        if ( (pl.pl_PositionVector - vOrigin).Length()<=fRange) {
          //CPrintF("Event Sent to: %s\n", pen->GetName());
          pen->SendEvent(ETrigger());
        }
      } 
    }}
  }

  void SendTGPEvent(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "Trigger")) {
        CTrigger *penT = (CTrigger *)pen;
        //if (((CTrigger *)&*pen)->fX==-10.25f || ((CTrigger *)&*pen)->fX==-46.0f) {
        if (penT->m_strName=="Start Bulls" && penT->fX==34.0f) {
          ((CTrigger *)&*pen)->SendEvent(ETrigger());
        }
      }
    }}
  }

  void SendFWDisplayEvent(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsOfClass(pen, "OverLord")) {
        pen->SendEvent(ETrigger());
      }
    }}
  }

	void StartRain(void)
	{
		//CPrintF("Start Rain\n");
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      if (IsOfClass(pen, "EnvironmentParticlesHolder")) {
				pen->SendEvent(EStart());
			}
		}}
	}

	void StopRain(void)
	{
		//CPrintF("Stop Rain\n");
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      if (IsOfClass(pen, "EnvironmentParticlesHolder")) {
				pen->SendEvent(EStop());
			}
		}}
	}

  void SetLevelMods(void) 
  {
	  //CPrintF( "Trigger Description: ^C%s\n", m_strName);

		// ( X, Y, Z ) Coords of Trigger
		fX = GetPlacement().pl_PositionVector(1);
		//fY = penTrigger->GetPlacement().pl_PositionVector(2);
		fZ = GetPlacement().pl_PositionVector(3);

		strLevelName = _pNetwork->ga_fnmWorld.FileName();

    if (m_fWaitTime>0) {
      m_fWaitTime /= 2;
    }

    if (strLevelName=="1_2_Palenque" && m_strName=="Trigg Valley Enter Fight") {
      m_fWaitTime = 1.0f*GetGameEnemyMultiplier();
    } else if (strLevelName=="1_3_Teotihuacan") {
      if (m_strName=="Start Third  Wave Trigger") {
        m_penTarget1 = NULL;
      }
    } else if (strLevelName=="1_4_Teotihuacan") {
      if (m_strName=="Deactivator Trigger" || m_strName=="Security Deactivator Trigger") {
        m_penTarget1 = m_penTarget2 = m_penTarget3 = NULL;
      }
    } else if (strLevelName=="1_5_Teotihuacan" && fZ==122.0f) {
      //CPrintF("Pit Trigger Tweak\n");
      m_iCount = 1;
      m_bUseCount = FALSE;
    } else if (strLevelName=="2_1_Ziggurrat" && m_strName=="Close Doors" ) {
			m_penTarget1 = m_penTarget2 = NULL;
    } else if (strLevelName=="2_3_Persepolis") {			
			if (fX==77.75f && m_strName=="Trigg enemies") {
				m_fWaitTime = 10.0f*GetGameEnemyMultiplier();
			}
			if (m_strName=="Deactiavte Secret Trigger") {
				 m_penTarget1 = NULL;
			}
    /*} else if (strLevelName=="2_4_TowerOfBabylon") {
      if (fZ==234.75f) {
        m_bTriggerTweak2 = TRUE;
      }
      if (fZ==198.25f || fZ==165.5f || fZ==125.5f) {
        m_fWaitTime = 5.0f*FRnd();
      }*/
    } else if (strLevelName=="3_1_GothicCastle") {
      if (fX==39.0f) {
        m_iCount = 1;
        m_bUseCount = FALSE;
      }
      if (m_strName=="First WaveTrigger") {
        m_bTriggerTweak1 = TRUE;
      }
      if (fX==76.75f || fX==146.25f) {
        m_fWaitTime = 5.0f*FRnd();
      }
    /*} else if (strLevelName=="3_3_CorridorOfDeath") {
      //m_fWaitTime /= 2;
      if (m_strName=="Trigg Kamikaze Fight") {
			  m_penTarget5 = NULL;
      }*/
		} else if (strLevelName=="01_Hatshepsut") {
			if (m_strName == "Trigger start rain") {
        m_bTriggerTweak9 = TRUE;
      }
			if (m_strName == "Trigger stop rain") {
        m_bTriggerTweak10 = TRUE;
      }
    } else if (strLevelName=="04_ValleyOfTheKings") {
			if (m_strName == "Deactivate Gizmos") {
				 m_penTarget1 =  m_penTarget2 = m_penTarget3 = NULL;
				 m_penTarget4 =  m_penTarget5 = m_penTarget6 = NULL;
			}
			if (m_strName == "Trigg BigWalker 1st") {
        m_bTriggerTweak7 = TRUE;
      }
		} else if (strLevelName=="06_Oasis") {
			if (m_strName == "Trigg Close Door") {
				 m_penTarget2 = NULL;
			}
		} else if (strLevelName=="07_Dunes") {
			if (m_strName == "Open Doors Coop") {
				 m_fWaitTime = 1.0f*GetGameEnemyMultiplier();
			}
			if (m_strName=="Player has made powerjump") {
				m_penTarget1 =  m_penTarget2 = m_penTarget3 = m_penTarget4 = NULL;
			}
		} else if (strLevelName=="10_Metropolis") {
			if (m_strName=="Trigg Item Trap" || m_strName=="Trigg Item trap") {
				m_penTarget1 =  m_penTarget2 = m_penTarget3 = NULL;
			}
			if (m_strName=="Trigg Coop Walkers") {
				m_fWaitTime = 0.0f;
			}
		} else if (strLevelName=="11_AlleyOfSphinxes") {
			if (m_strName=="DoorTrigger") {
				m_fWaitTime = 6.0f+GetGameEnemyMultiplier();
			}
			if (m_strName=="Next Fight Please" && fX==2128.0f) {
				m_bTriggerTweak6 = TRUE;
			}
		} else if (strLevelName=="12_Karnak" || strLevelName=="KarnakDemo") {
			if (m_strName=="Trigg_Trap_Activate" || m_strName=="Trigg_Trap_OpenDoors") {
				m_penTarget1 =  m_penTarget2 = m_penTarget3 = NULL;
			}
      if (fX<416 && fX>400 && fZ<2064 && fZ>2032) {
        m_fWaitTime = 0.0f;
        if (m_strName=="Trigg_Trap_Activate") {
          m_bTriggerTweak4 = TRUE;
        }
			}
			if (/*fX == 775.0f ||*/ fX == 3.75f) {
				m_fWaitTime = 5.0f;
			}
			if (fX==817.25f) {
				m_penTarget1 =  m_penTarget2 = NULL;
			}
      /*if (fZ>2026.62f && fZ<2026.64f) {
				m_penTarget1 = NULL;
				//CPrintF("Karnak Finish Trigger Gotten\n");
			}*/
      if (m_strName=="Trigger spawn enemies") {
        m_bTriggerTweak5 = TRUE;
      } 
      /*if (m_strName=="Trigger Walker Counter") {
				//m_fWaitTime = 30.0f;
        m_bTriggerTweak8 = TRUE;
      }*/ 
		} else if (strLevelName=="13_Luxor") {
			if (m_strName=="Trigger camera") {
				m_penTarget3 = NULL;
			}
			if (m_strName=="__ End Space Ship Sequence") {
				m_penTarget2 = NULL;
			}
		} else if (strLevelName=="15_TheGreatPyramid" ) {
			if (m_strName=="Trigg new Health") {
				m_fWaitTime = 5.0f;
			}
			if (m_strName=="Start Boss Cutscene") {
				m_penTarget1 = NULL;
			}
			if (m_strName=="Bring digits and start countdown") {
				m_penTarget1 = NULL;
			}
			if (m_strName=="Trigg Netricsa") {
				m_penTarget3 = NULL;
			}
			/*if (m_strName=="Wait" && fX==8.0f) {
				m_fWaitTime = 5.0f+(GetGameEnemyMultiplier()*2);
			}
			if (m_strName=="Trigg Boneman 1" && fX==14.0f) {
				m_bTriggerTweak3 = TRUE;
			}*/
		} else if (strLevelName=="alpinemists") {
			if (fX == -104.5f ) {
				m_penTarget3 = NULL;
			}
		}
  }

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CTrigger) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strMessage.Length();
    slUsedMemory += m_strName.Length();
    slUsedMemory += 1* sizeof(CSoundObject);
    return slUsedMemory;
  }



procedures:

  SendEventToTargets() {

		//CPrintF("* Trigger Triggered *\n");
    // if needed wait some time before event is sent
    if (m_fWaitTime > 0.0f) {
      wait (m_fWaitTime) {
        on (EBegin) : { resume; }
        on (ETimer) : { stop; }
        on (EDeactivate) : { pass; }
        otherwise(): { resume; }
      }
    }

		m_iCounter++;
		if (m_iCounter==1) {
      if (m_bTriggerTweak1) { // Citadel touchfield tweak
			  SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(75.75f, -1.0f, -44.0f), FLOAT3D(77.75f, 1.0f, -42.0f), 0);
        SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(145.25f, -1.0f, -47.25f), FLOAT3D(147.25f, 1.0f, -45.25f), 0);
      } else if (m_bTriggerTweak2 ) { // Babel tweak
			  SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(-1.5f, 7.0f, 197.25f), FLOAT3D(1.5f, 9.0f, 199.25f), 0);
        SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(0.5f, 7.0f, 164.5f), FLOAT3D(2.5f, 9.0f, 166.5f), 0);
			  SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(7.5f, 7.0f, 124.5f), FLOAT3D(9.5f, 9.0f, 126.5f), 0);
      } else if (m_bTriggerTweak3) {
			  //m_fWaitTime = 0.0f;
        SendTGPEvent();
      } else if (m_bTriggerTweak4) {
			  SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(392.0f, -1.0f, 2000.0f), FLOAT3D(442.0f, 35.0f, 2100.0f), 1);
      } else if (m_bTriggerTweak5) {
			  SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(150.0f, -1.0f, 2216.0f), FLOAT3D(500.0f, 70.0f, 2416.0f), 1);
        SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(229.0f, 12.0f, 2216.0f), FLOAT3D(231.0f, 14.0f, 2416.0f), 1);
        SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(390.0f, 8.0f, 2176.0f), FLOAT3D(397.0f, 9.0f, 2177.0f), 1);
			// Alley 
      } else if (m_bTriggerTweak6) {
			  SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(1974.0f, -1.0f, 2032.0f), FLOAT3D(1976.0f, 1.0f, 2034.0f), 0);
      } else if (m_bTriggerTweak7) { // valley of the kings armor 1 & 2
			  SendRangeEventSphere(this, EET_TRIGGER, FLOAT3D(51.0f, -80.0f, 158.0f), 5.0f, 0);
			  SendRangeEventSphere(this, EET_TRIGGER, FLOAT3D(-74.0f, -70.0f, -17.0f), 5.0f, 0);
      } else if (m_bTriggerTweak8) { // fireworks show
			  SendFWDisplayEvent();
			} else if (m_bTriggerTweak9) { // start Hat rain
				StartRain();
			} else if (m_bTriggerTweak10) { // stop Hat rain
				StopRain();
      } 
			if (strLevelName=="02_SandCanyon") {
				if (fX == -17.625f ) {
					SendRangeEventBox(this, EET_TRIGGER, FLOAT3D(-56.0f, -25.0f, -210.0f), FLOAT3D(-21.0f, -4.0f, -175.0f), 1);
				}
			}
    }

    // send event to all targets
    SendToTarget(m_penTarget1, m_eetEvent1, m_penCaused);
    SendToTarget(m_penTarget2, m_eetEvent2, m_penCaused);
    SendToTarget(m_penTarget3, m_eetEvent3, m_penCaused);
    SendToTarget(m_penTarget4, m_eetEvent4, m_penCaused);
    SendToTarget(m_penTarget5, m_eetEvent5, m_penCaused);
    SendToTarget(m_penTarget6, m_eetEvent6, m_penCaused);
    SendToTarget(m_penTarget7, m_eetEvent7, m_penCaused);
    SendToTarget(m_penTarget8, m_eetEvent8, m_penCaused);
    SendToTarget(m_penTarget9, m_eetEvent9, m_penCaused);
    SendToTarget(m_penTarget10, m_eetEvent10, m_penCaused);

    // if there is event to send in range
    if (m_eetRange!=EET_IGNORE) {
      // send in range also
      SendInRange(this, m_eetRange, FLOATaabbox3D(GetPlacement().pl_PositionVector, m_fSendRange));
    }

    // if trigger gives score
    if (m_fScore>0) {
      CEntity *penCaused = FixupCausedToPlayer(this, m_penCaused);

      // if we have causer
      if (penCaused!=NULL) {
        // send the score
        EReceiveScore eScore;
        eScore.iPoints = (INDEX) m_fScore;
        penCaused->SendEvent(eScore);
        penCaused->SendEvent(ESecretFound());
      }

      // kill score to never be reported again
      m_fScore = 0;
    }
    if (m_strMessage!="") {
      PrintCenterMessage(this, m_penCaused, 
        TranslateConst(m_strMessage), 
        m_fMessageTime, m_mssMessageSound);
    }

    // if max trig count is used for counting
    if(m_ctMaxTrigs > 0)
    {
      // decrease count
      m_ctMaxTrigs-=1;
      // if we trigged max times
      if( m_ctMaxTrigs <= 0)
      {
        // cease to exist
        Destroy();
      }
    }
    return;
  };

  Active() {
    ASSERT(m_bActive);
    // store count start value
    m_iCountTmp = m_iCount;

    //main loop
    wait() {
      on (EBegin) : { 
        // if auto start send event on init
        if (m_bAutoStart) {
          call SendEventToTargets();
        }
        resume;
      }
      // re-roots start events as triggers
      on (EStart eStart) : {
        SendToTarget(this, EET_TRIGGER, eStart.penCaused);
        resume;
      }
      // cascade trigger
      on (ETrigger eTrigger) : {
			  /*if (m_strName=="__ Call space ship to come") {
				  CPrintF("__ Call space ship to come Trigger Triggered\n");
			  }*/
        m_penCaused = eTrigger.penCaused;
        // if using count
        if (m_bUseCount) {
          // count reach lowest value
          if (m_iCountTmp > 0) {
            // decrease count
            m_iCountTmp--;
						//CPrintF( "^c008800( %.3f, %.3f, %.3f )Trigger, %d more to go...\n", fX, fY, fZ, m_iCountTmp);
						//CPrintF("^c008800Trigger %s, %d more to go...\n", m_strName, m_iCountTmp); 
            // send event if count is less than one (is zero)
            if (m_iCountTmp < 1) {
              if (m_bReuseCount) {
                m_iCountTmp = m_iCount;
              } else {
                m_iCountTmp = 0;
              }
							//CPrintF( "^c666666( %.3f, %.3f, %.3f )Trigger, ^f8Triggered\n", fX, fY, fZ);
							//CPrintF("^c666666Trigger %s, Triggered\n", m_strName); 
              call SendEventToTargets();
            } else if (m_bTellCount) {
              CTString strRemaining;
              strRemaining.PrintF(TRANSV("%d more to go..."), m_iCountTmp);
              PrintCenterMessage(this, m_penCaused, strRemaining, 3.0f, MSS_INFO);
            }
          }
        // else send event
        } else {
          call SendEventToTargets();
        }
        resume;
      }
      // if deactivated
      on (EDeactivate) : {
        // go to inactive state
        m_bActive = FALSE;
        jump Inactive();
      }
    }
  };
  Inactive() {
    ASSERT(!m_bActive);
    while (TRUE) {
      // wait 
      wait() {
        // if activated
        on (EActivate) : {
          // go to active state
          m_bActive = TRUE;
          jump Active();
        }
        otherwise() : {
          resume;
        };
      };
      
      // wait a bit to recover
      autowait(0.1f);
    }
  }

  Main() {
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    m_fSendRange = ClampDn(m_fSendRange, 0.01f);

    // spawn in world editor
    autowait(0.1f);

    // set all the level tweaks
    SetLevelMods();

    // go into active or inactive state
    if (m_bActive) {
      jump Active();
    } else {
      jump Inactive();
    }

    // cease to exist
    Destroy();

    return;
  };
};
