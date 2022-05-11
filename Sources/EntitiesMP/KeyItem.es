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

805
%{
#include "EntitiesMP/StdH/StdH.h"
#include "Models/Items/ItemHolder/ItemHolder.h"
%}

uses "EntitiesMP/Item";

// key type 
enum KeyItemType {
  0 KIT_BOOKOFWISDOM      "Book of wisdom",
  1 KIT_CROSSWOODEN       "Wooden cross",
  2 KIT_CROSSMETAL        "Silver cross",
  3 KIT_CROSSGOLD         "Gold cross",
  4 KIT_JAGUARGOLDDUMMY   "Gold jaguar",
  5 KIT_HAWKWINGS01DUMMY  "Hawk wings - part 1",
  6 KIT_HAWKWINGS02DUMMY  "Hawk wings - part 2",
  7 KIT_HOLYGRAIL         "Holy grail",
  8 KIT_TABLESDUMMY       "Tablet of wisdom",
  9 KIT_WINGEDLION        "Winged lion",
 10 KIT_ELEPHANTGOLD      "Gold elephant",
 11 KIT_STATUEHEAD01      "Seriously scary ceremonial mask",
 12 KIT_STATUEHEAD02      "Hilariously happy ceremonial mask",
 13 KIT_STATUEHEAD03      "Ix Chel mask",
 14 KIT_KINGSTATUE        "Statue of King Tilmun",
 15 KIT_CRYSTALSKULL      "Crystal Skull",
 // FE Keys
 16 KIT_ANKHWOOD          "Wooden ankh",
 17 KIT_ANKHROCK          "Stone ankh",
 18 KIT_ANKHGOLD          "Gold ankh",
 19 KIT_AMONGOLD          "Gold amon",
 20 KIT_ANKHGOLDDUMMY     "Gold ankh dummy key",
 21 KIT_ELEMENTEARTH      "Element - Earth",
 22 KIT_ELEMENTWATER      "Element - Water",
 23 KIT_ELEMENTAIR        "Element - Air",
 24 KIT_ELEMENTFIRE       "Element - Fire",
 25 KIT_RAKEY             "Ra Key",
 26 KIT_MOONKEY           "Moon Key",
 27 KIT_EYEOFRA           "Eye of Ra",
 28 KIT_SCARAB            "Scarab",
 29 KIT_COBRA             "Cobra",
 30 KIT_SCARABDUMMY       "Scarab dummy",
 31 KIT_HEART             "Gold Heart",
 32 KIT_FEATHER           "Feather of Truth",
 33 KIT_SPHINX1           "Sphinx 1",
 34 KIT_SPHINX2           "Sphinx 2",
};

// event for sending through receive item
event EKey {
  enum KeyItemType kitType,
};

