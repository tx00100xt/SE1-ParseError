3132
%{
#include "EntitiesMP/StdH/StdH.h"
%}

uses "EntitiesMP/AreaMarker";

enum BotActionType {
  0 BAT_RUN_CLOSEST     "Run to Closest",
  1 BAT_RUN_IMPORTANT   "Run to Most Important",
  2 BAT_RUN_PLAYER      "Run to Player",
  3 BAT_PROCEED         "Proceed to next Marker",
  4 BAT_PROCEED_IGNORE  "Proceed, Ignoring ALL",
  5 BAT_SEEK_ITEMS      "Seek Items",
  6 BAT_SEEK_KEY        "Seek Key",
  7 BAT_SEEK_SWITCH     "Seek Switch",
};

class CPlayerBotMarker: CEntity {
name      "Player Bot Marker";
thumbnail "Thumbnails\\PlayerBotMarker.tbn";
features  "HasName", "HasTarget", "IsTargetable";

properties:

  1 CTString m_strName            "Name" 'N' = "Player Bot Marker",
  2 CTString m_strDescription =   "",
  3 CEntityPointer m_penTarget    "Target" 'T' COLOR(C_MAGENTA|0xFF),
  4 FLOAT m_fWaitTime = 0.0f,     // time to wait(or do anything) until go to another marker
  5 RANGE m_fMarkerRange          "Marker Range" 'M' = 0.0f,  // range around marker (marker doesn't have to be hit directly)
  6 BOOL  m_bCreateAreaBox        "* Create Area Box *" 'C' = FALSE, // create area box if needed
  7 CEntityPointer m_penBox       "Area Box" 'B' COLOR(C_CYAN|0xFF), // target area box
  8 enum  BotActionType m_batType "Bot Action Type" 'K' = BAT_PROCEED,  

components:

  1 model   MODEL_MARKER        "Models\\Editor\\EnemyMarker.mdl",
  2 texture TEXTURE_MARKER      "Models\\Editor\\PlayerBotMarker.tex",
  3 class   CLASS_AREA_MARKER   "Classes\\AreaMarker.ecl",

functions:

  const CTString &GetDescription(void) const
  {
    ((CTString&)m_strDescription).PrintF("-><none>");
    if (m_penTarget!=NULL) {
      ((CTString&)m_strDescription).PrintF("->%s", m_penTarget->GetName());
    }
    return m_strDescription;
  }

  /* Check if entity is moved on a route set up by its targets. */
  BOOL MovesByTargetedRoute(CTString &strTargetProperty) const {
    strTargetProperty = "Target";
    return TRUE;
  };
  
  /* Check if entity can drop marker for making linked route. */
  BOOL DropsMarker(CTFileName &fnmMarkerClass, CTString &strTargetProperty) const {
    fnmMarkerClass = CTFILENAME("Classes\\PlayerBotMarker.ecl");
    strTargetProperty = "Target";
    return TRUE;
  }

  // this is MARKER !!!!
  virtual BOOL IsMarker(void) const
  {
    return TRUE;
  }

  BOOL IsTargetValid(SLONG slPropertyOffset, CEntity *penTarget)
  {
    if( slPropertyOffset == offsetof(CPlayerBotMarker, m_penTarget))
    {
      if (IsOfClass(penTarget, "Player Bot Marker")) { return TRUE; }
      else { return FALSE; }
    }   
    return CEntity::IsTargetValid(slPropertyOffset, penTarget);
  }

  void GetAreaBox(void) {
  }

  void CreateAreaBox(void) 
  {
    if (m_penBox!=NULL) {
      CEntity *pen = m_penBox;
      pen->Destroy();
      m_penBox = NULL;
    }
    if (m_penBox==NULL) {
      CPlacement3D pl = GetPlacement();
      m_penBox = CreateEntity(pl, CLASS_AREA_MARKER);
      ((CAreaMarker&)*m_penBox).Initialize();
    }
  }

  SLONG GetUsedMemory(void)
  {
    // initial
    SLONG slUsedMemory = sizeof(CPlayerBotMarker) - sizeof(CEntity) + CEntity::GetUsedMemory();
    // add some more
    slUsedMemory += m_strName.Length();
    slUsedMemory += m_strDescription.Length();
    return slUsedMemory;
  }

procedures:
  Main() {

    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);

    if (m_bCreateAreaBox) {
      CreateAreaBox();
      m_bCreateAreaBox = FALSE;
    }

    return;
  }
};

