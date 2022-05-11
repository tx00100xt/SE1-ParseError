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

#include "StdAfx.h"
#include "Game.h"

extern FLOAT gam_afEnemyMovementSpeed[5];
extern FLOAT gam_afEnemyAttackSpeed[5];
extern FLOAT gam_afDamageStrength[5];
extern FLOAT gam_afAmmoQuantity[5];
extern FLOAT gam_fManaTransferFactor;
extern FLOAT gam_fExtraEnemyStrength          ;
extern FLOAT gam_fExtraEnemyStrengthPerPlayer ;
extern INDEX gam_iCredits;
extern FLOAT gam_tmSpawnInvulnerability;
extern INDEX gam_iScoreLimit;
extern INDEX gam_iFragLimit;
extern INDEX gam_iTimeLimit;
extern INDEX gam_ctMaxPlayers;
extern INDEX gam_bWaitAllPlayers;
extern INDEX gam_bAmmoStays       ;
extern INDEX gam_bHealthArmorStays;
extern INDEX gam_bAllowHealth     ;
extern INDEX gam_bAllowArmor      ;
extern INDEX gam_bInfiniteAmmo    ;
extern INDEX gam_bRespawnInPlace  ;
extern INDEX gam_bPlayEntireGame;
extern INDEX gam_bWeaponsStay;
extern INDEX gam_bFriendlyFire;
extern INDEX gam_iInitialMana;
extern INDEX gam_iQuickStartDifficulty;
extern INDEX gam_iQuickStartMode;
extern INDEX gam_bQuickStartMP;
extern INDEX gam_iStartDifficulty;
extern INDEX gam_iStartMode;
extern INDEX gam_iBlood;
extern INDEX gam_bGibs;
extern INDEX gam_bUseExtraEnemies;
extern CTString gam_strGameAgentExtras;

// NEW CODE
// extra enemy stuff
extern INDEX gam_bExtraEnemiesPerPlayer;
extern INDEX gam_iEnemyMultiplier;
extern FLOAT gam_fExtraEnemiesPerPlayerRatio;
extern INDEX gam_iEnemyMax;
extern FLOAT gam_fEnemySpeedAdjuster;
extern FLOAT gam_fPlayerDamageAdjuster;
extern FLOAT gam_fGibLife;

// general game options
extern INDEX gam_bDamageSelf;
extern FLOAT gam_fSpeedAdjuster;
extern INDEX gam_bControlRunning;
extern INDEX gam_bBackwardsGame;
extern INDEX gam_iPostTGPLevel;
extern INDEX gam_bSkipLuxor;
extern INDEX gam_bSkipSewers;
extern INDEX gam_bRandomLevels;
extern INDEX gam_bControlFlying;
extern INDEX gam_iPostTGPLevel;
extern INDEX gam_bUsePEHealth;
/*extern INDEX gam_iMaxHealth;
extern INDEX gam_iTopHealth;
extern INDEX gam_iMaxArmor;
extern INDEX gam_iTopArmor;*/

// weapons options
extern INDEX gam_bGiveAllWeapons;
extern INDEX gam_bMaskChainsaw;
extern INDEX gam_bMaskColt;
extern INDEX gam_bMaskSingleShotgun;
extern INDEX gam_bMaskSniper;
extern INDEX gam_bMaskFlamer;
extern INDEX gam_bMaskTommyGun;
extern INDEX gam_bMaskRocketLauncher;
extern INDEX gam_bMaskGrenadeLauncher;
extern INDEX gam_bMaskMiniGun;
extern INDEX gam_bMaskLaser;
extern INDEX gam_bMaskCannon;
extern INDEX gam_bMaskTeleGun;
extern FLOAT gam_fWeaponsFireRate;
extern FLOAT gam_fWeaponsDamage;
extern FLOAT gam_fProjectileSpeed;

// bot options
extern INDEX gam_bUseBots;
extern INDEX gam_iBotsPerPlayer;
extern FLOAT gam_fBotSkill;

// spawner battery options
extern INDEX gam_bTestSpawnerBatteries;

// Single player fps chit
extern INDEX gam_iFPS;