%{
const char *GetKeyName(int /*enum KeyItemType*/ _kit)
{
  enum KeyItemType kit = (KeyItemType) _kit;

  switch(kit) {
  case KIT_BOOKOFWISDOM     :  return TRANS("Book of wisdom"); break;
  case KIT_CROSSWOODEN      :  return TRANS("Wooden cross"); break;
  case KIT_CROSSGOLD        :  return TRANS("Gold cross"); break;
  case KIT_CROSSMETAL       :  return TRANS("Silver cross"); break;
  case KIT_JAGUARGOLDDUMMY  :  return TRANS("Gold jaguar"); break;
  case KIT_HAWKWINGS01DUMMY :  return TRANS("Hawk wings - part 1"); break;
  case KIT_HAWKWINGS02DUMMY :  return TRANS("Hawk wings - part 2"); break;
  case KIT_HOLYGRAIL        :  return TRANS("Holy grail"); break;
  case KIT_TABLESDUMMY      :  return TRANS("Tablet of wisdom"); break;
  case KIT_WINGEDLION       :  return TRANS("Winged lion"); break;
  case KIT_ELEPHANTGOLD     :  return TRANS("Gold elephant"); break;    
  case KIT_STATUEHEAD01     :  return TRANS("Seriously scary ceremonial mask"); break;
  case KIT_STATUEHEAD02     :  return TRANS("Hilariously happy ceremonial mask"); break;
  case KIT_STATUEHEAD03     :  return TRANS("Ix Chel mask"); break;   
  case KIT_KINGSTATUE       :  return TRANS("Statue of King Tilmun"); break;   
  case KIT_CRYSTALSKULL     :  return TRANS("Crystal Skull"); break;
  // FE Keys
  case KIT_ANKHWOOD :       return TRANS("Wooden ankh"); break;
  case KIT_ANKHROCK:        return TRANS("Stone ankh"); break;
  case KIT_ANKHGOLD :
  case KIT_ANKHGOLDDUMMY :  return TRANS("Gold ankh"); break;
  case KIT_AMONGOLD :       return TRANS("Gold Amon statue"); break;
  case KIT_ELEMENTEARTH  :  return TRANS("Earth element"); break;
  case KIT_ELEMENTWATER  :  return TRANS("Water element"); break;
  case KIT_ELEMENTAIR    :  return TRANS("Air element"); break;
  case KIT_ELEMENTFIRE   :  return TRANS("Fire element"); break;
  case KIT_RAKEY         :  return TRANS("Ra key"); break;
  case KIT_MOONKEY       :  return TRANS("Moon key"); break;
  case KIT_EYEOFRA       :  return TRANS("Eye of Ra"); break;
  case KIT_SCARAB        :
  case KIT_SCARABDUMMY   :  return TRANS("Scarab"); break;
  case KIT_COBRA         :  return TRANS("Cobra"); break;
  case KIT_HEART         :  return TRANS("Gold Heart"); break;
  case KIT_FEATHER       :  return TRANS("Feather of Truth"); break;
  case KIT_SPHINX1       :
  case KIT_SPHINX2       :  return TRANS("Gold Sphinx"); break;
  default: return TRANS("unknown item"); break;
  };
}

%}

class CKeyItem : CItem {
name      "KeyItem";
thumbnail "Thumbnails\\KeyItem.tbn";
features  "IsImportant";

properties:

  1 enum KeyItemType m_kitType    "Type" 'Y' = KIT_BOOKOFWISDOM, // key type
  3 INDEX m_iSoundComponent = 0,
  5 FLOAT m_fSize "Size" = 1.0f,

	10 BOOL  m_bCreateTouchBox = FALSE,

components:

  0 class   CLASS_BASE        "Classes\\Item.ecl",

// ********* ANKH KEY *********
  1 model   MODEL_BOOKOFWISDOM      "ModelsMP\\Items\\Keys\\BookOfWisdom\\Book.mdl",
  2 texture TEXTURE_BOOKOFWISDOM    "ModelsMP\\Items\\Keys\\BookOfWisdom\\Book.tex",
  5 model   MODEL_CROSSWOODEN       "ModelsMP\\Items\\Keys\\Cross\\Cross.mdl",
  6 texture TEXTURE_CROSSWOODEN     "ModelsMP\\Items\\Keys\\Cross\\CrossWooden.tex",  
  7 model   MODEL_CROSSMETAL        "ModelsMP\\Items\\Keys\\Cross\\Cross.mdl",
  8 texture TEXTURE_CROSSMETAL      "ModelsMP\\Items\\Keys\\Cross\\CrossMetal.tex",
 10 model   MODEL_CROSSGOLD         "ModelsMP\\Items\\Keys\\GoldCross\\Cross.mdl",
 11 texture TEXTURE_CROSSGOLD       "ModelsMP\\Items\\Keys\\GoldCross\\Cross.tex",
 15 model   MODEL_JAGUARGOLD        "ModelsMP\\Items\\Keys\\GoldJaguar\\Jaguar.mdl",
 20 model   MODEL_HAWKWINGS01       "ModelsMP\\Items\\Keys\\HawkWings\\WingRight.mdl",
 21 model   MODEL_HAWKWINGS02       "ModelsMP\\Items\\Keys\\HawkWings\\WingLeft.mdl",
 22 texture TEXTURE_HAWKWINGS       "ModelsMP\\Items\\Keys\\HawkWings\\Wings.tex",
 30 model   MODEL_HOLYGRAIL         "ModelsMP\\Items\\Keys\\HolyGrail\\Grail.mdl",
 31 texture TEXTURE_HOLYGRAIL       "ModelsMP\\Items\\Keys\\HolyGrail\\Grail.tex",
 35 model   MODEL_TABLESOFWISDOM    "ModelsMP\\Items\\Keys\\TablesOfWisdom\\Tables.mdl",
 36 texture TEXTURE_TABLESOFWISDOM  "ModelsMP\\Items\\Keys\\TablesOfWisdom\\Tables.tex",
 40 model   MODEL_WINGEDLION        "ModelsMP\\Items\\Keys\\WingLion\\WingLion.mdl", 
 45 model   MODEL_ELEPHANTGOLD      "ModelsMP\\Items\\Keys\\GoldElephant\\Elephant.mdl",
 50 model   MODEL_STATUEHEAD01      "ModelsMP\\Items\\Keys\\Statue01\\Statue.mdl",
 51 texture TEXTURE_STATUEHEAD01    "ModelsMP\\Items\\Keys\\Statue01\\Statue.tex",
 52 model   MODEL_STATUEHEAD02      "ModelsMP\\Items\\Keys\\Statue02\\Statue.mdl",
 53 texture TEXTURE_STATUEHEAD02    "ModelsMP\\Items\\Keys\\Statue02\\Statue.tex",
 54 model   MODEL_STATUEHEAD03      "ModelsMP\\Items\\Keys\\Statue03\\Statue.mdl",
 55 texture TEXTURE_STATUEHEAD03    "ModelsMP\\Items\\Keys\\Statue03\\Statue.tex",
 58 model   MODEL_KINGSTATUE        "ModelsMP\\Items\\Keys\\ManStatue\\Statue.mdl", 
 60 model   MODEL_CRYSTALSKULL      "ModelsMP\\Items\\Keys\\CrystalSkull\\Skull.mdl",
 61 texture TEXTURE_CRYSTALSKULL    "ModelsMP\\Items\\Keys\\CrystalSkull\\Skull.tex",

