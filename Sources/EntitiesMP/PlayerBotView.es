4013
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/PlayerBot.h"
%}

// input parameter for viewer
event EBotViewInit {
  CEntityPointer penOwner,        // who owns it
  CEntityPointer penCamera,       // first camera for camera view
};

%{

void CPlayerBotView_Precache(void) 
{
  CDLLEntityClass *pdec = &CPlayerBotView_DLLClass;
  pdec->PrecacheModel(MODEL_MARKER);
  pdec->PrecacheTexture(TEXTURE_MARKER);
}

%}

class export CPlayerBotView : CMovableEntity {
name      "Player Bot View";
thumbnail "";
features "CanBePredictable";

properties:

  1 CEntityPointer m_penOwner,            // class which owns it

components:

  1 model   MODEL_MARKER     "Models\\Editor\\Axis.mdl",
  2 texture TEXTURE_MARKER   "Models\\Editor\\Vector.tex"

functions:

  CPlacement3D GetLerpedPlacement(void) const
  {
    FLOAT fLerpFactor;
    if (IsPredictor()) {
      fLerpFactor = _pTimer->GetLerpFactor();
    } else {
      fLerpFactor = _pTimer->GetLerpFactor2();
    }
    return LerpPlacementsPrecise(en_plLastPlacement, en_plPlacement, fLerpFactor);
    //return CMovableEntity::GetLerpedPlacement();
  }

  // render particles
  void RenderParticles(void)
  {
    if (Particle_GetViewer()==this) {
      Particles_ViewerLocal(this);
    }
  }
 
procedures:

  Main(EBotViewInit eInit) {
    // remember the initial parameters
    ASSERT(eInit.penOwner!=NULL);
    m_penOwner = eInit.penOwner;
    ASSERT(IsOfClass(m_penOwner, "PlayerBot"));

    // init as model
    InitAsModel();
    SetPhysicsFlags(EPF_MOVABLE);
    SetCollisionFlags(ECF_CAMERA);
    // set appearance
    SetModel(MODEL_MARKER);
    SetModelMainTexture(TEXTURE_MARKER);
    AddToMovers();

    //SendEvent(EStart());
    wait() {
      on (EBegin) : { resume; }
      on (EEnd) : { stop; }
      otherwise() : { resume; }
    }
    // cease to exist
    Destroy();

    return;
  };
};