static void SetGameModeParameters(CSessionProperties &sp)
{
  sp.sp_gmGameMode = (CSessionProperties::GameMode) Clamp(INDEX(gam_iStartMode), -1, 2);

  switch (sp.sp_gmGameMode) {
  default:
    ASSERT(FALSE);
  case CSessionProperties::GM_COOPERATIVE:
    sp.sp_ulSpawnFlags |= SPF_SINGLEPLAYER|SPF_COOPERATIVE;
    break;
  case CSessionProperties::GM_FLYOVER:
    sp.sp_ulSpawnFlags |= SPF_FLYOVER|SPF_MASK_DIFFICULTY;
    break;
  case CSessionProperties::GM_SCOREMATCH:
  case CSessionProperties::GM_FRAGMATCH:
    sp.sp_ulSpawnFlags |= SPF_DEATHMATCH;
    break;
  }
}
static void SetDifficultyParameters(CSessionProperties &sp)
{
  INDEX iDifficulty = gam_iStartDifficulty;
  if (iDifficulty==4) {
    sp.sp_bMental = TRUE;
    iDifficulty=3;
  } else {
		if (gam_bControlRunning) {
			iDifficulty = 3;
		}
    sp.sp_bMental = FALSE;
  }

  sp.sp_gdGameDifficulty = (CSessionProperties::GameDifficulty) Clamp(INDEX(iDifficulty), -1, 4);

  switch (sp.sp_gdGameDifficulty) {
  case CSessionProperties::GD_TOURIST:
    sp.sp_ulSpawnFlags = SPF_EASY; //SPF_TOURIST; !!!!
    sp.sp_fEnemyMovementSpeed = gam_afEnemyMovementSpeed [0]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fEnemyAttackSpeed   = gam_afEnemyAttackSpeed   [0]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fDamageStrength     = gam_afDamageStrength     [0];
    sp.sp_fAmmoQuantity       = gam_afAmmoQuantity       [0]*sp.sp_iEnemyMultiplier;
    break;
  case CSessionProperties::GD_EASY:
    sp.sp_ulSpawnFlags = SPF_EASY;
    sp.sp_fEnemyMovementSpeed = gam_afEnemyMovementSpeed [1]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fEnemyAttackSpeed   = gam_afEnemyAttackSpeed   [1]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fDamageStrength     = gam_afDamageStrength     [1];
    sp.sp_fAmmoQuantity       = gam_afAmmoQuantity       [1]*sp.sp_iEnemyMultiplier;
    break;
  default:
    ASSERT(FALSE);
  case CSessionProperties::GD_NORMAL:
    sp.sp_ulSpawnFlags = SPF_NORMAL;
    sp.sp_fEnemyMovementSpeed = gam_afEnemyMovementSpeed [2]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fEnemyAttackSpeed   = gam_afEnemyAttackSpeed   [2]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fDamageStrength     = gam_afDamageStrength     [2];
    sp.sp_fAmmoQuantity       = gam_afAmmoQuantity       [2]*sp.sp_iEnemyMultiplier;
    break;
  case CSessionProperties::GD_HARD:
    sp.sp_ulSpawnFlags = SPF_HARD;
    sp.sp_fEnemyMovementSpeed = gam_afEnemyMovementSpeed [3]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fEnemyAttackSpeed   = gam_afEnemyAttackSpeed   [3]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fDamageStrength     = gam_afDamageStrength     [3];
    sp.sp_fAmmoQuantity       = gam_afAmmoQuantity       [3]*sp.sp_iEnemyMultiplier;
    break;
  case CSessionProperties::GD_EXTREME:
    sp.sp_ulSpawnFlags = SPF_EXTREME;
		if (sp.sp_bMental) {
			sp.sp_fEnemyMovementSpeed = gam_afEnemyMovementSpeed [4]*sp.sp_fEnemySpeedAdjuster*1.5f;
			sp.sp_fEnemyAttackSpeed   = gam_afEnemyAttackSpeed   [4]*sp.sp_fEnemySpeedAdjuster*1.5f;
			sp.sp_fDamageStrength     = gam_afDamageStrength     [4]*0.8f;
		}	else {
			sp.sp_fEnemyMovementSpeed = gam_afEnemyMovementSpeed [4]*sp.sp_fEnemySpeedAdjuster;
			sp.sp_fEnemyAttackSpeed   = gam_afEnemyAttackSpeed   [4]*sp.sp_fEnemySpeedAdjuster;
			sp.sp_fDamageStrength     = gam_afDamageStrength     [4];
		}
		//sp.sp_fDamageStrength     = gam_afDamageStrength     [4];
    sp.sp_fAmmoQuantity       = gam_afAmmoQuantity       [4]*sp.sp_iEnemyMultiplier;
    break;
  /*case CSessionProperties::GD_INSAMNITY:
    sp.sp_ulSpawnFlags = SPF_EXTREME;
    sp.sp_fEnemyMovementSpeed = gam_afEnemyMovementSpeed [5]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fEnemyAttackSpeed   = gam_afEnemyAttackSpeed   [5]*sp.sp_fEnemySpeedAdjuster;
    sp.sp_fDamageStrength     = gam_afDamageStrength     [5];
    sp.sp_fAmmoQuantity       = gam_afAmmoQuantity       [5]*sp.sp_iEnemyMultiplier;
    break;*/
  }
}