 // ********* FE KEYS ********
 101 model   MODEL_ANKHWOOD					"Models\\Items\\Keys\\AnkhWood\\Ankh.mdl",
 102 texture TEXTURE_ANKHWOOD				"Models\\Ages\\Egypt\\Vehicles\\BigBoat\\OldWood.tex",
 103 model   MODEL_ANKHROCK					"Models\\Items\\Keys\\AnkhStone\\Ankh.mdl",
 104 texture TEXTURE_ANKHROCK				"Models\\Items\\Keys\\AnkhStone\\Stone.tex",
 105 model   MODEL_ANKHGOLD					"Models\\Items\\Keys\\AnkhGold\\Ankh.mdl",
 106 texture TEXTURE_ANKHGOLD				"Models\\Items\\Keys\\AnkhGold\\Ankh.tex",
 107 model   MODEL_AMONGOLD					"Models\\Ages\\Egypt\\Gods\\Amon\\AmonGold.mdl",
 108 texture TEXTURE_AMONGOLD				"Models\\Ages\\Egypt\\Gods\\Amon\\AmonGold.tex",
 110 model   MODEL_ELEMENTAIR				"Models\\Items\\Keys\\Elements\\Air.mdl",
 111 texture TEXTURE_ELEMENTAIR			"Models\\Items\\Keys\\Elements\\Air.tex",
 120 model   MODEL_ELEMENTWATER			"Models\\Items\\Keys\\Elements\\Water.mdl",
 121 texture TEXTURE_ELEMENTWATER		"Models\\Items\\Keys\\Elements\\Water.tex",
 130 model   MODEL_ELEMENTFIRE			"Models\\Items\\Keys\\Elements\\Fire.mdl",
 131 texture TEXTURE_ELEMENTFIRE		"Models\\Items\\Keys\\Elements\\Fire.tex",
 140 model   MODEL_ELEMENTEARTH			"Models\\Items\\Keys\\Elements\\Earth.mdl",
 141 texture TEXTURE_ELEMENTEARTH		"Models\\Items\\Keys\\Elements\\Texture.tex",
 150 model   MODEL_RAKEY						"Models\\Items\\Keys\\RaKey\\Key.mdl",
 151 texture TEXTURE_RAKEY					"Models\\Items\\Keys\\RaKey\\Key.tex",
 160 model   MODEL_MOONKEY					"Models\\Items\\Keys\\RaSign\\Sign.mdl",
 161 texture TEXTURE_MOONKEY				"Models\\Items\\Keys\\RaSign\\Sign.tex",
 170 model   MODEL_EYEOFRA					"Models\\Items\\Keys\\EyeOfRa\\EyeOfRa.mdl",
 171 texture TEXTURE_EYEOFRA				"Models\\Items\\Keys\\EyeOfRa\\EyeOfRa.tex",
 180 model   MODEL_SCARAB						"Models\\Items\\Keys\\Scarab\\Scarab.mdl",
 181 texture TEXTURE_SCARAB					"Models\\Items\\Keys\\Scarab\\Scarab.tex",
 190 model   MODEL_COBRA						"Models\\Items\\Keys\\Uaset\\Uaset.mdl",
 191 texture TEXTURE_COBRA					"Models\\Items\\Keys\\Uaset\\Uaset.tex",
 192 model   MODEL_FEATHER					"Models\\Items\\Keys\\Luxor\\FeatherOfTruth.mdl",
 193 texture TEXTURE_FEATHER				"Models\\Items\\Keys\\Luxor\\FeatherOfTruth.tex",
 194 model   MODEL_HEART						"Models\\Items\\Keys\\Luxor\\GoldHeart.mdl",
 195 texture TEXTURE_HEART					"Models\\Items\\Keys\\Luxor\\GoldHeart.tex",
 196 model   MODEL_SPHINXGOLD				"Models\\Items\\Keys\\GoldSphinx\\GoldSphinx.mdl",
 197 texture TEXTURE_SPHINXGOLD			"Models\\Items\\Keys\\GoldSphinx\\Sphinx.tex",

