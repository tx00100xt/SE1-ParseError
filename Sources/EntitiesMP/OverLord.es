20202
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/EnemyBase.h"
#include "EntitiesMP/Player.h"
#include "EntitiesMP/EnemySpawner.h"
#include "EntitiesMP/PESpawnProjectile.h"
#include "EntitiesMP/TouchField.h"
#include "EntitiesMP/Item.h"
#include "EntitiesMP/KeyItem.h"
#include "EntitiesMP/MovingBrush.h"
#include "EntitiesMP/DoorController.h"
#include "EntitiesMP/Switch.h"
#include "EntitiesMP/Bouncer.h"
#include "EntitiesMP/EndShow.h"
#include "EntitiesMP/MusicChanger.h"
#include "EntitiesMP/Trigger.h"
#include "EntitiesMP/PlayerBot.h"
#include "EntitiesMP/Star.h"
#include "EntitiesMP/Box.h"
#include "EntitiesMP/EnvironmentParticlesHolder.h"
#include "EntitiesMP/WorldSettingsController.h"
#include "EntitiesMP/BackgroundViewer.h"
#include "EntitiesMP/WeaponItem.h"
#include "EntitiesMP/PowerUpItem.h"
#include "EntitiesMP/FireworksDisplay.h"
#include "EntitiesMP/TemplateCreatorEG.h"
#include "EntitiesMP/PESpawnerEG.h"
extern INDEX hud_bShowOverlordInfo;
extern INDEX hud_bShowPEInfo;
%}

event EOverLordInit {
  CEntityPointer penOwner,        // who owns it
};


%{
//extern INDEX ol_ctEnemiesAlive = 0;
//extern FLOAT ol_fLag = 0.0f;
static const CPlayer *_penPlayer;
extern CPlayer *_apenPlayers[NET_MAXGAMEPLAYERS];

int qsort_CompareKills( const void *ppPEN0, const void *ppPEN1) {
	CPlayer &en0 = **(CPlayer**)ppPEN0;
	CPlayer &en1 = **(CPlayer**)ppPEN1;
	SLONG sl0 = en0.m_psLevelStats.ps_iKills;
	SLONG sl1 = en1.m_psLevelStats.ps_iKills;
	if (sl0<sl1) { 
		return +1; 
	} else if (sl0>sl1) { 
		return -1; 
	} else { 
		return 0;
	}
}
%}

class export COverLord : CRationalEntity {
name      "OverLord";
thumbnail "";

properties:

  1  BOOL  m_bDorkLevelCk = FALSE,
  2  BOOL  m_bControlRJin = FALSE,
  3  BOOL  m_bUseLeader = FALSE,
  4  BOOL  m_bYFixup = FALSE,
  5  FLOAT m_fCritterY = 0.0f,
  6  FLOAT m_fDistance = 0.0f,
  7  FLOAT m_fMaxY = 0.0f,
  8  INDEX m_iLeaderCounter = 0,
  9  INDEX m_iLevel = 0,
  10 INDEX m_ctEventCount = 0,
  //11 CTString strLevelName = "",
  12 CEntityPointer m_penOwner, 
  13 FLOAT m_fGameDamage = 1.0f,
  14 INDEX m_ctEvent = 0,
  15 FLOAT m_fXMin = 0.0f,
  16 FLOAT m_fXMax = 0.0f,
  17 FLOAT m_fYMin = 0.0f,
  18 FLOAT m_fYMax = 0.0f,
  19 FLOAT m_fZMin = 0.0f,
  20 FLOAT m_fZMax = 0.0f,
  21 BOOL  m_bSendEvents = TRUE,
  22 INDEX m_iEventCount = 0,
  23 BOOL  m_bControlRunning = FALSE,
  24 BOOL  m_bUseY = FALSE,
  25 BOOL  m_bDestroyChit = FALSE,
  26 INDEX m_ctChitCount = 0,
  27 BOOL  m_bFixBouncer = FALSE,
  28 INDEX m_iDestroyChit = 0,
  29 CEntityPointer m_penEndShow,
  30 BOOL  m_bCreateEndShow = FALSE,
  31 FLOAT m_fEndShowStartTime = 0.0f,
  32 BOOL  m_bSendCitadelEvents = FALSE,
  33 BOOL  m_bCreatePlayerBot = FALSE,
  34 INDEX m_iBotCounter = 0,
  35 INDEX m_iBotsPerPlayer = 0,
  36 INDEX m_iMaxPlayers = 0,
  37 INDEX m_iStarCount = 0,
  38 BOOL  m_bCkCritterY = FALSE,
  39 INDEX m_iPlayersLast = 0,
  40 BOOL  m_bSendBotEvent = TRUE,
  41 BOOL  m_bCreateBouncerBox = FALSE,
  42 BOOL  m_bAdjustSpawnerOCs = TRUE,
	43 FLOAT m_ctEnemiesAlive = 0,
	44 FLOAT m_fLag = 0.0f,
	45 BOOL  m_bStartSnow = FALSE,
	46 BOOL  m_bCreateWeapons = FALSE,
	47 INDEX m_iCritterCkCount = 0,
	48 BOOL  m_bStartFireworksDisplay = FALSE,

components:

  1 class   CLASS_ENDSHOW         "Classes\\EndShow.ecl",
  2 class   CLASS_MUSIC_CHANGER   "Classes\\MusicChanger.ecl",
  3 class   CLASS_PLAYERBOT       "Classes\\PlayerBot.ecl",
  4 class   CLASS_STAR            "Classes\\Star.ecl",
  5 class   CLASS_KEYITEM         "Classes\\KeyItem.ecl",
  6 class   CLASS_BOX             "Classes\\Box.ecl",
	7 class   CLASS_EPH             "Classes\\EnvironmentParticlesHolder.ecl",
	8 class   CLASS_WSC             "Classes\\WorldSettingsController.ecl",
	9 class   CLASS_WEAPON_ITEM     "Classes\\WeaponItem.ecl",
	10 class  CLASS_POWERUP_ITEM    "Classes\\PowerUpItem.ecl",
	11 class  CLASS_FW_DISPLAY      "Classes\\FireworksDisplay.ecl",
	12 class  CLASS_TEMP_CREATOR    "Classes\\TemplateCreatorEG.ecl",
	13 class  CLASS_PE_SPAWNER		  "Classes\\PESpawnerEG.ecl",

functions:

  class CMusicHolder *GetOwner(void)
  {
    ASSERT(m_penOwner!=NULL);
    return (CMusicHolder*) m_penOwner.ep_pen;
  }