// set properties for a single player session
void CGame::SetSinglePlayerSession(CSessionProperties &sp)
{
  // clear
  memset(&sp, 0, sizeof(sp));

	sp.sp_fEnemySpeedAdjuster = gam_fEnemySpeedAdjuster;
  sp.sp_iEnemyMultiplier = gam_iEnemyMultiplier;

  SetDifficultyParameters(sp);
  SetGameModeParameters(sp);
  sp.sp_ulSpawnFlags&=~SPF_COOPERATIVE;

	/*if (sp.sp_bMental) {
		sp.sp_fPlayerDamageAdjuster = gam_fPlayerDamageAdjuster*2.0f;
	} else {
		sp.sp_fPlayerDamageAdjuster = gam_fPlayerDamageAdjuster;
	}*/
	sp.sp_fPlayerDamageAdjuster = gam_fPlayerDamageAdjuster;

  sp.sp_bEndOfGame = FALSE;

  sp.sp_ctMaxPlayers = 1;
  sp.sp_bWaitAllPlayers = FALSE;
  sp.sp_bQuickTest = FALSE;
  sp.sp_bCooperative = TRUE;
  sp.sp_bSinglePlayer = TRUE;
  sp.sp_bUseFrags = FALSE;

  sp.sp_iScoreLimit = 0;
  sp.sp_iFragLimit  = 0; 
  sp.sp_iTimeLimit  = 0; 

  sp.sp_ctCredits     = -1;
  sp.sp_ctCreditsLeft = -1;
  sp.sp_tmSpawnInvulnerability = 3;

  sp.sp_bTeamPlay = FALSE;
  sp.sp_bFriendlyFire = FALSE;
  sp.sp_bWeaponsStay = FALSE;
  sp.sp_bPlayEntireGame = TRUE;

  sp.sp_bAmmoStays        = FALSE;
  sp.sp_bHealthArmorStays = FALSE;
  sp.sp_bAllowHealth = TRUE;
  sp.sp_bAllowArmor = TRUE;
  sp.sp_bInfiniteAmmo = gam_bInfiniteAmmo;
  sp.sp_bRespawnInPlace = TRUE;
  sp.sp_fExtraEnemyStrength = gam_fExtraEnemyStrength;
  sp.sp_fExtraEnemyStrengthPerPlayer = 0;

  sp.sp_iBlood = Clamp( gam_iBlood, 0, 3);
  sp.sp_bGibs  = gam_bGibs;
  sp.sp_bUseExtraEnemies = TRUE;

	// extra enemy stuff
  sp.sp_bExtraEnemiesPerPlayer = FALSE;
  sp.sp_iEnemyMax = gam_iEnemyMax;
  sp.sp_fGibLife = gam_fGibLife;

	// general game options
  sp.sp_bDamageSelf = gam_bDamageSelf;
  sp.sp_fSpeedAdjuster = gam_fSpeedAdjuster;
	sp.sp_bBackwardsGame = gam_bBackwardsGame;
	sp.sp_bControlRunning = FALSE;
	sp.sp_bControlFlying = FALSE;
  sp.sp_bUseBots = gam_bUseBots;
  sp.sp_iBotsPerPlayer = gam_iBotsPerPlayer;
  sp.sp_fBotSkill = gam_fBotSkill;
  sp.sp_iPostTGPLevel = gam_iPostTGPLevel;
  sp.sp_bSkipLuxor = gam_bSkipLuxor;
  sp.sp_bSkipSewers = gam_bSkipSewers;
	sp.sp_bRandomLevels = gam_bRandomLevels;
	sp.sp_bUsePEHealth = gam_bUsePEHealth;
	/*sp.sp_iMaxHealth = gam_iMaxHealth = 200;
	sp.sp_iTopHealth = gam_iTopHealth = 100;
	sp.sp_iMaxArmor = gam_iMaxArmor = 200;
	sp.sp_iTopArmo = gam_iTopArmor = 100;*/

	// weapons options
  sp.sp_bGiveAllWeapons = gam_bGiveAllWeapons;
  sp.sp_bMaskChainsaw = gam_bMaskChainsaw;
  sp.sp_bMaskColt = gam_bMaskColt;
  sp.sp_bMaskSingleShotgun = gam_bMaskSingleShotgun;
  sp.sp_bMaskSniper = gam_bMaskSniper;
  sp.sp_bMaskFlamer = gam_bMaskFlamer;
  sp.sp_bMaskTommyGun = gam_bMaskTommyGun;
  sp.sp_bMaskRocketLauncher = gam_bMaskRocketLauncher;
  sp.sp_bMaskGrenadeLauncher = gam_bMaskGrenadeLauncher;
  sp.sp_bMaskMiniGun = gam_bMaskMiniGun;
  sp.sp_bMaskLaser = gam_bMaskLaser;
  sp.sp_bMaskCannon = gam_bMaskCannon;
	sp.sp_bMaskTeleGun = gam_bMaskTeleGun;
  sp.sp_fWeaponsFireRate = gam_fWeaponsFireRate;
	sp.sp_fWeaponsDamage = gam_fWeaponsDamage;
	sp.sp_fProjectileSpeed = gam_fProjectileSpeed;

	// spawner battery options
	sp.sp_bTestSpawnerBatteries = gam_bTestSpawnerBatteries;

	sp.sp_iFPS = 60;
}