 // ********* MISC *********
 250 texture TEXTURE_FLARE					"ModelsMP\\Items\\Flares\\Flare.tex",
 251 model   MODEL_FLARE						"ModelsMP\\Items\\Flares\\Flare.mdl",
 252 texture TEX_REFL_GOLD01				"ModelsMP\\ReflectionTextures\\Gold01.tex",
 253 texture TEX_REFL_METAL01				"ModelsMP\\ReflectionTextures\\LightMetal01.tex",
 254 texture TEX_SPEC_MEDIUM				"ModelsMP\\SpecularTextures\\Medium.tex",
 255 texture TEX_SPEC_STRONG				"ModelsMP\\SpecularTextures\\Strong.tex",

 // ************** SOUNDS **************
 300 sound   SOUND_KEY							"Sounds\\Items\\Key.wav",

functions:

  void Precache(void) {
    PrecacheSound(SOUND_KEY);
    PrecacheModel(MODEL_FLARE);
    PrecacheTexture(TEXTURE_FLARE);
    PrecacheModel(MODEL_FEATHER);
    PrecacheTexture(TEXTURE_FEATHER);
    PrecacheModel(MODEL_EYEOFRA);
    PrecacheTexture(TEXTURE_EYEOFRA);
    PrecacheModel(MODEL_SCARAB);
    PrecacheTexture(TEXTURE_SCARAB);
    PrecacheModel(MODEL_ANKHGOLD);
    PrecacheTexture(TEXTURE_ANKHGOLD);
    PrecacheModel(MODEL_HEART);
    PrecacheTexture(TEXTURE_HEART);
    PrecacheModel(MODEL_ANKHROCK);
    PrecacheTexture(TEXTURE_ANKHROCK);
    PrecacheModel(MODEL_AMONGOLD);
    PrecacheModel(MODEL_KINGSTATUE);
    PrecacheTexture(TEXTURE_AMONGOLD);
    PrecacheTexture(TEX_REFL_GOLD01);
    PrecacheTexture(TEX_SPEC_MEDIUM);
    PrecacheTexture(TEX_REFL_METAL01);
  }

  /* Fill in entity statistics - for AI purposes only */
  BOOL FillEntityStatistics(EntityStats *pes)
  {
    pes->es_strName = GetKeyName(m_kitType);
    pes->es_ctCount = 1;
    pes->es_ctAmmount = 1;
    pes->es_fValue = 1;
    pes->es_iScore = 0;//m_iScore;
    return TRUE;
  }
  
