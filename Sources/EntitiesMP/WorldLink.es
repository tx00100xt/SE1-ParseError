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

214
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/EnemySpawner.h"
#include "EntitiesMP/Trigger.h"
%}

uses "EntitiesMP/Marker";

// world link
enum WorldLinkType {
  1 WLT_FIXED     "Fixed",      // fixed link
  2 WLT_RELATIVE  "Relative",   // relative link
};

class CWorldLink : CMarker {
name      "World link";
thumbnail "Thumbnails\\WorldLink.tbn";
features "IsImportant";

properties:
  1 CTString m_strGroup           "Group" 'G' = "",
  2 CTFileNameNoDep m_strWorld    "World" 'W' = "",
  3 BOOL m_bStoreWorld            "Store world" 'S' = FALSE,
  4 enum WorldLinkType m_EwltType "Type" 'Y' = WLT_RELATIVE,
	5 INDEX iStupidityCount = 0,
	//6 CTString strLevelName = "",

components:
  1 model   MODEL_WORLDLINK     "Models\\Editor\\WorldLink.mdl",
  2 texture TEXTURE_WORLDLINK   "Models\\Editor\\WorldLink.tex"


functions:
/************************************************************
 *                      START EVENT                         *
 ************************************************************/
  BOOL HandleEvent(const CEntityEvent &ee) {
    if (ee.ee_slEvent == EVENTCODE_ETrigger) {
			iStupidityCount++;
      ETrigger &eTrigger = (ETrigger &)ee;
      _SwcWorldChange.strGroup = m_strGroup;      // group name
      _SwcWorldChange.plLink = GetPlacement();    // link placement
      _SwcWorldChange.iType = (INDEX)m_EwltType;  // type	
			
			if (iStupidityCount==1) { 
				SetMods();
			}
      _pNetwork->ChangeLevel(m_strWorld, m_bStoreWorld, 0);
      return TRUE;
    }
    return FALSE;
  };

	void SetMods(void)
	{
		CTString strLevelName = _pNetwork->ga_fnmWorld.FileName();

		if ( GetSP()->sp_bBackwardsGame ) {
			if ( strLevelName == "3_2_LandOfDamned" ) {
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\3_1_GothicCastle.wld");
			} else if ( strLevelName == "3_1_GothicCastle" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\2_4_TowerOfBabylon.wld");
			} else if ( strLevelName == "2_4_TowerOfBabylon" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\2_3_Persepolis.wld");
			} else if ( strLevelName == "2_3_Persepolis" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\2_2_Persepolis.wld");
			} else if ( strLevelName == "2_2_Persepolis" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\2_1_Ziggurrat.wld");
			} else if ( strLevelName == "2_1_Ziggurrat" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\1_5_Teotihuacan.wld");
			} else if ( strLevelName == "1_5_Teotihuacan" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\1_4_Teotihuacan.wld");
			} else if ( strLevelName == "1_4_Teotihuacan" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\1_3_Teotihuacan.wld");
			} else if ( strLevelName == "1_3_Teotihuacan" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\1_2_Palenque.wld");
			} else if ( strLevelName == "1_2_Palenque" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\1_1_Palenque.wld");
			} else if ( strLevelName == "1_1_Palenque" ) { 
				m_strWorld = CTFILENAME("Levels\\LevelsMP\\3_3_CorridorOfDeath.wld");
			// FE
			} else if (strLevelName=="13_Luxor") {
				m_strWorld = CTFILENAME("Levels\\12_Karnak.wld");
			} else if (strLevelName=="12_Karnak") { 
				m_strWorld = CTFILENAME("Levels\\11_AlleyOfSphinxes.wld");
			} else if (strLevelName=="11_AlleyOfSphinxes") {
				m_strWorld = CTFILENAME("Levels\\10_Metropolis.wld");
			} else if (strLevelName=="10_Metropolis") {
				m_strWorld = CTFILENAME("Levels\\09_Sewers.wld");
			} else if (strLevelName=="09_Sewers") {
				m_strWorld = CTFILENAME("Levels\\08_Suburbs.wld");
			} else if (strLevelName=="08_Suburbs") {
				m_strWorld = CTFILENAME("Levels\\07_Dunes.wld");
			} else if (strLevelName=="07_Dunes") {
				m_strWorld = CTFILENAME("Levels\\06_Oasis.wld");
			} else if (strLevelName=="06_Oasis") {
				m_strWorld = CTFILENAME("Levels\\04_ValleyOfTheKings.wld");
			} else if (strLevelName=="04_ValleyOfTheKings") {
				m_strWorld = CTFILENAME("Levels\\03_TombOfRamses.wld");
			} else if (strLevelName=="03_TombOfRamses") {
				m_strWorld = CTFILENAME("Levels\\02_SandCanyon.wld");
			} else if (strLevelName=="02_SandCanyon") {
				m_strWorld = CTFILENAME("Levels\\01_Hatshepsut.wld");
			} else if (strLevelName=="01_Hatshepsut") {
				m_strWorld = CTFILENAME("Levels\\15_TheGreatPyramid.wld");
			} else {
				m_strWorld = m_strWorld;
			}
		}

		if (GetSP()->sp_bSkipLuxor && !GetSP()->sp_bBackwardsGame && strLevelName=="12_Karnak") {
			m_strWorld = CTFILENAME("Levels\\15_TheGreatPyramid.wld");
		}
		if (GetSP()->sp_bSkipSewers && !GetSP()->sp_bBackwardsGame && strLevelName=="08_Suburbs") {
			m_strWorld = CTFILENAME("Levels\\10_Metropolis.wld");
		}
		CPrintF("LevelChange: %s\n",(const char *) m_strWorld); 
	};

procedures:
/************************************************************
 *                       M  A  I  N                         *
 ************************************************************/
  Main(EVoid) {
    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // set appearance
    SetModel(MODEL_WORLDLINK);
    SetModelMainTexture(TEXTURE_WORLDLINK);

    // set name
    m_strName.PrintF("World link - %s", (const char *) m_strGroup);

    return;
  }
};