// set properties for a quick start session
void CGame::SetQuickStartSession(CSessionProperties &sp)
{
  gam_iStartDifficulty = gam_iQuickStartDifficulty;
  gam_iStartMode = gam_iQuickStartMode;

  // same as single player
  if (!gam_bQuickStartMP) {
    SetSinglePlayerSession(sp);
  } else {
    SetMultiPlayerSession(sp);
  }
  // quick start type
  sp.sp_bQuickTest = TRUE;

}

// set properties for a multiplayer session
void CGame::SetMultiPlayerSession(CSessionProperties &sp)
{
  // clear
  memset(&sp, 0, sizeof(sp));

	sp.sp_fEnemySpeedAdjuster = gam_fEnemySpeedAdjuster;

  sp.sp_iEnemyMultiplier = gam_iEnemyMultiplier;

  SetDifficultyParameters(sp);
  SetGameModeParameters(sp);
  sp.sp_ulSpawnFlags&=~SPF_SINGLEPLAYER;

	/*if (sp.sp_bMental) {
		sp.sp_fPlayerDamageAdjuster = gam_fPlayerDamageAdjuster*2.0f;
	} else {
		sp.sp_fPlayerDamageAdjuster = gam_fPlayerDamageAdjuster;
	}*/
	sp.sp_fPlayerDamageAdjuster = gam_fPlayerDamageAdjuster;

  sp.sp_bEndOfGame = FALSE;

  sp.sp_bQuickTest = FALSE;
  sp.sp_bCooperative = sp.sp_gmGameMode==CSessionProperties::GM_COOPERATIVE;
  sp.sp_bSinglePlayer = FALSE;
  sp.sp_bPlayEntireGame = gam_bPlayEntireGame;
  sp.sp_bUseFrags = sp.sp_gmGameMode==CSessionProperties::GM_FRAGMATCH;
  sp.sp_bWeaponsStay = gam_bWeaponsStay;
  sp.sp_bFriendlyFire = gam_bFriendlyFire;
  sp.sp_ctMaxPlayers = gam_ctMaxPlayers;
  sp.sp_bWaitAllPlayers = gam_bWaitAllPlayers;

  sp.sp_bAmmoStays        = TRUE;
  sp.sp_bHealthArmorStays = TRUE;
  sp.sp_bAllowHealth      = TRUE;
  sp.sp_bAllowArmor       = TRUE;
  sp.sp_bInfiniteAmmo     = TRUE;
  sp.sp_bRespawnInPlace   = TRUE;

  sp.sp_fManaTransferFactor = gam_fManaTransferFactor;
  sp.sp_fExtraEnemyStrength = gam_fExtraEnemyStrength;
  sp.sp_fExtraEnemyStrengthPerPlayer = gam_fExtraEnemyStrengthPerPlayer;
  sp.sp_iInitialMana = gam_iInitialMana;

  sp.sp_iBlood = Clamp( gam_iBlood, 0, 3);
  //sp.sp_bGibs  = gam_bGibs;
  sp.sp_tmSpawnInvulnerability = gam_tmSpawnInvulnerability;

  sp.sp_bUseExtraEnemies = TRUE;

	// extra enemy stuff
  sp.sp_bExtraEnemiesPerPlayer = gam_bExtraEnemiesPerPlayer;
  sp.sp_fExtraEnemiesPerPlayerRatio = gam_fExtraEnemiesPerPlayerRatio;
  sp.sp_iEnemyMax = gam_iEnemyMax;
  sp.sp_fGibLife = 1.0f;

	// general game options
  sp.sp_bDamageSelf = gam_bDamageSelf;
  sp.sp_fSpeedAdjuster = gam_fSpeedAdjuster;
	sp.sp_bControlRunning = gam_bControlRunning;
	sp.sp_bBackwardsGame = gam_bBackwardsGame;
	sp.sp_bUseBots = gam_bUseBots;
  sp.sp_iBotsPerPlayer = Clamp(gam_iBotsPerPlayer, 1, 6);
  sp.sp_fBotSkill = gam_fBotSkill;
  sp.sp_iPostTGPLevel = Clamp(gam_iPostTGPLevel, 0, 2);
  sp.sp_bSkipLuxor = gam_bSkipLuxor;
	sp.sp_bSkipSewers = gam_bSkipSewers;
	sp.sp_bRandomLevels = gam_bRandomLevels;
	sp.sp_bControlFlying = gam_bControlFlying;
	sp.sp_bUsePEHealth = gam_bUsePEHealth;

	// weapons options
  sp.sp_bGiveAllWeapons = gam_bGiveAllWeapons;
  sp.sp_bMaskChainsaw = gam_bMaskChainsaw;
  sp.sp_bMaskColt = gam_bMaskColt;
  sp.sp_bMaskSingleShotgun = gam_bMaskSingleShotgun;
  sp.sp_bMaskSniper = gam_bMaskSniper;
  sp.sp_bMaskFlamer = gam_bMaskFlamer;
  sp.sp_bMaskTommyGun = gam_bMaskTommyGun;
  sp.sp_bMaskRocketLauncher = gam_bMaskRocketLauncher;
  sp.sp_bMaskGrenadeLauncher = gam_bMaskGrenadeLauncher;
  sp.sp_bMaskMiniGun = gam_bMaskMiniGun;
  sp.sp_bMaskLaser = gam_bMaskLaser;
  sp.sp_bMaskCannon = gam_bMaskCannon;
	sp.sp_bMaskTeleGun = gam_bMaskTeleGun;
	sp.sp_fWeaponsFireRate = gam_fWeaponsFireRate;
	sp.sp_fWeaponsDamage = gam_fWeaponsDamage;
	sp.sp_fProjectileSpeed = gam_fProjectileSpeed;

	// spawner battery options
	sp.sp_bTestSpawnerBatteries = gam_bTestSpawnerBatteries;

  // set credits and limits
  if (sp.sp_bCooperative) {
    sp.sp_ctCredits     = gam_iCredits;
    sp.sp_ctCreditsLeft = gam_iCredits;
    sp.sp_iScoreLimit = 0;
    sp.sp_iFragLimit  = 0;
    sp.sp_iTimeLimit  = 0;
    sp.sp_bAllowHealth = TRUE;
    sp.sp_bAllowArmor  = TRUE;
    //sp.sp_bWeaponsStay = FALSE;
    //sp.sp_bAmmoStays = FALSE;
    //sp.sp_bHealthArmorStays = FALSE;
  } else {
    sp.sp_ctCredits     = -1;
    sp.sp_ctCreditsLeft = -1;
    sp.sp_iScoreLimit = gam_iScoreLimit;
    sp.sp_iFragLimit  = gam_iFragLimit;
    sp.sp_iTimeLimit  = gam_iTimeLimit;
    sp.sp_bWeaponsStay = FALSE;
    sp.sp_bAmmoStays = FALSE;
    sp.sp_bHealthArmorStays = FALSE;
		sp.sp_bUseBots = FALSE;
		sp.sp_bGibs  = TRUE;
    if (sp.sp_bUseFrags) {
      sp.sp_iScoreLimit = 0;
    } else {
      sp.sp_iFragLimit = 0;
    }
  }
	sp.sp_iFPS = 60;
}