  // render particles
  void RenderParticles(void) {
    // no particles when not existing
    if (GetRenderType()!=CEntity::RT_MODEL || !ShowItemParticles()) {
      return;
    }
    switch (m_kitType) {
      case KIT_ANKHWOOD:
      case KIT_ANKHROCK:
      case KIT_ANKHGOLD:
      case KIT_ANKHGOLDDUMMY:
        Particles_Stardust(this, 0.9f, 0.70f, PT_STAR08, 32);
        break;
      case KIT_AMONGOLD:
        Particles_Stardust(this, 1.6f, 1.00f, PT_STAR08, 32);
        break;
      case KIT_BOOKOFWISDOM    :
      case KIT_CRYSTALSKULL    :   
      case KIT_HOLYGRAIL       :
        Particles_Stardust(this, 1.0f, 0.5f, PT_STAR08, 64);
        break;
      case KIT_JAGUARGOLDDUMMY :
        Particles_Stardust(this, 2.0f, 2.0f, PT_STAR08, 64);
        break;
      case KIT_CROSSWOODEN     :
      case KIT_CROSSMETAL      :   
      case KIT_CROSSGOLD       :      
      case KIT_HAWKWINGS01DUMMY:
      case KIT_HAWKWINGS02DUMMY:
      case KIT_TABLESDUMMY     :
      case KIT_WINGEDLION      :
      case KIT_ELEPHANTGOLD    :
      case KIT_STATUEHEAD01    :
      case KIT_STATUEHEAD02    :
      case KIT_STATUEHEAD03    :
      case KIT_KINGSTATUE      :
      default:
      Particles_Stardust(this, 1.5f, 1.1f, PT_STAR08, 64);
      break;    
    }
  }
  
  void SetMods(void) 
	{
    FLOAT fX = GetPlacement().pl_PositionVector(1);
    CTString strLevelName = _pNetwork->ga_fnmWorld.FileName();

    if (strLevelName=="02_SandCanyon") {
      m_kitType = KIT_ELEMENTAIR;
    } else if (strLevelName=="03_TombOfRamses") {
      m_kitType = KIT_ELEMENTEARTH;
    } else if (strLevelName=="04_ValleyOfTheKings") {
      if (fX==-32.0f) {
        m_kitType = KIT_ANKHGOLD;
      } else if (fX==-224.0f) {
        m_kitType = KIT_ELEMENTFIRE;
      } else if (fX>-70 && fX<-68) {
        m_kitType = KIT_ANKHROCK;
      }
    } else if (strLevelName=="06_Oasis") {
      m_kitType = KIT_ELEMENTWATER;
		} else if (strLevelName=="10_Metropolis") {
      if (fX<400) {
        m_kitType = KIT_SCARABDUMMY;
      } else {
        m_kitType = KIT_EYEOFRA;
      }
		} else if (strLevelName=="12_Karnak") {
      if (fX==481.0f) {
        m_kitType = KIT_ANKHGOLD;
      } else {
        m_kitType = KIT_KINGSTATUE;
      }
    } else if (strLevelName=="13_Luxor") {
			if (fX==98.0f) {
				m_kitType = KIT_FEATHER;
			} else if (fX==76.0f) {
				m_kitType = KIT_HEART;
			} else if (fX<50) {
				m_kitType = KIT_ANKHGOLDDUMMY;
			}
    } else if (strLevelName=="14_SacredYards") {
      if (fX==382.0f) {
        m_kitType = KIT_SPHINX1;
      } else {
        m_kitType = KIT_SPHINX2;
      }
    } else if (strLevelName=="15_TheGreatPyramid") {
      m_kitType = KIT_RAKEY;
    } else if (strLevelName=="Triphon") {
      if (fX==-208.0f) {
        m_kitType = KIT_SCARAB;
      } else if (fX==398.0f) {
        m_kitType = KIT_ANKHROCK;
      } else if (fX==280.0f) {
        m_kitType = KIT_SPHINX1;
      }
    } else if (strLevelName=="new") {
      m_kitType = KIT_ELEMENTAIR;
    } else if (strLevelName=="Final Fight") {
      if (fX==-13.0f) {
        m_kitType = KIT_ANKHGOLD;
      } else if (fX==-28.5f) {
        m_kitType = KIT_ANKHROCK;
      }
    } else if (strLevelName=="KarnakDemo") {
      if (fX==481.0f) {
        m_kitType = KIT_ANKHGOLD;
      } else if (fX==320.0f) {
        m_kitType = KIT_KINGSTATUE;
      }
    } else if (strLevelName=="Return To Moon Mountains 1") {
      if (fX==-354.5f) {
        m_kitType = KIT_EYEOFRA;
      } else if (fX==-380.0f) {
        m_kitType = KIT_EYEOFRA;
      } else if (fX==194.0f) {
        m_kitType = KIT_SCARAB;
      }
    }

    m_strDescription = GetKeyName(m_kitType);
		m_fSize = 1.0f;
		m_iSoundComponent = SOUND_KEY;

    //CPrintF("%s, %s\n", m_strName, GetKeyName(m_kitType));
    //CPrintF("X: %g\n", fX);
  }