  void CheckCritters(void)
  {
    FLOAT fLag = 0.0f;
    INDEX ctEnemiesAlive = 0;
    FLOAT fAge = 1.0f;
    FLOAT fPurge = 95.0f-(_pNetwork->ga_sesSessionState.GetPlayersCount()*5.0f);
		if (fPurge<=30) { fPurge = 30.0f; }
    fPurge /= m_fGameDamage;
    //fPurge = 1.0f;

    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
				// if it has been spawned continue checking
				if (penEnemy->m_bHasBeenSpawned) {
					fAge = _pTimer->CurrentTick()-penEnemy->m_tmSpawned;
          if (m_bCkCritterY) {
  				  FLOAT fY = penEnemy->GetPlacement().pl_PositionVector(2);
					  if (fAge>0.1f && fY<m_fCritterY) {
						  penEnemy->SendEvent(EDeath());
					  }
					} else {
						// if it's been alive for too long
						if (penEnemy->GetFlags()&ENF_ALIVE) {
							if (fAge>fPurge) {
								// kill it and and send an event to purge the spawner
								if (penEnemy->m_penSpawnerTarget2!=NULL) {
									if (hud_bShowPEInfo) { CPrintF("Purge Event Sent....\n"); }
									SendToTarget(penEnemy->m_penSpawnerTarget2, EET_STOP, this);
								} 
								penEnemy->SendEvent(EDeath());
							/*} else if (fAge>20.0f && penEnemy->m_penEnemy==NULL) {
								// kill it and and send an event to purge the spawner
								if (penEnemy->m_penSpawnerTarget!=NULL) {
									if (hud_bShowPEInfo) { CPrintF("Purge Event Sent....\n"); }
									SendToTarget(penEnemy->m_penSpawnerTarget, EET_STOP, this);
								} 
								penEnemy->SendEvent(EDeath());*/
							} else {
								ctEnemiesAlive++;
								fLag += penEnemy->m_fLagger;
							}
						}
					}
        } /*else if (!penEnemy->m_bTemplate) {
					if (IsOfClass(pen, "Eyeman")) {
						CPrintF("%.0f, %.0f, %.0f\n", penEnemy->GetPlacement().pl_PositionVector(1), 
							penEnemy->GetPlacement().pl_PositionVector(2), penEnemy->GetPlacement().pl_PositionVector(3));
					}
				}*/
      }
    }}
    m_ctEnemiesAlive = ctEnemiesAlive;
    m_fLag = fLag;
	}

	void CreateFireworksDisplay(void)
	{
    CEntity *pen = NULL;
		CPlacement3D pl;
		pl = CPlacement3D(FLOAT3D(0,0,0), ANGLE3D(0, 0, 0));
    pen = CreateEntity(pl, CLASS_FW_DISPLAY);
    pen->Initialize();
	}

  void SendFWDisplayEvent(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
				penEnemy->SendEvent(EDeath());
			}
			if (IsOfClass(pen, "Enemy Spawner")) {
				pen->SendEvent(EStop());
			}
      if (IsOfClass(pen, "Fireworks Display")) {
        pen->SendEvent(ETrigger());
      }
    }}
  }

  void SendFWDisplayEndEvent(void)
  {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Touch Field")) {
				CTouchField *penTouchField = (CTouchField *)pen;
				if (penTouchField->m_strName=="DC_LastDoor") {
					penTouchField->SendEvent(EActivate());
				}
			}
    }}
  }

	void CreateSnow(void)
	{
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
			// get the background viewer
      if (IsOfClass(pen, "Background Viewer")) {
				CBackgroundViewer *penBV = (CBackgroundViewer *)pen;
				// create an environment particles holder
				CEntity *penEPH = NULL;
				CPlacement3D plEPH;
				plEPH = CPlacement3D(FLOAT3D(0, 0, 0), ANGLE3D(0, 0, 0));
				penEPH = CreateEntity(plEPH, CLASS_EPH);
				((CEnvironmentParticlesHolder&)*penEPH).m_boxHeightMap = FLOATaabbox3D(FLOAT3D(1345,0,1700), FLOAT3D(2600,50,2450));
				((CEnvironmentParticlesHolder&)*penEPH).m_eptType = EPTH_SNOW;
				//((CEnvironmentParticlesHolder&)*penEPH).
				// create a world settings controller
				CEntity *penWSC = NULL;
				CPlacement3D plWSC;
				plWSC = CPlacement3D(FLOAT3D(0, 0, 0), ANGLE3D(0, 0, 0));
				penWSC = CreateEntity(plWSC, CLASS_WSC);
				// set the WSC's EPH to our new EPH entity
				((CWorldSettingsController&)*penWSC).m_penEnvPartHolder = penEPH;
				// set the background viewer's WSC to our new WSC entity
				((CBackgroundViewer&)*penBV).m_penWorldSettingsController = penWSC;
				// initialize the new entities
				((CWorldSettingsController&)*penWSC).Initialize();
				((CEnvironmentParticlesHolder&)*penEPH).Initialize();
			}
		}}
	}

	void StartSnow(void)
	{
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      if (IsOfClass(pen, "EnvironmentParticlesHolder")) {
				pen->SendEvent(EStart());
			}
		}}
	}

	void CreateWeapons(void)
	{
    CEntity *pen = NULL;
		CPlacement3D pl;
		//	Hatshepsut
		if (m_iLevel == 13) {
      //CPrintF("Hatshepsut Sniper Created\n");
			pl = CPlacement3D(FLOAT3D(214, 0, 642), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_WEAPON_ITEM);
      CWeaponItem *penSniper = ((CWeaponItem*)pen);
      penSniper->m_EwitType = WIT_SNIPER;
      penSniper->Reinitialize();
		//  Sand Canyon
		} else if (m_iLevel == 14) {
      //CPrintF("Sand Canyon Chainsaw Created\n");
			pl = CPlacement3D(FLOAT3D(125, -16, -140), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_WEAPON_ITEM);
      CWeaponItem *penChainsaw = ((CWeaponItem*)pen);
      penChainsaw->m_EwitType = WIT_CHAINSAW;
      penChainsaw->Reinitialize();
		//  Valley Of The Kings
		} else if (m_iLevel == 16) {
      //CPrintF("Valley of the Kings Flamer Created\n");
			pl = CPlacement3D(FLOAT3D(68, -112.5f, -627), ANGLE3D(0, 0, 0));
      pen = CreateEntity(pl, CLASS_WEAPON_ITEM);
      CWeaponItem *penFlamer = ((CWeaponItem*)pen);
      penFlamer->m_EwitType = WIT_FLAMER;
      penFlamer->Reinitialize();
		}
	}


  void TeleportPowerup(CEntity *pen, FLOAT3D vPosVector, BOOL bFloating, BOOL bRespawn, FLOAT fRespawn)
  {
    // if the target doesn't exist, or is destroyed, do nothing
    if (pen==NULL) { return; }

    CEntity *penNew = GetWorld()->CopyEntityInWorld( *pen,
      CPlacement3D(FLOAT3D(-32000.0f+FRnd()*200.0f, -32000.0f+FRnd()*200.0f, 0), ANGLE3D(0, 0, 0)) );

		if (bFloating) {
			CPowerUpItem *pei = ((CPowerUpItem*)penNew);
			pei->m_bFloating = TRUE;
		}
		if (bRespawn) {
			CPowerUpItem *pei = ((CPowerUpItem*)penNew);
			pei->m_bFloating = TRUE;
			pei->m_bRespawn = TRUE;
			pei->m_fRespawnTime = fRespawn;
		}

    // teleport back
    CPlacement3D plWhere = CPlacement3D(vPosVector, ANGLE3D(0, 0, 0));
    plWhere.pl_PositionVector += GetRotationMatrix().GetColumn(2)*0.05f;
    penNew->Teleport(plWhere, FALSE);
  }

	void CreateFEPowerups(void)
	{
    CEntity *pen = NULL;
		CPowerUpItem *penInvuln;
		CPowerUpItem *penDamage;
		CPowerUpItem *penBomb;
		CPowerUpItem *penSpeed;
		CPlacement3D plInit = CPlacement3D(FLOAT3D(0, -32000.0f, 0), ANGLE3D(0, 0, 0));

		// serious damage
    pen = CreateEntity(plInit, CLASS_POWERUP_ITEM); // create the class
    penDamage = ((CPowerUpItem*)pen); // create a pointer so we can set it's initial vars
    penDamage->m_puitType = PUIT_DAMAGE; // set it's type
    penDamage->Initialize(); // initialize it		
		// invulnerability
    pen = CreateEntity(plInit, CLASS_POWERUP_ITEM);
    penInvuln = ((CPowerUpItem*)pen);
    penInvuln->m_puitType = PUIT_INVULNER;
    penInvuln->Initialize();
		// serious bomb
    pen = CreateEntity(plInit, CLASS_POWERUP_ITEM);
    penBomb = ((CPowerUpItem*)pen);
    penBomb->m_puitType = PUIT_BOMB;
    penBomb->Initialize();
		// serious speed
    pen = CreateEntity(plInit, CLASS_POWERUP_ITEM);
    penSpeed = ((CPowerUpItem*)pen);
    penSpeed->m_puitType = PUIT_SPEED;
    penSpeed->Initialize();

		CPlacement3D pl;
		//if (strLevelName =="01_Hatshepsut") {
		if (m_iLevel == 13) {
      TeleportPowerup(penBomb, FLOAT3D( -20, 4, -456), FALSE, FALSE, 0.0f); // secret hole, geez... better place for the bomb
      TeleportPowerup(penDamage, FLOAT3D( 24.5f, -5,-172), FALSE, FALSE, 0.0f); // croteam secret
      TeleportPowerup(penInvuln, FLOAT3D( -32, -9, -184), FALSE, FALSE, 0.0f); // fan secret, better place than the hole for this kind of PU
			TeleportPowerup(penSpeed, FLOAT3D( 6, 4, 2), FALSE, FALSE, 0.0f); // were in my first sam mod ever, it seemed fitting...
			//TeleportPowerup(penSpeed, FLOAT3D( 208, 13, 636), FALSE, FALSE, 0.0f); // well maybe just one since i changed how long it lasts...
    //} else if (strLevelName=="02_SandCanyon") {
		} else if (m_iLevel == 14) {
      TeleportPowerup(penBomb, FLOAT3D( -57, 4, 94), FALSE, FALSE, 0.0f); 	// this was a waste....damage changed to bomb :p
		//} else if (strLevelName=="03_TombOfRamses") {
		} else if (m_iLevel == 15) {
      TeleportPowerup(penInvuln, FLOAT3D( 39, 25.5, -125), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penDamage, FLOAT3D( 18, 16, -37), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penDamage, FLOAT3D( 146.75f, 65, -327.75f), FALSE, FALSE, 0.0f); 
		//} else if (strLevelName=="04_ValleyOfTheKings") {
		} else if (m_iLevel == 16) {
      TeleportPowerup(penSpeed, FLOAT3D( -40, -89, 248), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penDamage, FLOAT3D( 67, -112, -546), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D( -300, -103, -606), FALSE, FALSE, 0.0f); 
    //} else if (strLevelName=="05_MoonMountains") {
		} else if (m_iLevel == 17) {
      TeleportPowerup(penDamage, FLOAT3D( 48, -44, 108), FALSE, FALSE, 0.0f); 		//THE FUN TRAIN HAS ARRIVED!
      TeleportPowerup(penDamage, FLOAT3D( -36, -41, 51), FALSE, FALSE, 0.0f); 		//
      TeleportPowerup(penDamage, FLOAT3D( 42, -33, 0), FALSE, FALSE, 0.0f); 		//
      TeleportPowerup(penDamage, FLOAT3D( 99, -33, -84), FALSE, FALSE, 0.0f); 		//
      TeleportPowerup(penDamage, FLOAT3D( 3, -33, -103), FALSE, FALSE, 0.0f); 		//
      TeleportPowerup(penDamage, FLOAT3D( -85, -30, -43), FALSE, FALSE, 0.0f); 		//
      TeleportPowerup(penBomb, FLOAT3D( 50.75f, -38.5f, -224.75f), FALSE, FALSE, 0.0f); 	//I actualy have no idea where this is...totaly forgot, Might be secret wall before caves.
      TeleportPowerup(penBomb, FLOAT3D( 8, -133, -280), FALSE, FALSE, 0.0f); 		//last area
    //} else if (strLevelName=="06_Oasis") {
		//} else if (m_iLevel == 18) {
    //} else if (strLevelName=="07_Dunes") {
		} else if (m_iLevel == 19) {
      TeleportPowerup(penDamage, FLOAT3D( 62, 11, 200), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D( 0, 0, -84), FALSE, FALSE, 0.0f); 		// omg you have no idea how much i've always wanted this powerup here!
    //} else if (strLevelName=="08_Suburbs") {
		} else if (m_iLevel == 20) {
      TeleportPowerup(penBomb, FLOAT3D( 73, 0, 826.75), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D( -84.5f, 0, 627), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penInvuln, FLOAT3D( 0, 174, 160), FALSE, FALSE, 0.0f); 
    //} else if (strLevelName=="09_Sewers") {
			} else if (m_iLevel == 21) {
      TeleportPowerup(penBomb, FLOAT3D( 42, 19, -288), FALSE, FALSE, 0.0f); 	//--special singleplayer goodie (spawns behind exit door)
      TeleportPowerup(penBomb, FLOAT3D( 0, -5, -108), FALSE, FALSE, 0.0f); 
    //} else if (strLevelName=="10_Metropolis") {
		} else if (m_iLevel == 22) {
      TeleportPowerup(penDamage, FLOAT3D( 72, 15, 32), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D( 312.5f, 1, 24), FALSE, FALSE, 0.0f); 	// because I hate teh scarab yard
			TeleportPowerup(penBomb, FLOAT3D( 312.5f, 1, 27), FALSE, FALSE, 0.0f);
      TeleportPowerup(penSpeed, FLOAT3D( 931, 2, -7), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penDamage, FLOAT3D( 931, 2, -57), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D( 1312, 174, -32), FALSE, FALSE, 0.0f); 	// a fun treat for erry bodeh (runner control sucks! :P)
    //} else if (strLevelName=="11_AlleyOfSphinxes") {
		} else if (m_iLevel == 23) {
      TeleportPowerup(penBomb, FLOAT3D( 4800, 36, 1984), FALSE, FALSE, 0.0f); 	// secret pillar template croteam forgot to take out
      TeleportPowerup(penDamage, FLOAT3D( 1120, 35, 2112), FALSE, FALSE, 0.0f); 	// these numbers are correct --- level is massive
      TeleportPowerup(penSpeed, FLOAT3D( 1120, 35, 1984), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D( 830, 3, 2048), FALSE, FALSE, 0.0f); 
			TeleportPowerup(penSpeed, FLOAT3D( 2372, 5, 2048), FALSE, FALSE, 10.0f);
		//} else if (strLevelName =="12_Karnak") {
		} else if (m_iLevel == 24) {
      TeleportPowerup(penDamage, FLOAT3D(570, 21, 2048), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penInvuln, FLOAT3D(319, 5, 2640), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D(176, 4, 2048), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D(-204, 3, 2048), FALSE, FALSE, 0.0f); 
	    TeleportPowerup(penDamage, FLOAT3D(317, -73.5f, 2371.5f), FALSE, TRUE, 0.1f);
      TeleportPowerup(penDamage, FLOAT3D(323, -73.5f, 2371.5f), FALSE, TRUE, 0.1f); 
	    TeleportPowerup(penDamage, FLOAT3D(320, -73.5f, 2368.5f), FALSE, TRUE, 0.1f);
      TeleportPowerup(penDamage, FLOAT3D(320, -73.5f, 2374.5f), FALSE, TRUE, 0.1f);
    //} else if (strLevelName=="13_Luxor") {
		} else if (m_iLevel == 25) {
      TeleportPowerup(penDamage, FLOAT3D( 440, 0, 0), FALSE, FALSE, 0.0f); //I hate this map.
      TeleportPowerup(penInvuln, FLOAT3D( 88, 20, 0), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D( -300, 122, 0), TRUE, FALSE, 0.0f); //Floats over oblisk, just to be a meanie! :-)
			TeleportPowerup(penInvuln, FLOAT3D( 88, 20, 0), FALSE, FALSE, 0.0f); 
   //} else if (strLevelName=="15_TheGreatPyramid") {
		} else if (m_iLevel == 26) {
      TeleportPowerup(penDamage, FLOAT3D( 0, 18, 26), FALSE, FALSE, 0.0f); 	//Happy-Go-Lucky Inc.
      TeleportPowerup(penDamage, FLOAT3D( 0, 0, -312), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penBomb, FLOAT3D( 0, 0, -800), FALSE, FALSE, 0.0f); 
      TeleportPowerup(penInvuln, FLOAT3D( -144, 255, -1408), FALSE, TRUE, 10.0f);	//End Scene Ring Powerups
      TeleportPowerup(penSpeed, FLOAT3D( 144, 255, -1408), FALSE, TRUE, 10.0f);		//
      TeleportPowerup(penDamage, FLOAT3D( 0, 255, -1552), FALSE, TRUE, 10.0f);		//
      TeleportPowerup(penBomb, FLOAT3D( 0, 255, -1264), FALSE, TRUE, 10.0f);			//
		}
	}

	void FixHatshepsutRain(void)
	{
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
			// get the World Settings Controller
      if (IsOfClass(pen, "WorldSettingsController")) {
				CWorldSettingsController *penWSC = (CWorldSettingsController *)pen;
				// create an environment particles holder
				CEntity *penEPH = NULL;
				CPlacement3D plEPH;
				plEPH = CPlacement3D(FLOAT3D(0, 0, 0), ANGLE3D(0, 0, 0));
				penEPH = CreateEntity(plEPH, CLASS_EPH);
				((CEnvironmentParticlesHolder&)*penEPH).m_fnHeightMap = CTFILENAME("Textures\\Levels\\Hatshepsut\\RainMap.tex");
				((CEnvironmentParticlesHolder&)*penEPH).m_boxHeightMap = FLOATaabbox3D(FLOAT3D(-80,18,-480), FLOAT3D(80,64,-127));
				((CEnvironmentParticlesHolder&)*penEPH).m_eptType = EPTH_RAIN;
				// set the WSC's EPH to our new EPH entity
				((CWorldSettingsController&)*penWSC).m_penEnvPartHolder = penEPH;
				// initialize the new entities
				((CEnvironmentParticlesHolder&)*penEPH).Initialize();
			}
		}}
	}

  void DestroyChit(void)
  {
    //CPrintF("Chit Destroyed?\n");
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      if (m_iDestroyChit==1 && IsDerivedFromClass(pen, "Item")) {
        FLOAT fX = pen->GetPlacement().pl_PositionVector(1);
			  FLOAT fZ = pen->GetPlacement().pl_PositionVector(3);
        if (fZ<1070 && fX>800) {
          //CPrintF("Critter Item Destroyed\n");
          pen->Destroy();
        } 
      }
      if (m_iDestroyChit==2 && IsDerivedFromClass(pen, "Light")) {
			  FLOAT fZ = pen->GetPlacement().pl_PositionVector(3);
        if (fZ>2000) {
          //CPrintF("Critter Light Destroyed\n");
          pen->Destroy();
        } 
      }
    }}
  }

  void FixBouncer(void)
  {
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
      CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "Bouncer")) {
        CBouncer *penB = (CBouncer *)pen;
        if (penB->m_strName=="platzhalter") {
          //CPrintF("Bouncer Adjusted\n");
          penB->m_fSpeed = 230.0f;
          penB->m_fMaxExitSpeed = 230.0f;
        } 
        if (penB->m_strName=="platzhalter2") {
          //CPrintF("Bouncer Adjusted\n");
          penB->m_fSpeed = 200.0f;
          penB->m_fMaxExitSpeed = 200.0f;
        } 
      }
    }}
  }

  void CreateBouncerBox(void)
  {
    CEntity *penBox = NULL;
    CPlacement3D plBox;
    plBox = CPlacement3D(FLOAT3D(-2, -6, 628), ANGLE3D(0, 0, 0));
    penBox = CreateEntity(plBox, CLASS_BOX);
    //((CBox&)*penBox).m_fSize = 3.0f;
    ((CBox&)*penBox).Initialize();
  }

  void DestroyBouncerBox(void)
  {
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsOfClass(pen, "Box")) {
        pen->SendEvent(EDeactivate());
      }
    }}
  }

  void SendCitadelEvents(void)
  {
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "Trigger")) {
        CTrigger *penTrigger = (CTrigger *)pen;
			  CPlacement3D plTrigger;
			  plTrigger.pl_PositionVector = penTrigger->GetPlacement().pl_PositionVector;
			  FLOAT X = plTrigger.pl_PositionVector(1);
			  FLOAT Z = plTrigger.pl_PositionVector(3); 
        if (penTrigger->m_strName=="Trigger" && X>66 && X<160 && Z>-160 && Z<-66) {
          penTrigger->SendEvent(ETrigger());
        }
      } 
    }}
    if (hud_bShowOverlordInfo) {
      CPrintF("Citadel Events Sent\n");
    }    
  }

  void CreateEndShow(void)
  {
		CPlacement3D pl;
    CEntity *pen = NULL;
    pl = CPlacement3D(FLOAT3D(-1000.0f, 0.1f, -265.0f), ANGLE3D(270, 0, 0));
    pen = CreateEntity(pl, CLASS_ENDSHOW);
    ((CEndShow&)*pen).Initialize();
  }

  void FreezeCritters(void) {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
				// if it is not a template
				if (!penEnemy->m_bTemplate) {
          FLOAT fX = penEnemy->GetPlacement().pl_PositionVector(1);
          FLOAT fZ = penEnemy->GetPlacement().pl_PositionVector(3);
          if (fX>256 && fX<386 && fZ>1960 && fZ<2120) {
            penEnemy->m_bFrozen = TRUE;
          }
        }
      }
    }}
  }

  void UnfreezeCritters(void) {
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
			if (IsDerivedFromClass(pen, "Enemy Base")) {
				CEnemyBase *penEnemy = (CEnemyBase *)pen;
				// if it is frozen
				if (penEnemy->m_bFrozen) {
					// unfreeze
          penEnemy->m_bFrozen = FALSE;
        }
      }
    }}
  }

  /*void AdjustSpawnerOCs(void)
  {
    INDEX ctSpawners = 0;
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if ( IsOfClass(pen, "Enemy Spawner" )) {
				CEnemySpawner *penSpawner = (CEnemySpawner *)pen;
        if (!penSpawner->m_bTriggered && penSpawner->m_bAdjustOC) {
          ctSpawners++;
          CPrintF("AdjustOC: %s\n", penSpawner->GetDescription());
          penSpawner->AdjustOuterCircle(30.0f, 12, 60.0f);
          break;
        } else if (penSpawner->m_bTriggered && penSpawner->m_bAdjustOC) {
          penSpawner->m_bAdjustOC = FALSE;
        }
      } 
    }}
    if (ctSpawners<1) {
      m_bAdjustSpawnerOCs = FALSE;
    }
  }*/

  void CheckPlayersForBots(void) 
  {
		// determine maximum number of players for this session
		INDEX iPlayers = 0;
    INDEX iBots = m_iBotsPerPlayer;
		CPlayer *penPlayerCt;
		// loop thru potentional players 
		for( INDEX i=0; i<m_iMaxPlayers; i++) { 
			penPlayerCt = (CPlayer*)&*_penPlayer->GetPlayerEntity(i);
			// ignore non-existent players
			if (penPlayerCt==NULL) { continue; }
      iPlayers++;
    }
    if (m_iPlayersLast!=iPlayers) {
      m_iPlayersLast = iPlayers;
      if (iPlayers>2 && iPlayers<=4) {
        iBots -= 1;
      } else if (iPlayers>4) {
        iBots -= 2;
      }
      //CPrintF("iPlayers: %d, iBots: %d\n", iPlayers, iBots);

      CPlacement3D plBot;
      CEntity *penBot = NULL;
      // for each entity in the world
      {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			  CEntity *pen = iten;
        if (IsDerivedFromClass(pen, "Player")) {
          CPlayer *penPlayer = (CPlayer *)pen;
          // ignore non-existent players
			    if (penPlayer==NULL) { continue; }
          if (penPlayer->m_penBot1==NULL) {
            //CPrintF("penBot1 Created\n");
            plBot = penPlayer->GetPlacement();
            plBot.pl_PositionVector(2) += 3.0f;
            plBot.pl_OrientationAngle(1) = 0.0f;
            penBot = CreateEntity(plBot, CLASS_PLAYERBOT);
            penPlayer->m_penBot1 = penBot;
            ((CPlayerBot&)*penBot).m_btType = BT_SNIPER;
            //((CPlayerBot&)*penBot).m_strViewName = "Bot1";
            ((CPlayerBot&)*penBot).m_penOwner = penPlayer;
            ((CPlayerBot&)*penBot).m_tmSeriousSpeed = penPlayer->m_tmSeriousSpeed;
            ((CPlayerBot&)*penBot).m_tmSeriousDamage = penPlayer->m_tmSeriousDamage;
            ((CPlayerBot&)*penBot).Initialize();
          }
          if (penPlayer->m_penBot2==NULL && iBots>=2) {
            //CPrintF("penBot2 Created\n");
            plBot = penPlayer->GetPlacement();
            plBot.pl_PositionVector(2) += 3.0f;
            plBot.pl_OrientationAngle(1) = 0.0f;
            penBot = CreateEntity(plBot, CLASS_PLAYERBOT);
            penPlayer->m_penBot2 = penBot;
            ((CPlayerBot&)*penBot).m_btType = BT_BOMBER;
            //((CPlayerBot&)*penBot).m_strViewName = "Bot2";
            ((CPlayerBot&)*penBot).m_penOwner = penPlayer;
            ((CPlayerBot&)*penBot).m_tmSeriousSpeed = penPlayer->m_tmSeriousSpeed;
            ((CPlayerBot&)*penBot).m_tmSeriousDamage = penPlayer->m_tmSeriousDamage;
            ((CPlayerBot&)*penBot).Initialize();
          }
          if (penPlayer->m_penBot3==NULL && iBots>=3) {
            //CPrintF("penBot3 Created\n");
            plBot = penPlayer->GetPlacement();
            plBot.pl_PositionVector(2) += 3.0f;
            plBot.pl_OrientationAngle(1) = 0.0f;
            penBot = CreateEntity(plBot, CLASS_PLAYERBOT);
            penPlayer->m_penBot3 = penBot;
            ((CPlayerBot&)*penBot).m_btType = BT_ROCKETER;
            //((CPlayerBot&)*penBot).m_strViewName = "Bot3";
            ((CPlayerBot&)*penBot).m_penOwner = penPlayer;
            ((CPlayerBot&)*penBot).m_tmSeriousSpeed = penPlayer->m_tmSeriousSpeed;
            ((CPlayerBot&)*penBot).m_tmSeriousDamage = penPlayer->m_tmSeriousDamage;
            ((CPlayerBot&)*penBot).Initialize();
          }
          if (penPlayer->m_penBot4==NULL && iBots>=4) {
            //CPrintF("penBot1 Created\n");
            plBot = penPlayer->GetPlacement();
            plBot.pl_PositionVector(2) += 3.0f;
            plBot.pl_OrientationAngle(1) = 0.0f;
            penBot = CreateEntity(plBot, CLASS_PLAYERBOT);
            penPlayer->m_penBot4 = penBot;
            ((CPlayerBot&)*penBot).m_btType = BT_SNIPER;
            //((CPlayerBot&)*penBot).m_strViewName = "Bot4";
            ((CPlayerBot&)*penBot).m_penOwner = penPlayer;
            ((CPlayerBot&)*penBot).m_tmSeriousSpeed = penPlayer->m_tmSeriousSpeed;
            ((CPlayerBot&)*penBot).m_tmSeriousDamage = penPlayer->m_tmSeriousDamage;
            ((CPlayerBot&)*penBot).Initialize();
          }
          if (penPlayer->m_penBot5==NULL && iBots>=5) {
            //CPrintF("penBot2 Created\n");
            plBot = penPlayer->GetPlacement();
            plBot.pl_PositionVector(2) += 3.0f;
            plBot.pl_OrientationAngle(1) = 0.0f;
            penBot = CreateEntity(plBot, CLASS_PLAYERBOT);
            penPlayer->m_penBot5 = penBot;
            ((CPlayerBot&)*penBot).m_btType = BT_BOMBER;
            //((CPlayerBot&)*penBot).m_strViewName = "Bot5";
            ((CPlayerBot&)*penBot).m_penOwner = penPlayer;
            ((CPlayerBot&)*penBot).m_tmSeriousSpeed = penPlayer->m_tmSeriousSpeed;
            ((CPlayerBot&)*penBot).m_tmSeriousDamage = penPlayer->m_tmSeriousDamage;
            ((CPlayerBot&)*penBot).Initialize();
          }
          if (penPlayer->m_penBot6==NULL && iBots>=6) {
            //CPrintF("penBot3 Created\n");
            plBot = penPlayer->GetPlacement();
            plBot.pl_PositionVector(2) += 3.0f;
            plBot.pl_OrientationAngle(1) = 0.0f;
            penBot = CreateEntity(plBot, CLASS_PLAYERBOT);
            penPlayer->m_penBot6 = penBot;
            ((CPlayerBot&)*penBot).m_btType = BT_ROCKETER;
            //((CPlayerBot&)*penBot).m_strViewName = "Bot6";
            ((CPlayerBot&)*penBot).m_penOwner = penPlayer;
            ((CPlayerBot&)*penBot).m_tmSeriousSpeed = penPlayer->m_tmSeriousSpeed;
            ((CPlayerBot&)*penBot).m_tmSeriousDamage = penPlayer->m_tmSeriousDamage;
            ((CPlayerBot&)*penBot).Initialize();
          }
          if (penPlayer->m_penBot2!=NULL && iBots<2) {
            penPlayer->m_penBot2->SendEvent(EDeath());
            penPlayer->m_penBot2 = NULL;
          }
          if (penPlayer->m_penBot3!=NULL && iBots<3) {
            penPlayer->m_penBot3->SendEvent(EDeath());
            penPlayer->m_penBot3 = NULL;
          }
          if (penPlayer->m_penBot4!=NULL && iBots<4) {
            penPlayer->m_penBot4->SendEvent(EDeath());
            penPlayer->m_penBot4 = NULL;
          }
          if (penPlayer->m_penBot5!=NULL && iBots<5) {
            penPlayer->m_penBot5->SendEvent(EDeath());
            penPlayer->m_penBot5 = NULL;
          }
        }
      }}
    }
  }

  // find the leader
  void PlaceStars(void) {
    //CPrintF("PlaceStars()\n");
		// determine maximum number of players for this session
		INDEX iPlayers = 0;
		CPlayer *penCurrent;
		// loop thru potentional players 
		for( INDEX i=0; i<16; i++) { 
			penCurrent = (CPlayer*)&*_penPlayer->GetPlayerEntity(i);
			// ignore non-existent players
			if (penCurrent==NULL) { continue; }
			_apenPlayers[iPlayers] = penCurrent;
			iPlayers++;
		}

    // sort them by kills
		qsort( _apenPlayers, iPlayers, sizeof(CPlayer*), qsort_CompareKills);

		// loop thru actual players and create stars
    CPlayer *penPlayer;
    CPlacement3D pl;
    CEntity *pen = NULL;
		for( INDEX j=0; j<iPlayers; j++) { 
			penPlayer = _apenPlayers[j];
      // ignore non-existent players
			if (penPlayer==NULL) { continue; }
      // if it's the leader give em a gold star
      if (j==0) {
        if (penPlayer->m_penStar!=NULL) {
          //CPrintF("Player Star EEnd()\n");
          penPlayer->m_penStar->SendEvent(EEnd());
          penPlayer->m_penStar = NULL;
        }
        if (penPlayer->m_penStar==NULL) {
          //CPrintF("Player Star Created\n");
          pl = penPlayer->GetPlacement();
          pl.pl_PositionVector += FLOAT3D(0, 2.3f, 0);
          pen = CreateEntity(pl, CLASS_STAR);
          CStar *star = ((CStar*)pen);
          penPlayer->m_penStar = star;
          star->m_stType = ST_GOLD;
          star->fSize = 0.8f;
          star->SetParent(penPlayer);
          star->Initialize();
        }
      // if it's second place give em a silver star
      } else if (j==1) {
        if (penPlayer->m_penStar!=NULL) {
          penPlayer->m_penStar->SendEvent(EEnd());
          penPlayer->m_penStar = NULL;
        }
        if (penPlayer->m_penStar==NULL) {
          pl = penPlayer->GetPlacement();
          pl.pl_PositionVector += FLOAT3D(0, 2.3f, 0);
          pen = CreateEntity(pl, CLASS_STAR);
          CStar *star = ((CStar*)pen);
          penPlayer->m_penStar = star;
          star->m_stType = ST_CHROME;
          star->fSize = 0.8f;
          star->SetParent(penPlayer);
          star->Initialize();
        }
      // if it's third give em a bronze star
      } else if (j==2) {
        if (penPlayer->m_penStar!=NULL) {
          penPlayer->m_penStar->SendEvent(EEnd());
          penPlayer->m_penStar = NULL;
        }
        if (penPlayer->m_penStar==NULL) {
          pl = penPlayer->GetPlacement();
          pl.pl_PositionVector += FLOAT3D(0, 2.3f, 0);
          pen = CreateEntity(pl, CLASS_STAR);
          CStar *star = ((CStar*)pen);
          penPlayer->m_penStar = star;
          star->m_stType = ST_COPPER;
          star->fSize = 0.8f;
          star->SetParent(penPlayer);
          star->Initialize();
        }
      } else if (j>2) {
        if (penPlayer->m_penStar!=NULL) {
          penPlayer->m_penStar->SendEvent(EEnd());
          penPlayer->m_penStar = NULL;
        }
      }
    }
    //CPrintF("\n");
  }

  void SendAreaEvent(CEntity *penSender, EventEType eetEventType, FLOAT3D vOrigin, FLOAT3D vOffset, INDEX iEntityType)
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

  void SendEvents(void)
  {
    // for each entity in the world
    {FOREACHINDYNAMICCONTAINER(GetWorld()->wo_cenEntities, CEntity, iten) {
			CEntity *pen = iten;
      if (IsDerivedFromClass(pen, "Touch Field")
        || IsDerivedFromClass(pen, "DoorController")
        || IsDerivedFromClass(pen, "Item")
        //|| IsOfClass(pen, "Enemy Spawner")
        || IsDerivedFromClass(pen, "Switch")) {
			  CPlacement3D pl;
			  pl.pl_PositionVector = pen->GetPlacement().pl_PositionVector;
			  FLOAT X = pl.pl_PositionVector(1);
			  FLOAT Z = pl.pl_PositionVector(3);
        if (m_bUseY) {
          FLOAT Y = pl.pl_PositionVector(2);
          if (X>m_fXMin && X<m_fXMax  && Y>m_fYMin && Y<m_fYMax && Z>m_fZMin && Z<m_fZMax) {
            pen->SendEvent(EBecomeActive());
          }
        } else {
          if (X>m_fXMin && X<m_fXMax && Z>m_fZMin && Z<m_fZMax) {
            pen->SendEvent(EBecomeActive());
          }
        }
      } 
      /*if (m_ctEvent>0) {
        if (IsOfClass(pen, "Enemy Spawner")) {
			    CPlacement3D pl;
			    pl.pl_PositionVector = pen->GetPlacement().pl_PositionVector;
			    FLOAT X = pl.pl_PositionVector(1);
			    FLOAT Z = pl.pl_PositionVector(3);
          if (X>m_fXMin && X<m_fXMax && Z>m_fZMin && Z<m_fZMax) {
            pen->SendEvent(ETrigger());
          }
        }
      }*/
    }}
    if (hud_bShowOverlordInfo) {
      CPrintF("Touch Field Events Sent, m_ctEvent: %d\n", m_ctEvent);
    }
    m_ctEvent++;
  }

  // Handle an event, return false if the event is not handled
  BOOL HandleEvent(const CEntityEvent &ee)
  {
    if (ee.ee_slEvent==EVENTCODE_ETrigger) {
			m_bStartFireworksDisplay = TRUE;
    }
    if (m_bControlRunning) {
      if (ee.ee_slEvent==EVENTCODE_EBecomeActive)
      {
        m_iEventCount++;
        //ol_iEventCount = m_iEventCount;
        if (hud_bShowOverlordInfo) {
          CPrintF("Become Active Event Received, Event Count: %d\n", m_iEventCount);
        }

        switch (m_iLevel) {
          case 1:
            m_bSendEvents = FALSE;
            break;
		      // Valley of the Jaguar
          case 2:
            if (m_ctEvent==1 && m_iEventCount>1) { // valley  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>14) { // right jag   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>51) { // left jag  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>99) { // end battle 
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>120) { // 121?  end  
              m_bSendEvents = TRUE;
            }
            break;
          // City of the Gods
          case 3:
            m_bSendEvents = FALSE;
            break;
          // Serpent Yards
          case 4:
            if (m_ctEvent==1 && m_iEventCount>25) { // pit area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>40) { // 1st bend area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>51) { // 2nd bend area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>64) { // head area
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>79) { // switch area   
              m_bSendEvents = TRUE;
            }
            break;
          // The Pit
          case 5:
            if (m_ctEvent==1 && m_iEventCount>9) { // end battle  
              m_bSendEvents = TRUE;
            }
            break;
          // Ziggurrat
          case 6:
            if (m_ctEvent==1 && m_iEventCount>20) {  // first outside area 
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>46) { // second inside   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>79) { // second outside  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>121) { // door controller before critters on left   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>122) { // critters on left   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==6 && m_iEventCount>170) { // critters on right   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==7 && m_iEventCount>215) { // kleer trap  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==8 && m_iEventCount>220) { // end battle   
              m_bSendEvents = TRUE;
            }
            break;
          // The Elephant Atrium
          case 7:
            if (m_ctEvent==1 && m_iEventCount>28) { // outdoors first shit  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>29) {  // cannon area shit  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>74) { // grunts and guffy's and kleer shit  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>79) { // heading toward the gold elephant trigger shit  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>90) { // heading into the gold elephant trigger shit   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==6 && m_iEventCount>112) { // gold elephant trigger shit  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==7 && m_iEventCount>138) { // kleer after above  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==8 && m_iEventCount>139) { // indoors after above   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==9 && m_iEventCount>161) { // last area  
              m_bSendEvents = TRUE;
            }
            break;
          // Gilgamesh
          case 8:
            if (m_ctEvent==1 && m_iEventCount>2) { // pool area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>40) { // key area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>45) { // first inside right area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>67) { // hallway   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>85) { // floor breaking area 
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==6 && m_iEventCount>140) { // bouncer area       
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==7 && m_iEventCount>163) { // oscar cheatin area       
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==8 && m_iEventCount>167) { // area       
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==9 && m_iEventCount>188) { // area next to end battle
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==10 && m_iEventCount>215) { // end battle
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==11 && m_iEventCount>276) { // finish    
              m_bSendEvents = TRUE;
            }
            break;
          // Babel
          case 9:
            if (m_ctEvent==1 && m_iEventCount>21) { // staircase area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>65) { // last inside areas    
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>86) { // first outside area 86 
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>126) { // first tablet 126 
              m_bSendEvents = TRUE; 
            } else if (m_ctEvent==5 && m_iEventCount>154) { // second tablet 154  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==6 && m_iEventCount>179) { // third tablet 179 
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==7 && m_iEventCount>211) { // scorps   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==8 && m_iEventCount>225) { // last bulls 227 
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==9 && m_iEventCount>256) { // larva 258 
              m_bSendEvents = TRUE;
            }
            break;
          // Citadel
          case 10:
            if (m_ctEvent==1 && m_iEventCount>0) {  // first outside area 
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>11) { // first castle area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>32) { // second castle area 
              m_bSendEvents = TRUE;
              m_bSendCitadelEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>46) { // third castle area
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>69) { // fourth castle area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==6 && m_iEventCount>87) { // after the wheel
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==7 && m_iEventCount>97) { // brige area before castle   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==8 && m_iEventCount>110) { // castle   
              m_bSendEvents = TRUE;
            }
            break;
          // Land of the Damned
          case 11:
            if (m_ctEvent==1 && m_iEventCount>15) {  // jingle bell run first part  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>33) {  // jingle bell run second part   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>56) { // end battle 
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>81) { // end  
              m_bSendEvents = TRUE;
            }
            break;
          // The Grand Cathederal
          case 12:
            if (m_ctEvent==1 && m_iEventCount>13) { // second alley run  19
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>27) { // third alley run  37
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>47) { // fourth alley run  48
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>56) { // fifth alley run    
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>97) { // end alley run   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==6 && m_iEventCount>105) { // bouncers  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==7 && m_iEventCount>130) { // great yard   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==8 && m_iEventCount>203) { // mordekai   
              m_bSendEvents = TRUE;
            }
            break;
          // Sand Canyon
          case 14:
            if (m_ctEvent==1 && m_iEventCount>1) {  // first area 2
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>16) {  // second area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>41) {  // third area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>42) {  // end   
              m_bSendEvents = TRUE;
            }
            break;
          // Tomb of Ramses
          case 15:
            if (m_ctEvent==1 && m_iEventCount>5) { // second area
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>16) { // third area
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>18) { // fourth area
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount==32) { // fourth area double ck
              SendAreaEvent(this, EET_TRIGGER, FLOAT3D(-14.0f, 8.0f, -190.0f), FLOAT3D(500.0f, 70.0f, -80.0f), 1);
            } else if (m_ctEvent==4 && m_iEventCount>39) { // fifth area    
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>50) { // sixth area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==6 && m_iEventCount>98) { // end  
              m_bSendEvents = TRUE;
            }
            break;
          // Valley of the Kings
          case 16:
            if (m_ctEvent==1 && m_iEventCount>54) { // second area
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>75) { // third area
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>90) { // fourth area 1
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>91) { // fourth area 2
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>115) { // fifth area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==6 && m_iEventCount>143) { // end  
              m_bSendEvents = TRUE;
            }
            break;
          // Oasis
          case 18:
            if (m_ctEvent==1 && m_iEventCount>1) {  // first area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>2) {  // first area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>43) {  // second area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>69) {  // frogs & end   
              m_bSendEvents = TRUE;
            }
            break;
          // Dunes
          case 19:
            if (m_ctEvent==1 && m_iEventCount>132) {  // end 157 
              m_bSendEvents = TRUE;
            }
            break;
          // Suburbs
          case 20:
            if (m_ctEvent==1 && m_iEventCount>42) {  // second area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount==100) { // end 
              DestroyBouncerBox();
              if (hud_bShowOverlordInfo) {
                CPrintF("Bouncer Box Destroyed..\n");
              }
            }
            break;
          // Metro
          case 22:
            if (m_ctEvent==1 && m_iEventCount>82) {  // second area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>168) {  // thrid area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>213) {  // fourth area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>223) {  // end battle
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>318) {  // end battle
              m_bSendEvents = TRUE;
            }
            break;
          // Alley of the Sphinxes
          case 23:
            if (m_ctEvent==1 && m_iEventCount>59) {  // second area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>92) {  // end area   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>144) { // end 
              m_bSendEvents = TRUE;
            }
            break;
          // Karnak
          case 24:
            if (m_ctEvent==1 && m_iEventCount>5) { // first inside area
              m_bSendEvents = TRUE;
              FreezeCritters();
            } else if (m_ctEvent==2 && m_iEventCount>22) { // first outside area
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==3 && m_iEventCount>24) { // first outside area 2
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==4 && m_iEventCount>116) { // second inside area    
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==5 && m_iEventCount>162) { // second outside   
              m_bSendEvents = TRUE;
              UnfreezeCritters();
            } else if (m_ctEvent==6 && m_iEventCount>189) { // pool 1  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==7 && m_iEventCount>191) { // pool 2   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==8 && m_iEventCount>193) { // pool 3   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==9 && m_iEventCount>245) { // statue   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==10 && m_iEventCount>299) { // frog pit   
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==11 && m_iEventCount>365) { // end battle  
              m_bSendEvents = TRUE;
            }
            break;
          // TGP
          case 27:
            if (m_ctEvent==1 && m_iEventCount>65) {  // second area  
              m_bSendEvents = TRUE;
            } else if (m_ctEvent==2 && m_iEventCount>103) { // end 
              m_bSendEvents = TRUE;
            }
            break;
          default: m_bSendEvents = FALSE;
		    }
      }
    }
    return CRationalEntity::HandleEvent(ee);
  }

  void TeleportEntity(CEntity *pen, const CPlacement3D &pl) {
    // teleport 
    pen->Teleport(pl, FALSE);
  }

  void GetLevelEventInfo(void)
  {
    switch (m_iLevel) {      
      case 1: // Sierra de Chiappas
        m_fXMin = -10000;
        m_fXMax = 10000;
        m_fZMin = -10000;
        m_fZMax = 10000;
        break;      
      case 2: // Valley of the Jaguar
        if (m_ctEvent==0) {
          m_fXMin = 0;
          m_fXMax = 1000;
          m_fZMin = 380;
          m_fZMax = 2000;
        } else if (m_ctEvent==1) { // valley
          m_fXMin = 0;
          m_fXMax = 1000;
          m_fZMin = 150;
          m_fZMax = 380;
        } else if (m_ctEvent==2) { // right jag
          m_fXMin = 60;
          m_fXMax = 1000;
          m_fZMin = -500;
          m_fZMax = 500;
        } else if (m_ctEvent==3) { // left jag
          m_fXMin = -1000;
          m_fXMax = -100;
          m_fZMin = -600;
          m_fZMax = 500;
        } else if (m_ctEvent==4) { // end battle
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = -250;
          m_fZMax = 1000;
        } else if (m_ctEvent==5) { // end
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = -10000;
          m_fZMax = 10000;
        }
        break;
      case 3: // The City of the Gods
        m_fXMin = -10000;
        m_fXMax = 10000;
        m_fZMin = -10000;
        m_fZMax = 10000;
        break;      
      case 4: // Serpent Yards
        if (m_ctEvent==0) {
          m_fXMin = -1000;
          m_fXMax = 0;
          m_fZMin = 260;
          m_fZMax = 1000;
        } else if (m_ctEvent==1) { // pit area
          m_fXMin = -370;
          m_fXMax = 0;
          m_fZMin = 100;
          m_fZMax = 260;
        } else if (m_ctEvent==2) { // 1st bend area 
          m_fXMin = -500;
          m_fXMax = -370;
          m_fZMin = 0;
          m_fZMax = 260;
        } else if (m_ctEvent==3) { // 2nd bend area
          m_fXMin = -370;
          m_fXMax = 0;
          m_fZMin = 0;
          m_fZMax = 100;
        } else if (m_ctEvent==4) { // head area
          m_fXMin = -370;
          m_fXMax = 0;
          m_fZMin = -600;
          m_fZMax = 0;
        } else if (m_ctEvent==5) { // switch area 
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = -10000;
          m_fZMax = 10000;
        }
      case 5: // The Pit
        if (m_ctEvent==0) {
          m_fXMin = -10000;
          m_fXMax = 450;
          m_fZMin = -10000;
          m_fZMax = 10000;
        } else if (m_ctEvent==1) {
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = -10000;
          m_fZMax = 10000;
        }
        break;
      case 6: // Ziggurat
        if (m_ctEvent==0) {
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = 275;
          m_fZMax = 1000;
        } else if (m_ctEvent==1) { // first outside area
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = 125;
          m_fZMax = 275;
        } else if (m_ctEvent==2) { // second inside 
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = 0;
          m_fZMax = 125;
        } else if (m_ctEvent==3) { // second outside 
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = -260;
          m_fZMax = 0;
        } else if (m_ctEvent==4) { // door controllers before critters on left 
          m_fXMin = -5;
          m_fXMax = 5;
          m_fZMin = -280;
          m_fZMax = -259;
        } else if (m_ctEvent==5) { // critters on left 
          m_fXMin = -1000;
          m_fXMax = -10;
          m_fZMin = -600;
          m_fZMax = -260;
        } else if (m_ctEvent==6) { // critters on right  
          m_fXMin = 10;
          m_fXMax = 1000;
          m_fZMin = -600;
          m_fZMax = -260;
        } else if (m_ctEvent==7) { // kleer trap 
          m_fXMin = -40;
          m_fXMax = 40;
          m_fZMin = -460;
          m_fZMax = -260;
        } else if (m_ctEvent==8) { // end battle 
          m_fXMin = -40;
          m_fXMax = 40;
          m_fZMin = -600;
          m_fZMax = -460;
        }
        break;
      case 7: // The Elephant Atrium
        if (m_ctEvent==0) { // indoors first shit
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = 410;
          m_fZMax = 1000;
        } else if (m_ctEvent==1) { // outdoors first shit
          m_fXMin = -100;
          m_fXMax = 1000;
          m_fZMin = 192;
          m_fZMax = 410;
        } else if (m_ctEvent==2) { // cannon area shit
          m_fXMin = -1000;
          m_fXMax = -80;
          m_fZMin = 192;
          m_fZMax = 410;
        } else if (m_ctEvent==3) { // grunts and guffy's and kleer shit
          m_fXMin = -40;
          m_fXMax = 1000;
          m_fZMin = 132;
          m_fZMax = 196;
        } else if (m_ctEvent==4) { // heading toward the gold elephant trigger shit
          m_fXMin = -180;
          m_fXMax = -40;
          m_fZMin = 132;
          m_fZMax = 200;
        } else if (m_ctEvent==5) { // heading into the gold elephant trigger shit
          m_fXMin = -1000;
          m_fXMax = -180;
          m_fZMin = -1000;
          m_fZMax = 1000;
        } else if (m_ctEvent==6) { // gold elephant trigger shit
          m_fXMin = -180;
          m_fXMax = -60;
          m_fZMin = 28;
          m_fZMax = 132;
        } else if (m_ctEvent==7) { // kleer after above
          m_fXMin = -200;
          m_fXMax = -4;
          m_fZMin = -100;
          m_fZMax = 47;
        } else if (m_ctEvent==8) { // indoors after above
          m_fXMin = -60;
          m_fXMax = 40;
          m_fZMin = 46;
          m_fZMax = 132;
        } else if (m_ctEvent==9) { // last area
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = -10000;
          m_fZMax = 10000;
        }
        break;
      case 8: // Gilgamesh
        if (m_ctEvent==0) { // first area
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = -100;
          m_fZMax = 1000;
        } else if (m_ctEvent==1) { // pool area
          m_fXMin = -1000;
          m_fXMax = 15;
          m_fZMin = -220;
          m_fZMax = 1000;
        } else if (m_ctEvent==2) { // key area
          m_fXMin = -15;
          m_fXMax = 1000;
          m_fZMin = -220;
          m_fZMax = 1000;
        } else if (m_ctEvent==3) { // first inside area right
          m_fXMin = 50;
          m_fXMax = 1000;
          m_fZMin = -292;
          m_fZMax = -190;
        } else if (m_ctEvent==4) { // hallway
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = -326;
          m_fZMax = -220;
        } else if (m_ctEvent==5) { // floor breaking area
          m_fXMin = 30;
          m_fXMax = 1000;
          m_fZMin = -515;
          m_fZMax = -326;
        } else if (m_ctEvent==6) { // bouncer area to lift
          m_bUseY = TRUE;
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fYMin = -200;
          m_fYMax = -25;
          m_fZMin = -540;
          m_fZMax = 1000;
        } else if (m_ctEvent==7) { // oscar cheating area
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fYMin = -26;
          m_fYMax = -20;
          m_fZMin = -360;
          m_fZMax = -320;
        } else if (m_ctEvent==8) { // areas after lift
          m_bUseY = FALSE;
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = -515;
          m_fZMax = 1000;
        } else if (m_ctEvent==9) { // area next to end battle
          m_fXMin = 40;
          m_fXMax = 10000;
          m_fZMin = -672;
          m_fZMax = -490;
        } else if (m_ctEvent==10) { // end battle
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = -1200;
          m_fZMax = -672;
        } else if (m_ctEvent==11) { // finish
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = -1600;
          m_fZMax = -1200;
        }
        break;
      case 9: // Babel
        if (m_ctEvent==0) {
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = 640;
          m_fZMax = 1500;
        } else if (m_ctEvent==1) { // staircase
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = 520;
          m_fZMax = 640;
        } else if (m_ctEvent==2) { // last inside areas 
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = 290;
          m_fZMax = 520;
        } else if (m_ctEvent==3) { // first outside area 
          m_fXMin = -1000;
          m_fXMax = 50;
          m_fZMin = 100;
          m_fZMax = 290;
        } else if (m_ctEvent==4) { // first tablet
          m_fXMin = -1000;
          m_fXMax = -98;
          m_fZMin = -110;
          m_fZMax = 100;
        } else if (m_ctEvent==5) { // second tablet
          m_fXMin = -1000;
          m_fXMax = 50;
          m_fZMin = -600;
          m_fZMax = -110;
        } else if (m_ctEvent==6) { // third tablet
          m_fXMin = 50;
          m_fXMax = 300;
          m_fZMin = -600;
          m_fZMax = 40;
        } else if (m_ctEvent==7) { // scorps
          m_fXMin = 90;
          m_fXMax = 400;
          m_fZMin = 40;
          m_fZMax = 500;
        } else if (m_ctEvent==8) { // last bulls
          m_fXMin = -40;
          m_fXMax = 90;
          m_fZMin = 100;
          m_fZMax = 290;
        } else if (m_ctEvent==9) { // larva
          m_fXMin = -120;
          m_fXMax = 120;
          m_fZMin = -140;
          m_fZMax = 140;
        }
        break;
      case 10: // Citadel
        if (m_ctEvent==0) {
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = -1000;
          m_fZMax = -460;
        } else if (m_ctEvent==1) { // first outside area
          m_fXMin = -1000;
          m_fXMax = 1000;
          m_fZMin = -500;
          m_fZMax = -150;
        } else if (m_ctEvent==2) { // first castle area
          m_fXMin = -500;
          m_fXMax = 50;
          m_fZMin = -150;
          m_fZMax = -60;
        } else if (m_ctEvent==3) { // second castle area
          m_fXMin = 50;
          m_fXMax = 1000;
          m_fZMin = -500;
          m_fZMax = -66;
        } else if (m_ctEvent==4) { // third castle area
          m_fXMin = 50;
          m_fXMax = 1000;
          m_fZMin = -67;
          m_fZMax = 70;
        } else if (m_ctEvent==5) { // fourth castle area
          m_fXMin = -30;
          m_fXMax = 1000;
          m_fZMin = 64;
          m_fZMax = 200;
        } else if (m_ctEvent==6) { // after the wheel
          m_fXMin = -500;
          m_fXMax = -29;
          m_fZMin = 64;
          m_fZMax = 200;
        } else if (m_ctEvent==7) { // bridge area before entry
          m_fXMin = -500;
          m_fXMax = -51;
          m_fZMin = -64;
          m_fZMax = 64;
        } else if (m_ctEvent==8) { // castle
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = -10000;
          m_fZMax = 10000;
        }
        break;
      case 11: // Land of the Damned
        if (m_ctEvent==0) {
          m_fXMin = 250;
          m_fXMax = 1000;
          m_fZMin = -200;
          m_fZMax = 1000;
        } else if (m_ctEvent==1) { // jingle bell run first part
          m_fXMin = 250;
          m_fXMax = 1000;
          m_fZMin = -250;
          m_fZMax = 1000;
        } else if (m_ctEvent==2) { // jingle bell run second part
          m_fXMin = 250;
          m_fXMax = 1000;
          m_fZMin = -1000;
          m_fZMax = -250;
        } else if (m_ctEvent==3) { // end battle
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = 4000;
          m_fZMax = 10000;
        } else if (m_ctEvent==4) { // end
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = -10000;
          m_fZMax = 10000;
        }
        break;
      case 12: // The Grand Cathederal
        if (m_ctEvent==0) {
          m_fXMin = -300;
          m_fXMax = 1000;
          m_fZMin = -65; //-100
          m_fZMax = 600;
        } else if (m_ctEvent==1) { // second alley run
          m_fXMin = 520;
          m_fXMax = 650;
          m_fZMin = -500;
          m_fZMax = -64;
        } else if (m_ctEvent==2) { // third alley run
          m_fXMin = 320;
          m_fXMax = 541;
          m_fZMin = -500;
          m_fZMax = 200;
        } else if (m_ctEvent==3) { // fourth alley run
          m_fXMin = 260;
          m_fXMax = 1000;
          m_fZMin = -320;
          m_fZMax = 0;
        } else if (m_ctEvent==4) { // fifth alley run
          m_fXMin = 50;
          m_fXMax = 261;
          m_fZMin = -320;
          m_fZMax = 0;
        } else if (m_ctEvent==5) { // last alley run
          m_fXMin = -70;
          m_fXMax = 51;
          m_fZMin = -400;
          m_fZMax =  0;
        } else if (m_ctEvent==6) { // bouncers
          m_fXMin = -315;
          m_fXMax = 1000;
          m_fZMin = -300;
          m_fZMax = 100;
        } else if (m_ctEvent==7) { // great yard
          m_fXMin = -800;
          m_fXMax = 1000;
          m_fZMin = -1000;
          m_fZMax = 1000;
        } else if (m_ctEvent==8) { // mordekai
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = -10000;
          m_fZMax = 10000;
        }
        break;
      case 13: // Hatshepsut
        m_fXMin = -10000;
        m_fXMax = 10000;
        m_fZMin = -10000;
        m_fZMax = 10000;
        break;
      case 14: // Sand Canyon
        if (m_ctEvent==0) { // first area 1
          m_fXMin = 124;
          m_fXMax = 350;
          m_fZMin = -174;
          m_fZMax = 0;
        } else if (m_ctEvent==1) { // first area 2
          m_fXMin = 124;
          m_fXMax = 350;
          m_fZMin = -450;
          m_fZMax = -175;
        } else if (m_ctEvent==2) { // second area
          m_fXMin = -80;
          m_fXMax = 200;
          m_fZMin = -250;
          m_fZMax = -80;
        } else if (m_ctEvent==3) { // third area
          m_fXMin = -220;
          m_fXMax = 0;
          m_fZMin = -250;
          m_fZMax = -80;
        } else if (m_ctEvent==4) { // end
          m_fXMin = -220;
          m_fXMax = 100;
          m_fZMin = -79;
          m_fZMax = 120;
        }
        break;
      case 15: // Tomb of Ramses
        if (m_ctEvent==0) { // first area
          m_fXMin = -130;
          m_fXMax = 130;
          m_fZMin = -44;
          m_fZMax = 600;
        } else if (m_ctEvent==1) { // second area
          m_fXMin = -130;
          m_fXMax = 130;
          m_fZMin = -98;
          m_fZMax = -43;
        } else if (m_ctEvent==2) { // third area
          m_fXMin = -130;
          m_fXMax = -16;
          m_fZMin = -110;
          m_fZMax = -97;
        } else if (m_ctEvent==3) { // fourth area
          m_fXMin = -17;
          m_fXMax = 130;
          m_fZMin = -188;
          m_fZMax = -80;
        } else if (m_ctEvent==4) { // fifth area
          m_fXMin = 0;
          m_fXMax = 90;
          m_fZMin = -360;
          m_fZMax = -187;
        } else if (m_ctEvent==5) { // sixth area
          m_fXMin = 89;
          m_fXMax = 220;
          m_fZMin = -510;
          m_fZMax =  -280;
        } else if (m_ctEvent==6) { // end
          m_fXMin = 89;
          m_fXMax = 220;
          m_fZMin = -600;
          m_fZMax = -509;
        }
        break;
      case 16: // Valley of the Kings
        if (m_ctEvent==0) { // first area
          m_fXMin = -130;
          m_fXMax = 130;
          m_fZMin = -231;
          m_fZMax = 400;
        } else if (m_ctEvent==1) { // second area
          m_fXMin = -130;
          m_fXMax = 130;
          m_fZMin = -344;
          m_fZMax = -230;
        } else if (m_ctEvent==2) { // third area
          m_bUseY = TRUE;
          m_fXMin = -70;
          m_fXMax = 130;
          m_fYMin = -97;
          m_fYMax = 100;
          m_fZMin = -582;
          m_fZMax = -343;
        } else if (m_ctEvent==3) { // fourth area 1
          m_bUseY = FALSE;
          m_fXMin = -44;
          m_fXMax = 100;
          m_fZMin = -640;
          m_fZMax = -536;
        } else if (m_ctEvent==4) { // fourth area 2
          m_fXMin = 40;
          m_fXMax = 100;
          m_fZMin = -540;
          m_fZMax = -480;
        } else if (m_ctEvent==5) { // fifth area
          m_fXMin = -180;
          m_fXMax = 40;
          m_fZMin = -640;
          m_fZMax =  -480;
        } else if (m_ctEvent==6) { // end
          m_fXMin = -350;
          m_fXMax = -179;
          m_fZMin = -700;
          m_fZMax = -500;
        }
        break;
      case 18: // Oasis
        if (m_ctEvent==0) { // first area
          m_fXMin = -150;
          m_fXMax = 150;
          m_fZMin = -100;
          m_fZMax = 160;
        } else if (m_ctEvent==1) { // first area
          m_fXMin = -150;
          m_fXMax = 48;
          m_fZMin = -110;
          m_fZMax = -99;
        } else if (m_ctEvent==2) { // first area
          m_fXMin = 56;
          m_fXMax = 150;
          m_fZMin = -110;
          m_fZMax = -99;
        } else if (m_ctEvent==3) { // second area
          m_fXMin = -150;
          m_fXMax = 150;
          m_fZMin = -200;
          m_fZMax = 50;
        } else if (m_ctEvent==4) { // frogs & finish
          m_fXMin = -150;
          m_fXMax = 150;
          m_fZMin = -500;
          m_fZMax = -199;
        }
        break;
      case 19: // Dunes
        if (m_ctEvent==0) { // first area
          m_fXMin = -500;
          m_fXMax = 500;
          m_fZMin = -290;
          m_fZMax = 360;
        } else if (m_ctEvent==1) { // end
          m_fXMin = -50;
          m_fXMax = 500;
          m_fZMin = -300;
          m_fZMax = -289;
        }
        break;
      case 20: // Suburbs
        if (m_ctEvent==0) { // first area
          m_fXMin = -200;
          m_fXMax = 200;
          m_fZMin = 840;
          m_fZMax = 1200;
        } else if (m_ctEvent==1) { // second area
          m_fXMin = -200;
          m_fXMax = 200;
          m_fZMin = 500;
          m_fZMax = 841;
        }
        break;
      case 22: // Metro
        if (m_ctEvent==0) { // first area
          m_fXMin = -150;
          m_fXMax = 220;
          m_fZMin = -160;
          m_fZMax = 160;
        } else if (m_ctEvent==1) { // second area
          m_fXMin = 219;
          m_fXMax = 455;
          m_fZMin = -160;
          m_fZMax = 160;
        } else if (m_ctEvent==2) { // third area
          m_fXMin = 454;
          m_fXMax = 680;
          m_fZMin = -160;
          m_fZMax = 160;
        } else if (m_ctEvent==3) { // fourth area
          m_fXMin = 679;
          m_fXMax = 946;
          m_fZMin = -160;
          m_fZMax = 160;
        } else if (m_ctEvent==4) { // end battle
          m_fXMin = 945;
          m_fXMax = 1153;
          m_fZMin = -160;
          m_fZMax = 160;
        } else if (m_ctEvent==5) { // end
          m_fXMin = 1152;
          m_fXMax = 1425;
          m_fZMin = -160;
          m_fZMax = 160;
        }
        break;
      case 23: // Alley of the Sphinxes
        if (m_ctEvent==0) { // first area
          m_fXMin = 1610;
          m_fXMax = 2500;
          m_fZMin = 800;
          m_fZMax = 3200;
        } else if (m_ctEvent==1) { // second area
          m_fXMin = 1336;
          m_fXMax = 1611;
          m_fZMin = 800;
          m_fZMax = 3200;
        } else if (m_ctEvent==2) { // end area
          m_fXMin = 1030;
          m_fXMax = 1337;
          m_fZMin = 800;
          m_fZMax = 3200;
        } else if (m_ctEvent==3) { // finish
          m_fXMin = 1000;
          m_fXMax = 1031;
          m_fZMin = 800;
          m_fZMax = 3200;
        }
        break;
      case 24: // Karnak
        if (m_ctEvent==0) {
          m_fXMin = 784;
          m_fXMax = 1050;
          m_fZMin = 1950;
          m_fZMax = 2150;
        } else if (m_ctEvent==1) { // first inside area
          m_fXMin = 667;
          m_fXMax = 785;
          m_fZMin = 2000;
          m_fZMax = 2100;
        } else if (m_ctEvent==2) { // first outside area
          m_fXMin = 588;
          m_fXMax = 668;
          m_fZMin = 2000;
          m_fZMax = 2100;
        } else if (m_ctEvent==3) { // first outside area 2
          m_fXMin = 520;
          m_fXMax = 720;
          m_fZMin = 1690;
          m_fZMax = 2001;
        } else if (m_ctEvent==4) { // second inside area
          m_fXMin = 392;
          m_fXMax = 589;
          m_fZMin = 2000;
          m_fZMax = 2100;
        } else if (m_ctEvent==5) { // second outside area
          m_fXMin = 260;
          m_fXMax = 393;
          m_fZMin = 1960;
          m_fZMax = 2100;
        } else if (m_ctEvent==6) { // pool 1
          m_fXMin = 200;
          m_fXMax = 440;
          m_fZMin = 2099;
          m_fZMax = 2453;
        } else if (m_ctEvent==7) { // pool 2
          m_fXMin = 200;
          m_fXMax = 284;
          m_fZMin = 2452;
          m_fZMax = 2560;
        } else if (m_ctEvent==8) { // pool 3
          m_fXMin = 356;
          m_fXMax = 440;
          m_fZMin = 2452;
          m_fZMax = 2560;
        } else if (m_ctEvent==9) { // statue
          m_fXMin = 200;
          m_fXMax = 440;
          m_fZMin = 2452;
          m_fZMax = 2700;
        } else if (m_ctEvent==10) { // frog pit
          m_fXMin = -1;
          m_fXMax = 261;
          m_fZMin = 2000;
          m_fZMax = 2100;
        } else if (m_ctEvent==11) { // end battle
          m_fXMin = -200;
          m_fXMax = 0;
          m_fZMin = 1800;
          m_fZMax = 2300;
        }
        break;
      case 27: // TGP
        if (m_ctEvent==0) { // first area
          m_fXMin = -200;
          m_fXMax = 200;
          m_fZMin = -225;
          m_fZMax = 100;
        } else if (m_ctEvent==1) { // second area
          m_fXMin = -500;
          m_fXMax = 500;
          m_fZMin = -2000;
          m_fZMax = -226;
        }
        break;
      case 28:
        m_fXMin = -10000;
        m_fXMax = 10000;
        m_fZMin = -10000;
        m_fZMax = 10000;
        break;
      default: 
        m_fXMin = -10000;
        m_fXMax = 10000;
        m_fZMin = -10000;
        m_fZMax = 10000;
    }
  }

  void GetLevelIndex(void)
  {
    CTString strLevelName = _pNetwork->ga_fnmWorld.FileName();

		if (strLevelName=="1_1_Palenque") {
      m_iLevel = 1;
		} else if (strLevelName=="1_2_Palenque") {
			m_iLevel = 2;
		} else if (strLevelName=="1_3_Teotihuacan") {
			m_iLevel = 3;
		} else if (strLevelName=="1_4_Teotihuacan") {
      m_iLevel = 4;
		} else if (strLevelName=="1_5_Teotihuacan") {
      m_iLevel = 5;
		} else if (strLevelName=="2_1_Ziggurrat") {
			m_iLevel = 6;
		} else if (strLevelName=="2_2_Persepolis") {
			m_iLevel = 7;
		} else if (strLevelName=="2_3_Persepolis") {
			m_iLevel = 8;
		} else if (strLevelName=="2_4_TowerOfBabylon") {
			m_iLevel = 9;
		} else if (strLevelName=="3_1_GothicCastle") {
			m_iLevel = 10;
		} else if (strLevelName=="3_2_LandOfDamned") {
			m_iLevel = 11;
		} else if (strLevelName=="3_3_CorridorOfDeath") {
      m_iLevel = 12;
      CreateEndShow();
		} else if (strLevelName=="01_Hatshepsut") {
      m_iLevel = 13; 
			FixHatshepsutRain();
			//m_bStartRain = TRUE;
			CreateFEPowerups();
			CreateWeapons();
    } else if (strLevelName=="02_SandCanyon") {
      m_iLevel = 14;
			CreateFEPowerups();
			CreateWeapons();
		} else if (strLevelName=="03_TombOfRamses") {
      m_iLevel = 15;
			CreateFEPowerups();
			SpawnTemplateCreator();
			SpawnPESpawnerEGs();
		} else if (strLevelName=="04_ValleyOfTheKings") {
      m_iLevel = 16;
			CreateFEPowerups();
			CreateWeapons();
			SpawnTemplateCreator();
			SpawnPESpawnerEGs();
    } else if (strLevelName=="05_MoonMountains") {
      m_iLevel = 17;
			CreateFEPowerups();
      m_fCritterY = -160.0f;
      m_bCkCritterY = TRUE;
    } else if (strLevelName=="06_Oasis") {
      m_iLevel = 18;
			CreateFEPowerups();
    } else if (strLevelName=="07_Dunes") {
      m_iLevel = 19;
			CreateFEPowerups();
    } else if (strLevelName=="08_Suburbs") {
      m_iLevel = 20;
			CreateFEPowerups();
			if (m_bControlRunning) {
				CreateBouncerBox();
			}
    } else if (strLevelName=="09_Sewers") {
      m_iLevel = 21;
			CreateFEPowerups();
    } else if (strLevelName=="10_Metropolis") {
      m_iLevel = 22;
			CreateFEPowerups();
    } else if (strLevelName=="11_AlleyOfSphinxes") {
      m_iLevel = 23;
			CreateSnow();
			m_bStartSnow = TRUE;
			CreateFEPowerups();
    } else if (strLevelName=="12_Karnak") {
      m_iLevel = 24;
			CreateFEPowerups();
			//CreateFireworksDisplay();
    } else if (strLevelName=="13_Luxor") {
      m_iLevel = 25;
			CreateFEPowerups();
    } else if (strLevelName=="14_SacredYards") {
      m_iLevel = 26;
			CreateFEPowerups();
    } else if (strLevelName=="15_TheGreatPyramid") {
      m_iLevel = 27;
			CreateFEPowerups();
    } else if (strLevelName=="alpinemists") {
      m_iLevel = 28;
      m_fCritterY = -120.0f;
      m_bCkCritterY = TRUE;
			//CreateFEPowerups();
    } else if (strLevelName=="Triphon") {
      m_iLevel = 29;
			//CreateFEPowerups();
    } else if (strLevelName=="new") {
      m_iLevel = 30;
			//CreateFEPowerups();
    } else if (strLevelName=="Final Fight") {
      m_iLevel = 31;
			//CreateFEPowerups();
    } else if (strLevelName=="KarnakDemo") {
      m_iLevel = 32;
			//CreateFEPowerups();
    } else if (strLevelName=="Return To Moon Mountains 1") {
      m_iLevel = 33;
			//CreateFEPowerups();
		} else if (strLevelName=="cmap") {
      m_iLevel = 34;
      m_bDestroyChit = TRUE;
      m_iDestroyChit = 1;
			//CreateFEPowerups();
		} else if (strLevelName=="zzcanyon") {
      m_iLevel = 35;
      m_bFixBouncer = TRUE;
			//CreateFEPowerups();
		} else if (strLevelName=="portals_3") {
      m_iLevel = 36;
      m_bDestroyChit = TRUE;
      m_iDestroyChit = 2;
			//CreateFEPowerups();
		/*} else if (strLevelName=="FireworksTest") {
			CreateFireworksDisplay();
			m_bStartFireworksDisplay = TRUE;*/
		} else {
			m_iLevel = 0;
    }
  }

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(COverLord) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory());
  }

	void SpawnTemplateCreator(void)
	{
    CEntity *pen = NULL;
		CPlacement3D pl;
		pl = CPlacement3D(FLOAT3D(0,0,0), ANGLE3D(0, 0, 0));
    pen = CreateEntity(pl, CLASS_TEMP_CREATOR);
    pen->Initialize();
	}

	void SpawnPESpawnerEGs(void)
	{
    CEntity *pen = NULL;
		CPlacement3D pl;

		switch (m_iLevel)
		{
		case 15: // Tomb of Ramses
		{
			pl = CPlacement3D(FLOAT3D(146, 62, -360), ANGLE3D(0, 0, 0));
			pen = CreateEntity(pl, CLASS_PE_SPAWNER);
			((CPESpawnerEG&)*pen).m_bUseChFreak = TRUE;
			((CPESpawnerEG&)*pen).m_ctTotal = 3;
			((CPESpawnerEG&)*pen).m_fEnemyMaxAdjuster = 0.6f;
			((CPESpawnerEG&)*pen).m_iTouchBoxSize = 1;
			pen->Initialize();
		}
		break;
		case 16: // Valley of the Kings
		{
			pl = CPlacement3D(FLOAT3D(-12, -86, -80), ANGLE3D(180, 0, 0));
			pen = CreateEntity(pl, CLASS_PE_SPAWNER);
			((CPESpawnerEG&)*pen).m_bUseGuffy = TRUE;
			((CPESpawnerEG&)*pen).m_ctTotal = 2;
			((CPESpawnerEG&)*pen).m_fEnemyMaxAdjuster = 0.9f;
			((CPESpawnerEG&)*pen).m_iTouchBoxSize = 2;
			pen->Initialize();

			pl = CPlacement3D(FLOAT3D(-32, -74, -426), ANGLE3D(180, 0, 0));
			pen = CreateEntity(pl, CLASS_PE_SPAWNER);
			((CPESpawnerEG&)*pen).m_bUseGruntC = TRUE;
			((CPESpawnerEG&)*pen).m_bUseGruntS = TRUE;
			((CPESpawnerEG&)*pen).m_ctTotal = 3;
			((CPESpawnerEG&)*pen).m_fEnemyMaxAdjuster = 0.8f;
			((CPESpawnerEG&)*pen).m_fSearchRange = 0.0f;
			((CPESpawnerEG&)*pen).m_iTouchBoxSize = 1;
			pen->Initialize();
		}
		break;
		}
	}