BOOL IsMenuEnabled_(const CTString &strMenuName)
{
  if (strMenuName=="Single Player") {
    return TRUE;
  } else if (strMenuName=="Network"      ) {
    return TRUE;
  } else if (strMenuName=="Split Screen" ) {
    return TRUE;
  } else if (strMenuName=="High Score"   ) {
    return TRUE;
  } else if (strMenuName=="Training"   ) {
    return FALSE;
  } else if (strMenuName=="Technology Test") {
    return TRUE;
  } else {
    return TRUE;
  }
}
BOOL IsMenuEnabledCfunc(void* pArgs)
{
  CTString strMenuName = *NEXTARGUMENT(CTString*);
  return IsMenuEnabled_(strMenuName);
}

CTString GetGameTypeName(INDEX iMode)
{
  switch (iMode) {
  default:
    return "";
    break;
  case CSessionProperties::GM_COOPERATIVE:
    return TRANS("Cooperative");
    break;
  case CSessionProperties::GM_FLYOVER:
    return TRANS("Flyover");
    break;
  case CSessionProperties::GM_SCOREMATCH:
    return TRANS("Scorematch");
    break;
  case CSessionProperties::GM_FRAGMATCH:
    return TRANS("Fragmatch");
    break;
  }
}
CTString GetGameTypeNameCfunc(void* pArgs)
{
  INDEX iMode = NEXTARGUMENT(INDEX);
  return GetGameTypeName(iMode);
}
CTString GetCurrentGameTypeName()
{
  const CSessionProperties &sp = *GetSP();
  return GetGameTypeName(sp.sp_gmGameMode);
}