  // set health properties depending on type
  void SetProperties(void)
  {
    m_fRespawnTime = (m_fCustomRespawnTime>0) ? m_fCustomRespawnTime : 10.0f; 
    m_strDescription = GetKeyName(m_kitType);

    switch (m_kitType) {
      case KIT_BOOKOFWISDOM:
        // set appearance
        AddItem(MODEL_BOOKOFWISDOM, TEXTURE_BOOKOFWISDOM , 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_CROSSWOODEN:
        // set appearance
        AddItem(MODEL_CROSSWOODEN, TEXTURE_CROSSWOODEN, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_CROSSMETAL:
        // set appearance
        AddItem(MODEL_CROSSMETAL, TEXTURE_CROSSMETAL, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_CROSSGOLD:
        // set appearance
        AddItem(MODEL_CROSSGOLD, TEXTURE_CROSSGOLD, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_JAGUARGOLDDUMMY:
        // set appearance
        AddItem(MODEL_JAGUARGOLD, TEX_REFL_GOLD01, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.5f,0), FLOAT3D(2,2,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_HAWKWINGS01DUMMY:
        // set appearance
        AddItem(MODEL_HAWKWINGS01, TEXTURE_HAWKWINGS, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_HAWKWINGS02DUMMY:
        // set appearance
        AddItem(MODEL_HAWKWINGS02, TEXTURE_HAWKWINGS, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_HOLYGRAIL:
        // set appearance
        AddItem(MODEL_HOLYGRAIL, TEXTURE_HOLYGRAIL, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_TABLESDUMMY:
        // set appearance
        AddItem(MODEL_TABLESOFWISDOM, TEXTURE_TABLESOFWISDOM, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_WINGEDLION:
        // set appearance
        AddItem(MODEL_WINGEDLION, TEX_REFL_GOLD01, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEPHANTGOLD:
        // set appearance
        AddItem(MODEL_ELEPHANTGOLD, TEX_REFL_GOLD01, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.5f,0), FLOAT3D(2,2,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;      
      case KIT_STATUEHEAD01:
        // set appearance
        AddItem(MODEL_STATUEHEAD01, TEXTURE_STATUEHEAD01, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_STATUEHEAD02:
        // set appearance
        AddItem(MODEL_STATUEHEAD02, TEXTURE_STATUEHEAD02, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;      
      case KIT_STATUEHEAD03:
        // set appearance
        AddItem(MODEL_STATUEHEAD03, TEXTURE_STATUEHEAD03, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_KINGSTATUE:
        // set appearance
        AddItem(MODEL_KINGSTATUE, TEX_REFL_GOLD01, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_CRYSTALSKULL:
        // set appearance
        AddItem(MODEL_CRYSTALSKULL, TEXTURE_CRYSTALSKULL, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      // FE Keys
      case KIT_ANKHWOOD:
        // set appearance
        AddItem(MODEL_ANKHWOOD, TEXTURE_ANKHWOOD, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ANKHROCK:
        // set appearance
        AddItem(MODEL_ANKHROCK, TEXTURE_ANKHROCK, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ANKHGOLD:
      case KIT_ANKHGOLDDUMMY:
        // set appearance
        AddItem(MODEL_ANKHGOLD, TEXTURE_ANKHGOLD, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_SPHINX1:
      case KIT_SPHINX2:
        // set appearance
        AddItem(MODEL_SPHINXGOLD, TEXTURE_SPHINXGOLD, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(2.0f, 2.0f, 2.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_AMONGOLD:
        // set appearance
        AddItem(MODEL_AMONGOLD, TEXTURE_AMONGOLD, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.5f,0), FLOAT3D(2,2,0.3f) );
        StretchItem(FLOAT3D(2.0f, 2.0f, 2.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEMENTEARTH:
        // set appearance
        AddItem(MODEL_ELEMENTEARTH, TEXTURE_ELEMENTEARTH, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEMENTAIR:
        // set appearance
        AddItem(MODEL_ELEMENTAIR, TEXTURE_ELEMENTAIR, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEMENTWATER:
        // set appearance
        AddItem(MODEL_ELEMENTWATER, TEXTURE_ELEMENTWATER, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_ELEMENTFIRE:
        // set appearance
        AddItem(MODEL_ELEMENTFIRE, TEXTURE_ELEMENTFIRE, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;  
      case KIT_RAKEY:
        // set appearance
        AddItem(MODEL_RAKEY, TEXTURE_RAKEY, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_MOONKEY:
        // set appearance
        AddItem(MODEL_MOONKEY, TEXTURE_MOONKEY, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_EYEOFRA:
        // set appearance
        AddItem(MODEL_EYEOFRA, TEXTURE_EYEOFRA, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_SCARAB:
      case KIT_SCARABDUMMY:
        // set appearance
        AddItem(MODEL_SCARAB, TEXTURE_SCARAB, TEX_REFL_METAL01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_COBRA:
        // set appearance
        AddItem(MODEL_COBRA, TEXTURE_COBRA, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_FEATHER:
        // set appearance
        AddItem(MODEL_FEATHER, TEXTURE_FEATHER, 0, 0, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
      case KIT_HEART:
        // set appearance
        AddItem(MODEL_HEART, TEXTURE_HEART, TEX_REFL_GOLD01, TEX_SPEC_MEDIUM, 0);
        // add flare
        AddFlare(MODEL_FLARE, TEXTURE_FLARE, FLOAT3D(0,0.2f,0), FLOAT3D(1,1,0.3f) );
        StretchItem(FLOAT3D(1.0f, 1.0f, 1.0f));
        m_iSoundComponent = SOUND_KEY;
        break;
    }
    GetModelObject()->StretchModel(FLOAT3D(m_fSize, m_fSize, m_fSize));
		ModelChangeNotify();
  };

procedures:

  ItemCollected(EPass epass) : CItem::ItemCollected {
    ASSERT(epass.penOther!=NULL);

    if (IsOfClass(epass.penOther, "PlayerBot")) {
      return;
    }

    // if in cooperative, print key received message
    if (GetSP()->sp_bCooperative && m_bCanBeenPicked) {
			if (IsOfClass(epass.penOther, "Player")) {
				CTString strKey = GetKeyName(m_kitType);
				CPrintF(TRANS("^cFF0000%s - %s^r\n"), ((CPlayer &)*epass.penOther).GetPlayerName(), strKey);
			}
		}

    m_bCanBeenPicked = FALSE;

    // send key to entity
    EKey eKey;
    eKey.kitType = m_kitType;
    // if health is received
    if (epass.penOther->ReceiveItem(eKey)) {
      if(_pNetwork->IsPlayerLocal(epass.penOther)) {IFeel_PlayEffect("PU_Key");}
      // play the pickup sound
      m_soPick.Set3DParameters(50.0f, 1.0f, 1.0f, 1.0f);
      PlaySound(m_soPick, m_iSoundComponent, SOF_3D);
      m_fPickSoundLen = GetSoundLength(m_iSoundComponent);
      jump CItem::ItemReceived();
    }
    return;
  };

  Main() {
		//CPrintF("> Key Item Main\n");
    Initialize();     // initialize base class
    StartModelAnim(ITEMHOLDER_ANIM_SMALLOSCILATION, AOF_LOOPING|AOF_NORESTART);
    ForceCollisionBoxIndexChange(ITEMHOLDER_COLLISION_BOX_BIG);
		// fix the FE keys
		//SetMods();
    SetProperties();  // set properties

    jump CItem::ItemLoop();
  };
};
