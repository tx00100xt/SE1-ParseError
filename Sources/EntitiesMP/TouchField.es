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

206
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/Projectile.h"
#include "EntitiesMP/Trigger.h"
#include "EntitiesMP/Player.h"
extern INDEX hud_bShowPEInfo;
%}

%{

BOOL ConsiderAll(CEntity*pen) 
{
  return TRUE;
}
BOOL ConsiderPlayers(CEntity*pen) 
{
  if (IsDerivedFromClass(pen, "Player") || IsOfClass(pen, "PlayerBot")) {
    return TRUE;
  } else {
    return FALSE;
  }
  //return IsDerivedFromClass(pen, "Player");
}
//extern INDEX ol_ctSpawnersActive;
//extern INDEX ol_ctSpawnersInQueue;
%}

class CTouchField: CRationalEntity {
name      "Touch Field";
thumbnail "Thumbnails\\TouchField.tbn";
features "HasName", "IsTargetable";

properties:

  1 CTString m_strName            "Name" 'N' = "Touch Field",       // class name
  2 CEntityPointer m_penEnter     "Enter Target" 'T' COLOR(C_BROWN|0xFF), // target to send event to
  3 enum EventEType m_eetEnter    "Enter Event" 'E' = EET_TRIGGER,  // event to send on enter
  7 CEntityPointer m_penExit      "Exit Target" COLOR(C_dRED|0xFF), // target to send event to
  8 enum EventEType m_eetExit     "Exit Event" = EET_TRIGGER,      // event to send on exit
  4 BOOL m_bActive                "Active" 'A' = TRUE,              // is field active
  5 BOOL m_bPlayersOnly           "Players only" 'P' = TRUE,        // reacts only on players
  6 FLOAT m_tmExitCheck           "Exit check time" 'X' = 0.0f,     // how often to check for exit
  9 BOOL m_bBlockNonPlayers       "Block non-players" 'B' = FALSE,  // everything except players cannot pass
  11 CEntityPointer m_penCaused,    // for teleporting player

  100 CEntityPointer m_penLastIn,

  // New
  200 BOOL m_bTeleport1 = FALSE,
  201 BOOL m_bTeleport2 = FALSE,
  202 BOOL m_bSetMods = TRUE,
  203 BOOL m_bCanBeenTriggered = TRUE,
  204 CEntityPointer m_penTweak,
	205 BOOL m_bNoBots = FALSE,

  {
    CFieldSettings m_fsField;
  }

components:

 1 texture TEXTURE_FIELD  "Models\\Editor\\CollisionBox.tex",


functions:

  void SetupFieldSettings(void)
  {
    m_fsField.fs_toTexture.SetData(GetTextureDataForComponent(TEXTURE_FIELD));
    m_fsField.fs_colColor = C_WHITE|CT_OPAQUE;
  }

  CFieldSettings *GetFieldSettings(void) {
    if (m_fsField.fs_toTexture.GetData()==NULL) {
      SetupFieldSettings();      
    }
    return &m_fsField;
  };

  void TeleportEntity(CEntity *pen, const CPlacement3D &pl)
  {
    // teleport 
    pen->Teleport(pl, FALSE);
  }

  void SetMods(void)
  {
    // if single player
		if (GetSP()->sp_bSinglePlayer) {
      // don't even bother.....
      return;
    }

		CTString strLevelName = GetWorld()->wo_fnmFileName.FileName();

    if (strLevelName=="12_Karnak" || strLevelName=="KarnakDemo") {
      FLOAT TouchFieldX = GetPlacement().pl_PositionVector(1);
			if (TouchFieldX==394.0f) {
        m_penEnter = NULL;
			}
		}
    else if (strLevelName == "2_1_Ziggurrat") {
      FLOAT TouchFieldX = GetPlacement().pl_PositionVector(1);
			if (TouchFieldX==-41.0f) {
        m_bTeleport2 = TRUE;
			}
		}
		else if (strLevelName=="3_2_LandOfDamned") {
      FLOAT TouchFieldX = GetPlacement().pl_PositionVector(1);
			if (TouchFieldX==277.5f || TouchFieldX==-236.5f) {
        m_bTeleport1 = TRUE;
			}
		}
		else if (strLevelName=="04_ValleyOfTheKings") {
			// ending touch fields
      FLOAT TouchFieldX = GetPlacement().pl_PositionVector(1);
			if (TouchFieldX==-264.0f || TouchFieldX==-312.0f 
				|| TouchFieldX==-294.0f || TouchFieldX==-278.5f || TouchFieldX==-276.0f) {
				m_bNoBots = TRUE;
			}
		}
  }