CTString GetGameAgentRulesInfo(void)
{
  CTString strOut;
  CTString strKey;
  const CSessionProperties &sp = *GetSP();

  CTString strDifficulty;
  if (sp.sp_bMental) {
    strDifficulty = TRANS("InSamnity!");
  } else {
    switch(sp.sp_gdGameDifficulty) {
    case CSessionProperties::GD_TOURIST:
      strDifficulty = TRANS("Tourist");
      break;
    case CSessionProperties::GD_EASY:
      strDifficulty = TRANS("Easy");
      break;
    default:
      ASSERT(FALSE);
    case CSessionProperties::GD_NORMAL:
      strDifficulty = TRANS("Normal");
      break;
    case CSessionProperties::GD_HARD:
      strDifficulty = TRANS("Hard");
      break;
    case CSessionProperties::GD_EXTREME:
      strDifficulty = TRANS("Serious");
      break;
    }
  }

  strKey.PrintF(";Difficulty;%s", (const char*)strDifficulty);
  strOut+=strKey;

  strKey.PrintF(";Extra Enemy Ratio;%dX", GetGameEnemyMultiplier());
  strOut+=strKey;

  strKey.PrintF(";weaponsstay;%d", sp.sp_bWeaponsStay?0:1);
  strOut+=strKey;

  strKey.PrintF(";ammostays;%d", sp.sp_bAmmoStays                   ?0:1);	strOut+=strKey;
  strKey.PrintF(";healthandarmorstays;%d", sp.sp_bHealthArmorStays  ?0:1);	strOut+=strKey;
  strKey.PrintF(";allowhealth;%d", sp.sp_bAllowHealth               ?0:1);	strOut+=strKey;
  strKey.PrintF(";allowarmor;%d", sp.sp_bAllowArmor                 ?0:1);	strOut+=strKey;
  strKey.PrintF(";infiniteammo;%d", sp.sp_bInfiniteAmmo             ?0:1);	strOut+=strKey;
  strKey.PrintF(";respawninplace;%d", sp.sp_bRespawnInPlace         ?0:1);	strOut+=strKey;

  if (sp.sp_bFriendlyFire) {
    strKey.PrintF(";Friendly Fire;Is On");
		strOut+=strKey;
  } else {
    strKey.PrintF(";Friendly Fire;Is Off");
		strOut+=strKey;
  }

  strOut+=gam_strGameAgentExtras;
  return strOut;
}

ULONG GetSpawnFlagsForGameType(INDEX iGameType)
{
  switch(iGameType) {
  default:
    ASSERT(FALSE);
  case CSessionProperties::GM_COOPERATIVE:  return SPF_COOPERATIVE;
  case CSessionProperties::GM_SCOREMATCH:   return SPF_DEATHMATCH;
  case CSessionProperties::GM_FRAGMATCH:    return SPF_DEATHMATCH;
  };
}
ULONG GetSpawnFlagsForGameTypeCfunc(void* pArgs)
{
  INDEX iGameType = NEXTARGUMENT(INDEX);
  return GetSpawnFlagsForGameType(iGameType);
}

/*void CGame::SetFPS(void)
{
	//CSessionProperties *sp = (CSessionProperties *)_pNetwork->GetSessionProperties();
	sp->sp_iFPS = gam_iFPS;
}*/

