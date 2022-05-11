5004
%{
#include "EntitiesMP/StdH/StdH.h"
%}

class CBatteryMarker: CRationalEntity {
name      "Battery Marker";
thumbnail "";
features  "HasName", "HasTarget", "IsTargetable";

properties:

  1 CTString m_strName = "_SB TField - ",
  2 CEntityPointer m_penTarget  "Target 01 / Owner" 'T' COLOR(C_RED|0xFF),
  3 FLOAT m_fWidth "* Width" = 30.0f,
  4 FLOAT m_fHeight "* Height" = 8.0f,
  5 BOOL m_bActive "? Active" = TRUE,

 21 CEntityPointer m_penTarget2     "Target 02" 'Y' COLOR(C_CYAN|0xFF),
 22 CEntityPointer m_penTarget3     "Target 03" 'U' COLOR(C_CYAN|0xFF),
 23 CEntityPointer m_penTarget4     "Target 04" 'I' COLOR(C_CYAN|0xFF),
 24 CEntityPointer m_penTarget5     "Target 05" 'O' COLOR(C_CYAN|0xFF),
 25 CEntityPointer m_penTarget6     "Target 06" COLOR(C_CYAN|0xFF),
 26 CEntityPointer m_penTarget7     "Target 07" COLOR(C_CYAN|0xFF),
 27 CEntityPointer m_penTarget8     "Target 08" COLOR(C_CYAN|0xFF),
 28 CEntityPointer m_penTarget9     "Target 09" COLOR(C_CYAN|0xFF),
 29 CEntityPointer m_penTarget10    "Target 10" COLOR(C_CYAN|0xFF),

 30 enum EventEType m_eetEvent1     "Event type Target 01" 'G' = EET_TRIGGER,  // type of event to send
 31 enum EventEType m_eetEvent2     "Event type Target 02" 'H' = EET_TRIGGER,
 32 enum EventEType m_eetEvent3     "Event type Target 03" 'J' = EET_TRIGGER,
 33 enum EventEType m_eetEvent4     "Event type Target 04" 'K' = EET_TRIGGER,
 34 enum EventEType m_eetEvent5     "Event type Target 05" 'L' = EET_TRIGGER,
 35 enum EventEType m_eetEvent6     "Event type Target 06" = EET_TRIGGER,
 36 enum EventEType m_eetEvent7     "Event type Target 07" = EET_TRIGGER,
 37 enum EventEType m_eetEvent8     "Event type Target 08" = EET_TRIGGER,
 38 enum EventEType m_eetEvent9     "Event type Target 09" = EET_TRIGGER,
 39 enum EventEType m_eetEvent10    "Event type Target 10" = EET_TRIGGER,

components:

  //1 model   MODEL_MARKER           "Models\\PESpawnBattery\\Touch.mdl",
  //2 texture TEXTURE_MARKER         "Models\\PESpawnBattery\\Touch.tex",

  1 model   MODEL_MARKER     "Models\\Editor\\DoorController.mdl",
  2 texture TEXTURE_MARKER   "Models\\Editor\\DoorController.tex",

functions:

  void Precache(void) {
    if (m_penTarget!=NULL && !IsOfClass(m_penTarget, "PESpawnBattery")) {
		  CBatteryMarker *pen = this;
      CPlacement3D pl;
		  pl.pl_PositionVector = pen->GetPlacement().pl_PositionVector;
      CTString strCoords = "";
      strCoords.PrintF(TRANS("(%.0f, %.0f, %.0f)"), pl.pl_PositionVector(1), pl.pl_PositionVector(2), pl.pl_PositionVector(3));
      m_strName = "_TField - " + strCoords;
    }
  }

  // apply mirror and stretch to the entity
  void MirrorAndStretch(FLOAT fStretch, BOOL bMirrorX)
  {
    // stretch its ranges
    m_fWidth*=fStretch;
    m_fHeight*=fStretch;
  }


procedures:


  WaitForTrigger()
  {
    wait() {
      on (EPass et) : {
        if (IsDerivedFromClass(et.penOther, "Player")) {
          stop;
        }
      }
      otherwise() : { pass; }
    }

    SendToTarget(m_penTarget, m_eetEvent1, this);

    // send event to all targets
    SendToTarget(m_penTarget2, m_eetEvent2, this);
    SendToTarget(m_penTarget3, m_eetEvent3, this);
    SendToTarget(m_penTarget4, m_eetEvent4, this);
    SendToTarget(m_penTarget5, m_eetEvent5, this);
    SendToTarget(m_penTarget6, m_eetEvent6, this);
    SendToTarget(m_penTarget7, m_eetEvent7, this);
    SendToTarget(m_penTarget8, m_eetEvent8, this);
    SendToTarget(m_penTarget9, m_eetEvent9, this);
    SendToTarget(m_penTarget10, m_eetEvent10, this);

    // wait a bit to recover
    autowait(0.1f);

		jump Inactive();
  }

  Inactive() {
    ASSERT(!m_bActive);
    while (TRUE) {
      // wait 
      wait() {
        // if activated
        on (EActivate) : {
          // go to active state
          m_bActive = TRUE;
          jump WaitForTrigger();
        }
        otherwise() : {
          resume;
        };
      };
      
      // wait a bit to recover
      autowait(0.1f);
    }
  }

  Main()
  {

    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_TOUCHMODEL);
    GetModelObject()->StretchModel(FLOAT3D(m_fWidth, m_fHeight, 2.0f));
    SetModel(MODEL_MARKER);
		SetModelMainTexture(TEXTURE_MARKER);
    ModelChangeNotify();

    // go into active or inactive state
    if (m_bActive) {
      jump WaitForTrigger();
    } else {
      jump Inactive();
    }

    return;
  }
};