  void SendBossLevelEndEvent(void)
  {
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsOfClass(pen, "World link")) {
        // send event
        if (pen!=NULL) {
          SendToTarget(pen, EET_TRIGGER, this);
        }
      }
    }}
  }

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CTouchField) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strName.Length();
    return slUsedMemory;
  }


procedures:

  // field is active
  WaitingEntry() {
    m_bActive = TRUE;
    wait() {
      on (EBegin) : {  resume; }
      on (EDeactivate) : { 
        jump Frozen();
        //CPrintF("TouchField Deactivated\n");
        //pass;
      }
      // when someone passes the polygons
      on (EPass ep) : {

        m_penTweak = ep.penOther;

				if (m_bNoBots) {
					if (IsOfClass(ep.penOther, "PlayerBot")) {
						resume;
					}
				}

				if (m_bTeleport1 && (IsOfClass(ep.penOther, "Player") || IsOfClass(ep.penOther, "PlayerBot"))) {
					TeleportEntity(ep.penOther, CPlacement3D(FLOAT3D(-267, 0, 120), ANGLE3D(90, 0, 0)));
          resume;
				}
				if (m_bTeleport2 && (IsOfClass(ep.penOther, "Player") || IsOfClass(ep.penOther, "PlayerBot"))) {
					TeleportEntity(ep.penOther, CPlacement3D(FLOAT3D(-28, 9, 48), ANGLE3D(270, 0, 0)));
          resume;
				}

        // stop enemy projectiles if blocks non players 
        if (m_bBlockNonPlayers && IsOfClass(ep.penOther, "Projectile")) {
          if (!IsOfClass(((CProjectile *)&*ep.penOther)->m_penLauncher, "Player")) {
            EPass epass;
            epass.penOther = this;
            ep.penOther->SendEvent(epass);
          }
        }    
        
        // if should react only on players and not player or player bot
        if (m_bPlayersOnly && !(IsDerivedFromClass(ep.penOther, "Player") || IsOfClass(ep.penOther, "PlayerBot"))) {
          // ignore
					resume;
        } /*else {
          // ignore
          resume;
        }
        if (m_bPlayersOnly && IsDerivedFromClass(ep.penOther, "Enemy Base")) {
          // ignore
          resume;
        }*/

        // send event
        SendToTarget(m_penEnter, m_eetEnter, ep.penOther);

        // if checking for exit
        if (m_tmExitCheck>0) {
          // remember who entered
          m_penLastIn = ep.penOther;
          // wait for exit
          jump WaitingExit();
        }
        resume;
      }
    }
  };

  // waiting for entity to exit
  WaitingExit() {
    while(TRUE) {
      // wait
      wait(m_tmExitCheck) {
        on (EBegin) : { resume; }
        on (EDeactivate) : { 
          jump Frozen();
          //CPrintF("TouchField Deactivated\n");
          //pass;
        }
        on (ETimer) : {
          // check for entities inside
          CEntity *penNewIn;
          if (m_bPlayersOnly) {
            penNewIn = TouchingEntity(ConsiderPlayers, m_penLastIn);
          } else {
            penNewIn = TouchingEntity(ConsiderAll, m_penLastIn);
          }
          // if there are no entities in anymore
          if (penNewIn==NULL) {
            // send event
            SendToTarget(m_penExit, m_eetExit, m_penLastIn);
            // wait new entry
            jump WaitingEntry();
          }
          m_penLastIn = penNewIn;
          stop;
        }
      }
    }
  };

  // field is frozen
  Frozen() {
    m_bActive = FALSE;
    wait() {
      on (EBegin) : { resume; }
      on (EActivate) : { 
        //CPrintF("TouchField Activated\n");
        jump WaitingEntry(); 
      }
    }
  };

  // main initialization
  Main(EVoid) {
    InitAsFieldBrush();
    SetPhysicsFlags(EPF_BRUSH_FIXED);
    if ( !m_bBlockNonPlayers ) {
      SetCollisionFlags( ((ECBI_MODEL)<<ECB_TEST) | ((ECBI_BRUSH)<<ECB_IS) | ((ECBI_MODEL)<<ECB_PASS) );
    } else {
      SetCollisionFlags( ((ECBI_MODEL|ECBI_PLAYER|ECBI_PROJECTILE_SOLID|ECBI_PROJECTILE_MAGIC)<<ECB_TEST) 
        | ((ECBI_BRUSH)<<ECB_IS) | ((ECBI_PLAYER|ECBI_PROJECTILE_SOLID|ECBI_PROJECTILE_MAGIC)<<ECB_PASS) );
    }

    if (m_bActive) {
      jump WaitingEntry();
    } else {
      jump Frozen();
    }

    return;
  };
};