procedures:

  Active() {

    // repeat
    while (TRUE) {

      // wait 
      autowait(0.2f); 

			// check for critters to purge
			m_iCritterCkCount++;
			if (m_iCritterCkCount > 5) {
				CheckCritters();
				m_iCritterCkCount = 0;
			}

      if (m_bCreatePlayerBot) {
        m_iBotCounter++;
        if (m_iBotCounter > 5) {
          CheckPlayersForBots();
          m_iBotCounter = 0;
        }
      }

      /*if (m_bSendEvents) {
        if (m_bControlRunning) {
          if (m_bSendCitadelEvents) {
            SendCitadelEvents();
            m_bSendCitadelEvents = FALSE;
          }
          // get info for level specific event sending
          GetLevelEventInfo();
          SendEvents();
          m_bSendEvents = FALSE;
        } else {
          m_fXMin = -10000;
          m_fXMax = 10000;
          m_fZMin = -10000;
          m_fZMax = 10000;
          SendEvents();
          m_bSendEvents = FALSE;
        }
      }*/

			/*if (m_bStartFireworksDisplay) {
				if (m_ctEnemiesAlive<5) {
					SendFWDisplayEvent();
					m_bStartFireworksDisplay = FALSE;
				}
			}*/
    }
  };

  // initialize
  Main(EOverLordInit eInit) {

    //CPrintF("OverLord Main Run\n");

    // remember the initial parameters
    ASSERT(eInit.penOwner!=NULL);
    m_penOwner = eInit.penOwner;

    // init as nothing
    InitAsVoid();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // never start ai in wed
    //autowait(_pTimer->TickQuantum);
    
    GetLevelIndex();
    //m_ctEvent = 0;
    //m_iEventCount = 0;
   // m_iStarCount = 5;
    m_iBotCounter = 0;
    m_fGameDamage = GetGameDamageMultiplier();
    m_bUseY = FALSE;
    
    /*if (GetSP()->sp_bControlRunning) {
      m_bControlRunning = TRUE;
    }*/

    if (GetSP()->sp_bUseBots) {
      m_iBotsPerPlayer = GetSP()->sp_iBotsPerPlayer;
      m_iMaxPlayers = GetSP()->sp_ctMaxPlayers+1;
      m_bCreatePlayerBot = TRUE;
    }

    if (m_bDestroyChit) {
      DestroyChit();
    }
    
    if (m_bFixBouncer) {
      m_bFixBouncer = FALSE;
      FixBouncer();
    }

    // wait one tick
    //autowait(_pTimer->TickQuantum);

		if (m_bStartSnow) {
			StartSnow();
			m_bStartSnow = FALSE;
		}

    if (m_bDestroyChit) {
      DestroyChit();
      m_bDestroyChit = FALSE;
    }

		//autowait(2.0f);
		//CreateFireworksDisplay();
		//m_bStartFireworksDisplay = TRUE;

		/*CTString str = "some chit\n";

		for (INDEX i = 0; i < 10; i++) {
			str += "some more chit\n";
		}

		CTString strTemp = "";
		while (str != "") {
			strTemp = str;
			strTemp.OnlyFirstLine();
			CPrintF("strTemp: %s, strTemp.Length(): %d\n", strTemp, strTemp.Length());
			CPrintF("str: %s\n", str);
			str.TrimLeft(strTemp.Length());
		}*/
    
    jump Active();

    return;
  }
};
